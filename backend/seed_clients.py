import sqlite3
import os
import hashlib

DB_PATH = "kandjou.db"

def seed_10_clients():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    clients = [
        {"username": "620000001", "fullname": "Aboubacar Sylla", "orange": "224620000001", "mtn": "224664000001"},
        {"username": "620000002", "fullname": "Hadja Mariama Barry", "orange": "224620000002", "mtn": "224664000002"},
        {"username": "620000003", "fullname": "Ousmane Keita", "orange": "224620000003", "mtn": None},
        {"username": "620000004", "fullname": "Aissatou Bah", "orange": "224620000004", "mtn": "224664000004"},
        {"username": "620000005", "fullname": "Thierno Amadou Tidiane", "orange": "224620000005", "mtn": "224664000005"},
        {"username": "620000006", "fullname": "Salematou Traore", "orange": "224620000006", "mtn": None},
        {"username": "620000007", "fullname": "Lansana Kouyate", "orange": "224620000007", "mtn": "224664000007"},
        {"username": "620000008", "fullname": "Mohamed Camara", "orange": "224620000008", "mtn": None},
        {"username": "620000009", "fullname": "Fatoumata Binta Diallo", "orange": "224620000009", "mtn": "224664000009"},
        {"username": "620000010", "fullname": "Sekou Toure", "orange": "224620000010", "mtn": None}
    ]

    # Note: Le systeme semble accepter les mots de passe en clair pour le moment 
    # ou geres par la fonction create_user qui n'est pas appelee ici directement.
    # Pour correspondre au comportement de login.py, on met le pass en clair "pass123"
    password = "pass123"

    print(f"[INFO] Injection de 10 clients de test dans {DB_PATH}...")

    for c in clients:
        try:
            # On utilise le schema verifie dans database.py (pas de created_at)
            cursor.execute("""
                INSERT OR REPLACE INTO users 
                (username, password, role, fullname, msisdn_orange, msisdn_mtn, status, language, must_change_password)
                VALUES (?, ?, 'Client', ?, ?, ?, 'active', 'FR', 0)
            """, (c["username"], password, c["fullname"], c["orange"], c["mtn"]))
            print(f"[OK] Client ajoute : {c['fullname']} ({c['username']})")
        except Exception as e:
            print(f"[ERR] Erreur pour {c['username']}: {e}")

    conn.commit()
    conn.close()
    print("\n[FIN] Migration terminee. Connectez-vous avec 'pass123'")

if __name__ == "__main__":
    seed_10_clients()
