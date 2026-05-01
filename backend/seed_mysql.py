import mysql.connector
import os
import uuid
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Config MySQL
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "db_kandjou")

def seed_mysql():
    print(f"--- Migration des données vers MySQL ({DB_NAME}) ---")
    conn = mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
    )
    cursor = conn.cursor()

    # Nettoyage
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in ["transactions", "loan_dossiers", "audit_alerts", "audit_logs", "users"]:
        cursor.execute(f"TRUNCATE TABLE {table}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    print("[OK] Tables vidées")

    # 1. USERS
    default_users = [
        ('admin@kandjou.gn', '1234567890', 'Administrateur', 'Admin Kandjou', 'admin@kandjou.gn', None, None),
        ('agent@kandjou.gn', '1234567890', 'Agent de Crédit', 'Mamadou Diallo', 'mamadou@bkr.gn', None, None),
        ('risk@kandjou.gn', '1234567890', 'Analyste Risque', 'Fatoumata Camara', 'fatou@risk.gn', None, None),
        ('bcrg@kandjou.gn', '1234567890', 'Régulateur (BCRG)', 'Contrôleur BCRG', 'audit@bcrg.gn', None, None),
        ('620000001', '1234567890', 'Client', 'Aboubacar Sylla', 'abou@email.gn', '224620000001', '224664000001'),
        ('620000002', '1234567890', 'Client', 'Hadja Mariama Barry', 'mariama@email.gn', '224620000002', '224664000002'),
        ('620000003', '1234567890', 'Client', 'Ousmane Keita', 'ousmane@email.gn', '224620000003', None),
        ('620000004', '1234567890', 'Client', 'Aissatou Bah', 'aissatou@email.gn', '224620000004', '224664000004'),
        ('620000005', '1234567890', 'Client', 'Thierno Amadou Tidiane', 'thierno@email.gn', '224620000005', '224664000005'),
    ]
    cursor.executemany("""
        INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, default_users)
    print(f"[OK] {len(default_users)} utilisateurs créés")

    # 2. TRANSACTIONS
    clients = ['620000001', '620000002', '620000003', '620000004', '620000005']
    tx_count = 0
    base = datetime.now()
    for cid in clients:
        for _ in range(20):
            tx_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
            op = random.choice(["ORANGE", "MTN"])
            ttype = random.choice(["CREDIT", "DEBIT"])
            amt = random.randint(10, 500) * 10000
            cursor.execute("""
                INSERT INTO transactions (tx_id, client_id, operator, type, amount, status, created_at)
                VALUES (%s, %s, %s, %s, %s, 'SUCCESS', %s)
            """, (tx_id, cid, op, ttype, amt, base - timedelta(days=random.randint(0, 30))))
            tx_count += 1
    
    conn.commit()
    conn.close()
    print(f"[OK] {tx_count} transactions injectées dans MySQL !")

if __name__ == "__main__":
    seed_mysql()
