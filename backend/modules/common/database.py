import mysql.connector
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configuration MySQL depuis le .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "db_kandjou")

logger = logging.getLogger("database")

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            collation='utf8mb4_unicode_ci'
        )
        return conn
    except Exception as e:
        logger.error(f"Erreur de connexion MySQL: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    
    # Tables de base
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_policy (
            id INT AUTO_INCREMENT PRIMARY KEY,
            min_score_threshold INT DEFAULT 65,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    
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
            status VARCHAR(20) DEFAULT 'active',
            institution VARCHAR(100),
            department VARCHAR(100),
            access_level VARCHAR(50),
            audit_level VARCHAR(50),
            id_card VARCHAR(100),
            nationality VARCHAR(100) DEFAULT 'Guinéenne',
            must_change_password TINYINT DEFAULT 1
        )
    """)
    
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
            FOREIGN KEY (client_id) REFERENCES users(username) ON DELETE SET NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tx_id VARCHAR(100),
            client_id VARCHAR(190),
            type VARCHAR(100),
            severity VARCHAR(20),
            status VARCHAR(20) DEFAULT 'OPEN',
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS institutions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE,
            type VARCHAR(50),
            api_status VARCHAR(20) DEFAULT 'ONLINE',
            uptime_score DECIMAL(5,2) DEFAULT 99.9,
            total_volume DECIMAL(15,2) DEFAULT 0,
            last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tx_id VARCHAR(50) UNIQUE,
            client_id VARCHAR(190),
            operator VARCHAR(20),
            type VARCHAR(20),
            amount DECIMAL(15, 2),
            receiver VARCHAR(190),
            description TEXT,
            status VARCHAR(20) DEFAULT 'SUCCESS',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            id INT AUTO_INCREMENT PRIMARY KEY,
            config_key VARCHAR(100) UNIQUE,
            config_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)

    # Initialisation des seuils par défaut
    cursor.execute("SELECT COUNT(*) FROM risk_policy")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO risk_policy (min_score_threshold) VALUES (65)")
    
    conn.commit()
    conn.close()

# --- Fonctions Utilisateurs ---

def get_user_by_username(username: str):
    conn = get_db_connection()
    if not conn: return None
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_all_users():
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()
    return users

def create_user(username, password, role, fullname, email=None, msisdn_orange=None, msisdn_mtn=None, language='FR'):
    conn = get_db_connection()
    if not conn: return {"error": "DB Connection failed"}
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, language))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

def delete_user(username: str):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = %s", (username,))
    conn.commit()
    conn.close()
    return True

def toggle_user_status(username: str):
    conn = get_db_connection()
    if not conn: return {"error": "DB Connection failed"}
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

def update_user_role(username: str, role: str):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET role = %s WHERE username = %s", (role, username))
    conn.commit()
    conn.close()
    return True

# --- Fonctions de Risque ---

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
    cursor.execute("INSERT INTO risk_policy (min_score_threshold) VALUES (%s)", (threshold,))
    conn.commit()
    conn.close()

# --- Fonctions d'Audit et Config ---

def log_event(user_id, action, target=None, result=None, details=None):
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (user_id, action, target, result, details)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, action, target, result, details))
    conn.commit()
    conn.close()

def get_audit_logs(limit=50):
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT %s", (limit,))
    logs = cursor.fetchall()
    conn.close()
    return logs

def get_system_config():
    conn = get_db_connection()
    if not conn: return {}
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT config_key, config_value FROM system_config")
    rows = cursor.fetchall()
    conn.close()
    return {r["config_key"]: r["config_value"] for r in rows}

# --- Fonctions de Dossiers ---

def get_all_loan_dossiers():
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM loan_dossiers ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return rows

def update_loan_status(dossier_id, status):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("UPDATE loan_dossiers SET status = %s WHERE id = %s", (status, dossier_id))
    conn.commit()
    conn.close()
    return True

def create_loan_dossier(client_id, agent_id, score, amount):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
        VALUES (%s, %s, %s, %s, 'PENDING')
    """, (client_id, agent_id, score, amount))
    conn.commit()
    conn.close()
    return True

# Initialisation au démarrage
init_db()
