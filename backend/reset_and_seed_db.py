"""
Script de réinitialisation et peuplement complet de la base Kandjou.
Génère des données réalistes pour TOUS les clients, transactions, dossiers et alertes.
"""
import sqlite3
import uuid
import random
from datetime import datetime, timedelta

DB_PATH = "kandjou.db"

def reset_and_seed():
    print("=" * 60)
    print("  KANDJOU — Réinitialisation & Peuplement de la Base")
    print("=" * 60)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # ══════════════════════════════════════════════════════════════
    # 1. NETTOYAGE DES ANCIENNES DONNÉES INCOHÉRENTES
    # ══════════════════════════════════════════════════════════════
    print("\n[1/5] Nettoyage des anciennes données...")
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM loan_dossiers")
    cursor.execute("DELETE FROM audit_alerts")
    cursor.execute("DELETE FROM audit_logs")
    print("  ✓ Tables transactions, loan_dossiers, audit_alerts, audit_logs vidées")

    # ══════════════════════════════════════════════════════════════
    # 2. VÉRIFICATION DES UTILISATEURS
    # ══════════════════════════════════════════════════════════════
    print("\n[2/5] Vérification des utilisateurs...")
    
    # S'assurer que les 14 utilisateurs existent
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
    print(f"  ✓ {len(default_users)} utilisateurs vérifiés/insérés")

    # ══════════════════════════════════════════════════════════════
    # 3. INJECTION DE TRANSACTIONS RÉALISTES
    # ══════════════════════════════════════════════════════════════
    print("\n[3/5] Injection des transactions réalistes...")
    
    clients_data = {
        "620000001": {"name": "Aboubacar Sylla", "orange": "224620000001", "mtn": "224664000001"},
        "620000002": {"name": "Hadja Mariama Barry", "orange": "224620000002", "mtn": "224664000002"},
        "620000003": {"name": "Ousmane Keita", "orange": "224620000003", "mtn": None},
        "620000004": {"name": "Aissatou Bah", "orange": "224620000004", "mtn": "224664000004"},
        "620000005": {"name": "Thierno Amadou Tidiane", "orange": "224620000005", "mtn": "224664000005"},
        "620000006": {"name": "Salematou Traore", "orange": "224620000006", "mtn": None},
        "620000007": {"name": "Lansana Kouyate", "orange": "224620000007", "mtn": "224664000007"},
        "620000008": {"name": "Mohamed Camara", "orange": "224620000008", "mtn": None},
        "620000009": {"name": "Fatoumata Binta Diallo", "orange": "224620000009", "mtn": "224664000009"},
        "620000010": {"name": "Sekou Toure", "orange": "224620000010", "mtn": None},
    }
    
    descriptions_credit = [
        "Dépôt Agent Orange", "Salaire mensuel", "Transfert reçu", 
        "Vente commerce", "Remboursement prêt reçu", "Prime employeur",
        "Paiement client", "Encaissement chèque", "Commission vente",
        "Cotisation tontine reçue", "Virement familial reçu"
    ]
    
    descriptions_debit = [
        "Paiement EDG Électricité", "Recharge crédit téléphone", "Transfert envoyé",
        "Achat Marché Madina", "Paiement SOTELGUI Internet", "Frais scolarité",
        "Paiement loyer", "Achat médicaments", "Transport taxi/bus",
        "Cotisation tontine", "Paiement facture eau SEG", "Recharge data mobile",
        "Achat carburant", "Frais bancaires", "Paiement couture"
    ]
    
    receivers_list = [
        "+224620000001", "+224620000002", "+224620000003", "+224620000004",
        "+224620000005", "+224620000006", "+224620000007", "+224620000008",
        "+224620000009", "+224620000010", "+224622334455", "+224664112233",
        "EDG Conakry", "SOTELGUI", "SEG Eau", "Pharmacie Centrale",
        "Agent Orange Kaloum", "Agent MTN Ratoma", "Marché Madina",
    ]
    
    tx_count = 0
    base_date = datetime(2026, 5, 1, 10, 0, 0)
    
    for client_id, info in clients_data.items():
        # Nombre de transactions par client (entre 8 et 15)
        num_tx = random.randint(8, 15)
        
        for i in range(num_tx):
            days_ago = random.randint(0, 60)
            hours = random.randint(7, 19)
            minutes = random.randint(0, 59)
            tx_date = base_date - timedelta(days=days_ago, hours=random.randint(0, 12), minutes=minutes)
            
            tx_type = random.choice(["CREDIT", "CREDIT", "DEBIT", "DEBIT", "DEBIT"])  # Plus de débits
            operator = random.choice(["ORANGE", "ORANGE", "MTN"]) if info["mtn"] else "ORANGE"
            
            if tx_type == "CREDIT":
                desc = random.choice(descriptions_credit)
                amount = random.choice([150000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 3500000, 5000000])
            else:
                desc = random.choice(descriptions_debit)
                amount = random.choice([15000, 25000, 50000, 75000, 100000, 150000, 200000, 350000, 500000, 750000])
            
            receiver = random.choice(receivers_list) if tx_type == "DEBIT" else f"+{info['orange']}" if info['orange'] else None
            tx_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
            
            cursor.execute("""
                INSERT INTO transactions (tx_id, client_id, operator, type, amount, receiver, description, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?)
            """, (tx_id, client_id, operator, tx_type, amount, receiver, desc, tx_date.strftime('%Y-%m-%d %H:%M:%S')))
            tx_count += 1
    
    print(f"  ✓ {tx_count} transactions réalistes injectées pour {len(clients_data)} clients")

    # ══════════════════════════════════════════════════════════════
    # 4. INJECTION DE DOSSIERS DE PRÊT
    # ══════════════════════════════════════════════════════════════
    print("\n[4/5] Création des dossiers de prêt...")
    
    loan_dossiers = [
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
    
    for i, (client_id, agent_id, score, amount, status) in enumerate(loan_dossiers):
        created = base_date - timedelta(days=random.randint(1, 30))
        cursor.execute("""
            INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (client_id, agent_id, score, amount, status, 
              created.strftime('%Y-%m-%d %H:%M:%S'), created.strftime('%Y-%m-%d %H:%M:%S')))
    
    print(f"  ✓ {len(loan_dossiers)} dossiers de prêt créés")

    # ══════════════════════════════════════════════════════════════
    # 5. INJECTION D'ALERTES D'AUDIT
    # ══════════════════════════════════════════════════════════════
    print("\n[5/5] Création des alertes d'audit...")
    
    alerts = [
        (f"TXN-{uuid.uuid4().hex[:8].upper()}", "620000005", "LARGE_AMOUNT", "HIGH", "OPEN", "Transaction de 15 000 000 GNF détectée — seuil dépassé"),
        (f"TXN-{uuid.uuid4().hex[:8].upper()}", "620000002", "FREQUENCY", "MEDIUM", "INVESTIGATING", "5 transferts en moins de 30 minutes"),
        (f"TXN-{uuid.uuid4().hex[:8].upper()}", "620000007", "SUSPICIOUS_DESTINATION", "HIGH", "OPEN", "Transfert vers numéro non-résident (Sierra Leone)"),
        (f"TXN-{uuid.uuid4().hex[:8].upper()}", "620000001", "LARGE_AMOUNT", "MEDIUM", "CLOSED", "Transaction de 5 000 000 GNF — vérifiée et approuvée"),
        (f"TXN-{uuid.uuid4().hex[:8].upper()}", "620000009", "FREQUENCY", "LOW", "CLOSED", "3 dépôts consécutifs — comportement vérifié normal"),
    ]
    
    cursor.executemany("""
        INSERT INTO audit_alerts (tx_id, client_id, type, severity, status, details)
        VALUES (?, ?, ?, ?, ?, ?)
    """, alerts)
    print(f"  ✓ {len(alerts)} alertes d'audit créées")

    # ══════════════════════════════════════════════════════════════
    # 6. INJECTION DE LOGS D'AUDIT
    # ══════════════════════════════════════════════════════════════
    print("\n[BONUS] Création des logs d'activité...")
    
    audit_logs = [
        ("admin@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Rôle: Administrateur"),
        ("agent@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Rôle: Agent de Crédit"),
        ("bcrg@kandjou.gn", "LOGIN_SUCCESS", None, "SUCCESS", "Rôle: Régulateur (BCRG)"),
        ("620000001", "LOGIN_SUCCESS", None, "SUCCESS", "Rôle: Client"),
        ("620000005", "LOGIN_SUCCESS", None, "SUCCESS", "Rôle: Client"),
        ("agent@kandjou.gn", "CREATE_DOSSIER", "620000001", "SUCCESS", "Score: 78, Montant: 5 000 000 GNF"),
        ("agent@kandjou.gn", "CREATE_DOSSIER", "620000005", "SUCCESS", "Score: 91, Montant: 15 000 000 GNF"),
        ("risk@kandjou.gn", "APPROVE_LOAN", "620000001", "SUCCESS", "Dossier approuvé — risque faible"),
        ("risk@kandjou.gn", "REJECT_LOAN", "620000003", "SUCCESS", "Score insuffisant (42/100)"),
        ("admin@kandjou.gn", "SYSTEM_CONFIG_UPDATE", "session_timeout", "SUCCESS", "Timeout: 30 → 45 minutes"),
        ("bcrg@kandjou.gn", "GENERATE_REGULATORY_REPORT", None, "SUCCESS", "Rapport BCRG Q2-2026 généré"),
        ("admin@kandjou.gn", "TOGGLE_USER_STATUS", "620000010", "SUCCESS", "Statut: active → suspended → active"),
    ]
    
    for i, (user_id, action, target, result, details) in enumerate(audit_logs):
        log_time = base_date - timedelta(hours=random.randint(1, 72))
        cursor.execute("""
            INSERT INTO audit_logs (timestamp, user_id, action, target, result, details)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (log_time.strftime('%Y-%m-%d %H:%M:%S'), user_id, action, target, result, details))
    
    print(f"  ✓ {len(audit_logs)} logs d'audit créés")

    # ══════════════════════════════════════════════════════════════
    # COMMIT & VÉRIFICATION FINALE
    # ══════════════════════════════════════════════════════════════
    conn.commit()
    
    print("\n" + "=" * 60)
    print("  VÉRIFICATION FINALE")
    print("=" * 60)
    
    tables = ["users", "transactions", "loan_dossiers", "audit_alerts", "audit_logs", "institutions", "system_config"]
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            count = cursor.fetchone()[0]
            print(f"  📊 {t:20s} → {count} enregistrements")
        except:
            print(f"  ⚠️  {t:20s} → Table non trouvée")
    
    # Détail par client
    print("\n  --- Transactions par client ---")
    cursor.execute("SELECT client_id, COUNT(*) as cnt, SUM(amount) as total FROM transactions GROUP BY client_id ORDER BY client_id")
    for row in cursor.fetchall():
        print(f"  📱 {row[0]:15s} → {row[1]:3d} TX | Total: {row[2]:>15,.0f} GNF")
    
    conn.close()
    print("\n✅ Base de données Kandjou prête ! Mot de passe unique : 1234567890")
    print("=" * 60)

if __name__ == "__main__":
    reset_and_seed()
