import os
import uvicorn
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from src.lms.api import app
from src.lms.database import init_db, SessionLocal
from src.lms.models import User, RoleEnum, Task, SessionSchedule
from src.lms.auth import hash_password

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Mount Static Web UI
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

def seed_initial_database():
    """Seeds sample users, tasks, and sessions into SQLite DB if ADMIN-01 is not present."""
    init_db()
    db = SessionLocal()
    try:
        # Check if database already contains users
        any_user = db.query(User).first()
        if not any_user:
            print("Seeding initial sample LMS database...")
            
            # Users
            admin = User(
                id="ADMIN-01",
                name="مدير النظام",
                email="admin@codeguard.edu",
                role=RoleEnum.ADMIN,
                password_hash=hash_password("ADMIN-01"),
                must_change_password=True
            )
            instructor = User(
                id="INST-01",
                name="دكتور المهندس يوسف",
                email="instructor@codeguard.edu",
                role=RoleEnum.INSTRUCTOR,
                password_hash=hash_password("INST-01"),
                must_change_password=True
            )
            sup1 = User(
                id="SUP-01",
                name="المساعد طارق سعيد",
                email="tarek@codeguard.edu",
                role=RoleEnum.SUPPORTER,
                password_hash=hash_password("SUP-01"),
                must_change_password=True
            )
            sup2 = User(
                id="SUP-02",
                name="المساعدة ياسمين عادل",
                email="yasmine@codeguard.edu",
                role=RoleEnum.SUPPORTER,
                password_hash=hash_password("SUP-02"),
                must_change_password=True
            )
            hr1 = User(
                id="HR-01",
                name="مريم",
                email="hr@codeguard.edu",
                phone="01012345678",
                role=RoleEnum.HR,
                password_hash=hash_password("HR-01"),
                must_change_password=True
            )
            media1 = User(
                id="MEDIA-01",
                name="أحمد عادل",
                email="media@codeguard.edu",
                phone="01187654321",
                role=RoleEnum.MEDIA,
                password_hash=hash_password("MEDIA-01"),
                must_change_password=True
            )
            stu1 = User(
                id="2024001",
                name="أحمد محمود علي",
                email="ahmed@student.edu",
                phone="01200000001",
                role=RoleEnum.STUDENT,
                password_hash=hash_password("2024001"),
                must_change_password=True,
                assigned_supporter_id="SUP-01",
                assigned_hr_id="HR-01"
            )
            stu2 = User(
                id="2024002",
                name="سارة محمد خليل",
                email="sara@student.edu",
                phone="01200000002",
                role=RoleEnum.STUDENT,
                password_hash=hash_password("2024002"),
                must_change_password=True,
                assigned_supporter_id="SUP-01",
                assigned_hr_id="HR-01"
            )
            stu3 = User(
                id="2024003",
                name="عمر حسن إبراهيم",
                email="omar@student.edu",
                phone="01200000003",
                role=RoleEnum.STUDENT,
                password_hash=hash_password("2024003"),
                must_change_password=True,
                assigned_supporter_id="SUP-02",
                assigned_hr_id="HR-01"
            )

            # Insert users if they don't exist
            for u in [admin, instructor, sup1, sup2, hr1, media1, stu1, stu2, stu3]:
                if not db.query(User).filter(User.id == u.id).first():
                    db.add(u)
            db.commit()

            # Seed sample team
            from src.lms.models import Team
            if db.query(Team).count() == 0:
                sample_team = Team(name="فريق الابتكار (Team Alpha)", hr_id="HR-01")
                db.add(sample_team)
                db.commit()
                # Assign students 1 and 2 to sample team
                s1 = db.query(User).filter(User.id == "2024001").first()
                s2 = db.query(User).filter(User.id == "2024002").first()
                if s1: s1.team_id = sample_team.id
                if s2: s2.team_id = sample_team.id
                db.commit()

            # Tasks
            if db.query(Task).count() == 0:
                now = datetime.now()
                task1 = Task(
                    title="تاسك 1: تطبيق خوارزمية الترتيب الفقاعي (Bubble Sort)",
                    description="قم بكتابة دالة تفاعلية بلغة Python تقوم بترتيب مصفوفة من الأرقام الصحيحة تصاعدياً وترجع المصفوفة المرتّبة.",
                    instructor_id="INST-01",
                    deadline=now + timedelta(days=7),
                    max_score=100.0
                )
                task2 = Task(
                    title="تاسك 2: حساب رصيد الحساب البنكي (Bank Account)",
                    description="اكتب فئة (Class) تمثل حساباً بنكياً يحتوي على العمليات الأساسية: الإيداع، السحب، واستعلام الرصيد.",
                    instructor_id="INST-01",
                    deadline=now + timedelta(days=14),
                    max_score=100.0
                )
                db.add_all([task1, task2])
                db.commit()

            # Sessions
            if db.query(SessionSchedule).count() == 0:
                now = datetime.now()
                sess1 = SessionSchedule(
                    title="السيشن الأولى: التراكيب الهيكلية والخوارزميات",
                    description="مراجعة شاملة لأساسيات الخوارزميات وتأهيل المجموعات.",
                    instructor_id="INST-01",
                    date_time=now + timedelta(days=2),
                    location_or_link="قاعة 104 - مبنى الحواسيب"
                )
                db.add(sess1)
                db.commit()

            print("[OK] LMS Initial Database Seeded Successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_database()
    print("\n" + "="*60)
    print("Starting CodeGuard LMS Server...")
    print("Open Browser at: http://127.0.0.1:8000")
    print("="*60 + "\n")
    uvicorn.run("src.lms.main:app", host="127.0.0.1", port=8000, reload=True)
