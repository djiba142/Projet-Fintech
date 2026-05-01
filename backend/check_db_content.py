import sqlite3

for db in ["kandjou.db", "database.sqlite"]:
    print(f"--- Checking {db} ---")
    try:
        conn = sqlite3.connect(db)
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT username, fullname, role FROM users WHERE role='Client'").fetchall()
        for r in rows:
            print(f"  [Client] {r['username']} - {r['fullname']}")
        conn.close()
    except Exception as e:
        print(f"  Error: {e}")
    print()
