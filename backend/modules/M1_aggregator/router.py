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
TRANSFER_STATUS = {} # État global pour le suivi temps réel

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
        "primary": session.get("primary"),
        "role": session.get("role")
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

# ──────────────────────────────────�@router.post("/risk/threshold")
# ─────────────────────────────────────────────────────────────────────────────
# Seuils de Risque
# ─────────────────────────────────────────────────────────────────────────────

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
    # --- SÉCURITÉ D'ACCÈS (ÉQUIVALENT RLS) ---
    user_role = token_data.get("role")
    primary = token_data.get("primary")
    
    # 1. Le client ne peut voir que ses propres données
    if user_role == "Client" and msisdn != primary:
        logger.warning(f"❌ Accès refusé : Client {primary} tente d'accéder à {msisdn}")
        raise HTTPException(status_code=403, detail="Accès interdit : vous ne pouvez consulter que votre propre dossier.")
    
    # 2. L'administrateur et le régulateur ont désormais accès pour la simulation et l'audit
    if user_role in ["Administrateur", "Régulateur (BCRG)"]:
        logger.info(f"👁️ Accès Supervision : {user_role} consulte {msisdn}")
    
    # 3. L'agent ne peut voir que ses dossiers autorisés
    if user_role == "Agent de Crédit" and msisdn != primary:
        from modules.common.database import get_all_loan_dossiers
        dossiers = get_all_loan_dossiers()
        # Vérification si un dossier existe pour ce client lié à cet agent
        is_authorized = any(d["client_id"] == msisdn and d["agent_id"] == primary for d in dossiers)
        if not is_authorized:
            logger.warning(f"❌ Accès refusé : Agent {primary} n'est pas autorisé pour le client {msisdn}")
            raise HTTPException(status_code=403, detail="Accès interdit : aucun dossier de crédit actif pour ce client auprès de votre institution.")

    # Si autorisé, on récupère les MSISDN en base pour le client cible
    from modules.common.database import get_user_by_username
    target_user = get_user_by_username(msisdn)
    if not target_user:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    msisdn_orange = target_user.get("msisdn_orange")
    msisdn_mtn = target_user.get("msisdn_mtn")
    
    # Fallback si les champs MSISDN sont vides (migration ou cas spécifique)
    if not msisdn_orange and not msisdn_mtn:
        clean_msisdn = msisdn.replace(" ", "").replace("+224", "")
        if clean_msisdn.startswith("62") or clean_msisdn.startswith("61"):
            msisdn_orange = msisdn
        elif clean_msisdn.startswith("66") or clean_msisdn.startswith("65"):
            msisdn_mtn = msisdn
    
    logger.info(f"📣 Agrégation autorisée | Demandeur: {primary} ({user_role}) | Cible: {msisdn}")
    
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
            "revenu_mensuel": sum(s.balance for s in sources) * 0.45, # Simulation basée sur flux
            "depense_mensuelle": sum(s.balance for s in sources) * 0.30
        },
        "credit_analysis": credit_analysis.dict(),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    log_event(
        user_id="agent",
        action="SCORING_AGGREGATION",
        target=primary,
        result=credit_analysis.status,
        details=f"Score: {credit_analysis.score}"
    )
    return result

@router.get("/score/{msisdn}")
async def get_score_alias(msisdn: str, token_data: Dict = Depends(require_valid_token)):
    """Alias pour /aggregate/{msisdn} utilisé par le frontend."""
    return await aggregate(msisdn, token_data=token_data)

# ─────────────────────────────────────────────────────────────────────────────
# Gestion des Transactions (M1 Aggregated)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_orange_transactions(msisdn: str) -> List[dict]:
    """Appelle directement M2 pour l'historique Orange."""
    from modules.M2_simulators.router import get_orange_transactions
    try:
        data = await get_orange_transactions(msisdn)
        return [{"id": t["id"], "date": t["date"], "desc": t["desc"], "receiver": t["desc"], "type": t["type"], "amount": t["amount"], "status": t["status"], "op": "ORANGE"} for t in data]
    except Exception: return []

async def fetch_mtn_transactions(msisdn: str) -> List[dict]:
    """Appelle directement M2 pour l'historique MTN."""
    from modules.M2_simulators.router import get_mtn_transactions
    try:
        data = await get_mtn_transactions(msisdn)
        return [{"id": t["id"], "date": t["date"], "desc": t["desc"], "receiver": t["desc"], "type": t["type"], "amount": t["amount"], "status": t["status"], "op": "MTN"} for t in data]
    except Exception: return []

async def get_transactions_internal(username: str):
    """Fonction interne pour récupérer les transactions agrégées."""
    from modules.common.database import get_user_by_username
    target_user = get_user_by_username(username)
    if not target_user: return {"transactions": []}
    msisdn_orange = target_user.get("msisdn_orange")
    msisdn_mtn = target_user.get("msisdn_mtn")
    tasks = []
    tasks.append(fetch_orange_transactions(msisdn_orange) if msisdn_orange else asyncio.sleep(0, []))
    tasks.append(fetch_mtn_transactions(msisdn_mtn) if msisdn_mtn else asyncio.sleep(0, []))
    results = await asyncio.gather(*tasks)
    all_tx = []
    for res in results:
        if isinstance(res, list): all_tx.extend(res)
    all_tx.sort(key=lambda x: x["date"], reverse=True)
    return {"transactions": all_tx}

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
    if token_data.get("role") not in ["Administrateur", "Agent de Crédit", "Régulateur (BCRG)"] and msisdn != token_data.get("primary"):
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

@router.get("/me")
async def get_me(token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import get_user_by_username
    username = token_data["primary"]
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    # Sécurité: retirer le mot de passe
    if "password" in user: del user["password"]
    return user

class UnifiedTransferRequest(BaseModel):
    operator: str
    to_msisdn: str
    amount: int
    note: Optional[str] = "Transfert Kandjou"
    pin: Optional[str] = None

class UnifiedDepositRequest(BaseModel):
    operator: str
    msisdn: str
    amount: int
    agent_id: str
    client_id: Optional[str] = None

@router.post("/transfer/verify")
async def verify_transfer(
    req: UnifiedTransferRequest,
    token_data: Dict = Depends(require_valid_token)
):
    """
    Vérifie la faisabilité d'un transfert avant initiation.
    - Existence du destinataire (simulée)
    - Solde suffisant
    - Calcul des frais
    """
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    
    from_msisdn = msisdn_orange if req.operator.upper() == "ORANGE" else msisdn_mtn
    
    if not from_msisdn:
        raise HTTPException(status_code=400, detail=f"Aucun compte {req.operator} lié à votre profil.")

    # Simulation de frais (1% pour interop, gratuit si même opérateur)
    # Dans notre simu, on considère interop si le numéro commence par un préfixe différent
    # Orange: 62x, 61x | MTN: 66x, 65x
    is_orange_dest = req.to_msisdn.startswith("62") or req.to_msisdn.startswith("61") or req.to_msisdn.startswith("22462") or req.to_msisdn.startswith("22461")
    is_mtn_dest = req.to_msisdn.startswith("66") or req.to_msisdn.startswith("65") or req.to_msisdn.startswith("22466") or req.to_msisdn.startswith("22465")
    
    is_interop = (req.operator.upper() == "ORANGE" and is_mtn_dest) or (req.operator.upper() == "MTN" and is_orange_dest)
    fees = round(req.amount * 0.01) if is_interop else 0

    # Vérification solde
    try:
        if req.operator.upper() == "ORANGE":
            bal = await fetch_orange_balance(from_msisdn)
            current = bal["available_balance"] if bal else 0
        else:
            bal = await fetch_mtn_balance(from_msisdn)
            current = bal["current_balance"] if bal else 0
        
        if current < (req.amount + fees):
            raise HTTPException(status_code=400, detail="Solde insuffisant (incluant les frais éventuels).")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail="Erreur lors de la vérification du solde.")

    return {
        "status": "VALID",
        "recipient_name": "Abonné " + ("Orange" if is_orange_dest else "MTN" if is_mtn_dest else "Inconnu"),
        "fees": fees,
        "fee_rate": "1.0%" if is_interop else "0.5%",
        "total_deducted": req.amount + fees,
        "is_interop": is_interop
    }



@router.get("/institutions/overview")
async def institutions_overview(token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import get_db_connection
    
    # Vérification du rôle
    role = token_data.get("role")
    if role not in ["Administrateur", "Agent de Crédit", "Régulateur (BCRG)"]:
        raise HTTPException(status_code=403, detail="Accès réservé aux institutions")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Récupération de tous les clients avec leur dernier score connu s'il existe
        cursor.execute("""
            SELECT 
                u.username, u.fullname, u.msisdn_orange, u.msisdn_mtn, u.status,
                (SELECT score FROM loan_dossiers WHERE client_id = u.username ORDER BY created_at DESC LIMIT 1) as last_score
            FROM users u
            WHERE u.role = 'Client'
        """)
        clients = cursor.fetchall()
        
        # Statistiques globales
        cursor.execute("SELECT COUNT(*) as count FROM loan_dossiers WHERE status = 'PENDING'")
        pending_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM loan_dossiers WHERE status = 'APPROVED'")
        approved_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT AVG(score) as avg_score FROM loan_dossiers")
        avg_score = cursor.fetchone()['avg_score'] or 0

        conn.close()
        
        return {
            "clients": [dict(c) for c in clients],
            "clients_count": len(clients),
            "pending_count": pending_count,
            "approved_count": approved_count,
            "avg_score": round(float(avg_score), 1)
        }
    except Exception as e:
        logger.error(f"Erreur institutions_overview: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur lors de la récupération des données")

@router.get("/institutions/dossiers")
async def get_all_dossiers(token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import get_db_connection
    
    role = token_data.get("role")
    if role not in ["Administrateur", "Agent de Crédit"]:
        raise HTTPException(status_code=403, detail="Accès réservé")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM loan_dossiers ORDER BY created_at DESC")
        dossiers = cursor.fetchall()
        conn.close()
        return {"dossiers": [dict(d) for d in dossiers]}
    except Exception as e:
        logger.error(f"Erreur get_all_dossiers: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

class LoanActionRequest(BaseModel):
    dossier_id: int
    action: str # APPROVE or REJECT

from fastapi import APIRouter, HTTPException, Path, Request, Depends, Header, Query, status, Body, WebSocket, WebSocketDisconnect

# Gestion des flux de transactions par utilisateur (Global)
TRANSACTION_STREAMS = {}

@router.websocket("/ws/transactions/{username}")
async def transactions_live_websocket(websocket: WebSocket, username: str):
    await websocket.accept()
    if username not in TRANSACTION_STREAMS:
        TRANSACTION_STREAMS[username] = set()
    TRANSACTION_STREAMS[username].add(websocket)
    logger.info(f"📊 Dashboard Live connecté pour: {username}")
    try:
        while True:
            await websocket.receive_text() # Garde la connexion ouverte
    except WebSocketDisconnect:
        TRANSACTION_STREAMS[username].remove(websocket)
        logger.info(f"📊 Dashboard Live déconnecté pour: {username}")

async def broadcast_transaction_update(username: str, data: dict):
    """Envoie une mise à jour à tous les WebSockets d'un utilisateur."""
    if username in TRANSACTION_STREAMS:
        disconnected = set()
        for ws in TRANSACTION_STREAMS[username]:
            try:
                await ws.send_json(data)
            except Exception:
                disconnected.add(ws)
        for ws in disconnected:
            TRANSACTION_STREAMS[username].remove(ws)

@router.websocket("/ws/transfer/{tx_id}")
async def transfer_status_websocket(websocket: WebSocket, tx_id: str):
    await websocket.accept()
    logger.info(f"🔌 WebSocket connecté pour la transaction: {tx_id}")
    try:
        last_status = None
        while True:
            current_data = TRANSFER_STATUS.get(tx_id)
            if not current_data:
                await asyncio.sleep(0.5)
                continue
            
            if current_data["status"] != last_status:
                await websocket.send_json(current_data)
                last_status = current_data["status"]
            
            if last_status in ["SUCCESS", "FAILED"]:
                await asyncio.sleep(2)
                break
                
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass

@router.post("/transfer/v2")
async def initiate_transfer_v2(
    req: UnifiedTransferRequest,
    token_data: Dict = Depends(require_valid_token)
):
    import uuid
    tx_id = f"KDJ-{uuid.uuid4().hex[:8].upper()}"
    username = token_data["primary"]
    
    TRANSFER_STATUS[tx_id] = {
        "tx_id": tx_id,
        "username": username,
        "status": "INITIATED",
        "message": "Initialisation des protocoles...",
        "progress": 5,
        "amount": req.amount,
        "recipient": req.to_msisdn,
        "operator": req.operator,
        "timestamp": datetime.now().isoformat()
    }
    
    # Notifier le dashboard d'une nouvelle transaction
    await broadcast_transaction_update(username, {
        "type": "NEW_TRANSACTION",
        "data": TRANSFER_STATUS[tx_id]
    })
    
    asyncio.create_task(simulate_transfer_process(tx_id, req, username, token_data))
    return {"tx_id": tx_id, "status": "PENDING"}

async def simulate_transfer_process(tx_id: str, req: UnifiedTransferRequest, username: str, token_data: Dict):
    from modules.M2_simulators.router import execute_simulated_transfer, TransferRequest
    try:
        # Step 1: Validation Sécurité
        await asyncio.sleep(1.2) # Simulation de latence réseau Afrique
        if req.pin and req.pin != "1234": # PIN de simulation par défaut
             TRANSFER_STATUS[tx_id].update({"status": "FAILED", "message": "Code PIN incorrect.", "progress": 100})
             await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})
             return

        TRANSFER_STATUS[tx_id].update({"status": "VALIDATING", "message": "Validation des protocoles de sécurité...", "progress": 35})
        await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})
        
        # Step 2: Opérateur
        await asyncio.sleep(1.5)
        TRANSFER_STATUS[tx_id].update({"status": "PROCESSING", "message": f"Communication avec l'opérateur {req.operator}...", "progress": 70})
        await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})
        
        # Step 3: Action réelle
        await asyncio.sleep(1.0)
        try:
            if req.operator == "ORANGE":
                from_msisdn = token_data.get("msisdn_orange") or username
            else:
                from_msisdn = token_data.get("msisdn_mtn") or username
            
            sim_req = TransferRequest(
                operator=req.operator,
                from_msisdn=from_msisdn,
                to_msisdn=req.to_msisdn,
                amount=req.amount,
                note=req.note,
                client_id=username  # Pass username for DB persistence
            )
            result = await execute_simulated_transfer(sim_req)
            
            TRANSFER_STATUS[tx_id].update({
                "status": "SUCCESS", 
                "message": "Transfert validé avec succès !", 
                "progress": 100,
                "details": {
                    "amount": req.amount, 
                    "fee": result.get("fee", 0),
                    "total_deducted": result.get("total_deducted", req.amount),
                    "recipient": req.to_msisdn, 
                    "operator": req.operator,
                    "transaction_id": result["transaction_id"],
                    "interoperability": result["interoperability"],
                    "new_balance": result.get("new_balance", 0)
                }
            })
            
            # Déclencher le contrôle AML
            from .audit_router import trigger_aml_check
            trigger_aml_check(tx_id, username, req.amount, f"Transfert {req.operator} vers {req.to_msisdn}")
            
        except Exception as e:
            logger.error(f"Erreur M2 Mutation: {e}")
            TRANSFER_STATUS[tx_id].update({"status": "FAILED", "message": f"Erreur opérateur : {str(e)}", "progress": 100})
        
        await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})

    except Exception as e:
        logger.error(f"Err simulate {tx_id}: {e}")

# ... reste du fichier ...
@router.get("/analytics/{username}")
async def get_user_analytics(username: str, token_data: Dict = Depends(require_valid_token)):
    """Calcule les agrégats financiers pour les graphiques."""
    from datetime import datetime, timedelta
    
    # 1. Récupérer toutes les transactions
    tx_data = await get_transactions_internal(username)
    transactions = tx_data.get("transactions", [])
    
    # 2. Initialiser les 7 derniers jours
    today = datetime.now().date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    labels = [d.strftime("%a") for d in days] # Lun, Mar, etc.
    income = [0] * 7
    expense = [0] * 7
    
    # 3. Ventiler les transactions
    for tx in transactions:
        try:
            tx_date = datetime.fromisoformat(tx["date"]).date()
            if tx_date in days:
                idx = days.index(tx_date)
                if tx["type"] == "CREDIT":
                    income[idx] += tx["amount"]
                else:
                    expense[idx] += tx["amount"]
        except: continue

    # 4. Calcul du Score Réel via le moteur Kandjou
    try:
        # On réutilise la logique d'agrégation qui inclut déjà le scoring
        agg_data = await aggregate(username, token_data=token_data)
        real_score = agg_data["credit_analysis"]["score"]
    except:
        real_score = 0
        
    return {
        "labels": labels,
        "income": income,
        "expense": expense,
        "score": real_score
    }

# ─────────────────────────────────────────────────────────────────────────────
# Logique de Retrait (Withdraw / Cash-out)
# ─────────────────────────────────────────────────────────────────────────────

class WithdrawInitiateRequest(BaseModel):
    operator: str
    amount: int
    agent_id: str

class WithdrawValidateRequest(BaseModel):
    withdraw_code: str
    agent_id: str

@router.post("/withdraw/initiate")
async def initiate_withdraw(
    req: WithdrawInitiateRequest,
    token_data: Dict = Depends(require_valid_token)
):
    """
    Initie une demande de retrait.
    Vérifie le solde et prépare la génération du code (OTP requis après).
    """
    import uuid
    import secrets
    import string
    
    username = token_data["primary"]
    msisdn_orange = token_data.get("msisdn_orange")
    msisdn_mtn = token_data.get("msisdn_mtn")
    
    from_msisdn = msisdn_orange if req.operator.upper() == "ORANGE" else msisdn_mtn
    if not from_msisdn:
        raise HTTPException(status_code=400, detail=f"Aucun compte {req.operator} lié.")

    # Vérification solde via M2
    try:
        if req.operator.upper() == "ORANGE":
            bal_data = await fetch_orange_balance(from_msisdn)
            current_bal = bal_data["available_balance"] if bal_data else 0
        else:
            bal_data = await fetch_mtn_balance(from_msisdn)
            current_bal = bal_data["current_balance"] if bal_data else 0
            
        if current_bal < req.amount:
            raise HTTPException(status_code=400, detail="Solde insuffisant pour ce retrait.")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail="Erreur lors de la vérification du solde.")

    tx_id = f"KDJ-WD-{uuid.uuid4().hex[:8].upper()}"
    fees = round(req.amount * 0.01) # 1% de frais simulés
    
    TRANSFER_STATUS[tx_id] = {
        "tx_id": tx_id,
        "username": username,
        "status": "INITIATED",
        "step": "INITIALIZATION",
        "progress": 15,
        "message": "Demande de retrait initiée...",
        "amount": req.amount,
        "fees": fees,
        "operator": req.operator,
        "agent_id": req.agent_id,
        "timestamp": datetime.now().isoformat()
    }
    
    return {
        "status": "OK",
        "transaction_id": tx_id,
        "fees": fees
    }

@router.post("/withdraw/otp-verify")
async def verify_withdraw_otp(
    tx_id: str = Body(...),
    otp_code: str = Body(...),
    token_data: Dict = Depends(require_valid_token)
):
    """
    Valide l'OTP et génère le code de retrait final.
    """
    import secrets
    import string
    from modules.common.database import get_db_connection
    
    if tx_id not in TRANSFER_STATUS:
        raise HTTPException(status_code=404, detail="Transaction de retrait introuvable.")
    
    # Simulation validation OTP (toujours 123456 pour le dév)
    if otp_code != "123456":
        raise HTTPException(status_code=400, detail="Code OTP invalide.")
        
    username = token_data["primary"]
    withdraw_code = "".join(secrets.choice(string.digits) for _ in range(6))
    expires_at = (datetime.now() + timedelta(minutes=5)).isoformat()
    
    # Mise à jour du statut live
    TRANSFER_STATUS[tx_id].update({
        "status": "PROCESSING",
        "step": "CODE_GENERATED",
        "progress": 50,
        "message": "Code de retrait généré. Présentez-le à votre agent.",
        "withdraw_code": withdraw_code,
        "expires_at": expires_at
    })
    
    # Enregistrement en base (Transaction en attente)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transactions (tx_id, client_id, operator, type, amount, description, status, withdraw_code, withdraw_expires_at)
            VALUES (?, ?, ?, 'WITHDRAW', ?, ?, 'PENDING', ?, ?)
        """, (
            tx_id, 
            username, 
            TRANSFER_STATUS[tx_id]["operator"], 
            TRANSFER_STATUS[tx_id]["amount"], 
            f"Retrait Cash-out (Agent: {TRANSFER_STATUS[tx_id]['agent_id']})",
            withdraw_code,
            expires_at
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Erreur DB withdraw: {e}")
        # On continue quand même car l'état est en mémoire pour le WebSocket
    
    await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})
    
    return {
        "status": "SUCCESS",
        "withdraw_code": withdraw_code,
        "expires_at": expires_at
    }

@router.post("/withdraw/validate")
async def validate_withdraw_agent(req: WithdrawValidateRequest):
    """
    Endpoint utilisé par l'AGENT pour finaliser le retrait.
    """
    from modules.common.database import get_db_connection
    from modules.M2_simulators.router import execute_simulated_withdraw, WithdrawRequest
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Trouver la transaction correspondante
        cursor.execute("""
            SELECT * FROM transactions 
            WHERE withdraw_code = ? AND status = 'PENDING'
        """, (req.withdraw_code,))
        tx = cursor.fetchone()
        
        if not tx:
            conn.close()
            raise HTTPException(status_code=404, detail="Code de retrait invalide ou déjà utilisé.")
        
        # Vérification expiration
        if datetime.now() > datetime.fromisoformat(tx["withdraw_expires_at"]):
            cursor.execute("UPDATE transactions SET status = 'EXPIRED' WHERE tx_id = ?", (tx["tx_id"],))
            conn.commit()
            conn.close()
            raise HTTPException(status_code=400, detail="Code de retrait expiré.")

        # Action sur le simulateur (Débit réel)
        username = tx["client_id"]
        target_user = get_user_by_username(username)
        msisdn = target_user.get("msisdn_orange") if tx["operator"] == "ORANGE" else target_user.get("msisdn_mtn")
        
        try:
            sim_res = await execute_simulated_withdraw(WithdrawRequest(
                operator=tx["operator"],
                msisdn=msisdn,
                amount=int(tx["amount"]),
                agent_id=req.agent_id
            ))
            
            # Mise à jour finale en base
            cursor.execute("UPDATE transactions SET status = 'SUCCESS' WHERE tx_id = ?", (tx["tx_id"],))
            conn.commit()
            
            # Notification WebSocket au client
            tx_id = tx["tx_id"]
            if tx_id in TRANSFER_STATUS:
                TRANSFER_STATUS[tx_id].update({
                    "status": "SUCCESS",
                    "step": "COMPLETED",
                    "progress": 100,
                    "message": "Retrait effectué ! Récupérez vos espèces.",
                    "agent_id": req.agent_id
                })
                await broadcast_transaction_update(username, {"type": "UPDATE", "data": TRANSFER_STATUS[tx_id]})
            
            conn.close()
            return {"status": "SUCCESS", "message": "Retrait validé", "transaction_id": tx_id}
            
        except Exception as e:
            conn.close()
            logger.error(f"Erreur simulation withdraw: {e}")
            raise HTTPException(status_code=500, detail="Erreur lors de la communication avec l'opérateur.")
            
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Erreur validate_withdraw: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne serveur.")

# --- Gestion des Favoris ---

@router.get("/favorites")
async def get_favorites(token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import get_user_favorites
    username = token_data["primary"]
    favs = get_user_favorites(username)
    return {"favorites": favs}

class FavoriteRequest(BaseModel):
    name: str
    msisdn: str
    operator: str

@router.post("/favorites")
async def add_fav(req: FavoriteRequest, token_data: Dict = Depends(require_valid_token)):
    from modules.common.database import add_favorite
    username = token_data["primary"]
    success = add_favorite(username, req.name, req.msisdn, req.operator)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du favori")
    return {"status": "success"}

@router.post("/deposit")
async def perform_deposit(
    req: UnifiedDepositRequest,
    token_data: Dict = Depends(require_valid_token)
):
    """
    Effectue un dépôt (Cash-in) pour un client.
    Réservé aux Agents ou Admins.
    """
    from modules.M2_simulators.router import execute_simulated_deposit, DepositRequest
    
    role = token_data.get("role")
    if role not in ["Administrateur", "Agent de Crédit"]:
        raise HTTPException(status_code=403, detail="Seuls les agents peuvent effectuer des dépôts.")
        
    sim_req = DepositRequest(
        operator=req.operator,
        msisdn=req.msisdn,
        amount=req.amount,
        agent_id=req.agent_id,
        client_id=req.client_id
    )
    
    result = await execute_simulated_deposit(sim_req)
    
    # Notifier le client instantanément via WebSocket
    client_username = req.client_id or req.msisdn
    await broadcast_transaction_update(client_username, {
        "type": "NEW_TRANSACTION",
        "data": {
            "tx_id": result["transaction_id"],
            "type": "DEPOSIT",
            "status": "SUCCESS",
            "message": f"Dépôt de {req.amount:,} GNF reçu !",
            "amount": req.amount,
            "operator": req.operator,
            "recipient": "Moi",
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return result
