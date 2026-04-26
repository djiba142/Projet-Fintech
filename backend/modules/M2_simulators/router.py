import asyncio
import logging
from datetime import datetime
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

@router.get("/health")
async def health():
    return {
        "status": "online",
        "mode": "http",
        "timestamp": datetime.now().isoformat()
    }
