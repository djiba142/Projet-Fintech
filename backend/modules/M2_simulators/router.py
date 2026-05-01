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
    Supporte l'interopérabilité (Orange <-> MTN).
    """
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)
    
    op_source = req.operator.upper()
    amount = req.amount
    to_msisdn = req.to_msisdn
    from_msisdn = req.from_msisdn
    
    # --- 1. DÉBIT SOURCE ---
    if op_source == "ORANGE":
        acc_source = ORANGE_ACCOUNTS.get(from_msisdn)
        if not acc_source: raise HTTPException(status_code=404, detail="Abonné source Orange introuvable")
        if acc_source["available_balance"] < amount: raise HTTPException(status_code=400, detail="Solde Orange insuffisant")
        acc_source["available_balance"] -= amount
        source_tx_list = ORANGE_TRANSACTIONS
    elif op_source == "MTN":
        acc_source = MTN_ACCOUNTS.get(from_msisdn)
        if not acc_source: raise HTTPException(status_code=404, detail="Abonné source MTN introuvable")
        if acc_source["current_balance"] < amount: raise HTTPException(status_code=400, detail="Solde MTN insuffisant")
        acc_source["current_balance"] -= amount
        source_tx_list = MTN_TRANSACTIONS
    else:
        raise HTTPException(status_code=400, detail="Opérateur source non supporté")

    # Enregistrement débit
    tx_id = f"TX-{op_source}-{datetime.now().strftime('%H%M%S')}"
    debit_tx = {
        "id": tx_id,
        "date": datetime.now().isoformat(),
        "desc": f"Transfert vers {to_msisdn} ({req.note})",
        "type": "DEBIT",
        "amount": amount,
        "status": "SUCCESS"
    }
    if from_msisdn not in source_tx_list: source_tx_list[from_msisdn] = []
    source_tx_list[from_msisdn].insert(0, debit_tx)

    # --- 2. CRÉDIT DESTINATAIRE (AVEC INTEROPÉRABILITÉ) ---
    credited = False
    
    # Test Orange
    dest_orange = ORANGE_ACCOUNTS.get(to_msisdn)
    if dest_orange:
        dest_orange["available_balance"] += amount
        credit_tx = {
            "id": f"CR-OR-{tx_id}",
            "date": datetime.now().isoformat(),
            "desc": f"Transfert reçu de {from_msisdn} ({op_source})",
            "type": "CREDIT",
            "amount": amount,
            "status": "SUCCESS"
        }
        if to_msisdn not in ORANGE_TRANSACTIONS: ORANGE_TRANSACTIONS[to_msisdn] = []
        ORANGE_TRANSACTIONS[to_msisdn].insert(0, credit_tx)
        credited = True
        logger.info(f"🔗 INTEROPÉRABILITÉ : Crédit Orange effectué pour {to_msisdn}")

    # Test MTN (si pas déjà crédité ou pour supporter le dual-sim dans la simu)
    if not credited:
        dest_mtn = MTN_ACCOUNTS.get(to_msisdn)
        if dest_mtn:
            dest_mtn["current_balance"] += amount
            credit_tx = {
                "id": f"CR-MTN-{tx_id}",
                "date": datetime.now().isoformat(),
                "desc": f"Transfert reçu de {from_msisdn} ({op_source})",
                "type": "CREDIT",
                "amount": amount,
                "status": "SUCCESS"
            }
            if to_msisdn not in MTN_TRANSACTIONS: MTN_TRANSACTIONS[to_msisdn] = []
            MTN_TRANSACTIONS[to_msisdn].insert(0, credit_tx)
            credited = True
            logger.info(f"🔗 INTEROPÉRABILITÉ : Crédit MTN effectué pour {to_msisdn}")

    if not credited:
        logger.warning(f"⚠️ Destinataire {to_msisdn} non trouvé dans le réseau Kandjou. Montant débité mais non crédité (Simulation de perte ou numéro externe).")

    return {
        "status": "success",
        "message": "Transfert inter-opérateur réussi via Kandjou",
        "operator_source": op_source,
        "transaction_id": tx_id,
        "interoperability": credited
    }

