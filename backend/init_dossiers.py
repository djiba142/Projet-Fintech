import sqlite3
import os

db_path = "c:/Users/Djiba Kourouma/Desktop/projet_fintech/backend/kandjou.db"

def check_and_fill():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Ensure tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='loan_dossiers'")
    if not cursor.fetchone():
        print("Creating loan_dossiers table...")
        cursor.execute("""
            CREATE TABLE loan_dossiers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT NOT NULL,
                amount REAL NOT NULL,
                score INTEGER NOT NULL,
                status TEXT DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

    # Ensure at least one client user exists
    cursor.execute("SELECT * FROM users WHERE role = 'Client'")
    if not cursor.fetchone():
        print("Inserting test client...")
        cursor.execute("""
            INSERT INTO users (username, password, fullname, role, msisdn_orange, msisdn_mtn, status)
            VALUES ('622112233', 'pbkdf2:sha256:260000$test', 'Mamadou Diallo', 'Client', '622112233', '664112233', 'ACTIVE')
        """)
    
    # Fill dossiers
    cursor.execute("SELECT COUNT(*) as count FROM loan_dossiers")
    if cursor.fetchone()['count'] == 0:
        print("Inserting dummy dossiers...")
        dossiers = [
            ('622112233', 15000000, 85, 'PENDING'),
            ('622112233', 2500000, 42, 'PENDING'),
            ('622112233', 50000000, 92, 'APPROVED')
        ]
        cursor.executemany("INSERT INTO loan_dossiers (client_id, amount, score, status) VALUES (?, ?, ?, ?)", dossiers)
    
    conn.commit()
    conn.close()
    print("Database sync complete.")

if __name__ == "__main__":
    check_and_fill()
