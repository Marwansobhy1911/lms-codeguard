import enum
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.orm import declarative_base, relationship

EGYPT_TZ = ZoneInfo("Africa/Cairo")

def get_egypt_now():
    return datetime.now(EGYPT_TZ).replace(tzinfo=None)

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    STUDENT = "student"
    SUPPORTER = "supporter"
    INSTRUCTOR = "instructor"
    HR = "hr"
    MEDIA = "media"
    ADMIN = "admin"

class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    EXCUSED = "excused"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # User ID (e.g. 2024001 or STU-101)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True) # Personal Email
    official_email = Column(String, nullable=True) # Official FCIS Email
    phone = Column(String, nullable=True) # Student Mobile Number
    seat_number = Column(String, nullable=True, index=True) # Student FCIS Seat Number / الرقم الجامعي
    academic_level = Column(String, nullable=True) # Level during last academic year (25-26)
    program = Column(String, nullable=True) # Program (General, CS, IT, etc.)
    bio = Column(Text, nullable=True)
    role = Column(String, default="student", nullable=False, index=True) # Multi-role comma-separated string e.g. "student,hr"
    bonus_points = Column(Float, default=0.0)
    password_hash = Column(String, nullable=False)
    must_change_password = Column(Boolean, default=True, nullable=False)
    assigned_supporter_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    assigned_hr_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)

    created_at = Column(DateTime, default=get_egypt_now)

    # Relationships
    assigned_supporter = relationship("User", remote_side=[id], foreign_keys=[assigned_supporter_id], backref="assigned_students")
    assigned_hr = relationship("User", remote_side=[id], foreign_keys=[assigned_hr_id], backref="assigned_students_hr")
    submissions = relationship("Submission", back_populates="student", foreign_keys="Submission.student_id", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="recipient", foreign_keys="Certificate.user_id", cascade="all, delete-orphan")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    uploaded_by_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=get_egypt_now)

    recipient = relationship("User", foreign_keys=[user_id], back_populates="certificates")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])

class SessionSchedule(Base):
    __tablename__ = "session_schedules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    instructor_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date_time = Column(DateTime, nullable=False)
    location_or_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_egypt_now)
    is_hr_attendance_open = Column(Boolean, default=False)

    instructor = relationship("User")
    attendances = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("session_schedules.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.ABSENT, nullable=False)
    notes = Column(String, nullable=True)
    marked_at = Column(DateTime, default=get_egypt_now)

    session = relationship("SessionSchedule", back_populates="attendances")
    student = relationship("User", back_populates="attendances")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    instructor_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    deadline = Column(DateTime, nullable=False)
    max_score = Column(Float, default=100.0)
    allowed_languages = Column(String, default="python,c,cpp,javascript")
    reference_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_egypt_now)

    instructor = relationship("User")
    submissions = relationship("Submission", back_populates="task", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    code_content = Column(Text, nullable=False)
    file_name = Column(String, default="solution.py")
    language = Column(String, default="python")
    submitted_at = Column(DateTime, default=get_egypt_now)
    
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    graded_by_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    graded_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="submissions")
    student = relationship("User", foreign_keys=[student_id], back_populates="submissions")
    graded_by = relationship("User", foreign_keys=[graded_by_id])

class PlagiarismReport(Base):
    __tablename__ = "plagiarism_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    submission_a_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    submission_b_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, index=True)
    student_a_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    student_b_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_egypt_now)

    task = relationship("Task")
    submission_a = relationship("Submission", foreign_keys=[submission_a_id])
    submission_b = relationship("Submission", foreign_keys=[submission_b_id])
    student_a = relationship("User", foreign_keys=[student_a_id])
    student_b = relationship("User", foreign_keys=[student_b_id])

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)


class ProjectGrade(Base):
    __tablename__ = "project_grades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_name = Column(String, nullable=False, index=True) # e.g. "team 1"
    student_id = Column(String, nullable=False, index=True)
    individual_score = Column(Float, default=0.0) # Max 30
    full_project_score = Column(Float, default=0.0) # Max 80
    project_bonus = Column(Float, default=0.0) # Max 25
    attendance = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    graded_by_id = Column(String, nullable=True, index=True)
    updated_at = Column(DateTime, default=get_egypt_now, onupdate=get_egypt_now)



