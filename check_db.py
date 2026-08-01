import sqlite3

def upgrade_db():
    conn = sqlite3.connect('lms_database.db')
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE tasks ADD COLUMN reference_link VARCHAR;")
        print("Added reference_link to tasks")
    except Exception as e:
        print("Error adding reference_link:", e)
        
    try:
        c.execute("ALTER TABLE users ADD COLUMN bonus_points FLOAT DEFAULT 0.0;")
        print("Added bonus_points to users")
    except Exception as e:
        print("Error adding bonus_points:", e)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade_db()
