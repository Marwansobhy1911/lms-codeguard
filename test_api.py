import sqlite3
import json

conn = sqlite3.connect('lms_database.db')
c = conn.cursor()

c.execute("SELECT student_id, status FROM attendances WHERE session_id = 1")
rows = c.fetchall()

res = {}
for row in rows:
    res[str(row[0])] = str(row[1]).lower()
    
print(json.dumps(res, indent=2))
conn.close()
