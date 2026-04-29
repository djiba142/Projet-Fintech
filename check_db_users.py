import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def check_users():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT username, password, role FROM users")
        users = cursor.fetchall()
        print("--- Liste des utilisateurs ---")
        for u in users:
            print(f"User: {u['username']} | Pass: {u['password']} | Role: {u['role']}")
        conn.close()
    except Exception as e:
        print(f"Erreur : {e}")

if __name__ == "__main__":
    check_users()
