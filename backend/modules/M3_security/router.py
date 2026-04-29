import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException, Request, Body, status, Query
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
    global ACTIVE_SESSIONS
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r") as f:
                ACTIVE_SESSIONS = json.load(f)
                logger.info(f"💾 {len(ACTIVE_SESSIONS)} sessions chargées depuis sessions.json")
        except: pass

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
    
    # Génération d'un token de session utilisateur
    token = f"KANDJOU_SESSION_{generate_secure_token()}"
    session_data = {
        "username": req.username,
        "role": user["role"],
        "fullname": user["fullname"],
        "primary": req.username,
        "msisdn_orange": user.get("msisdn_orange"),
        "msisdn_mtn": user.get("msisdn_mtn"),
        "created_at": datetime.now().isoformat()
    }
    ACTIVE_SESSIONS[token] = session_data
    save_sessions()
    
    log_event(req.username, "LOGIN_SUCCESS", result="SUCCESS", details=f"Rôle: {user['role']}")
    logger.info(f"✅ Connexion réussie : {req.username} (Rôle: {user['role']})")
    return {"token": token, "role": user["role"], "fullname": user["fullname"], "language": user.get("language", "FR")}

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

@router.get("/auth/validate-token")
async def validate_token_get(token: str = Query(...)):
    session = ACTIVE_SESSIONS.get(token)
    if not session:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    # Vérification d'expiration si c'est un token d'accès scoring
    if session.get("type") == "scoring_access":
        expiry = datetime.fromisoformat(session["expires_at"])
        if datetime.now() > expiry:
            del ACTIVE_SESSIONS[token]
            raise HTTPException(status_code=401, detail="Token expiré")
            
    return session

@router.post("/auth/validate-token")
async def validate_token_post(token: str = Body(..., embed=True)):
    return await validate_token_get(token)

@router.get("/admin/audit-logs")
async def get_audit_logs_endpoint(limit: int = 100):
    from modules.common.database import get_audit_logs
    return get_audit_logs(limit)

@router.get("/admin/users")
async def get_all_users_endpoint():
    from modules.common.database import get_all_users
    return get_all_users()

class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str
    fullname: str

@router.post("/admin/create-user")
async def create_user_endpoint(req: CreateUserRequest):
    from modules.common.database import create_user
    res = create_user(req.username, req.password, req.role, req.fullname)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("/admin/toggle-user")
async def toggle_user_endpoint(username: str = Body(..., embed=True)):
    from modules.common.database import toggle_user_status
    return toggle_user_status(username)

@router.get("/admin/alerts")
async def get_alerts_endpoint():
    return SECURITY_ALERTS

class UpdateLangRequest(BaseModel):
    username: str
    language: str

@router.post("/auth/update-language")
async def update_language(req: UpdateLangRequest):
    from modules.common.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET language = %s WHERE username = %s", (req.language, req.username))
    conn.commit()
    conn.close()
    return {"message": "Langue mise à jour", "language": req.language}

# --- Endpoints Administratifs ---

@router.get("/admin/system-overview")
async def get_system_overview():
    """Retourne l'état complet du système pour le Dashboard Admin."""
    from modules.common.database import get_all_users
    return {
        "system_status": {
            "m1_aggregator": "online",
            "m2_simulators": "online",
            "m3_security": "online"
        },
        "users": get_all_users(),
        "security_alerts": SECURITY_ALERTS,
        "stats": {
            "total_scorings_today": 124,
            "avg_latency": "320ms",
            "active_sessions": len(ACTIVE_SESSIONS)
        }
    }

