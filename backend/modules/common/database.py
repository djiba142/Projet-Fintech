import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "database.sqlite")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table des seuils de risque
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_policy (
            id INTEGER PRIMARY KEY,
            min_score_threshold INTEGER DEFAULT 65,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Table des utilisateurs (Agents/Admins)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            fullname TEXT,
            status TEXT DEFAULT 'active'
        )
    """)
    
    # Registre d'audit immuable (Conformité BCRG)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id TEXT,
            action TEXT,
            target TEXT,
            result TEXT,
            details TEXT
        )
    """)
    
    # Insertion de la politique par défaut
    cursor.execute("SELECT COUNT(*) FROM risk_policy")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO risk_policy (min_score_threshold) VALUES (65)")
        
    # Insertion des utilisateurs par défaut
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_users = [
            ("agent@kandjou.gn", "agent123", "Agent de Crédit", "Agent Demo", "active"),
            ("admin@kandjou.gn", "admin123", "Administrateur", "Admin Root", "active"),
            ("risk@kandjou.gn", "risk123", "Analyste Risque", "Analyste Risque", "active")
        ]
        cursor.executemany("INSERT INTO users (username, password, role, fullname, status) VALUES (?, ?, ?, ?, ?)", default_users)
        
    conn.commit()
    conn.close()

def get_user_by_username(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username, password, role, fullname, status FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "username": row[0],
            "password": row[1],
            "role": row[2],
            "fullname": row[3],
            "status": row[4]
        }
    return None

def get_risk_threshold():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT min_score_threshold FROM risk_policy ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else 65
    except Exception:
        return 65

def set_risk_threshold(threshold: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE risk_policy SET min_score_threshold = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", (threshold,))
    conn.commit()
    conn.close()

def get_all_users():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username, role, fullname, status FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [{
        "username": r[0],
        "role": r[1],
        "fullname": r[2],
        "status": r[3]
    } for r in rows]

def toggle_user_status(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Get current status
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

def create_user(username: str, password: str, role: str, fullname: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, password, role, fullname, status)
            VALUES (?, ?, ?, ?, 'active')
        """, (username, password, role, fullname))
        conn.commit()
        conn.close()
        return {"username": username, "status": "created"}
    except sqlite3.IntegrityError:
        return {"error": "Cet utilisateur existe déjà."}
    except Exception as e:
        return {"error": str(e)}

# --- Fonctions d'Audit ---

def log_event(user_id: str, action: str, target: str = None, result: str = None, details: str = None):
    try:
        conn = sqlite3.connect(DB_PATH)
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, user_id, action, target, result, details FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [{
        "timestamp": r[0],
        "user_id": r[1],
        "action": r[2],
        "target": r[3],
        "result": r[4],
        "details": r[5]
    } for r in rows]

# Initialisation au chargement du module
if not os.path.exists(DB_PATH):
    init_db()
