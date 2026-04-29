import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "db_kandjou")
    )

def init_db():
    # First connection to create DB if not exists
    conn_initial = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "")
    )
    cursor_initial = conn_initial.cursor()
    cursor_initial.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('DB_NAME', 'db_kandjou')}")
    conn_initial.close()

    # Now connect to the DB
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table des seuils de risque
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_policy (
            id INT AUTO_INCREMENT PRIMARY KEY,
            min_score_threshold INT DEFAULT 65,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table des utilisateurs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
            id INT AUTO_INCREMENT PRIMARY KEY,
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
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id VARCHAR(190),
            agent_id VARCHAR(190),
            score INT,
            amount DECIMAL(15, 2),
            status VARCHAR(50) DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(username)
        )
    """)
    
    # Initial stats check
    cursor.execute("SELECT COUNT(*) FROM risk_policy")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO risk_policy (min_score_threshold) VALUES (65)")
        
    # Default users
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_users = [
            ("client@kandjou.gn", "1234567890", "Client", "Kadiatou Bah", "kadiatou@email.com", "622123456", "622987654", "FR", "active"),
            ("agent@kandjou.gn", "1234567890", "Agent de Crédit", "Mamadou Diallo", "mamadou@bkr.gn", None, None, "FR", "active"),
            ("admin@kandjou.gn", "1234567890", "Administrateur", "Admin Kandjou", "admin@kandjou.gn", None, None, "FR", "active"),
            ("risk@kandjou.gn", "1234567890", "Analyste Risque", "Fatoumata Camara", "fatou@risk.gn", None, None, "FR", "active"),
            ("bcrg@kandjou.gn", "1234567890", "Régulateur (BCRG)", "Contrôleur BCRG", "audit@bcrg.gn", None, None, "FR", "active")
        ]
        cursor.executemany("INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", default_users)
        
    # Default dossiers
    cursor.execute("SELECT COUNT(*) FROM loan_dossiers")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
            VALUES ('client@kandjou.gn', 'agent@kandjou.gn', 72, 15000000, 'PENDING')
        """)
        
    conn.commit()
    conn.close()

def get_user_by_username(username: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language, status FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        conn.close()
        return user
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
    cursor.execute("UPDATE risk_policy SET min_score_threshold = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1", (threshold,))
    conn.commit()
    conn.close()

def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT username, role, fullname, status FROM users")
    users = cursor.fetchall()
    conn.close()
    return users

def toggle_user_status(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM users WHERE username = %s", (username,))
    row = cursor.fetchone()
    if row:
        new_status = "suspended" if row[0] == "active" else "active"
        cursor.execute("UPDATE users SET status = %s WHERE username = %s", (new_status, username))
        conn.commit()
        conn.close()
        return {"username": username, "new_status": new_status}
    conn.close()
    return {"error": "User not found"}

def create_user(username: str, password: str, role: str, fullname: str, email: str = None, language: str = "FR"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, password, role, fullname, email, language, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'active')
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
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, action, target, result, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging event: {e}")

def get_audit_logs(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT timestamp, user_id, action, target, result, details FROM audit_logs ORDER BY timestamp DESC LIMIT %s", (limit,))
    logs = cursor.fetchall()
    conn.close()
    return logs

def get_all_loan_dossiers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM loan_dossiers ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows

def update_loan_status(dossier_id: int, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE loan_dossiers SET status = %s WHERE id = %s", (status, dossier_id))
    conn.commit()
    conn.close()
    return True

def create_loan_dossier(client_id, agent_id, score, amount):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
        VALUES (%s, %s, %s, %s, 'PENDING')
    """, (client_id, agent_id, score, amount))
    conn.commit()
    conn.close()
    return True

# Initialisation
try:
    init_db()
except Exception as e:
    print(f"Database initialization error: {e}")
