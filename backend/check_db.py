import sys
import os

# Ajouter le chemin actuel pour permettre l'importation de modules locaux
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from modules.common.database import get_db_connection

def check_all():
    conn = get_db_connection()
    if not conn:
        print("❌ Connexion échouée")
        return
        
    cursor = conn.cursor()
    
    # 1. Balances
    cursor.execute("SELECT COUNT(*) FROM simulator_balances")
    print(f"Simulator Balances: {cursor.fetchone()[0]}")
    
    # 2. Users
    cursor.execute("SELECT COUNT(*) FROM users")
    print(f"Users: {cursor.fetchone()[0]}")
    
    # 3. Institutions
    cursor.execute("SELECT COUNT(*) FROM institutions")
    print(f"Institutions: {cursor.fetchone()[0]}")
    
    # 4. Transactions
    cursor.execute("SELECT COUNT(*) FROM transactions")
    print(f"Transactions: {cursor.fetchone()[0]}")
    
    conn.close()

if __name__ == "__main__":
    check_all()
