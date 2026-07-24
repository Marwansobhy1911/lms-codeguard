import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.lms.api import app
from src.lms.database import get_db
from src.lms.models import Base, User, RoleEnum, Task, Submission, PlagiarismReport
from src.lms.auth import hash_password

# Use separate test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_lms.db"
test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestLMSIntegration(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(bind=test_engine)
        Base.metadata.create_all(bind=test_engine)
        self.client = TestClient(app)
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_login_and_force_password_change(self):
        user = User(
            id="STU-TEST",
            name="Test Student",
            email="test@student.com",
            role=RoleEnum.STUDENT,
            password_hash=hash_password("STU-TEST"),
            must_change_password=True
        )
        self.db.add(user)
        self.db.commit()

        login_res = self.client.post("/api/auth/login", json={
            "user_id": "STU-TEST",
            "password": "STU-TEST"
        })
        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertTrue(data["must_change_password"])

        token = data["token"]

        cp_res = self.client.post("/api/auth/change-password", 
            headers={"X-Session-Token": token},
            json={
                "current_password": "STU-TEST",
                "new_password": "newsecurepass123"
            }
        )
        self.assertEqual(cp_res.status_code, 200)

        login_res_2 = self.client.post("/api/auth/login", json={
            "user_id": "STU-TEST",
            "password": "newsecurepass123"
        })
        self.assertEqual(login_res_2.status_code, 200)
        self.assertFalse(login_res_2.json()["must_change_password"])

    def test_02_task_submission_and_anti_cheating(self):
        inst = User(id="INST-TEST", name="Instructor Test", role=RoleEnum.INSTRUCTOR, password_hash=hash_password("INST-TEST"))
        stu_a = User(id="STU-A", name="Student A", role=RoleEnum.STUDENT, password_hash=hash_password("STU-A"))
        stu_b = User(id="STU-B", name="Student B", role=RoleEnum.STUDENT, password_hash=hash_password("STU-B"))
        self.db.add_all([inst, stu_a, stu_b])
        self.db.commit()

        task = Task(
            title="Bubble Sort Task",
            description="Implement bubble sort",
            instructor_id="INST-TEST",
            deadline=datetime.now() + timedelta(days=5),
            max_score=100
        )
        self.db.add(task)
        self.db.commit()

        token_a = self.client.post("/api/auth/login", json={"user_id": "STU-A", "password": "STU-A"}).json()["token"]
        token_b = self.client.post("/api/auth/login", json={"user_id": "STU-B", "password": "STU-B"}).json()["token"]

        code_a = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
"""
        code_b = """
def bubble_sort(array):
    length = len(array)
    for i in range(length):
        for j in range(0, length-i-1):
            if array[j] > array[j+1]:
                array[j], array[j+1] = array[j+1], array[j]
    return array
"""

        res_a = self.client.post("/api/student/submit-task", headers={"X-Session-Token": token_a}, json={
            "task_id": task.id,
            "code_content": code_a,
            "file_name": "solution_a.py"
        })
        self.assertEqual(res_a.status_code, 200)

        res_b = self.client.post("/api/student/submit-task", headers={"X-Session-Token": token_b}, json={
            "task_id": task.id,
            "code_content": code_b,
            "file_name": "solution_b.py"
        })
        self.assertEqual(res_b.status_code, 200)

        reports = self.db.query(PlagiarismReport).filter(PlagiarismReport.task_id == task.id).all()
        self.assertGreater(len(reports), 0)
        self.assertGreater(reports[0].similarity_score, 50.0)

    def test_03_deadline_enforcement(self):
        inst = User(id="INST-EXP", name="Instructor Exp", role=RoleEnum.INSTRUCTOR, password_hash=hash_password("INST-EXP"))
        stu = User(id="STU-EXP", name="Student Exp", role=RoleEnum.STUDENT, password_hash=hash_password("STU-EXP"))
        self.db.add_all([inst, stu])
        self.db.commit()

        expired_task = Task(
            title="Expired Task",
            description="Expired",
            instructor_id="INST-EXP",
            deadline=datetime.now() - timedelta(hours=1),
            max_score=100
        )
        self.db.add(expired_task)
        self.db.commit()

        token = self.client.post("/api/auth/login", json={"user_id": "STU-EXP", "password": "STU-EXP"}).json()["token"]

        res = self.client.post("/api/student/submit-task", headers={"X-Session-Token": token}, json={
            "task_id": expired_task.id,
            "code_content": "print('hello')",
            "file_name": "solution.py"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Deadline Exceeded", res.json()["detail"])

if __name__ == "__main__":
    unittest.main()
