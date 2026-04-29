import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def migrate_db_v2():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor()
        
        print("--- Migration Database v2 ---")
        
        # Add msisdn_orange if missing
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN msisdn_orange VARCHAR(20) AFTER email")
            print("Added msisdn_orange")
        except:
            print("msisdn_orange already exists")

        # Add msisdn_mtn if missing
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN msisdn_mtn VARCHAR(20) AFTER msisdn_orange")
            print("Added msisdn_mtn")
        except:
            print("msisdn_mtn already exists")
            
        # Update test client
        cursor.execute("""
            UPDATE users 
            SET password = '1234567890', 
                msisdn_orange = '622123456', 
                msisdn_mtn = '622987654' 
            WHERE username = 'client@kandjou.gn'
        """)
        
        conn.commit()
        print("Test client updated successfully")
        conn.close()
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate_db_v2()
