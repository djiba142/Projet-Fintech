import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException, Request, Body, status, Query, Header, Depends
from pydantic import BaseModel

from .utils import OTPStorage, generate_secure_token
from modules.common.database import get_user_by_username, log_event

# --- Configuration du logger local ---
logger = logging.getLogger("security_vault")

router = APIRouter()

# --- Base de données Utilisateurs (Simulée) ---
# Les utilisateurs sont désormais gérés via SQLite (modules/common/database.py)

# --- Alertes Sécurité (Simulées) ---
SECURITY_ALERTS = [
    {"ip": "192.168.1.50", "reason": "Tentatives multiples OTP", "time": "16:05"},
    {"ip": "10.0.0.12", "reason": "Accès Admin non autorisé", "time": "15:20"}
]

# --- Modèles de données ---
class LoginRequest(BaseModel):
    username: str
    password: str

class OTPRequest(BaseModel):
    msisdn_orange: Optional[str] = None
    msisdn_mtn: Optional[str] = None

class OTPVerify(BaseModel):
    session_id: str
    code: str

# --- Stockage ---
otp_manager = OTPStorage()
ACTIVE_SESSIONS: Dict[str, Dict] = {} # Token -> UserData

# --- Persistance Simple des Sessions (pour le dév) ---
import json
import os
SESSIONS_FILE = "sessions.json"

def load_sessions():
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r") as f:
                data = json.load(f)
                ACTIVE_SESSIONS.clear()
                ACTIVE_SESSIONS.update(data)
                logger.info(f"💾 {len(ACTIVE_SESSIONS)} sessions chargées depuis sessions.json")
        except Exception as e:
            logger.error(f"Erreur chargement sessions: {e}")

def save_sessions():
    try:
        with open(SESSIONS_FILE, "w") as f:
            json.dump(ACTIVE_SESSIONS, f)
    except: pass

load_sessions()

# --- Endpoints d'Authentification ---

@router.post("/auth/login")
async def login(req: LoginRequest):
    user = get_user_by_username(req.username)
    
    if not user or user["password"] != req.password:
        logger.warning(f"❌ Échec de connexion : {req.username}")
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    
    if user["status"] == "suspended":
        raise HTTPException(status_code=403, detail="Votre compte est suspendu. Contactez l'administrateur.")
    
    # Génération des tokens
    access_token = f"KANDJOU_ACCESS_{generate_secure_token()}"
    refresh_token = f"KANDJOU_REFRESH_{generate_secure_token()}"
    
    session_data = {
        "username": req.username,
        "role": user["role"],
        "fullname": user["fullname"],
        "primary": req.username,
        "msisdn_orange": user.get("msisdn_orange"),
        "msisdn_mtn": user.get("msisdn_mtn"),
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(hours=2)).isoformat()
    }
    
    ACTIVE_SESSIONS[access_token] = session_data
    # On lie le refresh token à l'access token pour simplification dans cette simulation
    ACTIVE_SESSIONS[refresh_token] = {**session_data, "type": "refresh", "linked_to": access_token}
    
    save_sessions()
    
    log_event(req.username, "LOGIN_SUCCESS", result="SUCCESS", details=f"Rôle: {user['role']}")
    logger.info(f"✅ Connexion réussie : {req.username} (Rôle: {user['role']})")
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "role": user["role"],
        "fullname": user["fullname"],
        "email": user.get("email")
    }

@router.post("/auth/refresh")
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    if refresh_token not in ACTIVE_SESSIONS or ACTIVE_SESSIONS[refresh_token].get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token invalide")
    
    session_data = ACTIVE_SESSIONS[refresh_token]
    new_access_token = f"KANDJOU_ACCESS_{generate_secure_token()}"
    
    # Créer une nouvelle session d'accès
    ACTIVE_SESSIONS[new_access_token] = {
        "username": session_data["username"],
        "role": session_data["role"],
        "fullname": session_data["fullname"],
        "primary": session_data["username"],
        "msisdn_orange": session_data.get("msisdn_orange"),
        "msisdn_mtn": session_data.get("msisdn_mtn"),
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(hours=2)).isoformat()
    }
    
    save_sessions()
    return {"access_token": new_access_token}

class RegisterRequest(BaseModel):
    username: str
    password: str
    fullname: str
    email: Optional[str] = None
    language: Optional[str] = "FR"

@router.post("/auth/register")
async def register(req: RegisterRequest):
    from modules.common.database import create_user
    res = create_user(req.username, req.password, "Client", req.fullname, req.email, req.language)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    logger.info(f"Nouvel utilisateur cree : {req.username}")
    return {"message": "Utilisateur créé avec succès", "username": req.username}

class ResetPasswordRequest(BaseModel):
    username: str

@router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    """Simule l'envoi d'un e-mail de réinitialisation de mot de passe."""
    user = get_user_by_username(req.username)
    # On ne révèle jamais si le compte existe ou non (sécurité)
    log_event(
        user_id=req.username,
        action="PASSWORD_RESET_REQUEST",
        result="SENT" if user else "NOT_FOUND",
        details=f"Demande de reinitialisation pour {req.username}"
    )
    if user:
        logger.info(f"Demande de reinitialisation pour {req.username} - e-mail simule envoye")
    return {"message": "Si un compte existe avec cet identifiant, un e-mail de réinitialisation a été envoyé."}

@router.post("/auth/request-otp")
async def request_otp(req: OTPRequest):
    if not req.msisdn_orange and not req.msisdn_mtn:
        raise HTTPException(status_code=400, detail="Au moins un numéro est requis")
    
    session_id, code = otp_manager.create_session(req.msisdn_orange, req.msisdn_mtn)
    log_event("system", "OTP_REQUEST", target=f"{req.msisdn_orange or 'N/A'}/{req.msisdn_mtn or 'N/A'}", details=f"Session ID: {session_id}")
    logger.info(f"🔑 OTP généré pour {req.msisdn_orange or 'N/A'} / {req.msisdn_mtn or 'N/A'} | Code: {code}")
    return {"session_id": session_id, "message": "OTP envoyé (simulé)"}

@router.post("/auth/verify-otp")
async def verify_otp(req: OTPVerify):
    status = otp_manager.verify_otp(req.session_id, req.code)
    if status != "VALID":
        logger.warning(f"❌ Échec OTP pour session {req.session_id} : {status}")
        if status == "BLOCKED":
            raise HTTPException(status_code=429, detail="Trop de tentatives. Session bloquée.")
        raise HTTPException(status_code=400, detail=f"Code invalide ou session expirée ({status})")
    
    session_data = otp_manager.get_session_data(req.session_id)
    token = generate_secure_token()
    
    # Le token d'accès temporaire pour M1
    access_token = f"KANDJOU_ACCESS_{token}"
    ACTIVE_SESSIONS[access_token] = {
        "type": "scoring_access",
        "msisdn_orange": session_data["msisdn_orange"],
        "msisdn_mtn": session_data["msisdn_mtn"],
        "primary": session_data["primary"],
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat()
    }
    save_sessions()
    
    log_event("system", "OTP_VERIFY", target=session_data["primary"], result="SUCCESS", details=f"Token: {access_token}")
    logger.info(f"✅ OTP Validé pour {session_data['primary']} | Token: {access_token}")
    return {"token": access_token}

# --- Dépendances de sécurité ---

async def require_valid_token(token: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    actual_token = token
    if authorization and authorization.startswith("Bearer "):
        actual_token = authorization.split(" ")[1]
        
    if not actual_token:
        raise HTTPException(status_code=401, detail="Token manquant")
        
    session = ACTIVE_SESSIONS.get(actual_token)
    if not session:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")
    return session

async def require_admin_token(token: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    session = await require_valid_token(token, authorization)
    if session.get("role") != "Administrateur":
        log_event(session.get("username"), "UNAUTHORIZED_ADMIN_ACCESS", result="DENIED")
        raise HTTPException(status_code=403, detail="Privilèges Administrateur requis")
    return session

async def require_regulator_token(token: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    session = await require_valid_token(token, authorization)
    if session.get("role") not in ["Administrateur", "Régulateur (BCRG)"]:
        log_event(session.get("username"), "UNAUTHORIZED_REGULATOR_ACCESS", result="DENIED")
        raise HTTPException(status_code=403, detail="Privilèges Régulateur (BCRG) requis")
    return session

# --- Endpoints Régulateur (BCRG) ---

# --- Endpoints Administratifs ---

@router.get("/admin/system-overview")
async def get_system_overview(admin_session: Dict = Depends(require_admin_token)):
    """Retourne l'état complet du système pour le Dashboard Admin."""
    from modules.common.database import get_all_users, get_db_connection
    
    users = get_all_users()
    agents_count = len([u for u in users if u["role"] == "Agent de Crédit"])
    
    # Stats réelles depuis la base
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transactions")
        total_tx = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM institutions")
        total_inst = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM loan_dossiers")
        total_scorings = cursor.fetchone()[0]
        conn.close()
    except:
        total_tx = 0
        total_inst = 0
        total_scorings = 0
    
    return {
        "system_status": {
            "m1_aggregator": "online",
            "m2_simulators": "online",
            "m3_security": "online",
            "api_orange": "online",
            "api_mtn": "online"
        },
        "users": users,
        "security_alerts": SECURITY_ALERTS,
        "stats": {
            "total_users": len(users),
            "total_transactions": total_tx,
            "total_agents": agents_count,
            "total_institutions": total_inst,
            "total_scorings_today": total_scorings,
            "avg_latency": "320ms",
            "active_sessions": len(ACTIVE_SESSIONS)
        },
        "api_monitoring": {
            "orange": {"status": "online", "latency": "145ms", "last_check": "Il y a 2 min"},
            "mtn": {"status": "online", "latency": "190ms", "last_check": "Il y a 1 min"}
        }
    }

@router.get("/admin/transactions")
async def get_all_transactions(limit: int = 50, admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import get_db_connection
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.tx_id, t.client_id, u.fullname, t.operator, t.type, t.amount, 
                   t.receiver, t.description, t.status, t.created_at
            FROM transactions t
            LEFT JOIN users u ON t.client_id = u.username
            ORDER BY t.created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": r["tx_id"],
                "client_id": r["client_id"],
                "client": r["fullname"] or r["client_id"],
                "operator": r["operator"],
                "type": r["type"],
                "amount": r["amount"],
                "amount_formatted": f"{r['amount']:,.0f} GNF",
                "receiver": r["receiver"],
                "description": r["description"],
                "status": r["status"],
                "time": r["created_at"]
            }
            for r in rows
        ]
    except Exception as e:
        logger.error(f"Erreur admin/transactions: {e}")
        return []

@router.post("/admin/create-user")
async def create_user_endpoint(data: Dict = Body(...), admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import create_user
    try:
        create_user(data["username"], data["password"], data["role"], data["fullname"], data.get("username"))
        log_event(admin_session["username"], "CREATE_USER", target=data["username"], details=f"Rôle: {data['role']}")
        return {"message": "Utilisateur créé"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/test-api")
async def test_api(provider: str = Body(..., embed=True), admin_session: Dict = Depends(require_admin_token)):
    import random
    success = random.choice([True, True, True, False])
    return {"status": "success" if success else "error", "message": f"Test API {provider} terminé."}

@router.post("/admin/delete-user")
async def delete_user_endpoint(username: str = Body(..., embed=True), admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import delete_user
    delete_user(username)
    log_event(admin_session["username"], "DELETE_USER", target=username, result="SUCCESS")
    return {"message": "Utilisateur supprimé"}

@router.post("/admin/update-role")
async def update_role_endpoint(username: str = Body(...), role: str = Body(...), admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import update_user_role
    update_user_role(username, role)
    log_event(admin_session["username"], "UPDATE_USER_ROLE", target=username, details=f"Nouveau rôle: {role}")
    return {"message": "Rôle mis à jour"}

@router.post("/admin/toggle-user")
async def toggle_user_endpoint(username: str = Body(..., embed=True), admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import toggle_user_status
    res = toggle_user_status(username)
    log_event(admin_session["username"], "TOGGLE_USER_STATUS", target=username, details=f"Nouveau statut: {res.get('new_status')}")
    return res

@router.get("/admin/report/download")
async def download_admin_report(admin_session: Dict = Depends(require_admin_token)):
    from modules.common.database import get_all_users, get_audit_logs
    from fastapi.responses import StreamingResponse
    import io
    users = get_all_users()
    logs = get_audit_logs(20)
    report = "=== RAPPORT ADMINISTRATIF KANDJOU ===\n"
    report += f"Genere par: {admin_session['username']}\n\n"
    report += "--- UTILISATEURS ---\n"
    for u in users:
        report += f"  {u['username']} | {u['role']} | {u['status']}\n"
    report += f"\nTotal: {len(users)} utilisateurs\n\n"
    report += "--- DERNIERS LOGS ---\n"
    for l in logs:
        report += f"  [{l.get('timestamp','')}] {l.get('user_id','')} - {l.get('action','')}\n"
    log_event(admin_session["username"], "DOWNLOAD_REPORT", result="SUCCESS")
    buffer = io.BytesIO(report.encode("utf-8"))
    return StreamingResponse(buffer, media_type="text/plain", headers={"Content-Disposition": "attachment; filename=rapport_kandjou.txt"})

# --- Endpoints Régulateur (BCRG) ---

@router.get("/audit/overview")
async def get_audit_overview(reg_session: Dict = Depends(require_regulator_token)):
    """Tableau de bord global pour le régulateur — données réelles."""
    from modules.common.database import get_db_connection
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Stats transactions réelles
        cursor.execute("SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as total FROM transactions")
        tx_stats = cursor.fetchone()
        
        # Utilisateurs actifs
        cursor.execute("SELECT COUNT(*) FROM users WHERE status = 'active'")
        active_users = cursor.fetchone()[0]
        
        # Institutions (agents)
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'Agent de Crédit'")
        agents_count = cursor.fetchone()[0]
        
        # Alertes ouvertes
        cursor.execute("SELECT COUNT(*) FROM audit_alerts WHERE status IN ('OPEN', 'INVESTIGATING')")
        open_alerts = cursor.fetchone()[0]
        
        # Alertes récentes
        cursor.execute("""
            SELECT id, type, details, client_id, severity, status, created_at 
            FROM audit_alerts 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        recent_alerts = [
            {
                "id": a["id"], 
                "type": a["type"], 
                "desc": a["details"], 
                "target": f"Client {a['client_id']}", 
                "severity": a["severity"],
                "status": a["status"],
                "time": a["created_at"]
            } 
            for a in cursor.fetchall()
        ]
        
        # Dossiers stats
        cursor.execute("SELECT COUNT(*) FROM loan_dossiers WHERE status = 'APPROVED'")
        approved = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM loan_dossiers WHERE status = 'REJECTED'")
        rejected = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM loan_dossiers")
        total_dossiers = cursor.fetchone()[0]
        
        compliance_rate = round((approved / total_dossiers * 100), 1) if total_dossiers > 0 else 0
        
        conn.close()
        
        return {
            "stats": {
                "total_transactions": tx_stats["cnt"],
                "total_volume": f"{tx_stats['total']:,.0f} GNF",
                "active_users": active_users,
                "connected_institutions": agents_count + 4  # Agents + Institutions fixes (Orange, MTN, Vista, Ecobank)
            },
            "anomalies_count": open_alerts,
            "compliance_rate": f"{compliance_rate}%",
            "loan_stats": {
                "total": total_dossiers,
                "approved": approved,
                "rejected": rejected,
                "pending": total_dossiers - approved - rejected
            },
            "recent_alerts": recent_alerts
        }
    except Exception as e:
        logger.error(f"Erreur audit/overview: {e}")
        return {"stats": {}, "anomalies_count": 0, "compliance_rate": "N/A", "recent_alerts": []}

@router.get("/audit/institutions")
async def get_audit_institutions(reg_session: Dict = Depends(require_regulator_token)):
    """Liste des institutions financières surveillées."""
    return [
        {"id": "MF-001", "name": "BKR Microfinance", "status": "CONFORME", "last_audit": "12/04/2024", "risk": "FAIBLE"},
        {"id": "MF-002", "name": "Kandjou Crédit", "status": "EN RÉVISION", "last_audit": "05/05/2024", "risk": "MODÉRÉ"}
    ]

@router.post("/audit/report/generate")
async def generate_regulatory_report(reg_session: Dict = Depends(require_regulator_token)):
    """Simule la génération d'un rapport de conformité BCRG."""
    log_event(reg_session["username"], "GENERATE_REGULATORY_REPORT", result="SUCCESS")
    return {"message": "Rapport BCRG généré avec succès", "download_url": "/audit/report/download/rep-2024.pdf"}

@router.get("/audit/logs")
async def get_regulator_logs(limit: int = 100, reg_session: Dict = Depends(require_regulator_token)):
    from modules.common.database import get_audit_logs
    return get_audit_logs(limit)

@router.post("/audit/resolve-alert")
async def resolve_alert(alert_id: int = Body(..., embed=True), reg_session: Dict = Depends(require_regulator_token)):
    log_event(reg_session["username"], "RESOLVE_ALERT", target=str(alert_id), result="SUCCESS")
    return {"message": "Alerte marquée comme traitée"}

