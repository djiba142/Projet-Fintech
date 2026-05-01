import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

# Path to local sqlite db
DB_PATH = "kandjou.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row # Equivalent to dictionary=True in MySQL
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table des seuils de risque
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_policy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            min_score_threshold INT DEFAULT 65,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table des utilisateurs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(190) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(100),
            fullname VARCHAR(255),
            email VARCHAR(255),
            msisdn_orange VARCHAR(20),
            msisdn_mtn VARCHAR(20),
            language VARCHAR(10) DEFAULT 'FR',
            status VARCHAR(20) DEFAULT 'active'
        )
    """)
    
    # Registre d'audit
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id VARCHAR(255),
            action VARCHAR(255),
            target VARCHAR(255),
            result VARCHAR(100),
            details TEXT
        )
    """)

    # Table des dossiers de crédit
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS loan_dossiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id VARCHAR(190),
            agent_id VARCHAR(190),
            score INT,
            amount DECIMAL(15, 2),
            status VARCHAR(50) DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(username)
        )
    """)
    
    # Table des alertes de fraude (AML)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tx_id VARCHAR(100),
            client_id VARCHAR(190),
            type VARCHAR(100), -- LARGE_AMOUNT, FREQUENCY, SUSPICIOUS_DESTINATION
            severity VARCHAR(20), -- HIGH, MEDIUM, LOW
            status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, CLOSED
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Table des institutions surveillées
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS institutions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) UNIQUE,
            type VARCHAR(50), -- TELCO, BANK, MFI
            api_status VARCHAR(20) DEFAULT 'ONLINE',
            uptime_score DECIMAL(5,2) DEFAULT 99.9,
            total_volume DECIMAL(15,2) DEFAULT 0,
            last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Table des transactions réelles (Grand Livre)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tx_id VARCHAR(50) UNIQUE,
            client_id VARCHAR(190),
            operator VARCHAR(20), -- ORANGE, MTN
            type VARCHAR(20), -- DEBIT, CREDIT
            amount DECIMAL(15, 2),
            receiver VARCHAR(190),
            description TEXT,
            status VARCHAR(20) DEFAULT 'SUCCESS',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table de configuration globale
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_key VARCHAR(100) UNIQUE,
            config_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Initial stats check
    cursor.execute("SELECT COUNT(*) FROM risk_policy")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO risk_policy (min_score_threshold) VALUES (65)")

    # Default config
    cursor.execute("SELECT COUNT(*) FROM system_config")
    if cursor.fetchone()[0] == 0:
        configs = [
            ("session_timeout", "30"),
            ("max_otp_attempts", "3"),
            ("orange_api_url", "https://api.orange.gn/v1"),
            ("mtn_api_url", "https://api.mtn.gn/v1")
        ]
        cursor.executemany("INSERT INTO system_config (config_key, config_value) VALUES (?, ?)", configs)
        
    # Default users
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_users = [
            ("client@kandjou.gn", "1234567890", "Client", "Kadiatou Bah", "kadiatou@email.com", "224622123456", "224664100001", "FR", "active"),
            ("agent@kandjou.gn", "1234567890", "Agent de Crédit", "Mamadou Diallo", "mamadou@bkr.gn", None, None, "FR", "active"),
            ("admin@kandjou.gn", "1234567890", "Administrateur", "Admin Kandjou", "admin@kandjou.gn", None, None, "FR", "active"),
            ("risk@kandjou.gn", "1234567890", "Analyste Risque", "Fatoumata Camara", "fatou@risk.gn", None, None, "FR", "active"),
            ("bcrg@kandjou.gn", "1234567890", "Régulateur (BCRG)", "Contrôleur BCRG", "audit@bcrg.gn", None, None, "FR", "active")
        ]
        cursor.executemany("INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", default_users)
        
        cursor.execute("""
            INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
            VALUES ('client@kandjou.gn', 'agent@kandjou.gn', 72, 15000000, 'PENDING')
        """)

    # Default Institutions
    cursor.execute("SELECT COUNT(*) FROM institutions")
    if cursor.fetchone()[0] == 0:
        insts = [
            ("ORANGE MONEY", "TELCO", "ONLINE", 99.8, 450000000),
            ("MTN MOMO", "TELCO", "ONLINE", 99.5, 320000000),
            ("VISTA BANK", "BANK", "ONLINE", 99.9, 1200000000),
            ("ECOBANK", "BANK", "MAINTENANCE", 94.2, 850000000)
        ]
        cursor.executemany("INSERT INTO institutions (name, type, api_status, uptime_score, total_volume) VALUES (?, ?, ?, ?, ?)", insts)
        
    # Default Transactions for BCRG visibility
    cursor.execute("SELECT COUNT(*) FROM transactions")
    if cursor.fetchone()[0] == 0:
        import uuid
        txs = []
        for i in range(40):
            op = "ORANGE" if i % 2 == 0 else "MTN"
            tx_type = "DEBIT" if i % 3 == 0 else "CREDIT"
            amt = (i + 1) * 250000
            txs.append((
                f"TXN-{uuid.uuid4().hex[:8].upper()}",
                "client@kandjou.gn",
                op,
                tx_type,
                amt,
                f"+2246200000{i%10}",
                f"Transaction test {i+1}",
                "SUCCESS"
            ))
        cursor.executemany("""
            INSERT INTO transactions (tx_id, client_id, operator, type, amount, receiver, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, txs)
    conn.commit()
    conn.close()

def get_user_by_username(username: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        print(f"Database error in get_user_by_username: {e}")
        return None

def get_risk_threshold():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT min_score_threshold FROM risk_policy ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else 65
    except Exception:
        return 65

def set_risk_threshold(threshold: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE risk_policy SET min_score_threshold = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", (threshold,))
    conn.commit()
    conn.close()

def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT username, role, fullname, status FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def toggle_user_status(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if row:
        new_status = "suspended" if row[0] == "active" else "active"
        cursor.execute("UPDATE users SET status = ? WHERE username = ?", (new_status, username))
        conn.commit()
        conn.close()
        return {"username": username, "new_status": new_status}
    conn.close()
    return {"error": "User not found"}

def delete_user(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    conn.commit()
    conn.close()
    return True

def update_user_role(username: str, role: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET role = ? WHERE username = ?", (role, username))
    conn.commit()
    conn.close()
    return True

def get_system_config():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT config_key, config_value FROM system_config")
    rows = cursor.fetchall()
    conn.close()
    return {r["config_key"]: r["config_value"] for r in rows}

def create_user(username: str, password: str, role: str, fullname: str, email: str = None, language: str = "FR"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, password, role, fullname, email, language, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
        """, (username, password, role, fullname, email, language))
        conn.commit()
        conn.close()
        return {"username": username, "status": "created"}
    except Exception as e:
        return {"error": str(e)}

def log_event(user_id: str, action: str, target: str = None, result: str = None, details: str = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs (user_id, action, target, result, details)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, action, target, result, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging event: {e}")

def get_audit_logs(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, user_id, action, target, result, details FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_loan_dossiers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM loan_dossiers ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_loan_status(dossier_id: int, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE loan_dossiers SET status = ? WHERE id = ?", (status, dossier_id))
    conn.commit()
    conn.close()
    return True

def create_loan_dossier(client_id, agent_id, score, amount):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
        VALUES (?, ?, ?, ?, 'PENDING')
    """, (client_id, agent_id, score, amount))
    conn.commit()
    conn.close()
    return True

# Initialisation
try:
    init_db()
except Exception as e:
    print(f"Database initialization error: {e}")
