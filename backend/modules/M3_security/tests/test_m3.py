import time
import requests
import unittest
import threading
import uvicorn
from modules.modules.M3_security.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8003, log_level="error")

class TestSecurityModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_thread = threading.Thread(target=run_server, daemon=True)
        cls.server_thread.start()
        time.sleep(1) # Attendre que le serveur démarre
        cls.base_url = "http://127.0.0.1:8003"
        cls.msisdn = "224622123456"

    def test_full_otp_flow(self):
        # 1. Request OTP
        resp = requests.post(f"{self.base_url}/auth/request-otp", json={"msisdn": self.msisdn})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        session_id = data["session_id"]
        self.assertIn("session_id", data)
        
        # 2. Verify with WRONG OTP
        resp = requests.post(f"{self.base_url}/auth/verify-otp", json={"session_id": session_id, "code": "000000"})
        self.assertEqual(resp.status_code, 401)

        # 3. Récupérer le code réel (via accès direct au stockage pour le test)
        from modules.modules.M3_security.main import storage
        otp = storage.sessions[session_id]["otp"]
        
        # 4. Verify with CORRECT OTP
        resp = requests.post(f"{self.base_url}/auth/verify-otp", json={"session_id": session_id, "code": otp})
        self.assertEqual(resp.status_code, 200)
        verify_data = resp.json()
        self.assertTrue(verify_data["token"].startswith("m3-"))
        
    def test_multiple_sessions(self):
        msisdn2 = "224664998877"
        resp1 = requests.post(f"{self.base_url}/auth/request-otp", json={"msisdn": self.msisdn})
        resp2 = requests.post(f"{self.base_url}/auth/request-otp", json={"msisdn": msisdn2})
        
        sid1 = resp1.json()["session_id"]
        sid2 = resp2.json()["session_id"]
        
        self.assertNotEqual(sid1, sid2)
        
    def test_invalid_session(self):
        resp = requests.post(f"{self.base_url}/auth/verify-otp", json={"session_id": "INVALID-ID", "code": "123456"})
        self.assertEqual(resp.status_code, 404)

    def test_expiration(self):
        # Test de la logique d'expiration via un petit délai simulé ou en réduisant le temps dans l'objet
        from modules.modules.M3_security.main import storage
        session_id, otp = storage.create_session(self.msisdn)
        
        # On "vieillit" la session manuellement
        storage.sessions[session_id]["created_at"] -= 200 # -200 secondes ( > 180s/3min)
        
        resp = requests.post(f"{self.base_url}/auth/verify-otp", json={"session_id": session_id, "code": otp})
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(resp.json()["detail"], "Session introuvable ou expirée")

    def test_brute_force_blocking(self):
        """Après 3 tentatives échouées, la session est bloquée (HTTP 429)."""
        # 1. Créer une session
        resp = requests.post(f"{self.base_url}/auth/request-otp", json={"msisdn": self.msisdn})
        session_id = resp.json()["session_id"]
        
        # 2. Trois tentatives échouées
        for i in range(3):
            resp = requests.post(
                f"{self.base_url}/auth/verify-otp",
                json={"session_id": session_id, "code": "000000"}
            )
            self.assertEqual(resp.status_code, 401, f"Tentative {i+1} devrait retourner 401")
        
        # 3. La 4ème tentative doit être bloquée (même avec le bon code)
        from modules.modules.M3_security.main import storage
        otp = storage.sessions[session_id]["otp"]
        resp = requests.post(
            f"{self.base_url}/auth/verify-otp",
            json={"session_id": session_id, "code": otp}
        )
        self.assertEqual(resp.status_code, 429)
        self.assertIn("bloquée", resp.json()["detail"])

    def test_validate_token(self):
        """Le flux complet OTP → token → /auth/validate-token retourne le msisdn."""
        # 1. Demander un OTP
        resp = requests.post(f"{self.base_url}/auth/request-otp", json={"msisdn": self.msisdn})
        session_id = resp.json()["session_id"]
        
        # 2. Récupérer le code réel et valider
        from modules.modules.M3_security.main import storage
        otp = storage.sessions[session_id]["otp"]
        resp = requests.post(
            f"{self.base_url}/auth/verify-otp",
            json={"session_id": session_id, "code": otp}
        )
        self.assertEqual(resp.status_code, 200)
        token = resp.json()["token"]
        
        # 3. Valider le token via /auth/validate-token
        resp = requests.post(
            f"{self.base_url}/auth/validate-token",
            json={"token": token}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["msisdn"], self.msisdn)
        
        # 4. Un faux token doit être rejeté
        resp = requests.post(
            f"{self.base_url}/auth/validate-token",
            json={"token": "fake-token-xxxxx"}
        )
        self.assertEqual(resp.status_code, 401)

if __name__ == "__main__":
    unittest.main()
