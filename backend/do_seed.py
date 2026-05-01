# -*- coding: utf-8 -*-
import sqlite3, uuid, random
from datetime import datetime, timedelta

DB_PATH = "kandjou.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 1. NETTOYAGE
cursor.execute("DELETE FROM transactions")
cursor.execute("DELETE FROM loan_dossiers")
cursor.execute("DELETE FROM audit_alerts")
cursor.execute("DELETE FROM audit_logs")
print("[OK] Tables nettoyees")

# 2. USERS
default_users = [
    ("admin@kandjou.gn", "1234567890", "Administrateur", "Admin Kandjou", "admin@kandjou.gn", None, None, "FR", "active", "ADM-001", "Guineenne"),
    ("agent@kandjou.gn", "1234567890", "Agent de Credit", "Mamadou Diallo", "mamadou@bkr.gn", None, None, "FR", "active", "AGT-001", "Guineenne"),
    ("risk@kandjou.gn", "1234567890", "Analyste Risque", "Fatoumata Camara", "fatou@risk.gn", None, None, "FR", "active", "RSK-001", "Guineenne"),
    ("bcrg@kandjou.gn", "1234567890", "Regulateur (BCRG)", "Controleur BCRG", "audit@bcrg.gn", None, None, "FR", "active", "REG-001", "Guineenne"),
    ("620000001", "1234567890", "Client", "Aboubacar Sylla", "abou@email.gn", "224620000001", "224664000001", "FR", "active", "ID-620001", "Guineenne"),
    ("620000002", "1234567890", "Client", "Hadja Mariama Barry", "mariama@email.gn", "224620000002", "224664000002", "FR", "active", "ID-620002", "Guineenne"),
    ("620000003", "1234567890", "Client", "Ousmane Keita", "ousmane@email.gn", "224620000003", None, "FR", "active", "ID-620003", "Guineenne"),
    ("620000004", "1234567890", "Client", "Aissatou Bah", "aissatou@email.gn", "224620000004", "224664000004", "FR", "active", "ID-620004", "Guineenne"),
    ("620000005", "1234567890", "Client", "Thierno Amadou Tidiane", "thierno@email.gn", "224620000005", "224664000005", "FR", "active", "ID-620005", "Guineenne"),
    ("620000006", "1234567890", "Client", "Salematou Traore", "salem@email.gn", "224620000006", None, "FR", "active", "ID-620006", "Guineenne"),
    ("620000007", "1234567890", "Client", "Lansana Kouyate", "lansana@email.gn", "224620000007", "224664000007", "FR", "active", "ID-620007", "Guineenne"),
    ("620000008", "1234567890", "Client", "Mohamed Camara", "mohamed@email.gn", "224620000008", None, "FR", "active", "ID-620008", "Guineenne"),
    ("620000009", "1234567890", "Client", "Fatoumata Binta Diallo", "binta@email.gn", "224620000009", "224664000009", "FR", "active", "ID-620009", "Guineenne"),
    ("620000010", "1234567890", "Client", "Sekou Toure", "sekou@email.gn", "224620000010", None, "FR", "active", "ID-620010", "Guineenne"),
]
cursor.executemany("""INSERT OR REPLACE INTO users 
    (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status, id_card, nationality) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", default_users)
print("[OK] %d utilisateurs" % len(default_users))

# 3. TRANSACTIONS REALISTES
clients_info = {
    "620000001": {"orange": "224620000001", "mtn": "224664000001"},
    "620000002": {"orange": "224620000002", "mtn": "224664000002"},
    "620000003": {"orange": "224620000003", "mtn": None},
    "620000004": {"orange": "224620000004", "mtn": "224664000004"},
    "620000005": {"orange": "224620000005", "mtn": "224664000005"},
    "620000006": {"orange": "224620000006", "mtn": None},
    "620000007": {"orange": "224620000007", "mtn": "224664000007"},
    "620000008": {"orange": "224620000008", "mtn": None},
    "620000009": {"orange": "224620000009", "mtn": "224664000009"},
    "620000010": {"orange": "224620000010", "mtn": None},
}

descs_credit = [
    "Depot Agent Orange", "Salaire mensuel", "Transfert recu",
    "Vente commerce", "Prime employeur", "Paiement client recu",
    "Commission vente", "Cotisation tontine recue", "Virement familial"
]
descs_debit = [
    "Paiement EDG Electricite", "Recharge credit telephone", "Transfert envoye",
    "Achat Marche Madina", "Paiement SOTELGUI Internet", "Frais scolarite",
    "Paiement loyer", "Achat medicaments Pharmacie", "Transport taxi",
    "Cotisation tontine", "Facture eau SEG", "Recharge data mobile",
    "Achat carburant station", "Paiement couture tailleur"
]
receivers_list = [
    "+224620000001", "+224620000002", "+224620000003", "+224620000004",
    "+224620000005", "+224620000006", "+224620000007", "+224620000008",
    "+224620000009", "+224620000010", "+224622334455", "+224664112233",
    "EDG Conakry", "SOTELGUI", "SEG Eau", "Pharmacie Centrale",
    "Agent Orange Kaloum", "Agent MTN Ratoma", "Marche Madina",
]

base_date = datetime(2026, 5, 1, 10, 0, 0)
tx_count = 0

for cid, info in clients_info.items():
    num_tx = random.randint(8, 15)
    for i in range(num_tx):
        tx_date = base_date - timedelta(days=random.randint(0, 60), hours=random.randint(0, 12), minutes=random.randint(0, 59))
        tx_type = random.choice(["CREDIT", "CREDIT", "DEBIT", "DEBIT", "DEBIT"])
        op = random.choice(["ORANGE", "ORANGE", "MTN"]) if info["mtn"] else "ORANGE"
        
        if tx_type == "CREDIT":
            desc = random.choice(descs_credit)
            amt = random.choice([150000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 3500000, 5000000])
        else:
            desc = random.choice(descs_debit)
            amt = random.choice([15000, 25000, 50000, 75000, 100000, 150000, 200000, 350000, 500000, 750000])
        
        rcv = random.choice(receivers_list) if tx_type == "DEBIT" else "+" + info["orange"]
        tx_id = "TXN-" + uuid.uuid4().hex[:8].upper()
        
        cursor.execute(
            "INSERT INTO transactions (tx_id, client_id, operator, type, amount, receiver, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (tx_id, cid, op, tx_type, amt, rcv, desc, "SUCCESS", tx_date.strftime("%Y-%m-%d %H:%M:%S"))
        )
        tx_count += 1

print("[OK] %d transactions" % tx_count)

# 4. DOSSIERS DE PRET
loans = [
    ("620000001", "agent@kandjou.gn", 78, 5000000, "APPROVED"),
    ("620000002", "agent@kandjou.gn", 65, 3000000, "PENDING"),
    ("620000003", "agent@kandjou.gn", 42, 1500000, "REJECTED"),
    ("620000004", "agent@kandjou.gn", 71, 2000000, "APPROVED"),
    ("620000005", "agent@kandjou.gn", 91, 15000000, "APPROVED"),
    ("620000006", "agent@kandjou.gn", 35, 500000, "PENDING"),
    ("620000007", "agent@kandjou.gn", 82, 8000000, "APPROVED"),
    ("620000008", "agent@kandjou.gn", 55, 1000000, "PENDING"),
    ("620000009", "agent@kandjou.gn", 88, 10000000, "APPROVED"),
    ("620000010", "agent@kandjou.gn", 28, 300000, "REJECTED"),
]
for cid, aid, score, amt, status in loans:
    cd = base_date - timedelta(days=random.randint(1, 30))
    cursor.execute(
        "INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (cid, aid, score, amt, status, cd.strftime("%Y-%m-%d %H:%M:%S"), cd.strftime("%Y-%m-%d %H:%M:%S"))
    )
print("[OK] %d dossiers de pret" % len(loans))

# 5. ALERTES
alerts = [
    ("TXN-" + uuid.uuid4().hex[:8].upper(), "620000005", "LARGE_AMOUNT", "HIGH", "OPEN", "Transaction 15M GNF detectee - seuil depasse"),
    ("TXN-" + uuid.uuid4().hex[:8].upper(), "620000002", "FREQUENCY", "MEDIUM", "INVESTIGATING", "5 transferts en moins de 30 minutes"),
    ("TXN-" + uuid.uuid4().hex[:8].upper(), "620000007", "SUSPICIOUS_DESTINATION", "HIGH", "OPEN", "Transfert vers numero non-resident Sierra Leone"),
    ("TXN-" + uuid.uuid4().hex[:8].upper(), "620000001", "LARGE_AMOUNT", "MEDIUM", "CLOSED", "Transaction 5M GNF - verifiee et approuvee"),
    ("TXN-" + uuid.uuid4().hex[:8].upper(), "620000009", "FREQUENCY", "LOW", "CLOSED", "3 depots consecutifs - comportement normal"),
]
cursor.executemany(
    "INSERT INTO audit_alerts (tx_id, client_id, type, severity, status, details) VALUES (?, ?, ?, ?, ?, ?)",
    alerts
)
print("[OK] %d alertes" % len(alerts))

# 6. LOGS D'AUDIT
audit_logs = [
    ("admin@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Role: Administrateur"),
    ("agent@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Role: Agent de Credit"),
    ("bcrg@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Role: Regulateur BCRG"),
    ("620000001", "LOGIN_SUCCESS", None, "SUCCESS", "Role: Client"),
    ("620000005", "LOGIN_SUCCESS", None, "SUCCESS", "Role: Client"),
    ("agent@kandjou.gn", "CREATE_DOSSIER", "620000001", "SUCCESS", "Score: 78, Montant: 5M GNF"),
    ("agent@kandjou.gn", "CREATE_DOSSIER", "620000005", "SUCCESS", "Score: 91, Montant: 15M GNF"),
    ("risk@kandjou.gn", "APPROVE_LOAN", "620000001", "SUCCESS", "Dossier approuve - risque faible"),
    ("risk@kandjou.gn", "REJECT_LOAN", "620000003", "SUCCESS", "Score insuffisant (42/100)"),
    ("admin@kandjou.gn", "SYSTEM_CONFIG", "session_timeout", "SUCCESS", "Timeout: 30 -> 45 minutes"),
    ("bcrg@kandjou.gn", "GENERATE_REPORT", None, "SUCCESS", "Rapport BCRG Q2-2026 genere"),
    ("admin@kandjou.gn", "TOGGLE_USER", "620000010", "SUCCESS", "Statut modifie"),
]
for uid, action, target, result, details in audit_logs:
    lt = base_date - timedelta(hours=random.randint(1, 72))
    cursor.execute(
        "INSERT INTO audit_logs (timestamp, user_id, action, target, result, details) VALUES (?, ?, ?, ?, ?, ?)",
        (lt.strftime("%Y-%m-%d %H:%M:%S"), uid, action, target, result, details)
    )
print("[OK] %d logs" % len(audit_logs))

conn.commit()

# VERIFICATION
print("\n=== VERIFICATION FINALE ===")
for t in ["users", "transactions", "loan_dossiers", "audit_alerts", "audit_logs", "institutions"]:
    try:
        cursor.execute("SELECT COUNT(*) FROM " + t)
        print("  %s: %d enregistrements" % (t, cursor.fetchone()[0]))
    except:
        pass

print("\n--- Transactions par client ---")
cursor.execute("SELECT client_id, COUNT(*) as cnt, SUM(amount) as total FROM transactions GROUP BY client_id ORDER BY client_id")
for r in cursor.fetchall():
    print("  %s: %d TX | Total: %d GNF" % (r[0], r[1], r[2]))

conn.close()
print("\n[DONE] Base Kandjou prete! Mot de passe: 1234567890")
