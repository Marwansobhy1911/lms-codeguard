import io
import json
import os
import enum
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
import pandas as pd

from src.lms.database import init_db, get_db, DB_PATH
from src.lms.models import (
    User, RoleEnum, SessionSchedule, Attendance, AttendanceStatusEnum,
    Task, Submission, PlagiarismReport, Certificate, SystemSetting,
)
from src.lms.auth import (
    hash_password, verify_password, create_session_token,
    get_session_user, destroy_session
)
from src.lms.anti_cheating import check_task_plagiarism
import re

from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(title="CodeGuard LMS API", version="1.0.0")

# Enable response compression for mobile bandwidth optimization
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Enable CORS for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Root route → serve index.html
@app.get("/", include_in_schema=False)
def serve_root():
    index_path = os.path.join(_STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return Response(content="LMS API is running. index.html not found.", status_code=200)

# HTTP Security Headers Middleware
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    icon_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Icon.ico")
    if os.path.exists(icon_path):
        return FileResponse(icon_path, media_type="image/x-icon")
    return Response(status_code=204)

@app.get("/logo1.jpeg", include_in_schema=False)
@app.get("/logo.jpeg", include_in_schema=False)
def get_logo1():
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logo 1.jpeg")
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/jpeg")
    return Response(status_code=404)

@app.get("/logo2.jpeg", include_in_schema=False)
def get_logo2():
    logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logo 2.jpeg")
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/jpeg")
    return Response(status_code=404)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Rate-Limiting Store (Brute Force Protection)
_LOGIN_ATTEMPTS = {}

def check_login_rate_limit(key: str, limit: int = 5, window_sec: int = 60):
    now = datetime.now()
    attempts = _LOGIN_ATTEMPTS.get(key, [])
    attempts = [t for t in attempts if (now - t).total_seconds() < window_sec]
    if len(attempts) >= limit:
        raise HTTPException(
            status_code=429,
            detail="تم تجاوز عدد محاولات الدخول المسموحة. يرجى الانتظار 60 ثانية لحماية حسابك من التخمين."
        )
    attempts.append(now)
    _LOGIN_ATTEMPTS[key] = attempts

def sanitize_text(text: Optional[str]) -> Optional[str]:
    if not text:
        return text
    cleaned = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r'<.*?javascript:.*?>', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()

from fastapi import Query

# --- Helper Dependencies ---
def get_current_user(x_session_token: Optional[str] = Header(None), token: Optional[str] = Query(None), db: Session = Depends(get_db)) -> User:
    actual_token = x_session_token or token
    if not actual_token:
        raise HTTPException(status_code=401, detail="غير مصرح: يلزم تسجيل الدخول")
    session = get_session_user(actual_token)
    if not session:
        raise HTTPException(status_code=401, detail="الجلسة منتهية أو غير صالحة")
    user = db.query(User).filter(User.id == session["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="المستخدم غير موجود")
    return user

def get_user_roles(user: User) -> List[str]:
    if not user or not user.role:
        return ["student"]
    val = user.role.value if isinstance(user.role, enum.Enum) else str(user.role)
    parts = [p.strip().lower() for p in val.split(",") if p.strip()]
    return parts if parts else ["student"]

def require_role(roles: List[RoleEnum]):
    def role_checker(user: User = Depends(get_current_user)):
        user_roles = get_user_roles(user)
        if "admin" in user_roles:
            return user
        req_role_strs = [r.value for r in roles]
        if not any(r in user_roles for r in req_role_strs):
            raise HTTPException(status_code=403, detail="غير مصرح لك بالوصول إلى هذه الخاصية")
        return user
    return role_checker

# --- Pydantic Schemas ---
class LoginRequest(BaseModel):
    user_id: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangeRoleRequest(BaseModel):
    user_id: str
    new_role: Optional[str] = None
    roles: Optional[List[str]] = None

class AssignSupporterRequest(BaseModel):
    student_id: str
    supporter_id: Optional[str]

class AssignHRRequest(BaseModel):
    student_id: str
    hr_id: Optional[str] = None

class TaskCreateRequest(BaseModel):
    title: str
    description: str
    deadline: str # ISO format string (e.g. 2026-07-30T23:59:00)
    reference_link: Optional[str] = None
    max_score: float = 100.0

class TaskDeadlineUpdateRequest(BaseModel):
    new_deadline: str
    allowed_languages: str = "python,c,cpp,javascript"

class TaskSubmitRequest(BaseModel):
    task_id: int
    submission_link: str

class GradeSubmissionRequest(BaseModel):
    submission_id: int
    score: float
    feedback: str

class SessionCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    date_time: str # ISO format string
    location_or_link: Optional[str] = None

class MaterialDriveRequest(BaseModel):
    url: str

class PointAddRequest(BaseModel):
    student_id: str
    points_to_add: float

class AttendanceMarkRequest(BaseModel):
    session_id: int
    student_id: str
    status: AttendanceStatusEnum
    notes: Optional[str] = None

class BulkAttendanceItem(BaseModel):
    student_id: str
    status: AttendanceStatusEnum
    notes: Optional[str] = None

class BulkAttendanceRequest(BaseModel):
    session_id: int
    records: List[BulkAttendanceItem]

class ManualIDAttendanceRequest(BaseModel):
    session_id: int
    student_id: str

# --- SYSTEM SETTING HELPERS ---
def get_system_setting(key: str, default_val: str, db: Session) -> str:
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if setting:
        return setting.value
    return default_val

def set_system_setting(key: str, value: str, db: Session):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = SystemSetting(key=key, value=value)
        db.add(setting)
    db.commit()

@app.get("/api/settings/material-drive")
def get_material_drive(db: Session = Depends(get_db)):
    url = get_system_setting("material_drive_url", "https://drive.google.com/", db)
    return {"url": url}

@app.post("/api/settings/material-drive")
def set_material_drive(req: MaterialDriveRequest, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    set_system_setting("material_drive_url", req.url, db)
    return {"success": True, "message": "تم تحديث رابط درايف الماتيريال بنجاح"}

# --- AUTH ENDPOINTS ---
from sqlalchemy import text

@app.get("/api/upgrade-db-schema")
def upgrade_db_schema(db: Session = Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE tasks ADD COLUMN reference_link VARCHAR"))
        db.commit()
    except Exception as e:
        db.rollback()
        
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN bonus_points FLOAT DEFAULT 0.0"))
        db.commit()
    except Exception as e:
        db.rollback()
        
    return {"message": "Database schema upgraded successfully. You can now login."}

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    uid = req.user_id.strip()
    pwd = req.password.strip()

    # Rate limiting protection against brute-force password guessing
    check_login_rate_limit(f"login_{uid}")

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        # Case-insensitive fallback lookup
        user = db.query(User).filter(User.id.ilike(uid)).first()

    if not user:
        raise HTTPException(status_code=401, detail="الرقم التعريفي (ID) غير مسجل في النظام")

    if not verify_password(pwd, user.password_hash):
        raise HTTPException(status_code=401, detail="كلمة المرور غير صحيحة")

    user_roles = get_user_roles(user)
    token = create_session_token(user.id, user_roles[0])

    return {
        "success": True,
        "token": token,
        "must_change_password": user.must_change_password,
        "user": get_me(user)
    }

@app.post("/api/auth/change-password")
def change_password(req: ChangePasswordRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="كلمة المرور الحالية غير صحيحة")

    if verify_password(req.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية")

    if len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل")

    user.password_hash = hash_password(req.new_password)
    user.must_change_password = False
    db.commit()

    return {"success": True, "message": "تم تغيير كلمة المرور بنجاح"}

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    official_email: Optional[str] = None
    phone: Optional[str] = None
    seat_number: Optional[str] = None
    academic_level: Optional[str] = None
    program: Optional[str] = None
    bio: Optional[str] = None

@app.post("/api/user/profile")
def update_user_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.name and req.name.strip():
        user.name = req.name.strip()
    if req.email is not None:
        user.email = req.email.strip()
    if req.official_email is not None:
        user.official_email = req.official_email.strip()
    if req.phone is not None:
        user.phone = req.phone.strip()
    if req.seat_number is not None:
        user.seat_number = req.seat_number.strip()
    if req.academic_level is not None:
        user.academic_level = req.academic_level.strip()
    if req.program is not None:
        user.program = req.program.strip()
    if req.bio is not None:
        user.bio = req.bio.strip()

    db.commit()
    return {"success": True, "message": "تم تحديث البيانات الشخصية بنجاح"}

# Registration Request
class RegisterRequest(BaseModel):
    name: str
    official_email: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    seat_number: Optional[str] = None
    academic_level: Optional[str] = None
    program: Optional[str] = None
    password: str

@app.post("/api/auth/register")
def register_student(req: RegisterRequest, db: Session = Depends(get_db)):
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="الاسم الكامل مطلوب للتسجيل")

    pwd = req.password.strip()
    if len(pwd) < 4:
        raise HTTPException(status_code=400, detail="كلمة المرور يجب أن تكون 4 خانات على الأقل")

    # Check Seat Number uniqueness constraint
    seat_no = req.seat_number.strip() if req.seat_number and req.seat_number.strip() else None
    if seat_no:
        existing_seat = db.query(User).filter((User.seat_number == seat_no) | (User.id == seat_no)).first()
        if existing_seat:
            raise HTTPException(status_code=400, detail=f"عذراً! رقم الجلوس / الرقم الجامعي ({seat_no}) مسجل بالفعل لحساب طالب آخر بالنظام ({existing_seat.name}). يرجى التأكد من رقم جلوسك.")

    # Find next Student ID: last created numeric user ID + 1
    recent_users = db.query(User).order_by(User.created_at.desc()).all()
    new_id = None
    next_id_num = None
    for u in recent_users:
        if u.id and u.id.isdigit():
            next_id_num = int(u.id) + 1
            new_id = str(next_id_num)
            break

    if not new_id:
        next_id_num = 20261000
        new_id = str(next_id_num)

    while db.query(User).filter(User.id == new_id).first():
        next_id_num += 1
        new_id = str(next_id_num)

    official_email = req.official_email.strip() if req.official_email and req.official_email.strip() else f"{new_id}@cis.asu.edu.eg"
    personal_email = req.email.strip() if req.email and req.email.strip() else official_email

    new_user = User(
        id=new_id,
        name=name,
        email=personal_email,
        official_email=official_email,
        phone=req.phone.strip() if req.phone else "",
        seat_number=seat_no if seat_no else new_id,
        academic_level=req.academic_level.strip() if req.academic_level else "Level 1",
        program=req.program.strip() if req.program else "General",
        role=RoleEnum.STUDENT,
        password_hash=hash_password(pwd),
        must_change_password=False
    )
    db.add(new_user)
    db.commit()

    user_roles = get_user_roles(new_user)
    token = create_session_token(new_user.id, user_roles[0])

    return {
        "success": True,
        "message": f"تم إنشاء حساب الطالب بنجاح! الرقم التعريفي الخاص بك هو: {new_id}",
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "official_email": new_user.official_email,
            "phone": new_user.phone,
            "seat_number": new_user.seat_number,
            "academic_level": new_user.academic_level,
            "program": new_user.program,
            "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
            "must_change_password": new_user.must_change_password
        }
    }

class AdminUpdateUserProfileRequest(BaseModel):
    target_user_id: str
    new_user_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    official_email: Optional[str] = None
    phone: Optional[str] = None
    seat_number: Optional[str] = None
    academic_level: Optional[str] = None
    program: Optional[str] = None
    role: Optional[str] = None
    roles: Optional[List[str]] = None
    bio: Optional[str] = None

@app.post("/api/admin/users/update-profile")
def admin_update_user_profile(req: AdminUpdateUserProfileRequest, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == req.target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    # Update ID if changed
    if req.new_user_id and req.new_user_id.strip() and req.new_user_id.strip() != target.id:
        new_id = req.new_user_id.strip()
        if is_master_admin(target):
            raise HTTPException(status_code=400, detail="لا يمكن تغيير الرقم التعريفي لحساب الماستر أدمن المحمي")
        
        existing = db.query(User).filter(User.id == new_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"الـ ID الجديد ({new_id}) مستخدم بالفعل لحساب آخر")

        old_id = target.id
        db.query(User).filter(User.assigned_supporter_id == old_id).update({"assigned_supporter_id": new_id})
        db.query(User).filter(User.assigned_hr_id == old_id).update({"assigned_hr_id": new_id})
        target.id = new_id

    if req.name and req.name.strip():
        target.name = req.name.strip()
    if req.email is not None:
        target.email = req.email.strip()
    if req.official_email is not None:
        target.official_email = req.official_email.strip()
    if req.phone is not None:
        target.phone = req.phone.strip()
    if req.seat_number is not None:
        target.seat_number = req.seat_number.strip()
    if req.academic_level is not None:
        target.academic_level = req.academic_level.strip()
    if req.program is not None:
        target.program = req.program.strip()
    if req.bio is not None:
        target.bio = req.bio.strip()

    if req.roles is not None:
        valid_roles = [r.strip().lower() for r in req.roles if r.strip().lower() in [e.value for e in RoleEnum]]
        if is_master_admin(target) and "admin" not in valid_roles:
            valid_roles.append("admin")
        if valid_roles:
            target.role = ",".join(valid_roles)
    elif req.role and req.role.strip():
        r_val = req.role.strip().lower()
        if is_master_admin(target) and "admin" not in r_val:
            r_val = "admin"
        target.role = r_val

    db.commit()
    return {"success": True, "message": f"تم تحديث بيانات ورولات المستخدم {target.name} بنجاح"}

@app.get("/api/admin/database-view")
def get_clean_database_view(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    users = db.query(User).all()
    records = []
    for u in users:
        records.append({
            "id": u.id,
            "name": u.name,
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role or "student"),
            "official_email": u.official_email or "",
            "email": u.email or "",
            "phone": u.phone or "",
            "seat_number": u.seat_number or "",
            "academic_level": u.academic_level or "",
            "program": u.program or "",
            "assigned_supporter": u.assigned_supporter.name if u.assigned_supporter else "غير معين",
            "assigned_hr": u.assigned_hr.name if u.assigned_hr else "غير معين",
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else ""
        })
    return {"total": len(records), "records": records}

@app.get("/api/admin/database-export-excel")
def export_clean_database_excel(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    users = db.query(User).all()
    data = []
    for u in users:
        data.append({
            "ID": u.id,
            "Full Name": u.name,
            "Role": u.role.value if hasattr(u.role, 'value') else str(u.role or "student"),
            "Official FCIS Email": u.official_email or "",
            "Personal Email": u.email or "",
            "Student Mobile": u.phone or "",
            "FCIS Seat Number": u.seat_number or "",
            "Academic Level": u.academic_level or "",
            "Program": u.program or "",
            "Assigned Supporter (TA)": u.assigned_supporter.name if u.assigned_supporter else "",
            "Assigned HR": u.assigned_hr.name if u.assigned_hr else "",
            "Created Date": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else ""
        })
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="LMS_Database")
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=LMS_Clean_Database_Export.xlsx"}
    )

@app.get("/api/auth/me")
def get_me(user: User = Depends(get_current_user)):
    is_incomplete = not user.email or "@lms.edu" in user.email or not user.phone
    hr_user = user.assigned_hr

    roles = get_user_roles(user)
    primary_role = roles[0] if roles else "student"

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "official_email": user.official_email or "",
        "phone": user.phone or "",
        "seat_number": user.seat_number or "",
        "academic_level": user.academic_level or "",
        "program": user.program or "",
        "bio": user.bio or "",
        "role": primary_role,
        "roles": roles,
        "must_change_password": user.must_change_password,
        "assigned_supporter_id": user.assigned_supporter_id,
        "assigned_supporter_name": user.assigned_supporter.name if user.assigned_supporter else "غير معين",
        "assigned_hr_id": hr_user.id if hr_user else None,
        "assigned_hr_name": hr_user.name if hr_user else "غير معين",
        "assigned_hr_email": (hr_user.official_email or hr_user.email or "") if hr_user else "",
        "assigned_hr_phone": hr_user.phone or "" if hr_user else "",
        "assigned_hr_bio": hr_user.bio or "" if hr_user else "",
        "is_profile_incomplete": is_incomplete
    }

@app.post("/api/auth/logout")
def logout(x_session_token: Optional[str] = Header(None)):
    if x_session_token:
        destroy_session(x_session_token)
    return {"success": True}

# --- ADMIN ENDPOINTS ---
@app.get("/api/admin/students")
def get_all_students_for_admin(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    users = db.query(User).all()
    res = []
    for u in users:
        if "student" in get_user_roles(u):
            res.append({
                "id": u.id,
                "name": u.name,
                "email": u.official_email or u.email or "",
                "seat_number": u.seat_number or ""
            })
    return res

@app.get("/api/admin/users")
def get_all_users(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    users = db.query(User).all()
    res = []
    for u in users:
        u_roles = get_user_roles(u)
        is_student = "student" in u_roles
        supporter_name = u.assigned_supporter.name if (is_student and u.assigned_supporter) else "N/A"
        hr_name = u.assigned_hr.name if (is_student and u.assigned_hr) else "N/A"

        res.append({
            "id": u.id,
            "name": u.name,
            "email": u.email or "",
            "official_email": u.official_email or "",
            "phone": u.phone or "",
            "seat_number": u.seat_number or "",
            "academic_level": u.academic_level or "",
            "program": u.program or "",
            "bio": u.bio or "",
            "bonus_points": round(u.bonus_points or 0.0, 1),
            "role": ", ".join(u_roles),
            "roles": u_roles,
            "must_change_password": u.must_change_password,
            "assigned_supporter_id": u.assigned_supporter_id,
            "assigned_supporter_name": supporter_name,
            "assigned_hr_id": u.assigned_hr_id,
            "assigned_hr_name": hr_name,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else ""
        })
    return res

def is_master_admin(u: User) -> bool:
    if not u:
        return False
    return u.id == "2023170570"

@app.get("/api/admin/system-stats")
def get_system_stats(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    all_users = db.query(User).all()
    
    users_by_role = {
        "admin": [],
        "instructor": [],
        "supporter": [],
        "hr": [],
        "media": [],
        "student": []
    }
    
    for u in all_users:
        u_roles = get_user_roles(u)
        user_info = {
            "id": u.id,
            "name": u.name,
            "email": u.email or "",
            "official_email": u.official_email or "",
            "phone": u.phone or "",
            "seat_number": u.seat_number or "",
            "academic_level": u.academic_level or "",
            "program": u.program or ""
        }
        for r_val in u_roles:
            if r_val in users_by_role:
                users_by_role[r_val].append(user_info)


    certs = db.query(Certificate).all()
    certs_list = [{
        "id": c.id,
        "user_id": c.user_id,
        "recipient_name": c.recipient.name if c.recipient else "عام للجميع",
        "title": c.title,
        "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else ""
    } for c in certs]

    return {
        "counts": {
            "students": len(users_by_role["student"]),
            "supporters": len(users_by_role["supporter"]),
            "instructors": len(users_by_role["instructor"]),
            "hr": len(users_by_role["hr"]),
            "media": len(users_by_role["media"]),
            "admins": len(users_by_role["admin"]),
            "certificates": len(certs_list)
        },
        "details": users_by_role,
        "certificates": certs_list
    }

@app.post("/api/admin/change-role")
def change_role(req: ChangeRoleRequest, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if is_master_admin(target_user):
        raise HTTPException(status_code=400, detail="عفواً! حساب الماستر (مروان صبحي) محمي بالكامل ولا يمكن تعديل صفتها كـ Admin.")

    target_user.role = req.new_role
    db.commit()
    return {"success": True, "message": f"تم تغيير دور {target_user.name} إلى {req.new_role.value}"}

@app.post("/api/admin/reset-password")
def reset_password(user_id: str = Form(...), user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if is_master_admin(target_user) and user.id != target_user.id:
        raise HTTPException(status_code=400, detail="عفواً! حساب الماستر (مروان صبحي) محمي من إعادة تعيين كلمة المرور بواسطة أدمن آخر.")

    target_user.password_hash = hash_password(target_user.id)
    target_user.must_change_password = True
    db.commit()
    return {"success": True, "message": f"تم إعادة تعيين كلمة المرور إلى الـ ID ({target_user.id}) وجعل التغيير إجبارياً."}

@app.delete("/api/admin/users/{target_id}")
def delete_user(target_id: str, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    if target_id == user.id:
        raise HTTPException(status_code=400, detail="لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به")

    target = db.query(User).filter(User.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if is_master_admin(target):
        raise HTTPException(status_code=400, detail="عفواً! حساب الماستر (مروان صبحي) محمي من الحذف نهائياً.")

    db.delete(target)
    db.commit()
    return {"success": True, "message": f"تم حذف المستخدم {target_id} بنجاح"}

@app.delete("/api/admin/users/all/clear")
def delete_all_users(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    # Clear all test transactional data
    db.query(PlagiarismReport).delete()
    db.query(Submission).delete()
    db.query(Attendance).delete()
    db.query(Certificate).delete()
    
    # Nullify foreign keys before deleting users & teams
    db.query(User).update({"assigned_supporter_id": None, "assigned_hr_id": None})
    db.query(SessionSchedule).delete()
    db.query(Task).delete()

    # Delete all users except current performing admin and Marwan Subhi master account
    count = db.query(User).filter(
        User.id != user.id,
        ~User.name.like("%مروان صبحي%"),
        User.id != "2023170570"
    ).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "message": f"تم تفريغ النظام ومسح {count} حساب تجريبي مع الحفاظ التام على حساب الماستر (مروان صبحي)."}


@app.post("/api/admin/assign-supporter")
def assign_supporter(req: AssignSupporterRequest, user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.INSTRUCTOR])), db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    if req.supporter_id:
        supporter = db.query(User).filter(User.id == req.supporter_id).first()
        if not supporter or supporter.role not in [RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN]:
            raise HTTPException(status_code=400, detail="المساعد غير موجود أو غير مؤهل لهذا الدور")
        student.assigned_supporter_id = req.supporter_id
    else:
        student.assigned_supporter_id = None

    db.commit()
    return {"success": True, "message": "تم تعيين المساعد للطالب بنجاح"}

# --- STUDENT ENDPOINTS ---
@app.get("/api/student/dashboard")
def get_student_dashboard(user: User = Depends(require_role([RoleEnum.STUDENT, RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    # User attendance
    attendances = db.query(Attendance).filter(Attendance.student_id == user.id).all()
    total_sessions = db.query(SessionSchedule).count()
    present_count = sum(1 for a in attendances if a.status == AttendanceStatusEnum.PRESENT)
    absent_count = sum(1 for a in attendances if a.status == AttendanceStatusEnum.ABSENT)
    excused_count = sum(1 for a in attendances if a.status == AttendanceStatusEnum.EXCUSED)
    attendance_rate = round((present_count / total_sessions * 100), 1) if total_sessions > 0 else 100.0

    # Submissions
    submissions = db.query(Submission).filter(Submission.student_id == user.id).all()

    hr_user = user.assigned_hr

    return {
        "user_info": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "assigned_supporter": {
                "id": user.assigned_supporter.id,
                "name": user.assigned_supporter.name,
                "email": user.assigned_supporter.email,
                "phone": user.assigned_supporter.phone or "غير مسجل",
                "bio": user.assigned_supporter.bio or ""
            } if user.assigned_supporter else None,
            "assigned_hr": {
                "id": hr_user.id,
                "name": hr_user.name,
                "email": hr_user.official_email or hr_user.email or "غير مسجل",
                "phone": hr_user.phone or "غير مسجل",
                "bio": hr_user.bio or "مسؤول غياب وإدارات الفرق"
            } if hr_user else None
        },
        "attendance": {
            "total_sessions": total_sessions,
            "present": present_count,
            "absent": absent_count,
            "excused": excused_count,
            "rate": attendance_rate
        },
        "submissions_count": len(submissions)
    }

@app.get("/api/student/supporter-info")
def get_student_supporter_info(user: User = Depends(get_current_user)):
    if not user.assigned_supporter:
        raise HTTPException(status_code=404, detail="لم يتم إسناد مساعد لك بعد")
    sup = user.assigned_supporter
    return {
        "id": sup.id,
        "name": sup.name,
        "email": sup.email,
        "phone": sup.phone or "غير مسجل",
        "bio": sup.bio or "لا توجد ملاحظات إضافية"
    }

@app.get("/api/student/tasks")
def get_student_tasks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.deadline.desc()).all()
    res = []
    now = datetime.now()

    for t in tasks:
        sub = db.query(Submission).filter(Submission.task_id == t.id, Submission.student_id == user.id).first()
        is_expired = now > t.deadline
        
        if sub:
            sub_data = {
                "id": sub.id,
                "code_content": sub.code_content,
                "file_name": sub.file_name,
                "submitted_at": sub.submitted_at.strftime("%Y-%m-%d %I:%M %p"),
                "score": sub.score,
                "feedback": sub.feedback,
                "graded_by_name": sub.graded_by.name if sub.graded_by else None
            }
        elif is_expired:
            sub_data = {
                "id": None,
                "code_content": "# لم يتم تسليم كود قبل الموعد النهائي",
                "file_name": "N/A",
                "submitted_at": "لم يُسلم (انتهى الموعد)",
                "score": 0,
                "feedback": "تلقائي: تم إغلاق التسليم بسبب انقضاء الموعد النهائي (الدرجة: 0)",
                "graded_by_name": "النظام الآلي (Auto-Zero)"
            }
        else:
            sub_data = None

        res.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "instructor_name": t.instructor.name if t.instructor else "المدرب",
            "deadline": t.deadline.strftime("%Y-%m-%dT%H:%M:%S"),
            "reference_link": t.reference_link,
            "max_score": t.max_score,
            "allowed_languages": t.allowed_languages,
            "is_expired": is_expired,
            "submission": sub_data
        })
    return res

@app.post("/api/student/submit-task")
def submit_task(req: TaskSubmitRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")

    now = datetime.now()
    if now > task.deadline:
        raise HTTPException(status_code=400, detail="عذراً! لقد انتهى الموعد النهائي لتسليم هذه المهمة (Deadline Exceeded).")

    existing_sub = db.query(Submission).filter(Submission.task_id == req.task_id, Submission.student_id == user.id).first()
    if existing_sub:
        existing_sub.code_content = req.submission_link
        existing_sub.file_name = "link"
        existing_sub.language = "url"
        existing_sub.submitted_at = now
    else:
        new_sub = Submission(
            task_id=req.task_id,
            student_id=user.id,
            code_content=req.submission_link,
            file_name="link",
            language="url",
            submitted_at=now
        )
        db.add(new_sub)

    db.commit()

    # Trigger Automated Anti-Cheating Plagiarism Analysis across task submissions
    try:
        check_task_plagiarism(req.task_id, db)
    except Exception as e:
        print(f"Anti-cheating error: {e}")

    return {"success": True, "message": "تم تسليم الحل وفحصه بنجاح!"}

# --- SUPPORTER ENDPOINTS ---
@app.get("/api/supporter/assigned-students")
def get_assigned_students(user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    u_roles = get_user_roles(user)
    if "admin" in u_roles:
        students = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
    else:
        students = db.query(User).filter(User.assigned_supporter_id == user.id).all()

    res = []
    for s in students:
        subs_count = db.query(Submission).filter(Submission.student_id == s.id).count()
        res.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "seat_number": s.seat_number or "",
            "bonus_points": round(s.bonus_points or 0.0, 1),
            "submissions_count": subs_count
        })
    return res

@app.get("/api/supporter/unassigned-students")
def get_unassigned_students(user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    all_users = db.query(User).filter(User.assigned_supporter_id == None).all()
    res = []
    for s in all_users:
        if "student" in get_user_roles(s):
            res.append({
                "id": s.id,
                "name": s.name,
                "email": s.official_email or s.email or ""
            })
    return res


@app.post("/api/supporter/self-assign/{student_id}")
def self_assign_student(student_id: str, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    user_roles = get_user_roles(user)
    if ("supporter" in user_roles or "instructor" in user_roles) and "admin" not in user_roles:
        current_count = db.query(User).filter(User.assigned_supporter_id == user.id).count()
        if current_count >= 20:
            raise HTTPException(status_code=400, detail="عذراً! لقد وصلت للحد الأقصى لعدد الطلاب المسندين إليك (20 طالب كحد أقصى).")

    student = db.query(User).filter(User.id == student_id).first()
    if not student or "student" not in get_user_roles(student):
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    if student.assigned_supporter_id and student.assigned_supporter_id != user.id and "admin" not in user_roles:
        raise HTTPException(status_code=400, detail="هذا الطالب مخصص بالفعل لمساعد آخر")

    student.assigned_supporter_id = user.id
    db.commit()
    return {"success": True, "message": f"تم إسناد الطالب ({student.name}) لقائمتك بنجاح"}

@app.get("/api/supporter/submissions")
def get_supporter_submissions(task_id: Optional[int] = None, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    if user.role == RoleEnum.SUPPORTER:
        assigned_students = db.query(User).filter(User.assigned_supporter_id == user.id, User.role == RoleEnum.STUDENT).all()
    else:
        assigned_students = db.query(User).filter(User.role == RoleEnum.STUDENT).all()

    assigned_student_ids = [s.id for s in assigned_students]
    
    tasks_query = db.query(Task)
    if task_id:
        tasks_query = tasks_query.filter(Task.id == task_id)
    tasks = tasks_query.all()

    now = datetime.now()
    res = []

    # 1. Actual Submissions
    subs_query = db.query(Submission).filter(Submission.student_id.in_(assigned_student_ids))
    if task_id:
        subs_query = subs_query.filter(Submission.task_id == task_id)
    submissions = subs_query.order_by(Submission.submitted_at.desc()).all()

    submitted_pairs = set()
    for sub in submissions:
        submitted_pairs.add((sub.task_id, sub.student_id))
        res.append({
            "id": sub.id,
            "task_id": sub.task_id,
            "task_title": sub.task.title if sub.task else "",
            "max_score": sub.task.max_score if sub.task else 100,
            "student_id": sub.student_id,
            "student_name": sub.student.name if sub.student else sub.student_id,
            "code_content": sub.code_content,
            "file_name": sub.file_name,
            "submitted_at": sub.submitted_at.strftime("%Y-%m-%d %I:%M %p"),
            "score": sub.score,
            "feedback": sub.feedback,
            "graded_by_name": sub.graded_by.name if sub.graded_by else None,
            "is_auto_zero": False,
            "can_grade": True
        })

    # 2. Unsubmitted Expired Tasks (Auto-Zero & Locked from grading)
    for t in tasks:
        if now > t.deadline:
            for s in assigned_students:
                if (t.id, s.id) not in submitted_pairs:
                    res.append({
                        "id": None,
                        "task_id": t.id,
                        "task_title": t.title,
                        "max_score": t.max_score,
                        "student_id": s.id,
                        "student_name": s.name,
                        "code_content": "# لم يتم تسليم كود من الطالب قبل الموعد النهائي",
                        "file_name": "N/A",
                        "submitted_at": "لم يُسلم (انتهى الموعد)",
                        "score": 0,
                        "feedback": "تلقائي: انقضى الموعد النهائي دون تسليم حل (الدرجة: 0)",
                        "graded_by_name": "النظام الآلي (Auto-Zero)",
                        "is_auto_zero": True,
                        "can_grade": False
                    })

    return res

@app.post("/api/supporter/grade")
def grade_submission(req: GradeSubmissionRequest, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    if req.submission_id is None:
        raise HTTPException(status_code=400, detail="عذراً! لا يمكن تصحيح مهمة لم يتم تسليم كود بها وانتهى موعدها، درجتها مثبتة عند 0 تلقائياً.")

    sub = db.query(Submission).filter(Submission.id == req.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="التسليم غير موجود")

    sub.score = req.score
    sub.feedback = req.feedback
    sub.graded_by_id = user.id
    sub.graded_at = datetime.now()
    db.commit()

    return {"success": True, "message": "تم تقييم التسليم ورصد الدرجة بنجاح"}

# --- INSTRUCTOR & SESSIONS ENDPOINTS ---
@app.get("/api/instructor/tasks")
def get_instructor_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    res = []
    for t in tasks:
        submissions_count = db.query(Submission).filter(Submission.task_id == t.id).count()
        res.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "deadline": t.deadline.strftime("%Y-%m-%dT%H:%M:%S"),
            "reference_link": t.reference_link,
            "max_score": t.max_score,
            "allowed_languages": t.allowed_languages,
            "submissions_count": submissions_count,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return res

@app.post("/api/instructor/tasks")
def create_task(req: TaskCreateRequest, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    try:
        deadline_dt = datetime.fromisoformat(req.deadline.replace('Z', '+00:00'))
    except Exception:
        raise HTTPException(status_code=400, detail="صيغة التاريخ والوقت غير صحيحة")

    task = Task(
        title=req.title,
        description=req.description,
        instructor_id=user.id,
        deadline=deadline_dt,
        reference_link=req.reference_link,
        max_score=req.max_score,
        allowed_languages=req.allowed_languages
    )
    db.add(task)
    db.commit()
    return {"success": True, "task_id": task.id, "message": "تم إنشاء المهمة بنجاح"}

@app.get("/api/sessions")
def get_sessions(x_session_token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    current_user = None
    if x_session_token:
        sess_data = get_session_user(x_session_token)
        if sess_data:
            current_user = db.query(User).filter(User.id == sess_data["user_id"]).first()

    sessions = db.query(SessionSchedule).order_by(SessionSchedule.date_time.asc()).all()
    res = []
    for s in sessions:
        att_status = None
        att_notes = None
        if current_user:
            att = db.query(Attendance).filter(
                Attendance.session_id == s.id,
                Attendance.student_id == current_user.id
            ).first()
            if att:
                att_status = att.status.value if hasattr(att.status, 'value') else str(att.status)
                att_notes = att.notes

        res.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "instructor_name": s.instructor.name if s.instructor else "المدرب",
            "date_time": s.date_time.strftime("%Y-%m-%d %H:%M"),
            "location_or_link": s.location_or_link,
            "my_attendance": att_status,
            "my_attendance_notes": att_notes,
            "is_hr_attendance_open": s.is_hr_attendance_open
        })
    return res

@app.post("/api/admin/sessions/{session_id}/toggle-hr")
def toggle_session_hr_attendance(session_id: int, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")
    sess.is_hr_attendance_open = not sess.is_hr_attendance_open
    db.commit()
    status_str = "مفتوح" if sess.is_hr_attendance_open else "مغلق"
    return {"success": True, "message": f"تم تغيير حالة تسجيل الحضور للـ HR إلى {status_str}", "is_hr_attendance_open": sess.is_hr_attendance_open}

@app.get("/api/admin/backup-db")
def download_database_backup(user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail="ملف قاعدة البيانات غير موجود")
    
    filename = f"lms_database_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    return StreamingResponse(
        open(DB_PATH, "rb"),
        media_type="application/x-sqlite3",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.post("/api/instructor/sessions")
def create_session(req: SessionCreateRequest, user: User = Depends(require_role([RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    try:
        dt = datetime.fromisoformat(req.date_time.replace('Z', '+00:00'))
    except Exception:
        raise HTTPException(status_code=400, detail="صيغة التاريخ غير صحيحة")

    sess = SessionSchedule(
        title=req.title,
        description=req.description,
        instructor_id=user.id,
        date_time=dt,
        location_or_link=req.location_or_link
    )
    db.add(sess)
    db.commit()
    return {"success": True, "message": "تم إضافة ميعاد السيشن بنجاح"}

@app.delete("/api/instructor/tasks/{task_id}")
def delete_task(task_id: int, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")

    db.query(Submission).filter(Submission.task_id == task_id).delete()
    db.query(PlagiarismReport).filter(PlagiarismReport.task_id == task_id).delete()
    db.delete(task)
    db.commit()
    return {"success": True, "message": "تم مسح المهمة وكافة التسليمات المرتبطة بها"}

@app.put("/api/instructor/tasks/{task_id}/deadline")
def update_task_deadline(task_id: int, req: TaskDeadlineUpdateRequest, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    task.deadline = datetime.fromisoformat(req.new_deadline)
    db.commit()
    return {"success": True, "message": "تم تحديث موعد الديدلاين بنجاح"}

@app.delete("/api/instructor/sessions/{session_id}")
def delete_session(session_id: int, user: User = Depends(require_role([RoleEnum.INSTRUCTOR, RoleEnum.ADMIN, RoleEnum.HR])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")

    db.query(Attendance).filter(Attendance.session_id == session_id).delete()
    db.delete(sess)
    db.commit()
    return {"success": True, "message": "تم حذف السيشن وسجلات غيابها بنجاح"}

@app.post("/api/instructor/attendance")
def mark_attendance(req: AttendanceMarkRequest, user: User = Depends(require_role([RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    st = db.query(User).filter(User.id == req.student_id).first()
    if st:
        is_admin = "admin" in get_user_roles(user)
        if not is_admin and "student" not in get_user_roles(st):
            raise HTTPException(status_code=400, detail="عفواً، لا يمكن تسجيل حضور لغير الطلاب. الإدمن فقط من يمكنه ذلك.")

    att = db.query(Attendance).filter(Attendance.session_id == req.session_id, Attendance.student_id == req.student_id).first()
    if att:
        att.status = req.status
        att.notes = req.notes
    else:
        att = Attendance(
            session_id=req.session_id,
            student_id=req.student_id,
            status=req.status,
            notes=req.notes
        )
        db.add(att)

    db.commit()
    return {"success": True, "message": "تم رصد الغياب/الحضور بنجاح"}

# --- PLAGIARISM REPORTS ENDPOINT ---
@app.post("/api/plagiarism/run-analysis/{task_id}")
def trigger_plagiarism_analysis(task_id: int, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    reports = check_task_plagiarism(task_id, db)
    return {
        "success": True,
        "message": f"تم إجراء فحص الغش البرمجي على {len(reports)} زوج تسليمات بنجاح",
        "count": len(reports)
    }

@app.get("/api/plagiarism/reports/{task_id}")
def get_plagiarism_reports(task_id: int, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    # Run analysis to ensure up-to-date
    reports = check_task_plagiarism(task_id, db)
    if not reports:
        reports = db.query(PlagiarismReport).filter(PlagiarismReport.task_id == task_id).order_by(PlagiarismReport.similarity_score.desc()).all()

    user_roles = get_user_roles(user)

    # Filter for supporters/HR to see reports involving their assigned students
    if "admin" not in user_roles and "instructor" not in user_roles:
        if "supporter" in user_roles:
            assigned_ids = set(s.id for s in db.query(User).filter(User.assigned_supporter_id == user.id).all())
            reports = [r for r in reports if r.student_a_id in assigned_ids or r.student_b_id in assigned_ids]
        elif "hr" in user_roles:
            assigned_ids = set(s.id for s in db.query(User).filter(User.assigned_hr_id == user.id).all())
            reports = [r for r in reports if r.student_a_id in assigned_ids or r.student_b_id in assigned_ids]

    res = []
    for r in reports:
        st_a = r.student_a
        st_b = r.student_b

        supporter_a_name = st_a.assigned_supporter.name if (st_a and st_a.assigned_supporter) else "غير معين"
        hr_a_name = st_a.assigned_hr.name if (st_a and st_a.assigned_hr) else "غير معين"

        supporter_b_name = st_b.assigned_supporter.name if (st_b and st_b.assigned_supporter) else "غير معين"
        hr_b_name = st_b.assigned_hr.name if (st_b and st_b.assigned_hr) else "غير معين"

        res.append({
            "id": r.id,
            "task_id": r.task_id,
            "student_a": {
                "id": st_a.id if st_a else "",
                "name": st_a.name if st_a else "",
                "email": (st_a.official_email or st_a.email or "") if st_a else "",
                "seat_number": st_a.seat_number or "" if st_a else "",
                "supporter_name": supporter_a_name,
                "hr_name": hr_a_name
            },
            "student_b": {
                "id": st_b.id if st_b else "",
                "name": st_b.name if st_b else "",
                "email": (st_b.official_email or st_b.email or "") if st_b else "",
                "seat_number": st_b.seat_number or "" if st_b else "",
                "supporter_name": supporter_b_name,
                "hr_name": hr_b_name
            },
            "submission_a_id": r.submission_a_id,
            "submission_b_id": r.submission_b_id,
            "code_a": r.submission_a.code_content if r.submission_a else "",
            "code_b": r.submission_b.code_content if r.submission_b else "",
            "similarity_score": r.similarity_score,
            "details": json.loads(r.details_json) if r.details_json else {}
        })
    return res


# --- HR ENDPOINTS ---
@app.get("/api/hr/assigned-students")
def get_hr_assigned_students(user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    if user.role == RoleEnum.ADMIN:
        query = db.query(User).filter(User.role == RoleEnum.STUDENT)
    else:
        query = db.query(User).filter(User.assigned_hr_id == user.id)
    
    students = query.all()
    res = []
    for s in students:
        res.append({
            "id": s.id,
            "name": s.name,
            "email": s.email or "---",
            "phone": s.phone or "غير مدخل",
            "seat_number": s.seat_number or "",
            "assigned_hr_id": s.assigned_hr_id,
            "hr_name": s.assigned_hr.name if s.assigned_hr else "غير محدد"
        })
    return res

# --- TEAM REGISTRATION & SYSTEM SETTINGS ---









@app.post("/api/hr/attendance/single")
def mark_single_attendance(req: AttendanceMarkRequest, user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == req.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")

    is_admin = "admin" in get_user_roles(user)
    st = db.query(User).filter(User.id == req.student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    target_roles = get_user_roles(st)
    if not is_admin and ("hr" in target_roles or "admin" in target_roles or "instructor" in target_roles):
        raise HTTPException(status_code=400, detail="عفواً، لا يمكن لمسؤول الـ HR تسجيل حضور للزملاء أو المسؤولين. الإدمن فقط من يمكنه ذلك.")

    att = db.query(Attendance).filter(Attendance.session_id == req.session_id, Attendance.student_id == st.id).first()
    if att:
        att.status = req.status
        if req.notes:
            att.notes = req.notes
    else:
        att = Attendance(
            session_id=req.session_id,
            student_id=st.id,
            status=req.status,
            notes=req.notes
        )
        db.add(att)
    db.commit()
    return {"success": True, "message": "تم حفظ الحضور بنجاح"}

@app.post("/api/hr/attendance/bulk-manual")
def mark_bulk_attendance(req: BulkAttendanceRequest, user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == req.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")

    is_admin = "admin" in get_user_roles(user)

    count = 0
    for rec in req.records:
        st = db.query(User).filter(User.id == rec.student_id).first()
        if not st:
            continue
        
        target_roles = get_user_roles(st)
        if not is_admin and ("hr" in target_roles or "admin" in target_roles or "instructor" in target_roles):
            raise HTTPException(status_code=400, detail="عفواً، لا يمكن لمسؤول الـ HR تسجيل حضور للزملاء أو المسؤولين. الإدمن فقط من يمكنه ذلك.")
        
        att = db.query(Attendance).filter(Attendance.session_id == req.session_id, Attendance.student_id == st.id).first()
        if att:
            att.status = rec.status
            att.notes = rec.notes
        else:
            att = Attendance(
                session_id=req.session_id,
                student_id=st.id,
                status=rec.status,
                notes=rec.notes
            )
            db.add(att)
        count += 1

    db.commit()
    return {"success": True, "message": f"تم حفظ غياب السيشن لـ {count} طالب بنجاح"}

@app.get("/api/hr/attendance/{session_id}")
def get_session_attendance(session_id: int, response: Response, user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")
        
    attendances = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    res = {}
    for att in attendances:
        status_str = att.status.value if hasattr(att.status, 'value') else str(att.status).lower()
        res[str(att.student_id)] = status_str
    
    return {"success": True, "attendance": res}

@app.post("/api/hr/attendance/manual-id")
def mark_manual_id_attendance(req: ManualIDAttendanceRequest, user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == req.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")

    st = db.query(User).filter((User.id == req.student_id) | (User.seat_number == req.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    is_admin = "admin" in get_user_roles(user)
    target_roles = get_user_roles(st)
    if not is_admin and ("hr" in target_roles or "admin" in target_roles or "instructor" in target_roles):
        raise HTTPException(status_code=400, detail="عفواً، لا يمكن تسجيل حضور للمسؤولين أو الزملاء. الإدمن فقط من يمكنه ذلك.")

    att = db.query(Attendance).filter(Attendance.session_id == req.session_id, Attendance.student_id == st.id).first()
    
    if att:
        att.status = AttendanceStatusEnum.PRESENT
        att.notes = "حضور يدوي بالـ ID"
    else:
        att = Attendance(
            session_id=req.session_id,
            student_id=st.id,
            status=AttendanceStatusEnum.PRESENT,
            notes="حضور يدوي بالـ ID"
        )
        db.add(att)

    db.commit()
    return {"success": True, "message": f"تم تسجيل حضور الطالب {st.name} بنجاح"}






@app.post("/api/admin/assign-hr")
def assign_hr_to_student(req: AssignHRRequest, user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.HR])), db: Session = Depends(get_db)):
    st = db.query(User).filter(User.id == req.student_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    if req.hr_id:
        hr_user = db.query(User).filter(User.id == req.hr_id).first()
        if not hr_user:
            raise HTTPException(status_code=404, detail="مسؤول HR غير موجود")
        current_count = db.query(User).filter(User.assigned_hr_id == req.hr_id).count()
        if current_count >= 50 and st.assigned_hr_id != req.hr_id:
            raise HTTPException(status_code=400, detail=f"عذراً! مسئول الـ HR ({hr_user.name}) وصل للحد الأقصى المسموح به (50 طالب كحد أقصى).")

    st.assigned_hr_id = req.hr_id
    db.commit()
    return {"success": True, "message": "تم تعيين مسئول الـ HR للطالب بنجاح"}


# --- MEDIA & CERTIFICATES ENDPOINTS ---
import os
import shutil

CERTIFICATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "certificates")
os.makedirs(CERTIFICATES_DIR, exist_ok=True)

ALLOWED_CERTIFICATE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".webp", ".svg"}

@app.post("/api/media/certificates/upload")
async def upload_certificate(
    title: str = Form(...),
    user_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user: User = Depends(require_role([RoleEnum.MEDIA, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    base_name = os.path.basename(file.filename)
    ext = os.path.splitext(base_name)[1].lower()
    if ext not in ALLOWED_CERTIFICATE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"نوع الملف غير مسموح به. الصيغ المسموحة للشهادات هى: {', '.join(ALLOWED_CERTIFICATE_EXTENSIONS)}"
        )

    clean_filename = re.sub(r'[^a-zA-Z0-9_\.-]', '_', base_name)
    safe_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{clean_filename}"
    file_path = os.path.join(CERTIFICATES_DIR, safe_filename)

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="حجم ملف الشهادة كبير جداً. الحد الأقصى المسموح به هو 15 ميجابايت.")

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    rel_path = f"/certificates/{safe_filename}"

    cert = Certificate(
        title=sanitize_text(title),
        file_path=rel_path,
        user_id=user_id if user_id and user_id.strip() else None,
        uploaded_by_id=user.id
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return {"success": True, "message": "تم رفع الشهادة بنجاح وتأمينها", "certificate_id": cert.id}

@app.get("/api/certificates")
def get_certificates(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role in [RoleEnum.ADMIN, RoleEnum.MEDIA]:
        certs = db.query(Certificate).all()
    else:
        # User sees certificates specifically for them OR general certificates (user_id is None)
        certs = db.query(Certificate).filter(
            (Certificate.user_id == user.id) | (Certificate.user_id == None)
        ).all()
        
    res = []
    for c in certs:
        recipient = db.query(User).filter(User.id == c.user_id).first() if c.user_id else None
        uploader = db.query(User).filter(User.id == c.uploaded_by_id).first()
        res.append({
            "id": c.id,
            "title": c.title,
            "file_path": c.file_path,
            "recipient": {"id": recipient.id, "name": recipient.name} if recipient else {"id": None, "name": "عام للجميع"},
            "uploader": uploader.name if uploader else "مسؤول الميديا",
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else ""
        })
    return res

@app.delete("/api/media/certificates/{cert_id}")
def delete_certificate(cert_id: int, user: User = Depends(require_role([RoleEnum.MEDIA, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="الشهادة غير موجودة")
    
    # Remove file if exists
    full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", cert.file_path.lstrip("/"))
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception:
            pass

    db.delete(cert)
    db.commit()
    return {"success": True, "message": "تم حذف الشهادة بنجاح"}

# --- STUDENT TEAM & PORTAL ENDPOINTS ---

@app.post("/api/points/add")
def add_bonus_points(req: PointAddRequest, user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.INSTRUCTOR, RoleEnum.SUPPORTER])), db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    if not student.bonus_points:
        student.bonus_points = 0.0
        
    student.bonus_points += req.points_to_add
    db.commit()
    return {"success": True, "message": f"تم التعديل بنجاح! نقاط البونص الحالية: {student.bonus_points}"}

# --- ENHANCEMENTS: LEADERBOARD, NOTIFICATIONS & EXPORTS ---

@app.get("/api/student/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    all_users = db.query(User).all()
    student_scores = []
    
    for u in all_users:
        if "student" in get_user_roles(u):
            # Calculate total score from submissions
            subs = db.query(Submission).filter(Submission.student_id == u.id).all()
            total_task_score = sum(s.score for s in subs if s.score is not None)
            
            # Calculate attendance rate
            att_total = db.query(Attendance).filter(Attendance.student_id == u.id).count()
            att_present = db.query(Attendance).filter(Attendance.student_id == u.id, Attendance.status == AttendanceStatusEnum.PRESENT).count()
            att_rate = round((att_present / att_total * 100)) if att_total > 0 else 100
            
            bonus_pts = u.bonus_points or 0.0
            total_score = total_task_score + bonus_pts
            final_score = total_score + (att_rate * 0.5)
            
            badges = []
            if att_rate == 100:
                badges.append("🌟 Perfect Attendance")
            if total_task_score >= 100:
                badges.append("⚡ Code Master")
                
            student_scores.append({
                "id": u.id,
                "name": u.name,
                "seat_number": u.seat_number or "",
                "total_score": round(total_score, 1),
                "task_score": round(total_task_score, 1),
                "bonus_points": round(bonus_pts, 1),
                "attendance_rate": f"{att_rate}%",
                "final_score": round(final_score, 1),
                "badges": badges
            })
            
    student_scores.sort(key=lambda x: (x["final_score"], x["total_score"]), reverse=True)
    
    # Assign ranks
    for i, s in enumerate(student_scores, 1):
        s["rank"] = i
        
    return student_scores[:10]

@app.get("/api/notifications")
def get_user_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = []
    
    # 1. Upcoming session announcements
    sessions = db.query(SessionSchedule).order_by(SessionSchedule.date_time.desc()).limit(3).all()
    for s in sessions:
        notifications.append({
            "id": f"sess-{s.id}",
            "type": "session",
            "title": f"📅 سيشن قادمة: {s.title}",
            "body": f"الموعد: {s.date_time} | المكان: {s.location_or_link or 'غير محدد'}",
            "time": s.date_time
        })
        
    # 2. Upcoming tasks
    tasks = db.query(Task).order_by(Task.created_at.desc()).limit(3).all()
    for t in tasks:
        notifications.append({
            "id": f"task-{t.id}",
            "type": "task",
            "title": f"📝 واجب جديد: {t.title}",
            "body": f"الديدلاين: {t.deadline.strftime('%Y-%m-%d %H:%M')} | الدرجة: {t.max_score}",
            "time": t.created_at.strftime("%Y-%m-%d %H:%M")
        })
        
            
    return notifications

@app.get("/api/plagiarism/export-excel/{task_id}")
def export_plagiarism_excel(task_id: int, user: User = Depends(require_role([RoleEnum.SUPPORTER, RoleEnum.INSTRUCTOR, RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    reports = db.query(PlagiarismReport).filter(PlagiarismReport.task_id == task_id).order_by(PlagiarismReport.similarity_score.desc()).all()
    
    data = []
    for r in reports:
        st_a = r.student_a
        st_b = r.student_b
        data.append({
            "Report ID": r.id,
            "Task ID": r.task_id,
            "Similarity Match %": f"{r.similarity_score}%",
            "Student A ID": st_a.id if st_a else "",
            "Student A Name": st_a.name if st_a else "",
            "Student A TA": st_a.assigned_supporter.name if (st_a and st_a.assigned_supporter) else "غير معين",
            "Student A HR": st_a.assigned_hr.name if (st_a and st_a.assigned_hr) else "غير معين",
            "Student B ID": st_b.id if st_b else "",
            "Student B Name": st_b.name if st_b else "",
            "Student B TA": st_b.assigned_supporter.name if (st_b and st_b.assigned_supporter) else "غير معين",
            "Student B HR": st_b.assigned_hr.name if (st_b and st_b.assigned_hr) else "غير معين"
        })
        
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Plagiarism_Report")
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=codeguard_plagiarism_task_{task_id}.xlsx"}
    )

@app.get("/api/hr/attendance/export-excel/{session_id}")
def export_hr_attendance_excel(session_id: int, user: User = Depends(require_role([RoleEnum.HR, RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")
        
    # Get students
    if user.role == RoleEnum.ADMIN or "admin" in get_user_roles(user):
        students = db.query(User).all()
    else:
        students = db.query(User).filter(User.assigned_hr_id == user.id).all()
        
    data = []
    for s in students:
        if "student" in get_user_roles(s):
            att = db.query(Attendance).filter(Attendance.session_id == session_id, Attendance.student_id == s.id).first()
            data.append({
                "Session Title": sess.title,
                "Session Date": sess.date_time.strftime("%Y-%m-%d %H:%M"),
                "Student ID": s.id,
                "Student Name": s.name,
                "Seat Number": s.seat_number or "",
                "Academic Level": s.academic_level or "",
                "Program": s.program or "",
                "Attendance Status": (att.status.value if hasattr(att.status, 'value') else str(att.status)) if att else "absent",
                "Notes": att.notes if att else ""
            })
            
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Session_Attendance")
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=session_{session_id}_attendance.xlsx"}
    )


@app.get("/api/admin/attendance/export-excel/{session_id}")
def export_admin_student_attendance_excel(session_id: int, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")
    
    all_users = db.query(User).all()
    attendances = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    att_map = {str(a.student_id): (a.status.value if hasattr(a.status, 'value') else str(a.status)) for a in attendances}
    
    data = []
    for u in all_users:
        if "student" not in get_user_roles(u):
            continue
        status = att_map.get(str(u.id), "absent")
        data.append({
            "ID": u.id,
            "الاسم": u.name,
            "رقم الجلوس": u.seat_number or "",
            "الإيميل الأكاديمي": u.official_email or "",
            "حالة الحضور": status
        })
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Attendance')
    output.seek(0)
    filename = f"student_attendance_{sess.title.replace(' ', '_')}_{session_id}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/admin/crew-attendance/export-excel/{session_id}")

def export_crew_attendance_excel(session_id: int, user: User = Depends(require_role([RoleEnum.ADMIN])), db: Session = Depends(get_db)):
    sess = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="السيشن غير موجودة")
        
    all_users = db.query(User).all()
    
    data = []
    for s in all_users:
        roles = get_user_roles(s)
        # Check if user is crew (has any role other than student)
        is_crew = any(r in roles for r in ["admin", "hr", "media", "supporter", "instructor"])
        if is_crew:
            att = db.query(Attendance).filter(Attendance.session_id == session_id, Attendance.student_id == s.id).first()
            data.append({
                "Session Title": sess.title,
                "Session Date": sess.date_time.strftime("%Y-%m-%d %H:%M"),
                "Crew ID": s.id,
                "Crew Name": s.name,
                "Role": s.role,
                "Attendance Status": (att.status.value if hasattr(att.status, 'value') else str(att.status)) if att else "absent",
                "Notes": att.notes if att else ""
            })
            
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Crew_Attendance")
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=session_{session_id}_crew_attendance.xlsx"}
    )

# Mount static files LAST (after all API routes)
if os.path.isdir(_STATIC_DIR):
    app.mount("/static", StaticFiles(directory=_STATIC_DIR), name="static")
    
    # Mount subdirectories to serve them from the root as requested by index.html
    css_dir = os.path.join(_STATIC_DIR, "css")
    js_dir = os.path.join(_STATIC_DIR, "js")
    includes_dir = os.path.join(_STATIC_DIR, "includes")
    
    if os.path.isdir(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.isdir(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    if os.path.isdir(includes_dir):
        app.mount("/includes", StaticFiles(directory=includes_dir), name="includes")
