import re
import logging
import asyncio
import os
from datetime import datetime
from typing import List, Optional, Dict

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Path, Request, Depends, Header, Query, status, Body
from pydantic import BaseModel
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
    Utilise les numéros Orange et MTN stockés dans le token M3 ou en base.
    Le {msisdn} dans l'URL sert de référence client (primary).
    """
    # Si l'utilisateur demande ses propres données ou si c'est un Admin/Agent
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    primary = token_data.get("primary")
    
    # Si c'est un Admin ou un Agent demandant pour un autre client, on récupère les MSISDN en base
    if token_data.get("role") in ["Admin", "Agent", "Regulateur"] and msisdn != primary:
        from modules.common.database import get_user_by_username
        target_user = get_user_by_username(msisdn)
        if target_user:
            msisdn_orange = target_user.get("msisdn_orange")
            msisdn_mtn = target_user.get("msisdn_mtn")
            primary = msisdn
    else:
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
    
    # Données KYC Dynamiques
    from modules.common.database import get_user_by_username
    target_user = get_user_by_username(primary) or {}
    
    kyc_data = {
        "fullname": target_user.get("fullname", "Utilisateur Inconnu"),
        "id_card": target_user.get("id_card", "Non fournie"),
        "nationality": target_user.get("nationality", "Guinéenne"),
        "operator": "Orange Money" if str(msisdn_orange).startswith("62") else "MTN MoMo"
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

# ─────────────────────────────────────────────────────────────────────────────
# Gestion des Transactions (M1 Aggregated)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_orange_transactions(msisdn: str) -> List[dict]:
    """Appelle directement M2 pour l'historique Orange."""
    from modules.M2_simulators.router import get_orange_transactions
    try:
        data = await get_orange_transactions(msisdn)
        return [{"id": t["id"], "date": t["date"], "desc": t["desc"], "type": t["type"], "amount": t["amount"], "status": t["status"], "op": "ORANGE"} for t in data]
    except Exception: return []

async def fetch_mtn_transactions(msisdn: str) -> List[dict]:
    """Appelle directement M2 pour l'historique MTN."""
    from modules.M2_simulators.router import get_mtn_transactions
    try:
        data = await get_mtn_transactions(msisdn)
        return [{"id": t["id"], "date": t["date"], "desc": t["desc"], "type": t["type"], "amount": t["amount"], "status": t["status"], "op": "MTN"} for t in data]
    except Exception: return []

@router.get("/transactions/{msisdn}")
async def get_aggregated_transactions(
    msisdn: str,
    token_data: Dict = Depends(require_valid_token)
):
    """
    Fusionne et normalise l'historique multi-opérateurs.
    """
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    
    # Sécurité : un client ne peut voir que ses propres transactions
    if token_data.get("role") not in ["Admin", "Agent", "Regulateur"] and msisdn != token_data.get("primary"):
         msisdn = token_data.get("primary")
         
    tasks = []
    tasks.append(fetch_orange_transactions(msisdn_orange) if msisdn_orange else asyncio.sleep(0, []))
    tasks.append(fetch_mtn_transactions(msisdn_mtn) if msisdn_mtn else asyncio.sleep(0, []))
    
    results = await asyncio.gather(*tasks)
    
    # Flatten and Sort
    all_tx = []
    for res in results:
        if isinstance(res, list):
            all_tx.extend(res)
            
    # Tri par date décroissante
    all_tx.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "msisdn": msisdn,
        "count": len(all_tx),
        "transactions": all_tx,
        "timestamp": datetime.now().isoformat()
    }

class UnifiedTransferRequest(BaseModel):
    operator: str
    to_msisdn: str
    amount: int
    note: Optional[str] = "Transfert Kandjou"

@router.post("/transfer")
async def process_transfer(
    req: UnifiedTransferRequest,
    token_data: Dict = Depends(require_valid_token)
):
    """
    Route unifiée pour effectuer un transfert via le simulateur approprié.
    """
    from modules.M2_simulators.router import execute_simulated_transfer, TransferRequest as SimReq
    
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    
    # Détermination du MSISDN source basé sur l'opérateur choisi
    from_msisdn = msisdn_orange if req.operator.upper() == "ORANGE" else msisdn_mtn
    
    if not from_msisdn:
        raise HTTPException(status_code=400, detail=f"Aucun compte {req.operator} lié à votre profil.")

    # Appel direct de la fonction du simulateur (simulation interne)
    sim_req = SimReq(
        operator=req.operator,
        from_msisdn=from_msisdn,
        to_msisdn=req.to_msisdn,
        amount=req.amount,
        note=req.note
    )
    
    try:
        result = await execute_simulated_transfer(sim_req)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"❌ Erreur transfert M1 : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors du transfert")



@router.get("/institutions/overview")
async def institutions_overview(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") not in ["Admin", "Agent de Crédit", "Administrateur"]:
        # We need to re-fetch the user to get the role if not in token_data
        from modules.common.database import get_user_by_username
        user = get_user_by_username(token_data["primary"])
        if user["role"] not in ["Admin", "Agent de Crédit", "Administrateur"]:
            raise HTTPException(status_code=403, detail="Accès réservé aux institutions")

    from modules.common.database import get_all_loan_dossiers, get_all_users
    dossiers = get_all_loan_dossiers()
    all_users = get_all_users()
    clients = [u for u in all_users if u["role"] == "Client"]
    
    return {
        "dossiers": dossiers,
        "clients_count": len(clients),
        "pending_count": len([d for d in dossiers if d["status"] == "PENDING"]),
        "approved_count": len([d for d in dossiers if d["status"] == "APPROVED"])
    }

class LoanActionRequest(BaseModel):
    dossier_id: int
    action: str # APPROVE or REJECT

@router.post("/loan/process")
async def process_loan(req: LoanActionRequest, token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import update_loan_status, log_event
    status = "APPROVED" if req.action == "APPROVE" else "REJECTED"
    update_loan_status(req.dossier_id, status)
    
    log_event(
        user_id=token_data["primary"],
        action=f"LOAN_{req.action}",
        target=str(req.dossier_id),
        result="SUCCESS",
        details=f"Dossier {req.dossier_id} marqué comme {status}"
    )
    
    return {"message": f"Dossier {status}", "status": status}
