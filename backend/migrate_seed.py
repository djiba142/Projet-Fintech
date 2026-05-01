import sqlite3
import os

DB_PATH = "kandjou.db"

def migrate_and_seed():
    print(f"--- Migration de {DB_PATH} ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Ajout des colonnes si manquantes
    columns = ["id_card", "nationality"]
    for col in columns:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} VARCHAR(100)")
            print(f"[OK] Colonne {col} ajoutee.")
        except sqlite3.OperationalError:
            print(f"[INFO] Colonne {col} existe deja.")

    # 2. Injection des 10 clients
    default_users = [
        ("admin@kandjou.gn", "1234567890", "Administrateur", "Admin Kandjou", "admin@kandjou.gn", None, None, "FR", "active", "ADM-001", "Guinéenne"),
        ("agent@kandjou.gn", "1234567890", "Agent de Crédit", "Mamadou Diallo", "mamadou@bkr.gn", None, None, "FR", "active", "AGT-001", "Guinéenne"),
        ("risk@kandjou.gn", "1234567890", "Analyste Risque", "Fatoumata Camara", "fatou@risk.gn", None, None, "FR", "active", "RSK-001", "Guinéenne"),
        ("bcrg@kandjou.gn", "1234567890", "Régulateur (BCRG)", "Contrôleur BCRG", "audit@bcrg.gn", None, None, "FR", "active", "REG-001", "Guinéenne"),
        ("620000001", "1234567890", "Client", "Aboubacar Sylla", "abou@email.gn", "224620000001", "224664000001", "FR", "active", "ID-620001", "Guinéenne"),
        ("620000002", "1234567890", "Client", "Hadja Mariama Barry", "mariama@email.gn", "224620000002", "224664000002", "FR", "active", "ID-620002", "Guinéenne"),
        ("620000003", "1234567890", "Client", "Ousmane Keita", "ousmane@email.gn", "224620000003", None, "FR", "active", "ID-620003", "Guinéenne"),
        ("620000004", "1234567890", "Client", "Aissatou Bah", "aissatou@email.gn", "224620000004", "224664000004", "FR", "active", "ID-620004", "Guinéenne"),
        ("620000005", "1234567890", "Client", "Thierno Amadou Tidiane", "thierno@email.gn", "224620000005", "224664000005", "FR", "active", "ID-620005", "Guinéenne"),
        ("620000006", "1234567890", "Client", "Salematou Traore", "salem@email.gn", "224620000006", None, "FR", "active", "ID-620006", "Guinéenne"),
        ("620000007", "1234567890", "Client", "Lansana Kouyate", "lansana@email.gn", "224620000007", "224664000007", "FR", "active", "ID-620007", "Guinéenne"),
        ("620000008", "1234567890", "Client", "Mohamed Camara", "mohamed@email.gn", "224620000008", None, "FR", "active", "ID-620008", "Guinéenne"),
        ("620000009", "1234567890", "Client", "Fatoumata Binta Diallo", "binta@email.gn", "224620000009", "224664000009", "FR", "active", "ID-620009", "Guinéenne"),
        ("620000010", "1234567890", "Client", "Sekou Toure", "sekou@email.gn", "224620000010", None, "FR", "active", "ID-620010", "Guinéenne"),
    ]
    
    cursor.executemany("""
        INSERT OR REPLACE INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status, id_card, nationality) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, default_users)
    print(f"[OK] {len(default_users)} utilisateurs migres/actualises.")

    conn.commit()
    conn.close()
    print("--- Termine ---")

if __name__ == "__main__":
    migrate_and_seed()
