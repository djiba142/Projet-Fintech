import sqlite3

def patch_users():
    conn = sqlite3.connect("kandjou.db")
    cursor = conn.cursor()
    
    cols = [
        ("institution", "VARCHAR(100)"),
        ("department", "VARCHAR(100)"),
        ("access_level", "VARCHAR(50)"),
        ("audit_level", "VARCHAR(50)"),
        ("must_change_password", "INTEGER DEFAULT 1")
    ]
    
    for col_name, col_type in cols:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Column {col_name} added.")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    patch_users()
