import time
import requests
import unittest
import threading
import uvicorn
import os
from modules.modules.M1_aggregator.main import app as m1_app
from modules.modules.M2_simulators.main import app as m2_app
from modules.modules.M3_security.main import app as m3_app

def run_m1():
    uvicorn.run(m1_app, host="127.0.0.1", port=8001, log_level="error")

def run_m2():
    uvicorn.run(m2_app, host="127.0.0.1", port=8002, log_level="error")

def run_m3():
    uvicorn.run(m3_app, host="127.0.0.1", port=8003, log_level="error")

class TestFullSystemIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Configuration des URLs pour les tests
        os.environ["ORANGE_SIMULATOR_URL"] = "http://127.0.0.1:8002"
        os.environ["MTN_SIMULATOR_URL"] = "http://127.0.0.1:8002"
        os.environ["M3_SECURITY_URL"] = "http://127.0.0.1:8003"
        
        # Démarrage des 3 modules
        cls.threads = [
            threading.Thread(target=run_m1, daemon=True),
            threading.Thread(target=run_m2, daemon=True),
            threading.Thread(target=run_m3, daemon=True)
        ]
        for t in cls.threads:
            t.start()
            
        time.sleep(2) # Attente démarrage

    def test_end_to_end_flow(self):
        """Test du flux complet : OTP -> Token -> Aggregation."""
        msisdn = "224622123456" # Existe chez Orange et MTN dans mock_data
        
        # 1. Demander un OTP (M3)
        resp = requests.post("http://127.0.0.1:8003/auth/request-otp", json={"msisdn": msisdn})
        self.assertEqual(resp.status_code, 200)
        session_id = resp.json()["session_id"]
        
        # 2. Récupérer le code OTP (via accès direct au storage M3 pour le test)
        from modules.modules.M3_security.main import storage
        otp = storage.sessions[session_id]["otp"]
        
        # 3. Valider l'OTP (M3)
        resp = requests.post("http://127.0.0.1:8003/auth/verify-otp", json={
            "session_id": session_id,
            "code": otp
        })
        self.assertEqual(resp.status_code, 200)
        token = resp.json()["token"]
        
        # 4. Appeler l'agrégateur (M1) avec le token
        headers = {"Authorization": token}
        resp = requests.get(f"http://127.0.0.1:8001/aggregate/{msisdn}", headers=headers)
        
        # Vérifications finales
        self.assertEqual(resp.status_code, 200, f"Erreur M1: {resp.text}")
        data = resp.json()
        
        # Vérifier que les données opérateurs sont là (provenant de M2)
        self.assertEqual(data["client_id"], msisdn)
        self.assertIn("ORANGE", data["consolidation"]["sources_active"])
        self.assertIn("MTN", data["consolidation"]["sources_active"])
        
        # Vérifier le score (calculé par M1)
        self.assertIn("score", data["credit_analysis"])
        self.assertTrue(0 <= data["credit_analysis"]["score"] <= 100)
        
        print(f"\n✅ Flux E2E réussi pour {msisdn} | Score: {data['credit_analysis']['score']}")

    def test_unauthorized_access(self):
        """Vérifie que M1 rejette un accès sans token ou avec un mauvais token."""
        msisdn = "224622123456"
        
        # Sans header
        resp = requests.get(f"http://127.0.0.1:8001/aggregate/{msisdn}")
        self.assertEqual(resp.status_code, 401)
        
        # Avec mauvais token (forgé)
        headers = {"Authorization": "m3-fake-token"}
        resp = requests.get(f"http://127.0.0.1:8001/aggregate/{msisdn}", headers=headers)
        self.assertEqual(resp.status_code, 401)

if __name__ == "__main__":
    unittest.main()
