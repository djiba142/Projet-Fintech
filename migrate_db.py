import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def migrate_db():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor()
        
        print("--- Migration de la base de données ---")
        
        # Ajout des colonnes manquantes si nécessaire
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN msisdn_orange VARCHAR(20) AFTER email")
            print("✅ Colonne msisdn_orange ajoutée.")
        except Exception:
            print("ℹ️ Colonne msisdn_orange déjà présente ou erreur ignorée.")

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN msisdn_mtn VARCHAR(20) AFTER msisdn_orange")
            print("✅ Colonne msisdn_mtn ajoutée.")
        except Exception:
            print("ℹ️ Colonne msisdn_mtn déjà présente ou erreur ignorée.")
            
        # Mise à jour des données pour le client test
        cursor.execute("""
            UPDATE users 
            SET password = '1234567890', 
                msisdn_orange = '622123456', 
                msisdn_mtn = '622987654' 
            WHERE username = 'client@kandjou.gn'
        """)
        
        conn.commit()
        print("✅ Données du client test mises à jour.")
        conn.close()
    except Exception as e:
        print(f"❌ Erreur lors de la migration : {e}")

if __name__ == "__main__":
    migrate_db()
