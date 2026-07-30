import sqlite3
import pprint

conn = sqlite3.connect('lms_database.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("Tables:", tables)

if ('attendances',) in tables or ('attendance',) in tables:
    table_name = 'attendances' if ('attendances',) in tables else 'attendance'
    c.execute(f"SELECT * FROM {table_name} LIMIT 5")
    print(f"\n{table_name}:")
    pprint.pprint(c.fetchall())
