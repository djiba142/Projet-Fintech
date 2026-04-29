import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def check_users_v2():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, password FROM users")
        users = cursor.fetchall()
        print("--- DEBUG USERS ---")
        for u in users:
            print(f"ID: {u['id']} | Username: [{u['username']}] | Pass: [{u['password']}]")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users_v2()
