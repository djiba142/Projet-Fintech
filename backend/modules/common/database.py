import sqlite3
import os
import logging
from dotenv import load_dotenv

# Ajout du support MySQL
try:
    import mysql.connector
    from mysql.connector import Error
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

load_dotenv()

# Configuration SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "kandjou.db")

# Configuration MySQL depuis .env
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

logger = logging.getLogger("database")

def get_db_connection():
    """
    Retourne une connexion à la base de données (MySQL si configurée, sinon SQLite).
    """
    # Si MySQL est configuré dans le .env
    if MYSQL_AVAILABLE and DB_HOST and DB_NAME:
        try:
            conn = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME,
                autocommit=True
            )
            return conn
        except Exception as e:
            logger.error(f"❌ Échec connexion MySQL ({DB_HOST}): {e}. Fallback vers SQLite.")
    
    # Fallback SQLite
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"❌ Échec connexion SQLite ({DB_PATH}): {e}")
        return None

def get_placeholder():
    """Retourne le placeholder correct selon le type de base de données."""
    if MYSQL_AVAILABLE and DB_HOST and DB_NAME:
        return "%s"
    return "?"

def init_db():
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    
    is_mysql = not isinstance(conn, sqlite3.Connection)
    pk_inc = "INTEGER PRIMARY KEY AUTO_INCREMENT" if is_mysql else "INTEGER PRIMARY KEY AUTOINCREMENT"
    text_type = "VARCHAR(255)" if is_mysql else "TEXT"
    long_text = "TEXT" if is_mysql else "TEXT"
    
    # Tables de base
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS risk_policy (
            id {pk_inc},
            min_score_threshold INTEGER DEFAULT 65,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {pk_inc},
            username {text_type} UNIQUE,
            password {text_type},
            role {text_type},
            fullname {text_type},
            email {text_type},
            msisdn_orange {text_type},
            msisdn_mtn {text_type},
            language {text_type} DEFAULT 'FR',
            status {text_type} DEFAULT 'active',
            institution {text_type},
            department {text_type},
            access_level {text_type},
            audit_level {text_type},
            id_card {text_type},
            nationality {text_type} DEFAULT 'Guinéenne',
            address {long_text},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            must_change_password INTEGER DEFAULT 1
        )
    """)
    
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id {pk_inc},
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id {text_type},
            action {text_type},
            target {text_type},
            result {text_type},
            details {long_text}
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS loan_dossiers (
            id {pk_inc},
            client_id {text_type},
            agent_id {text_type},
            score INTEGER,
            amount DOUBLE,
            status {text_type} DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS audit_alerts (
            id {pk_inc},
            tx_id {text_type},
            client_id {text_type},
            type {text_type},
            severity {text_type},
            status {text_type} DEFAULT 'OPEN',
            details {long_text},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS institutions (
            id {pk_inc},
            name {text_type} UNIQUE,
            type {text_type},
            api_status {text_type} DEFAULT 'ONLINE',
            uptime_score DOUBLE DEFAULT 99.9,
            total_volume DOUBLE DEFAULT 0,
            last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS transactions (
            id {pk_inc},
            tx_id {text_type} UNIQUE,
            client_id {text_type},
            operator {text_type},
            type {text_type},
            amount DOUBLE,
            fee DOUBLE DEFAULT 0,
            receiver {text_type},
            description {long_text},
            status {text_type} DEFAULT 'SUCCESS',
            withdraw_code {text_type},
            withdraw_expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS system_config (
            id {pk_inc},
            config_key {text_type} UNIQUE,
            config_value {long_text},
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS simulator_balances (
            msisdn {text_type} PRIMARY KEY,
            operator {text_type},
            balance DOUBLE DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS favorites (
            id {pk_inc},
            user_id {text_type},
            name {text_type},
            msisdn {text_type},
            operator {text_type},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Initialisation des seuils par défaut
    cursor.execute("SELECT COUNT(*) FROM risk_policy")
    row = cursor.fetchone()
    count = row[0] if isinstance(row, (list, tuple)) else row['COUNT(*)'] if isinstance(row, dict) else row[0]
    if count == 0:
        cursor.execute(f"INSERT INTO risk_policy (min_score_threshold) VALUES ({65})")

    if not is_mysql:
        conn.commit()
    conn.close()

def _to_dict(row, cursor):
    """Convertit une ligne de résultat en dictionnaire (Compatible SQLite/MySQL)."""
    if row is None: return None
    if hasattr(row, '__dict__') and 'Row' in str(type(row)): # SQLite Row
        return dict(row)
    # MySQL or standard tuple
    return dict(zip(cursor.column_names, row))

# --- Fonctions Utilisateurs ---

def get_user_by_username(username: str):
    conn = get_db_connection()
    if not conn: return None
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    cursor.execute(f"SELECT * FROM users WHERE username = {p}", (username,))
    row = cursor.fetchone()
    user = _to_dict(row, cursor)
    conn.close()
    return user

def get_all_users():
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = [_to_dict(row, cursor) for row in cursor.fetchall()]
    conn.close()
    return users

def create_user(username, password, role, fullname, email=None, msisdn_orange=None, msisdn_mtn=None, address="Conakry, Guinée", language='FR'):
    conn = get_db_connection()
    if not conn: return {"error": "DB Connection failed"}
    cursor = conn.cursor()
    p = get_placeholder()
    try:
        cursor.execute(f"""
            INSERT INTO users (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, address, language)
            VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
        """, (username, password, role, fullname, email, msisdn_orange, msisdn_mtn, address, language))
        if isinstance(conn, sqlite3.Connection): conn.commit()
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

def delete_user(username: str):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"DELETE FROM users WHERE username = {p}", (username,))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    return True

def toggle_user_status(username: str):
    conn = get_db_connection()
    if not conn: return {"error": "DB Connection failed"}
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    cursor.execute(f"SELECT status FROM users WHERE username = {p}", (username,))
    row = cursor.fetchone()
    data = _to_dict(row, cursor)
    if data:
        new_status = "suspended" if data['status'] == "active" else "active"
        cursor.execute(f"UPDATE users SET status = {p} WHERE username = {p}", (new_status, username))
        if isinstance(conn, sqlite3.Connection): conn.commit()
        conn.close()
        return {"username": username, "new_status": new_status}
    conn.close()
    return {"error": "User not found"}

def update_user_role(username: str, role: str):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"UPDATE users SET role = {p} WHERE username = {p}", (role, username))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    return True

# --- Fonctions de Risque ---

def get_risk_threshold():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
        cursor.execute("SELECT min_score_threshold FROM risk_policy ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        data = _to_dict(row, cursor)
        conn.close()
        return data['min_score_threshold'] if data else 65
    except Exception:
        return 65

def set_risk_threshold(threshold: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"INSERT INTO risk_policy (min_score_threshold) VALUES ({p})", (threshold,))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()

# --- Fonctions d'Audit et Config ---

def log_event(user_id, action, target=None, result=None, details=None):
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"""
        INSERT INTO audit_logs (user_id, action, target, result, details)
        VALUES ({p}, {p}, {p}, {p}, {p})
    """, (user_id, action, target, result, details))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()

def get_audit_logs(limit=50):
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    cursor.execute(f"SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT {p}", (limit,))
    logs = [_to_dict(row, cursor) for row in cursor.fetchall()]
    conn.close()
    return logs

def get_system_config():
    conn = get_db_connection()
    if not conn: return {}
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT config_key, config_value FROM system_config")
    rows = cursor.fetchall()
    conn.close()
    return {_to_dict(r, cursor)["config_key"]: _to_dict(r, cursor)["config_value"] for r in rows}

# --- Fonctions de Dossiers ---

def get_all_loan_dossiers():
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM loan_dossiers ORDER BY created_at DESC")
    rows = [_to_dict(row, cursor) for row in cursor.fetchall()]
    conn.close()
    return rows

def update_loan_status(dossier_id, status):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"UPDATE loan_dossiers SET status = {p} WHERE id = {p}", (status, dossier_id))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    return True

def create_loan_dossier(client_id, agent_id, score, amount):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"""
        INSERT INTO loan_dossiers (client_id, agent_id, score, amount, status)
        VALUES ({p}, {p}, {p}, {p}, 'PENDING')
    """, (client_id, agent_id, score, amount))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    return True

# --- Fonctions Simulateur (Persistance des soldes) ---

def get_sim_balance(msisdn: str):
    conn = get_db_connection()
    if not conn: return None
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    cursor.execute(f"SELECT balance FROM simulator_balances WHERE msisdn = {p}", (msisdn,))
    row = cursor.fetchone()
    data = _to_dict(row, cursor)
    conn.close()
    return data['balance'] if data else None

def update_sim_balance(msisdn: str, operator: str, balance: float):
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    p = get_placeholder()
    
    is_mysql = not isinstance(conn, sqlite3.Connection)
    if is_mysql:
        query = f"""
            INSERT INTO simulator_balances (msisdn, operator, balance, updated_at)
            VALUES ({p}, {p}, {p}, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE balance = VALUES(balance), updated_at = CURRENT_TIMESTAMP
        """
    else:
        query = f"""
            INSERT INTO simulator_balances (msisdn, operator, balance, updated_at)
            VALUES ({p}, {p}, {p}, CURRENT_TIMESTAMP)
            ON CONFLICT(msisdn) DO UPDATE SET balance = excluded.balance, updated_at = CURRENT_TIMESTAMP
        """
    cursor.execute(query, (msisdn, operator, balance))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()

# --- Fonctions Favoris ---

def get_user_favorites(username: str):
    conn = get_db_connection()
    if not conn: return []
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    cursor.execute(f"SELECT * FROM favorites WHERE user_id = {p}", (username,))
    favs = [_to_dict(row, cursor) for row in cursor.fetchall()]
    conn.close()
    return favs

def add_favorite(username, name, msisdn, operator):
    conn = get_db_connection()
    if not conn: return False
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"""
        INSERT INTO favorites (user_id, name, msisdn, operator)
        VALUES ({p}, {p}, {p}, {p})
    """, (username, name, msisdn, operator))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    return True

# Initialisation au démarrage
init_db()
