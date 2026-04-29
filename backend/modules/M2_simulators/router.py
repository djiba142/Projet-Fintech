import asyncio
import logging
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request

from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, SIMULATED_OUTAGE_MSISDNS

# ─────────────────────────────────────────────────────────────────────────────
# Config & Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("simulators")

LATENCY_SECONDS = 0.3

from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Endpoints HTTP (appelés directement par M1)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/provider/orange/balance/{msisdn}")
async def get_orange_balance(msisdn: str):
    """Retourne le solde Orange Money pour un MSISDN donné."""
    # Simulation de latence réseau
    await asyncio.sleep(LATENCY_SECONDS)

    # Simulation de panne
    if msisdn in SIMULATED_OUTAGE_MSISDNS:
        logger.warning(f"⚠️ Panne simulée Orange pour {msisdn}")
        raise HTTPException(status_code=503, detail="Service Orange temporairement indisponible")

    account = ORANGE_ACCOUNTS.get(msisdn)
    if not account:
        raise HTTPException(status_code=404, detail=f"Abonné Orange introuvable : {msisdn}")
    
    logger.info(f"📱 Orange → Solde retourné pour {msisdn}")
    return account

@router.get("/provider/mtn/balance/{msisdn}")
async def get_mtn_balance(msisdn: str):
    """Retourne le solde MTN MoMo pour un MSISDN donné."""
    # Simulation de latence réseau
    await asyncio.sleep(LATENCY_SECONDS)

    # Simulation de panne
    if msisdn in SIMULATED_OUTAGE_MSISDNS:
        logger.warning(f"⚠️ Panne simulée MTN pour {msisdn}")
        raise HTTPException(status_code=503, detail="Service MTN temporairement indisponible")

    account = MTN_ACCOUNTS.get(msisdn)
    if not account:
        raise HTTPException(status_code=404, detail=f"Abonné MTN introuvable : {msisdn}")
    
    logger.info(f"📱 MTN → Solde retourné pour {msisdn}")
    return account

@router.get("/provider/orange/transactions/{msisdn}")
async def get_orange_transactions(msisdn: str):
    """Retourne l'historique Orange Money pour un MSISDN donné."""
    from .mock_data import ORANGE_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)
    return ORANGE_TRANSACTIONS.get(msisdn, [])

@router.get("/provider/mtn/transactions/{msisdn}")
async def get_mtn_transactions(msisdn: str):
    """Retourne l'historique MTN MoMo pour un MSISDN donné."""
    from .mock_data import MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)
    return MTN_TRANSACTIONS.get(msisdn, [])


@router.get("/provider/orange/health")
async def orange_health():
    return {"status": "online", "operator": "Orange Guinée"}

@router.get("/provider/mtn/health")
async def mtn_health():
    return {"status": "online", "operator": "MTN MoMo Guinée"}

@router.get("/health")
async def health():
    return {
        "status": "online",
        "mode": "http",
        "timestamp": datetime.now().isoformat()
    }

# ─────────────────────────────────────────────────────────────────────────────
# Logique de Transfert (Mutation Simulée)
# ─────────────────────────────────────────────────────────────────────────────

class TransferRequest(BaseModel):
    operator: str  # ORANGE or MTN
    from_msisdn: str
    to_msisdn: str
    amount: int
    note: Optional[str] = "Transfert Kandjou"

@router.post("/provider/transfer")
async def execute_simulated_transfer(req: TransferRequest):
    """
    Simule une opération de transfert avec mutation immédiate (en mémoire).
    """
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)
    
    op = req.operator.upper()
    amount = req.amount
    
    if op == "ORANGE":
        acc = ORANGE_ACCOUNTS.get(req.from_msisdn)
        if not acc: raise HTTPException(status_code=404, detail="Abonné source Orange introuvable")
        if acc["available_balance"] < amount: raise HTTPException(status_code=400, detail="Solde Orange insuffisant")
        
        # Mutation
        acc["available_balance"] -= amount
        
        # Log Transaction
        tx = {
            "id": f"TX-OR-{datetime.now().strftime('%H%M%S')}",
            "date": datetime.now().isoformat(),
            "desc": req.note,
            "type": "DEBIT",
            "amount": amount,
            "status": "SUCCESS"
        }
        if req.from_msisdn not in ORANGE_TRANSACTIONS: ORANGE_TRANSACTIONS[req.from_msisdn] = []
        ORANGE_TRANSACTIONS[req.from_msisdn].insert(0, tx)
        
        # Si le destinataire est aussi chez Orange (intra-op), on le crédite
        dest = ORANGE_ACCOUNTS.get(req.to_msisdn)
        if dest:
            dest["available_balance"] += amount
            tx_credit = tx.copy()
            tx_credit["id"] = f"CR-{tx['id']}"
            tx_credit["type"] = "CREDIT"
            tx_credit["desc"] = f"Transfert reçu de {req.from_msisdn}"
            if req.to_msisdn not in ORANGE_TRANSACTIONS: ORANGE_TRANSACTIONS[req.to_msisdn] = []
            ORANGE_TRANSACTIONS[req.to_msisdn].insert(0, tx_credit)

    elif op == "MTN":
        acc = MTN_ACCOUNTS.get(req.from_msisdn)
        if not acc: raise HTTPException(status_code=404, detail="Abonné source MTN introuvable")
        if acc["current_balance"] < amount: raise HTTPException(status_code=400, detail="Solde MTN insuffisant")
        
        # Mutation
        acc["current_balance"] -= amount
        
        # Log Transaction
        tx = {
            "id": f"TX-MTN-{datetime.now().strftime('%H%M%S')}",
            "date": datetime.now().isoformat(),
            "desc": req.note,
            "type": "DEBIT",
            "amount": amount,
            "status": "SUCCESS"
        }
        if req.from_msisdn not in MTN_TRANSACTIONS: MTN_TRANSACTIONS[req.from_msisdn] = []
        MTN_TRANSACTIONS[req.from_msisdn].insert(0, tx)
        
        # Si le destinataire est aussi chez MTN
        dest = MTN_ACCOUNTS.get(req.to_msisdn)
        if dest:
            dest["current_balance"] += amount
            tx_credit = tx.copy()
            tx_credit["id"] = f"CR-{tx['id']}"
            tx_credit["type"] = "CREDIT"
            tx_credit["desc"] = f"Transfert reçu de {req.from_msisdn}"
            if req.to_msisdn not in MTN_TRANSACTIONS: MTN_TRANSACTIONS[req.to_msisdn] = []
            MTN_TRANSACTIONS[req.to_msisdn].insert(0, tx_credit)
    
    else:
        raise HTTPException(status_code=400, detail="Opérateur non supporté")
        
    return {"message": "Transfert effectué", "operator": op, "new_balance": (acc["available_balance"] if op=="ORANGE" else acc["current_balance"])}

