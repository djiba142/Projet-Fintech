"""
Tests du Module 2 — Simulateur d'API Opérateurs.

Couvre les 5 scénarios du cahier des charges :
  1. Cas nominal Orange (200 + bonnes données)
  2. Cas nominal MTN (200 + bonnes données)
  3. Cas double-opérateur (MSISDN présent chez les deux)
  4. Cas partiel / abonné inconnu (404)
  5. Cas panne réseau simulée (503)
  6. Latence réseau (middleware asyncio.sleep)
"""

import time
import requests
import unittest
import threading
import uvicorn

from modules.modules.M2_simulators.main import app


def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8012, log_level="error")


class TestSimulatorModule(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.server_thread = threading.Thread(target=run_server, daemon=True)
        cls.server_thread.start()
        time.sleep(1)  # Attendre le démarrage du serveur
        cls.base_url = "http://127.0.0.1:8012"

    # ─────────────────────────────────────────────────────────────────────
    # Health Check
    # ─────────────────────────────────────────────────────────────────────

    def test_health(self):
        resp = requests.get(f"{self.base_url}/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("OrangeMoney", data["providers"])
        self.assertIn("MTNMoMo", data["providers"])

    # ─────────────────────────────────────────────────────────────────────
    # Cas Nominal — Orange Money
    # ─────────────────────────────────────────────────────────────────────

    def test_orange_nominal(self):
        """MSISDN connu chez Orange → 200 avec les bons champs du CdC."""
        resp = requests.get(f"{self.base_url}/provider/orange/balance/224622123456")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Vérification de tous les champs du cahier des charges
        self.assertEqual(data["msisdn"], "224622123456")
        self.assertEqual(data["available_balance"], 2500000)
        self.assertEqual(data["last_deposit"], "2026-04-10")
        self.assertEqual(data["status"], "ACTIVE")

    # ─────────────────────────────────────────────────────────────────────
    # Cas Nominal — MTN MoMo
    # ─────────────────────────────────────────────────────────────────────

    def test_mtn_nominal(self):
        """MSISDN connu chez MTN → 200 avec les bons champs du CdC."""
        resp = requests.get(f"{self.base_url}/provider/mtn/balance/224664123456")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Vérification de tous les champs du cahier des charges
        self.assertEqual(data["subscriber_number"], "224664123456")
        self.assertEqual(data["current_balance"], 1200000)
        self.assertEqual(data["currency"], "GNF")
        self.assertEqual(data["account_state"], "OPEN")

    # ─────────────────────────────────────────────────────────────────────
    # Cas Double-Opérateur (MSISDN chez Orange ET MTN)
    # ─────────────────────────────────────────────────────────────────────

    def test_double_operator(self):
        """Le MSISDN 224622123456 est présent chez les deux opérateurs."""
        msisdn = "224622123456"
        resp_orange = requests.get(f"{self.base_url}/provider/orange/balance/{msisdn}")
        resp_mtn = requests.get(f"{self.base_url}/provider/mtn/balance/{msisdn}")

        self.assertEqual(resp_orange.status_code, 200)
        self.assertEqual(resp_mtn.status_code, 200)

        # Vérifier que les deux ont des noms de champs DIFFÉRENTS (force la normalisation dans M1)
        orange_data = resp_orange.json()
        mtn_data = resp_mtn.json()
        self.assertIn("available_balance", orange_data)
        self.assertIn("current_balance", mtn_data)
        self.assertNotEqual(
            set(orange_data.keys()), set(mtn_data.keys()),
            "Les champs Orange et MTN doivent être différents pour forcer la normalisation"
        )

    # ─────────────────────────────────────────────────────────────────────
    # Cas Partiel — Abonné inconnu (404)
    # ─────────────────────────────────────────────────────────────────────

    def test_orange_not_found(self):
        """MSISDN Orange-only → MTN doit retourner 404."""
        # 224625999888 est Orange-only (pas dans MTN_ACCOUNTS)
        resp = requests.get(f"{self.base_url}/provider/mtn/balance/224625999888")
        self.assertEqual(resp.status_code, 404)

    def test_mtn_not_found(self):
        """MSISDN MTN-only → Orange doit retourner 404."""
        # 224664123456 est MTN-only (pas dans ORANGE_ACCOUNTS)
        resp = requests.get(f"{self.base_url}/provider/orange/balance/224664123456")
        self.assertEqual(resp.status_code, 404)

    # ─────────────────────────────────────────────────────────────────────
    # Cas d'Erreur — Panne réseau simulée (503)
    # ─────────────────────────────────────────────────────────────────────

    def test_orange_outage(self):
        """MSISDN de panne simulée → Orange retourne 503."""
        resp = requests.get(f"{self.base_url}/provider/orange/balance/224622999999")
        self.assertEqual(resp.status_code, 503)

    def test_mtn_outage(self):
        """MSISDN de panne simulée → MTN retourne 503."""
        resp = requests.get(f"{self.base_url}/provider/mtn/balance/224664999999")
        self.assertEqual(resp.status_code, 503)

    # ─────────────────────────────────────────────────────────────────────
    # Latence réseau — Middleware asyncio.sleep(0.3)
    # ─────────────────────────────────────────────────────────────────────

    def test_latency_simulation(self):
        """Chaque requête doit prendre au moins 300ms (latence simulée)."""
        start = time.time()
        requests.get(f"{self.base_url}/provider/orange/balance/224622123456")
        elapsed = time.time() - start
        self.assertGreaterEqual(elapsed, 0.25, "La latence simulée (300ms) ne semble pas active")


if __name__ == "__main__":
    unittest.main()
