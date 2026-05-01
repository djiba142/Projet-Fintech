import sys
import os

# Ajouter le chemin actuel pour permettre l'importation de modules locaux
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from modules.common.database import get_db_connection

def check_balances():
    conn = get_db_connection()
    if not conn:
        print("❌ Connexion échouée")
        return
        
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM simulator_balances")
    rows = cursor.fetchall()
    
    print(f"--- {len(rows)} records in simulator_balances ---")
    for row in rows:
        print(row)
        
    conn.close()

if __name__ == "__main__":
    check_balances()
