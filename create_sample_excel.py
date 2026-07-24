import pandas as pd

def create_sample_excel():
    data = [
        {"ID": "2024001", "Name": "أحمد محمود علي", "Email": "ahmed@example.com", "Role": "student", "AssignedSupporterID": "SUP-01"},
        {"ID": "2024002", "Name": "سارة محمد خليل", "Email": "sara@example.com", "Role": "student", "AssignedSupporterID": "SUP-01"},
        {"ID": "2024003", "Name": "عمر حسن إبراهيم", "Email": "omar@example.com", "Role": "student", "AssignedSupporterID": "SUP-02"},
        {"ID": "2024004", "Name": "مريم يوسف كمال", "Email": "mariam@example.com", "Role": "student", "AssignedSupporterID": "SUP-02"},
        {"ID": "SUP-01", "Name": "المساعد طارق سعيد", "Email": "tarek@example.com", "Role": "supporter", "AssignedSupporterID": ""},
        {"ID": "SUP-02", "Name": "المساعدة ياسمين عادل", "Email": "yasmine@example.com", "Role": "supporter", "AssignedSupporterID": ""},
        {"ID": "INST-01", "Name": "المهندس يوسف (Instructor)", "Email": "yousef@example.com", "Role": "instructor", "AssignedSupporterID": ""},
        {"ID": "ADMIN-01", "Name": "مدير النظام (Admin)", "Email": "admin@example.com", "Role": "admin", "AssignedSupporterID": ""},
    ]

    df = pd.DataFrame(data)
    file_path = "lms_database_sample.xlsx"
    df.to_excel(file_path, index=False)
    print(f"[OK] Created sample Excel database file at: {file_path}")

if __name__ == "__main__":
    create_sample_excel()
