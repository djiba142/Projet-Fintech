import re
import logging
import asyncio
import os
from datetime import datetime
from typing import List, Optional, Dict

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Path, Request, Depends, Header, Query, status, Body
import httpx

# Importation directe des fonctions des autres modules pour éviter les boucles HTTP
from modules.M2_simulators.router import get_orange_balance, get_mtn_balance
from modules.M3_security.router import ACTIVE_SESSIONS

from .models import (
    OrangeBalance, 
    MTNBalance, 
    AggregatedResponse, 
    Consolidation, 
    CreditAnalysis,
    OperatorSource,
    UtilitySource
)
from .scoring.engine import ScoringEngine
from modules.common.database import get_risk_threshold, set_risk_threshold, log_event

# Load environment variables
load_dotenv()

# --- Logging Configuration ---
# Note: Configured in backend/main.py
logger = logging.getLogger("aggregator")

router = APIRouter()

# --- Auth Helper (Direct Memory Access) ---
async def require_valid_token(authorization: Optional[str] = Header(None)) -> Dict:
    """
    Valide le token directement en consultant ACTIVE_SESSIONS de M3.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Format de token invalide (Bearer requis)")
    
    token = authorization.split(" ")[1]
    
    # Accès direct aux sessions partagées de M3
    from modules.M3_security.router import ACTIVE_SESSIONS
    session = ACTIVE_SESSIONS.get(token)
    
    if not session:
        logger.warning(f"⚠️ Tentative d'accès avec token invalide : {token}")
        raise HTTPException(status_code=401, detail="Token Kandjou invalide ou expiré")
    
    # Vérification d'expiration
    expiry_str = session.get("expires_at")
    if expiry_str:
        if datetime.now() > datetime.fromisoformat(expiry_str):
            if token in ACTIVE_SESSIONS: del ACTIVE_SESSIONS[token]
            raise HTTPException(status_code=401, detail="Token Kandjou expiré")

    return {
        "msisdn_orange": session.get("msisdn_orange"),
        "msisdn_mtn": session.get("msisdn_mtn"),
        "primary": session.get("primary")
    }

# ─────────────────────────────────────────────────────────────────────────────
# Fonctions d'appel DIRECT vers M2 (Optimisé)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_orange_balance(msisdn: str) -> Optional[dict]:
    """Appelle directement le module M2 pour obtenir le solde Orange."""
    try:
        data = await get_orange_balance(msisdn)
        logger.info(f"✅ Orange → données reçues par appel direct pour {msisdn}")
        return data
    except HTTPException as e:
        if e.status_code == 404:
            logger.info(f"ℹ️ Orange → abonné non trouvé : {msisdn}")
        else:
            logger.warning(f"⚠️ Orange → erreur {e.status_code} pour {msisdn}")
        return None
    except Exception as e:
        logger.error(f"❌ Orange → erreur imprévue : {e}")
        return None

async def fetch_mtn_balance(msisdn: str) -> Optional[dict]:
    """Appelle directement le module M2 pour obtenir le solde MTN."""
    try:
        data = await get_mtn_balance(msisdn)
        logger.info(f"✅ MTN → données reçues par appel direct pour {msisdn}")
        return data
    except HTTPException as e:
        if e.status_code == 404:
            logger.info(f"ℹ️ MTN → abonné non trouvé : {msisdn}")
        else:
            logger.warning(f"⚠️ MTN → erreur {e.status_code} pour {msisdn}")
        return None
    except Exception as e:
        logger.error(f"❌ MTN → erreur imprévue : {e}")
        return None

def normalize_sources(msisdn_orange: Optional[str], msisdn_mtn: Optional[str], 
                       orange_data: Optional[dict], mtn_data: Optional[dict]) -> List[OperatorSource]:
    """Normalise les données brutes des opérateurs en sources standardisées."""
    sources = []
    if orange_data and msisdn_orange:
        o = OrangeBalance(**orange_data)
        sources.append(OperatorSource(
            operator="ORANGE",
            msisdn=msisdn_orange,
            balance=o.available_balance,
            last_activity=o.last_deposit,
            is_active=o.status == "ACTIVE"
        ))
    
    if mtn_data and msisdn_mtn:
        m = MTNBalance(**mtn_data)
        sources.append(OperatorSource(
            operator="MTN",
            msisdn=msisdn_mtn,
            balance=m.current_balance,
            last_activity=None,
            is_active=m.account_state == "OPEN"
        ))
    return sources

# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "mode": "http-sync-dual-msisdn",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/risk/threshold")
async def get_threshold():
    return {"threshold": get_risk_threshold()}

@router.post("/risk/threshold")
async def update_threshold(threshold: int = Body(..., embed=True)):
    set_risk_threshold(threshold)
    return {"message": "Seuil mis à jour avec succès", "new_threshold": threshold}

# --- Logique de Scoring Dynamique ---
def calculate_score(orange_score: int, mtn_score: int, policy):
    # Pondération dynamique
    final_score = (orange_score * policy.weight_orange) + (mtn_score * policy.weight_mtn)
    final_score = round(final_score)
    
    # Éligibilité basée sur le seuil
    is_eligible = final_score >= policy.min_score_threshold
    
    # Classification du risque
    if final_score >= 80:
        risk_level = "FAIBLE"
        rec = "Profil excellent. Approuvé sans réserve."
    elif is_eligible:
        risk_level = "MODÉRÉ"
        rec = "Profil stable. Approbation sous conditions standards."
    else:
        risk_level = "ÉLEVÉ"
        rec = "Risque trop important pour la politique actuelle."
        
    return final_score, risk_level, rec

@router.get("/aggregate/{msisdn}")
async def aggregate(
    msisdn: str,
    strategy: str = Query("v1", description="Strategie de scoring"),
    token_data: Dict = Depends(require_valid_token)
):
    """
    Agrégation synchrone avec dual-MSISDN.
    Utilise les numéros Orange et MTN stockés dans le token M3.
    Le {msisdn} dans l'URL sert de référence client (primary).
    """
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    primary = token_data.get("primary", msisdn)
    
    logger.info(f"📣 Agrégation déclenchée | Primary: {primary} | Orange: {msisdn_orange} | MTN: {msisdn_mtn}")
    
    # Appels asynchrones directs vers les fonctions de M2
    tasks = []
    tasks.append(fetch_orange_balance(msisdn_orange) if msisdn_orange else asyncio.sleep(0))
    tasks.append(fetch_mtn_balance(msisdn_mtn) if msisdn_mtn else asyncio.sleep(0))
    results = await asyncio.gather(*tasks)
    
    orange_data = results[0] if msisdn_orange and isinstance(results[0], dict) else None
    mtn_data = results[1] if msisdn_mtn and isinstance(results[1], dict) else None
    
    # Normalisation des sources
    sources = normalize_sources(msisdn_orange, msisdn_mtn, orange_data, mtn_data)
    
    if not sources:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée trouvée pour le client {primary}."
        )
    
    # Récupération du seuil persistant
    current_threshold = get_risk_threshold()
    
    # Scoring inline
    engine = ScoringEngine(strategy=strategy)
    credit_analysis = engine.run(sources, None, threshold=current_threshold)
    
    total_balance = sum(s.balance for s in sources)
    active_sources = [s.operator for s in sources]
    
    # Génération d'un ID de rapport unique (Authenticité)
    import hashlib
    report_id = f"KDJ-{datetime.now().strftime('%Y%m%d')}-{hashlib.md5(msisdn.encode()).hexdigest()[:4].upper()}"
    
    # Données KYC Simulées (viendraient de M2 en production)
    kyc_data = {
        "fullname": "Mamadou Alimou DIALLO",
        "id_card": "GN-ID-2024-8891-B",
        "nationality": "Guinéenne",
        "operator": "Orange Money" if msisdn.startswith("62") else "MTN MoMo"
    }

    result = {
        "report_id": report_id,
        "kyc": kyc_data,
        "client_id": primary,
        "msisdn_orange": msisdn_orange,
        "msisdn_mtn": msisdn_mtn,
        "consolidation": {
            "total_balance": total_balance,
            "currency": "GNF",
            "sources_active": active_sources,
            "orange_balance": next((s.balance for s in sources if s.operator == "ORANGE"), 0),
            "mtn_balance": next((s.balance for s in sources if s.operator == "MTN"), 0),
        },
        "credit_analysis": credit_analysis.dict(),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    log_event(
        user_id="agent",
        action="SCORING_AGGREGATION",
        target=primary,
        result=credit_analysis.status,
        details=f"ReportID: {report_id} | Score: {credit_analysis.score}"
    )
    
    return result
