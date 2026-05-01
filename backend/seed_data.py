import sys
import os
from datetime import datetime

# Ajouter le chemin actuel pour permettre l'importation de modules locaux
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from modules.common.database import get_db_connection, get_placeholder, init_db

def seed_kandjou():
    print("Initialisation du Seeding Kandjou (Unifie MySQL/SQLite)...")
    init_db() # S'assure que les tables existent
    
    conn = get_db_connection()
    if not conn:
        print("Impossible de se connecter a la base de donnees.")
        return
        
    cursor = conn.cursor()
    p = get_placeholder()
    
    # 1. Liste des utilisateurs à injecter
    users = [
        ("admin@kandjou.gn", "1234567890", "Administrateur", "Admin Kandjou", "admin@kandjou.gn", None, None, "Système", "FR", "active"),
        ("agent@kandjou.gn", "1234567890", "Agent de Crédit", "Mamadou Diallo", "mamadou@bkr.gn", None, None, "Institution", "FR", "active"),
        ("620000001", "1234567890", "Client", "Aboubacar Sylla", "abou@email.gn", "224620000001", "224664000001", "Multi-Opérateur (Premium)", "FR", "active"),
        ("620000002", "1234567890", "Client", "Hadja Mariama Barry", "mariama@email.gn", "224620000002", "224664000002", "Commerçante (Actif)", "FR", "active"),
        ("620000003", "1234567890", "Client", "Ousmane Keita", "ousmane@email.gn", "224620000003", None, "Orange Uniquement", "FR", "active"),
        ("620000004", "1234567890", "Client", "Aissatou Bah", "aissatou@email.gn", "224620000004", "224664000004", "Jeune Active", "FR", "active"),
        ("620000005", "1234567890", "Client", "Thierno Amadou Tidiane", "thierno@email.gn", "224620000005", "224664000005", "Grand Compte (15M GNF)", "FR", "active"),
        ("620000006", "1234567890", "Client", "Salematou Traore", "salem@email.gn", "224620000006", None, "Petit Épargnant", "FR", "active"),
        ("620000007", "1234567890", "Client", "Lansana Kouyate", "lansana@email.gn", "224620000007", "224664000007", "Acteur Économique", "FR", "active"),
        ("620000008", "1234567890", "Client", "Mohamed Camara", "mohamed@email.gn", "224620000008", None, "Rural Orange", "FR", "active"),
        ("620000009", "1234567890", "Client", "Fatoumata Binta Diallo", "binta@email.gn", "224620000009", "224664000009", "Multi-Usage", "FR", "active"),
        ("620000010", "1234567890", "Client", "Sekou Toure", "sekou@email.gn", "224620000010", None, "Étudiant", "FR", "active"),
    ]
    
    print(f"--- Injection de {len(users)} utilisateurs ---")
    for u in users:
        try:
            cursor.execute(f"SELECT id FROM users WHERE username = {p}", (u[0],))
            if cursor.fetchone():
                cursor.execute(f"UPDATE users SET password={p}, role={p}, fullname={p}, email={p}, msisdn_orange={p}, msisdn_mtn={p}, profile_type={p}, language={p}, status={p} WHERE username={p}",
                               (u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], u[0]))
            else:
                cursor.execute(f"""
                    INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, profile_type, language, status)
                    VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
                """, u)
        except Exception as e:
            print(f"Erreur utilisateur {u[0]}: {e}")

    # 2. Injection des soldes simulateur
    balances = [
        ("224620000001", "ORANGE", 10000000), ("224664000001", "MTN", 10000000),
        ("224620000002", "ORANGE", 10000000), ("224664000002", "MTN", 10000000),
        ("224620000003", "ORANGE", 10000000), ("224620000004", "ORANGE", 10000000),
        ("224664000004", "MTN", 10000000), ("224620000005", "ORANGE", 10000000),
        ("224664000005", "MTN", 10000000), ("224620000006", "ORANGE", 10000000),
        ("224620000007", "ORANGE", 10000000), ("224664000007", "MTN", 10000000),
        ("224620000008", "ORANGE", 10000000), ("224620000009", "ORANGE", 10000000),
        ("224664000009", "MTN", 10000000), ("224620000010", "ORANGE", 10000000),
    ]

    print(f"--- Injection de {len(balances)} soldes simulateur ---")
    import sqlite3
    is_mysql = not isinstance(conn, sqlite3.Connection)
    
    for msisdn, op, bal in balances:
        try:
            if is_mysql:
                query = f"INSERT INTO simulator_balances (msisdn, operator, balance, updated_at) VALUES ({p}, {p}, {bal}, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE balance = {bal}, updated_at = CURRENT_TIMESTAMP"
            else:
                query = f"INSERT INTO simulator_balances (msisdn, operator, balance, updated_at) VALUES ({p}, {p}, {bal}, CURRENT_TIMESTAMP) ON CONFLICT(msisdn) DO UPDATE SET balance = {bal}, updated_at = CURRENT_TIMESTAMP"
            cursor.execute(query, (msisdn, op))
        except Exception as e:
            print(f"Erreur solde {msisdn}: {e}")

    # 3. Injection des Institutions
    institutions = [
        ("Orange Money Guinea", "TELCO", "ONLINE", 99.8, 150000000),
        ("MTN MoMo Guinea", "TELCO", "ONLINE", 99.5, 95000000),
        ("Kandjou Finance", "MFI", "ONLINE", 100.0, 5000000)
    ]
    print(f"--- Injection de {len(institutions)} institutions ---")
    for name, itype, status, uptime, vol in institutions:
        try:
            cursor.execute(f"SELECT id FROM institutions WHERE name = {p}", (name,))
            if not cursor.fetchone():
                cursor.execute(f"INSERT INTO institutions (name, type, api_status, uptime_score, total_volume) VALUES ({p}, {p}, {p}, {p}, {p})", (name, itype, status, uptime, vol))
        except Exception as e:
            print(f"Erreur institution {name}: {e}")

    if not is_mysql:
        conn.commit()
    conn.close()
    print("Seeding terminé avec succès pour MySQL et SQLite !")

if __name__ == "__main__":
    seed_kandjou()
