import sqlite3

conn = sqlite3.connect('lms_database.db')
c = conn.cursor()

# Set all attendances to 'ABSENT'
c.execute("UPDATE attendances SET status = 'ABSENT' WHERE status = 'PRESENT'")
print(f"Updated {c.rowcount} attendance records to 'ABSENT'.")

conn.commit()
conn.close()
