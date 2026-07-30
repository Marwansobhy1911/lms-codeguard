import sqlite3

def check_db():
    conn = sqlite3.connect('lms_database.db')
    c = conn.cursor()
    c.execute("SELECT session_id, student_id, status FROM attendances")
    rows = c.fetchall()
    print(rows)
    conn.close()

if __name__ == "__main__":
    check_db()
