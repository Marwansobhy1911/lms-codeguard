import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'lms_database.db')

def delete_all_reports():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get count before deletion
        cursor.execute("SELECT COUNT(*) FROM plagiarism_reports")
        count = cursor.fetchone()[0]
        
        # Delete records
        cursor.execute("DELETE FROM plagiarism_reports")
        conn.commit()
        
        print(f"Successfully deleted {count} plagiarism reports.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    delete_all_reports()
