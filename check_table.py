import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def check_table():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor()
        cursor.execute("DESCRIBE users")
        rows = cursor.fetchall()
        print("--- Structure de la table users ---")
        for r in rows:
            print(r)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_table()
