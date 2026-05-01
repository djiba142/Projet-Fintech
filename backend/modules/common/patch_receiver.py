import sqlite3
import os

DB_PATH = r"c:\Users\Djiba Kourouma\Desktop\projet_fintech\backend\kandjou.db"

def patch_db():
    if not os.path.exists(DB_PATH):
        print("DB non trouvée")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE transactions ADD COLUMN receiver VARCHAR(190)")
        print("Colonne 'receiver' ajoutée avec succès.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("La colonne 'receiver' existe déjà.")
        else:
            print(f"Erreur: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    patch_db()
