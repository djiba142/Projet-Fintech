import logging
import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel

from modules.M1_aggregator.router import require_valid_token
from modules.common.database import (
    get_db_connection, 
    get_all_users, 
    create_user, 
    delete_user, 
    toggle_user_status,
    get_audit_logs,
    get_system_config,
    log_event
)

logger = logging.getLogger("admin-module")
router = APIRouter()

# --- Modèles ---
class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str
    fullname: str
    email: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    access_level: Optional[str] = None
    audit_level: Optional[str] = None

class ConfigUpdateRequest(BaseModel):
    key: str
    value: str

class SimulateDepositRequest(BaseModel):
    msisdn: str
    operator: str
    amount: int

class SimulateActivityRequest(BaseModel):
    msisdn: str
    operator: str
    count: int = 10

# ─── HELPER: vérifier rôle admin ───
def check_admin(token_data: Dict):
    if token_data.get("role") != "Administrateur":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")

# ─── OVERVIEW ───
@router.get("/overview")
async def get_admin_overview(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    users = get_all_users()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as count FROM transactions")
        total_tx = cursor.fetchone()['count']
    except Exception: total_tx = 0
    try:
        cursor.execute("SELECT COUNT(*) as count FROM audit_logs")
        total_logs = cursor.fetchone()['count']
    except Exception: total_logs = 0
    conn.close()
    
    try:
        import psutil
        cpu, ram = psutil.cpu_percent(interval=0.1), psutil.virtual_memory().percent
    except Exception: cpu, ram = 12.5, 45.2

    return {
        "kpis": {
            "total_users": len(users),
            "clients": len([u for u in users if u['role'] == 'Client']),
            "agents": len([u for u in users if u['role'] == 'Agent de Crédit']),
            "analystes": len([u for u in users if u['role'] == 'Analyste Risque']),
            "tx_total": total_tx,
            "system_health": "OPTIMAL",
            "uptime": "99.98%"
        },
        "system": { "cpu": cpu, "ram": ram, "latency": "42ms" },
        "user_growth": [{"month": "Jan", "count": 45}, {"month": "Mai", "count": len(users)}]
    }

# ─── UTILISATEURS ───
@router.get("/users")
async def get_admin_users(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    return get_all_users()

@router.post("/users")
async def admin_create_user(req: UserCreateRequest, token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    if req.role == "Client":
        raise HTTPException(status_code=400, detail="L'admin ne peut pas créer de clients.")
    res = create_user(req.username, req.password, req.role, req.fullname, req.email, institution=req.institution, department=req.department, access_level=req.access_level, audit_level=req.audit_level)
    if "error" in res: raise HTTPException(status_code=400, detail=res["error"])
    return res

# ─── OUTILS DE SIMULATION (FLUX MOCK) ───

@router.get("/simulate/mock-accounts")
async def get_mock_accounts(token_data: Dict = Depends(require_valid_token)):
    """Retourne la liste des comptes simulés disponibles dans M2."""
    check_admin(token_data)
    from modules.M2_simulators.mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS
    return {
        "orange": list(ORANGE_ACCOUNTS.keys()),
        "mtn": list(MTN_ACCOUNTS.keys())
    }

@router.post("/simulate/deposit")
async def simulate_deposit(req: SimulateDepositRequest, token_data: Dict = Depends(require_valid_token)):
    """Injecte des fonds simulés dans un compte Orange/MTN."""
    check_admin(token_data)
    from modules.M2_simulators.mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    
    if req.operator.upper() == "ORANGE":
        if req.msisdn not in ORANGE_ACCOUNTS: raise HTTPException(404, "Compte Orange non trouvé")
        ORANGE_ACCOUNTS[req.msisdn]["available_balance"] += req.amount
        tx_list = ORANGE_TRANSACTIONS
    else:
        if req.msisdn not in MTN_ACCOUNTS: raise HTTPException(404, "Compte MTN non trouvé")
        MTN_ACCOUNTS[req.msisdn]["current_balance"] += req.amount
        tx_list = MTN_TRANSACTIONS

    # Tracer la transaction
    new_tx = {
        "id": f"SIM-DEP-{random.randint(1000,9999)}",
        "date": datetime.now().isoformat(),
        "desc": f"Dépôt Simulation Admin",
        "type": "CREDIT",
        "amount": req.amount,
        "status": "SUCCESS"
    }
    if req.msisdn not in tx_list: tx_list[req.msisdn] = []
    tx_list[req.msisdn].insert(0, new_tx)
    
    log_event("admin", "SIMULATE_DEPOSIT", req.msisdn, "SUCCESS", f"Dépôt de {req.amount} GNF")
    return {"status": "success", "new_balance": ORANGE_ACCOUNTS[req.msisdn]["available_balance"] if req.operator == "ORANGE" else MTN_ACCOUNTS[req.msisdn]["current_balance"]}

@router.post("/simulate/generate-activity")
async def simulate_activity(req: SimulateActivityRequest, token_data: Dict = Depends(require_valid_token)):
    """Génère un historique de transactions pour un MSISDN (utile pour le scoring)."""
    check_admin(token_data)
    from modules.M2_simulators.mock_data import ORANGE_ACCOUNTS, MTN_ACCOUNTS, ORANGE_TRANSACTIONS, MTN_TRANSACTIONS
    
    is_orange = req.operator.upper() == "ORANGE"
    tx_list = ORANGE_TRANSACTIONS if is_orange else MTN_TRANSACTIONS
    if req.msisdn not in (ORANGE_ACCOUNTS if is_orange else MTN_ACCOUNTS):
        raise HTTPException(404, f"Compte {req.operator} non trouvé")

    if req.msisdn not in tx_list: tx_list[req.msisdn] = []
    
    types = ["CREDIT", "DEBIT", "DEBIT"] # Plus de débits pour le réalisme
    descs = ["Paiement Facture", "Achat Crédit", "Transfert reçu", "Dépôt Agent", "Paiement Marchand"]
    
    for i in range(req.count):
        t = random.choice(types)
        amt = random.randint(10000, 500000)
        new_tx = {
            "id": f"SIM-ACT-{random.randint(10000,99999)}",
            "date": (datetime.now() - timedelta(days=random.randint(1, 60))).isoformat(),
            "desc": random.choice(descs),
            "type": t,
            "amount": amt,
            "status": "SUCCESS"
        }
        tx_list[req.msisdn].append(new_tx)
    
    tx_list[req.msisdn].sort(key=lambda x: x["date"], reverse=True)
    return {"status": "success", "generated": req.count}

# ─── RESTE (LOGS, CONFIG, ROLES) ───
@router.get("/logs")
async def get_admin_logs(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    raw = get_audit_logs(limit=100)
    return [{"timestamp": l.get("timestamp"), "username": l.get("user_id"), "event_type": l.get("action"), "details": l.get("details"), "result": l.get("result"), "ip": "127.0.0.1"} for l in raw]

@router.get("/config")
async def get_admin_config(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    return get_system_config()

@router.get("/institutions")
async def get_admin_institutions(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    # ... mock simplified for readability ...
    return [{"id": "orange", "name": "Orange Money", "status": "ACTIVE", "uptime": "99.9%", "latency": "120ms", "success_rate": "99.8%"}]

@router.get("/transactions")
async def get_admin_all_transactions(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 200")
    txs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return txs

@router.get("/roles")
async def get_admin_roles(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    return [{"role": "Administrateur", "permissions": ["ALL_ACCESS"]}]
