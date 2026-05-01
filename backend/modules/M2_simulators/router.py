import asyncio
import logging
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, SIMULATED_OUTAGE_MSISDNS
from modules.common.database import get_sim_balance, update_sim_balance

# ─────────────────────────────────────────────────────────────────────────────
# Config & Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("simulators")

# ─────────────────────────────────────────────────────────────────────────────
# Initialisation des soldes depuis la DB (Persistance réelle)
# ─────────────────────────────────────────────────────────────────────────────
def sync_balances_from_db():
    """Charge TOUS les soldes persistants depuis la base de données (MySQL ou SQLite)."""
    from modules.common.database import get_db_connection
    conn = get_db_connection()
    if not conn: return
    
    try:
        cursor = conn.cursor(dictionary=True) if not hasattr(conn, 'row_factory') else conn.cursor()
        cursor.execute("SELECT msisdn, operator, balance FROM simulator_balances")
        rows = cursor.fetchall()
        
        count = 0
        for row in rows:
            # Normalisation pour SQLite vs MySQL
            if hasattr(row, '__dict__') and 'Row' in str(type(row)):
                r = dict(row)
            else:
                r = row if isinstance(row, dict) else {"msisdn": row[0], "operator": row[1], "balance": row[2]}
            
            msisdn = r["msisdn"]
            op = r["operator"].upper()
            bal = r["balance"]
            
            if op == "ORANGE":
                ORANGE_ACCOUNTS[msisdn] = {"msisdn": msisdn, "available_balance": bal, "last_deposit": None, "status": "ACTIVE"}
            elif op == "MTN":
                MTN_ACCOUNTS[msisdn] = {"subscriber_number": msisdn, "current_balance": bal, "currency": "GNF", "account_state": "OPEN"}
            count += 1
            
        logger.info(f"💾 {count} soldes synchronisés depuis la base de données.")
    except Exception as e:
        logger.error(f"❌ Erreur lors de la synchronisation des soldes: {e}")
    finally:
        conn.close()

# Appel au chargement du module
sync_balances_from_db()

LATENCY_SECONDS = 0.3

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# GRILLE TARIFAIRE KANDJOU (Officielle)
# ─────────────────────────────────────────────────────────────────────────────
# Frais appliqués sur le montant de la transaction
FEE_SCHEDULE = {
    "TRANSFER_SAME_OPERATOR": 0.005,   # 0.5% — Orange→Orange ou MTN→MTN
    "TRANSFER_INTEROP":       0.010,   # 1.0% — Orange→MTN ou MTN→Orange
    "WITHDRAWAL":             0.010,   # 1.0% — Retrait chez agent
    "DEPOSIT":                0.000,   # 0.0% — Dépôt toujours gratuit
}

FEE_MIN = 500   # Frais minimum en GNF
FEE_MAX = 50000  # Plafond frais en GNF

def compute_fee(amount: int, fee_type: str) -> int:
    """Calcule les frais selon la grille tarifaire avec min/max."""
    rate = FEE_SCHEDULE.get(fee_type, 0)
    if rate == 0:
        return 0
    fee = round(amount * rate)
    fee = max(fee, FEE_MIN)
    fee = min(fee, FEE_MAX)
    return fee

def is_interop(from_operator: str, to_msisdn: str) -> bool:
    """Détecte si le transfert est inter-opérateur."""
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS
    dest_is_orange = to_msisdn in ORANGE_ACCOUNTS
    dest_is_mtn = to_msisdn in MTN_ACCOUNTS
    if from_operator.upper() == "ORANGE" and dest_is_mtn and not dest_is_orange:
        return True
    if from_operator.upper() == "MTN" and dest_is_orange and not dest_is_mtn:
        return True
    return False

# ─────────────────────────────────────────────────────────────────────────────
# Persistance SQLite des transactions
# ─────────────────────────────────────────────────────────────────────────────

def persist_transaction(tx_id: str, client_id: str, operator: str, tx_type: str,
                         amount: int, fee: int, receiver: str, description: str,
                         status: str = "SUCCESS"):
    """Enregistre chaque transaction dans la base SQLite de façon fiable."""
    try:
        from modules.common.database import get_db_connection
        conn = get_db_connection()
        if not conn:
            logger.warning("⚠️ DB non disponible — transaction non persistée")
            return
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO transactions
              (tx_id, client_id, operator, type, amount, receiver, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx_id, client_id, operator, tx_type, amount, receiver, description, status))
        conn.commit()
        conn.close()
        logger.info(f"✅ Transaction {tx_id} persistée en DB (type={tx_type}, fee={fee} GNF)")
    except Exception as e:
        logger.error(f"❌ Erreur persistence DB: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# Endpoints Solde / Historique
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/provider/orange/balance/{msisdn}")
async def get_orange_balance(msisdn: str):
    """Retourne le solde Orange Money pour un MSISDN donné (Auto-création si nouveau)."""
    await asyncio.sleep(LATENCY_SECONDS)
    if msisdn in SIMULATED_OUTAGE_MSISDNS:
        logger.warning(f"⚠️ Panne simulée Orange pour {msisdn}")
        raise HTTPException(status_code=503, detail="Service Orange temporairement indisponible")
    
    if msisdn not in ORANGE_ACCOUNTS:
        ORANGE_ACCOUNTS[msisdn] = {"msisdn": msisdn, "available_balance": 0, "last_deposit": None, "status": "ACTIVE"}
        logger.info(f"🆕 Compte Orange auto-créé pour {msisdn}")
        
    account = ORANGE_ACCOUNTS.get(msisdn)
    logger.info(f"📱 Orange → Solde retourné pour {msisdn}")
    return account

@router.get("/provider/mtn/balance/{msisdn}")
async def get_mtn_balance(msisdn: str):
    """Retourne le solde MTN MoMo pour un MSISDN donné (Auto-création si nouveau)."""
    await asyncio.sleep(LATENCY_SECONDS)
    if msisdn in SIMULATED_OUTAGE_MSISDNS:
        logger.warning(f"⚠️ Panne simulée MTN pour {msisdn}")
        raise HTTPException(status_code=503, detail="Service MTN temporairement indisponible")
    
    if msisdn not in MTN_ACCOUNTS:
        MTN_ACCOUNTS[msisdn] = {"subscriber_number": msisdn, "current_balance": 0, "currency": "GNF", "account_state": "OPEN"}
        logger.info(f"🆕 Compte MTN auto-créé pour {msisdn}")
        
    account = MTN_ACCOUNTS.get(msisdn)
    logger.info(f"📱 MTN → Solde retourné pour {msisdn}")
    return account

@router.get("/provider/orange/transactions/{msisdn}")
async def get_orange_transactions(msisdn: str):
    from .mock_data import ORANGE_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)
    return ORANGE_TRANSACTIONS.get(msisdn, [])

@router.get("/provider/mtn/transactions/{msisdn}")
async def get_mtn_transactions(msisdn: str):
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
    return {"status": "online", "mode": "http", "timestamp": datetime.now().isoformat()}

# ─────────────────────────────────────────────────────────────────────────────
# Endpoint : Calcul des frais AVANT transfert (preview)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/provider/fees")
async def get_fees_preview(operator: str, to_msisdn: str, amount: int):
    """Retourne les frais estimés avant d'effectuer un transfert."""
    interop = is_interop(operator, to_msisdn)
    fee_type = "TRANSFER_INTEROP" if interop else "TRANSFER_SAME_OPERATOR"
    fee = compute_fee(amount, fee_type)
    return {
        "amount": amount,
        "fee": fee,
        "total_deducted": amount + fee,
        "is_interop": interop,
        "fee_type": fee_type,
        "fee_rate": f"{FEE_SCHEDULE[fee_type]*100:.1f}%",
        "currency": "GNF"
    }

# ─────────────────────────────────────────────────────────────────────────────
# Transfert entre clients (avec frais automatiques)
# ─────────────────────────────────────────────────────────────────────────────

class TransferRequest(BaseModel):
    operator: str          # ORANGE or MTN
    from_msisdn: str
    to_msisdn: str
    amount: int
    note: Optional[str] = "Transfert Kandjou"
    client_id: Optional[str] = None  # username pour la DB

@router.post("/provider/transfer")
async def execute_simulated_transfer(req: TransferRequest):
    """
    Simule un transfert avec :
    - Déduction automatique des frais selon la grille tarifaire
    - Mise à jour immédiate des soldes en mémoire
    - Persistance dans SQLite
    - Interopérabilité Orange ↔ MTN
    """
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)

    op_source = req.operator.upper()
    amount = req.amount
    to_msisdn = req.to_msisdn
    from_msisdn = req.from_msisdn
    tx_id = f"TX-{op_source[:2]}-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now().isoformat()

    # Calcul des frais
    interop = is_interop(op_source, to_msisdn)
    fee_type = "TRANSFER_INTEROP" if interop else "TRANSFER_SAME_OPERATOR"
    fee = compute_fee(amount, fee_type)
    total_deducted = amount + fee

    # ── 1. DÉBIT SOURCE (montant + frais) ──
    if op_source == "ORANGE":
        acc_source = ORANGE_ACCOUNTS.get(from_msisdn)
        if not acc_source:
            raise HTTPException(status_code=404, detail="Abonné source Orange introuvable")
        if acc_source["available_balance"] < total_deducted:
            raise HTTPException(status_code=400,
                detail=f"Solde Orange insuffisant. Requis: {total_deducted:,} GNF (montant + frais {fee:,} GNF)")
        acc_source["available_balance"] -= total_deducted
        update_sim_balance(from_msisdn, "ORANGE", acc_source["available_balance"])
        source_tx_list = ORANGE_TRANSACTIONS
        bal_key = "available_balance"

    elif op_source == "MTN":
        acc_source = MTN_ACCOUNTS.get(from_msisdn)
        if not acc_source:
            raise HTTPException(status_code=404, detail="Abonné source MTN introuvable")
        if acc_source["current_balance"] < total_deducted:
            raise HTTPException(status_code=400,
                detail=f"Solde MTN insuffisant. Requis: {total_deducted:,} GNF (montant + frais {fee:,} GNF)")
        acc_source["current_balance"] -= total_deducted
        update_sim_balance(from_msisdn, "MTN", acc_source["current_balance"])
        source_tx_list = MTN_TRANSACTIONS
        bal_key = "current_balance"
    else:
        raise HTTPException(status_code=400, detail="Opérateur source non supporté")

    # Enregistrement débit source (montant principal)
    debit_tx = {
        "id": tx_id,
        "date": now,
        "desc": f"Transfert vers {to_msisdn} ({req.note}) — Frais: {fee:,} GNF",
        "type": "DEBIT",
        "amount": amount,
        "fee": fee,
        "status": "SUCCESS"
    }
    if from_msisdn not in source_tx_list:
        source_tx_list[from_msisdn] = []
    source_tx_list[from_msisdn].insert(0, debit_tx)

    # ── 2. CRÉDIT DESTINATAIRE (interopérabilité automatique) ──
    credited = False

    # Chercher d'abord dans Orange
    dest_orange = ORANGE_ACCOUNTS.get(to_msisdn)
    if dest_orange:
        dest_orange["available_balance"] += amount
        update_sim_balance(to_msisdn, "ORANGE", dest_orange["available_balance"])
        credit_tx = {
            "id": f"CR-OR-{tx_id}",
            "date": now,
            "desc": f"Reçu de {from_msisdn} ({op_source})",
            "type": "CREDIT",
            "amount": amount,
            "fee": 0,
            "status": "SUCCESS"
        }
        if to_msisdn not in ORANGE_TRANSACTIONS:
            ORANGE_TRANSACTIONS[to_msisdn] = []
        ORANGE_TRANSACTIONS[to_msisdn].insert(0, credit_tx)
        credited = True
        logger.info(f"🔗 INTEROP: Crédit Orange pour {to_msisdn} ({amount:,} GNF)")

    # Puis dans MTN si non crédité
    if not credited:
        dest_mtn = MTN_ACCOUNTS.get(to_msisdn)
        if dest_mtn:
            dest_mtn["current_balance"] += amount
            update_sim_balance(to_msisdn, "MTN", dest_mtn["current_balance"])
            credit_tx = {
                "id": f"CR-MTN-{tx_id}",
                "date": now,
                "desc": f"Reçu de {from_msisdn} ({op_source})",
                "type": "CREDIT",
                "amount": amount,
                "fee": 0,
                "status": "SUCCESS"
            }
            if to_msisdn not in MTN_TRANSACTIONS:
                MTN_TRANSACTIONS[to_msisdn] = []
            MTN_TRANSACTIONS[to_msisdn].insert(0, credit_tx)
            credited = True
            logger.info(f"🔗 INTEROP: Crédit MTN pour {to_msisdn} ({amount:,} GNF)")

    if not credited:
        logger.warning(f"⚠️ Destinataire {to_msisdn} introuvable — débit effectué sans crédit")

    # ── 3. PERSISTANCE SQLite ──
    persist_transaction(
        tx_id=tx_id,
        client_id=req.client_id or from_msisdn,
        operator=op_source,
        tx_type="TRANSFER",
        amount=amount,
        fee=fee,
        receiver=to_msisdn,
        description=f"Transfert {op_source}→{'Orange' if dest_orange else 'MTN'} | Frais: {fee:,} GNF",
        status="SUCCESS"
    )

    logger.info(f"✅ Transfert {tx_id}: {from_msisdn}→{to_msisdn} | {amount:,} GNF + frais {fee:,} GNF")

    new_balance = acc_source.get("available_balance") or acc_source.get("current_balance")
    return {
        "status": "success",
        "message": "Transfert réussi via Kandjou",
        "operator_source": op_source,
        "transaction_id": tx_id,
        "amount": amount,
        "fee": fee,
        "fee_type": fee_type,
        "total_deducted": total_deducted,
        "new_balance": new_balance,
        "interoperability": credited and interop,
        "recipient_credited": credited
    }

# ─────────────────────────────────────────────────────────────────────────────
# Retrait chez agent (avec frais automatiques)
# ─────────────────────────────────────────────────────────────────────────────

class WithdrawRequest(BaseModel):
    operator: str
    msisdn: str
    amount: int
    agent_id: str
    client_id: Optional[str] = None

@router.post("/provider/withdraw")
async def execute_simulated_withdraw(req: WithdrawRequest):
    """
    Retrait chez agent avec :
    - Frais de retrait (1% du montant, min 500 GNF, max 50 000 GNF)
    - Déduction solde en mémoire
    - Persistance SQLite
    """
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)

    op = req.operator.upper()
    amount = req.amount
    msisdn = req.msisdn
    tx_id = f"WD-{op[:2]}-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now().isoformat()

    # Calcul des frais de retrait
    fee = compute_fee(amount, "WITHDRAWAL")
    total_deducted = amount + fee

    if op == "ORANGE":
        acc = ORANGE_ACCOUNTS.get(msisdn)
        if not acc:
            raise HTTPException(status_code=404, detail="Abonné Orange introuvable")
        if acc["available_balance"] < total_deducted:
            raise HTTPException(status_code=400,
                detail=f"Solde insuffisant. Requis: {total_deducted:,} GNF (retrait + frais {fee:,} GNF)")
        acc["available_balance"] -= total_deducted
        update_sim_balance(msisdn, "ORANGE", acc["available_balance"])
        tx_list = ORANGE_TRANSACTIONS
        new_balance = acc["available_balance"]

    elif op == "MTN":
        acc = MTN_ACCOUNTS.get(msisdn)
        if not acc:
            raise HTTPException(status_code=404, detail="Abonné MTN introuvable")
        if acc["current_balance"] < total_deducted:
            raise HTTPException(status_code=400,
                detail=f"Solde insuffisant. Requis: {total_deducted:,} GNF (retrait + frais {fee:,} GNF)")
        acc["current_balance"] -= total_deducted
        update_sim_balance(msisdn, "MTN", acc["current_balance"])
        tx_list = MTN_TRANSACTIONS
        new_balance = acc["current_balance"]
    else:
        raise HTTPException(status_code=400, detail="Opérateur non supporté")

    # Enregistrement en mémoire
    withdraw_tx = {
        "id": tx_id,
        "date": now,
        "desc": f"Retrait Agent #{req.agent_id} — Frais: {fee:,} GNF",
        "type": "DEBIT",
        "amount": amount,
        "fee": fee,
        "status": "SUCCESS"
    }
    if msisdn not in tx_list:
        tx_list[msisdn] = []
    tx_list[msisdn].insert(0, withdraw_tx)

    # Persistance SQLite
    persist_transaction(
        tx_id=tx_id,
        client_id=req.client_id or msisdn,
        operator=op,
        tx_type="WITHDRAW",
        amount=amount,
        fee=fee,
        receiver=f"AGENT-{req.agent_id}",
        description=f"Retrait Cash-out Agent #{req.agent_id} | Frais: {fee:,} GNF",
        status="SUCCESS"
    )

    logger.info(f"💵 Retrait {tx_id}: {msisdn} | {amount:,} GNF + frais {fee:,} GNF | Agent {req.agent_id}")

    return {
        "status": "success",
        "transaction_id": tx_id,
        "amount": amount,
        "fee": fee,
        "total_deducted": total_deducted,
        "new_balance": new_balance,
        "operator": op,
        "agent_id": req.agent_id
    }

# ─────────────────────────────────────────────────────────────────────────────
# Dépôt chez agent (gratuit, crédit automatique)
# ─────────────────────────────────────────────────────────────────────────────

class DepositRequest(BaseModel):
    operator: str
    msisdn: str
    amount: int
    agent_id: str
    client_id: Optional[str] = None

@router.post("/provider/deposit")
async def execute_simulated_deposit(req: DepositRequest):
    """
    Dépôt chez agent : toujours gratuit, crédit immédiat du compte.
    """
    from .mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    await asyncio.sleep(LATENCY_SECONDS)

    op = req.operator.upper()
    amount = req.amount
    msisdn = req.msisdn
    tx_id = f"DEP-{op[:2]}-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now().isoformat()

    if op == "ORANGE":
        acc = ORANGE_ACCOUNTS.get(msisdn)
        if not acc:
            raise HTTPException(status_code=404, detail="Abonné Orange introuvable")
        acc["available_balance"] += amount
        update_sim_balance(msisdn, "ORANGE", acc["available_balance"])
        tx_list = ORANGE_TRANSACTIONS
        new_balance = acc["available_balance"]

    elif op == "MTN":
        acc = MTN_ACCOUNTS.get(msisdn)
        if not acc:
            raise HTTPException(status_code=404, detail="Abonné MTN introuvable")
        acc["current_balance"] += amount
        update_sim_balance(msisdn, "MTN", acc["current_balance"])
        tx_list = MTN_TRANSACTIONS
        new_balance = acc["current_balance"]
    else:
        raise HTTPException(status_code=400, detail="Opérateur non supporté")

    # Enregistrement en mémoire
    deposit_tx = {
        "id": tx_id,
        "date": now,
        "desc": f"Dépôt Agent #{req.agent_id} (Gratuit)",
        "type": "CREDIT",
        "amount": amount,
        "fee": 0,
        "status": "SUCCESS"
    }
    if msisdn not in tx_list:
        tx_list[msisdn] = []
    tx_list[msisdn].insert(0, deposit_tx)

    # Persistance SQLite
    persist_transaction(
        tx_id=tx_id,
        client_id=req.client_id or msisdn,
        operator=op,
        tx_type="DEPOSIT",
        amount=amount,
        fee=0,
        receiver=msisdn,
        description=f"Dépôt Cash-in Agent #{req.agent_id} (Gratuit)",
        status="SUCCESS"
    )

    logger.info(f"🏦 Dépôt {tx_id}: {msisdn} | +{amount:,} GNF (gratuit) | Agent {req.agent_id}")

    return {
        "status": "success",
        "transaction_id": tx_id,
        "amount": amount,
        "fee": 0,
        "new_balance": new_balance,
        "operator": op,
        "agent_id": req.agent_id
    }
