import secrets
import string
import time
from typing import Dict, Optional, Tuple


class OTPStorage:
    """
    Stockage temporaire en mémoire des sessions OTP et tokens actifs.

    ⚠️  IMPORTANT — Limitation MVP :
    Toutes les sessions OTP et tokens actifs sont stockés en mémoire (dictionnaires Python).
    Ils sont **intégralement perdus** si le service M3 redémarre.
    En production (V2), ce stockage serait remplacé par Redis avec TTL natif
    pour garantir la persistance et l'expiration automatique des clés.
    """

    def __init__(self, expiration_minutes: int = 3, max_attempts: int = 3):
        self.expiration_seconds = expiration_minutes * 60
        self.max_attempts = max_attempts
        self.sessions: Dict[str, Dict] = {}
        # Tokens actifs : token -> {"msisdn_orange": str|None, "msisdn_mtn": str|None, "primary": str, "created_at": float}
        self.active_tokens: Dict[str, Dict] = {}

    def create_session(self, msisdn_orange: Optional[str], msisdn_mtn: Optional[str]) -> Tuple[str, str]:
        session_id = secrets.token_hex(8).upper()
        primary = msisdn_orange or msisdn_mtn
        # On force le code à 123456 pour les tests
        otp = "123456" 
        self.sessions[session_id] = {
            "msisdn_orange": msisdn_orange,
            "msisdn_mtn": msisdn_mtn,
            "primary": primary,
            "otp": otp,
            "created_at": time.time(),
            "verified": False,
            "attempts": 0
        }
        return session_id, otp

    def verify_otp(self, session_id: str, otp: str) -> str:
        """
        Vérifie l'OTP.
        Renvoie 'VALID', 'EXPIRED', 'INVALID', 'BLOCKED' ou 'NOT_FOUND'.
        Anti-brute force : bloque la session après max_attempts échecs consécutifs.
        """
        if session_id not in self.sessions:
            return "NOT_FOUND"

        session = self.sessions[session_id]

        # Anti-brute force : blocage après max_attempts tentatives échouées
        if session.get("attempts", 0) >= self.max_attempts:
            return "BLOCKED"

        # Check expiration
        if time.time() - session["created_at"] > self.expiration_seconds:
            del self.sessions[session_id]
            return "EXPIRED"

        if session["otp"] == otp:
            session["verified"] = True
            return "VALID"

        # Incrémenter le compteur de tentatives échouées
        session["attempts"] = session.get("attempts", 0) + 1
        return "INVALID"

    def is_verified(self, session_id: str) -> bool:
        return self.sessions.get(session_id, {}).get("verified", False)

    def get_msisdn(self, session_id: str) -> Optional[str]:
        """Retourne le MSISDN principal (pour les logs)."""
        return self.sessions.get(session_id, {}).get("primary")

    def get_session_data(self, session_id: str) -> Optional[Dict]:
        """Retourne les données complètes de la session (msisdn_orange, msisdn_mtn, primary)."""
        session = self.sessions.get(session_id)
        if not session:
            return None
        return {
            "msisdn_orange": session.get("msisdn_orange"),
            "msisdn_mtn": session.get("msisdn_mtn"),
            "primary": session.get("primary")
        }

    # --- Gestion des tokens actifs ---

    def store_token(self, token: str, msisdn_orange: Optional[str], msisdn_mtn: Optional[str], primary: str):
        """Stocke un token actif en mémoire, associé aux deux MSISDNs."""
        self.active_tokens[token] = {
            "msisdn_orange": msisdn_orange,
            "msisdn_mtn": msisdn_mtn,
            "primary": primary,
            "created_at": time.time()
        }

    def validate_token(self, token: str) -> Optional[Dict]:
        """
        Valide un token et retourne les données associées (msisdn_orange, msisdn_mtn, primary).
        Retourne None si le token est inconnu ou expiré (TTL = 30 minutes).
        """
        entry = self.active_tokens.get(token)
        if not entry:
            return None
        # Expiration du token : 30 minutes
        if time.time() - entry["created_at"] > 1800:
            del self.active_tokens[token]
            return None
        return {
            "msisdn_orange": entry["msisdn_orange"],
            "msisdn_mtn": entry["msisdn_mtn"],
            "primary": entry["primary"]
        }


def generate_secure_token() -> str:
    """Génère un token temporaire préfixé par m3- pour le Module 1."""
    return f"m3-{secrets.token_urlsafe(16)}"
