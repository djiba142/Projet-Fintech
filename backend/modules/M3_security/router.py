import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException, Request, Body, status
from pydantic import BaseModel

from .utils import OTPStorage, generate_secure_token

# --- Configuration du logger local ---
logger = logging.getLogger("security_vault")

router = APIRouter()

# --- Base de données Utilisateurs (Simulée) ---
USERS_DB = [
    {"id": 1, "username": "djiba", "password": "password123", "role": "ADMIN", "fullname": "Djiba Kourouma", "status": "active", "last_login": "2026-04-24 14:00"},
    {"id": 2, "username": "agent_01", "password": "agentpassword", "role": "AGENT", "fullname": "Abdoulaye Diallo", "status": "active", "last_login": "2026-04-24 15:30"},
    {"id": 3, "username": "risk_boss", "password": "riskpassword", "role": "RISK_MANAGER", "fullname": "Mariama Barry", "status": "active", "last_login": "2026-04-24 12:45"},
    {"id": 4, "username": "stagiaire_01", "password": "stg", "role": "AGENT", "fullname": "Moussa Camara", "status": "suspended", "last_login": "2026-04-23 09:00"}
]

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

# --- Endpoints d'Authentification ---

@router.post("/auth/login")
async def login(req: LoginRequest):
    user = next((u for u in USERS_DB if u["username"] == req.username), None)
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
        "created_at": datetime.now().isoformat()
    }
    ACTIVE_SESSIONS[token] = session_data
    
    logger.info(f"✅ Connexion réussie : {req.username} (Rôle: {user['role']})")
    return {"token": token, "role": user["role"], "fullname": user["fullname"]}

@router.post("/auth/request-otp")
async def request_otp(req: OTPRequest):
    if not req.msisdn_orange and not req.msisdn_mtn:
        raise HTTPException(status_code=400, detail="Au moins un numéro est requis")
    
    session_id, code = otp_manager.create_session(req.msisdn_orange, req.msisdn_mtn)
    logger.info(f"🔑 OTP généré pour {req.msisdn_orange or 'N/A'} / {req.msisdn_mtn or 'N/A'} | Code: {code}")
    return {"session_id": session_id, "message": "OTP envoyé (simulé)"}

@router.post("/auth/verify-otp")
async def verify_otp(req: OTPVerify):
    session = otp_manager.verify_code(req.session_id, req.code)
    if not session:
        raise HTTPException(status_code=400, detail="Code invalide ou session expirée")
    
    token = generate_secure_token()
    # Le token d'accès temporaire pour M1
    access_token = f"KANDJOU_ACCESS_{token}"
    ACTIVE_SESSIONS[access_token] = {
        "type": "scoring_access",
        "msisdn_orange": session["msisdn_orange"],
        "msisdn_mtn": session["msisdn_mtn"],
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat()
    }
    
    return {"token": access_token}

@router.post("/auth/validate-token")
async def validate_token(token: str = Body(..., embed=True)):
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

# --- Endpoints Administratifs ---

@router.get("/admin/system-overview")
async def get_system_overview():
    """Retourne l'état complet du système pour le Dashboard Admin."""
    return {
        "system_status": {
            "m1_aggregator": "online",
            "m2_simulators": "online",
            "m3_security": "online"
        },
        "users": USERS_DB,
        "security_alerts": SECURITY_ALERTS,
        "stats": {
            "total_scorings_today": 124,
            "avg_latency": "320ms",
            "active_sessions": len(ACTIVE_SESSIONS)
        }
    }

@router.post("/admin/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: int):
    for user in USERS_DB:
        if user["id"] == user_id:
            user["status"] = "suspended" if user["status"] == "active" else "active"
            return {"message": f"Statut mis à jour pour {user['fullname']}", "new_status": user["status"]}
    raise HTTPException(status_code=404, detail="Utilisateur introuvable")
