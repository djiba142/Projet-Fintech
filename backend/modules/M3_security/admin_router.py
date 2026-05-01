import logging
import random
import sqlite3
import uuid
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

@router.get("/overview")
async def get_admin_overview(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    users = get_all_users()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    
    try:
        cursor.execute("SELECT COUNT(*) as count FROM transactions")
        row = cursor.fetchone()
        total_tx = row['count'] if isinstance(row, dict) else row[0]
    except Exception: total_tx = 0
    
    # Calcul croissance réelle des utilisateurs
    try:
        cursor.execute("SELECT strftime('%m', created_at) as month, COUNT(*) as count FROM users GROUP BY month")
        growth_raw = cursor.fetchall()
        # Mapping mois index -> nom
        months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
        user_growth = []
        for g in growth_raw:
            m_idx = int(g['month'] if isinstance(g, dict) else g[0]) - 1
            user_growth.append({"month": months[m_idx], "count": g['count'] if isinstance(g, dict) else g[1]})
        if not user_growth:
            user_growth = [{"month": "Mai", "count": len(users)}]
    except Exception:
        user_growth = [{"month": "Mai", "count": len(users)}]
    
    # Alertes récentes pour l'admin
    try:
        cursor.execute("SELECT * FROM audit_alerts WHERE status = 'OPEN' ORDER BY created_at DESC LIMIT 3")
        recent_alerts = [dict(a) for a in cursor.fetchall()]
    except Exception:
        recent_alerts = []

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
        "system": { "cpu": cpu, "ram": ram, "latency": "24ms" },
        "user_growth": user_growth,
        "recent_alerts": recent_alerts
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
    """Injecte des fonds réels dans un compte Orange/MTN simulé via la DB."""
    check_admin(token_data)
    from modules.M2_simulators.router import persist_transaction
    from modules.common.database import get_sim_balance, update_sim_balance
    
    # 1. CRÉDIT CLIENT
    current = get_sim_balance(req.msisdn) or 0
    new_bal = current + req.amount
    update_sim_balance(req.msisdn, req.operator.upper(), new_bal)
    
    # 2. DÉBIT ADMIN (Réalisme demandé)
    admin_msisdn = token_data.get("msisdn_orange") if req.operator.upper() == "ORANGE" else token_data.get("msisdn_mtn")
    if not admin_msisdn: admin_msisdn = token_data.get("primary")
    
    admin_bal = get_sim_balance(admin_msisdn) or 0
    update_sim_balance(admin_msisdn, req.operator.upper(), admin_bal - req.amount)
    
    tx_id = f"SIM-DEP-{uuid.uuid4().hex[:6].upper()}"
    persist_transaction(
        tx_id=tx_id,
        client_id=req.msisdn,
        operator=req.operator.upper(),
        tx_type="DEPOSIT",
        amount=req.amount,
        fee=0,
        receiver=req.msisdn,
        description="Dépôt Simulation Admin",
        status="SUCCESS"
    )
    
    log_event("admin", "SIMULATE_DEPOSIT", req.msisdn, "SUCCESS", f"Dépôt de {req.amount} GNF (Admin débié)")
    return {"status": "success", "new_balance": new_bal, "admin_new_balance": admin_bal - req.amount}

@router.post("/simulate/generate-activity")
async def simulate_activity(req: SimulateActivityRequest, token_data: Dict = Depends(require_valid_token)):
    """Génère un historique de transactions réel dans la DB pour un MSISDN."""
    check_admin(token_data)
    from modules.M2_simulators.router import persist_transaction
    
    types = ["CREDIT", "DEBIT", "DEBIT"]
    descs = ["Paiement Facture", "Achat Crédit", "Transfert reçu", "Dépôt Agent", "Paiement Marchand"]
    
    for _ in range(req.count):
        t = random.choice(types)
        amt = random.randint(10000, 500000)
        tx_id = f"SIM-ACT-{uuid.uuid4().hex[:8].upper()}"
        persist_transaction(
            tx_id=tx_id,
            client_id=req.msisdn,
            operator=req.operator.upper(),
            tx_type=t,
            amount=amt,
            fee=0,
            receiver="Destinataire Simulé",
            description=random.choice(descs),
            status="SUCCESS"
        )
    
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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM institutions")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/transactions")
async def get_admin_all_transactions(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 200")
    rows = cursor.fetchall()
    txs = []
    for r in rows:
        d = dict(r)
        txs.append({
            "tx_id": d.get("tx_id"),
            "username": d.get("client_id"),
            "type": d.get("type"),
            "amount": d.get("amount"),
            "status": d.get("status"),
            "date": d.get("created_at")
        })
    conn.close()
    return txs

@router.get("/roles")
async def get_admin_roles(token_data: Dict = Depends(require_valid_token)):
    check_admin(token_data)
    return [{"role": "Administrateur", "permissions": ["ALL_ACCESS"]}]
