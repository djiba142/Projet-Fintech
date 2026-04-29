import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

def reset_password():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "db_kandjou")
        )
        cursor = conn.cursor()
        
        # On s'assure que l'utilisateur existe et on force son mot de passe
        username = "client@kandjou.gn"
        new_pass = "1234567890"
        
        cursor.execute("UPDATE users SET password = %s WHERE username = %s", (new_pass, username))
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Mot de passe de {username} réinitialisé avec succès !")
        else:
            print(f"⚠️ Utilisateur {username} non trouvé.")
            
        conn.close()
    except Exception as e:
        print(f"❌ Erreur lors de la réinitialisation : {e}")

if __name__ == "__main__":
    reset_password()
