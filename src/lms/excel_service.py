import pandas as pd
import io
from sqlalchemy.orm import Session
from src.lms.models import User, RoleEnum, Attendance, AttendanceStatusEnum, SessionSchedule
from src.lms.auth import hash_password

def clean_id(val) -> str:
    """Cleans ID string to remove trailing .0 from pandas float conversion and whitespace."""
    if pd.isna(val):
        return ""
    s = str(val).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s

def import_users_from_excel_or_csv(file_bytes: bytes, filename: str, db: Session) -> dict:
    """
    Parses Excel (.xlsx) or CSV (.csv) bytes and inserts/updates users into the database.
    Each imported user gets initial default password = user.id, with must_change_password = True.
    """
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes), dtype=str)
        else:
            df = pd.read_excel(io.BytesIO(file_bytes), dtype=str)
    except Exception as e:
        return {"success": False, "error": f"فشل في قراءة ملف الإكسيل/CSV: {str(e)}"}

    # Normalize columns
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Flexible Column Matching
    id_col = next((c for c in df.columns if any(k in c for k in ['id', 'user_id', 'كود', 'الرقم التعريفي'])), None)
    name_col = next((c for c in df.columns if any(k in c for k in ['name', 'full name', 'الاسم', 'اسم'])), None)
    email_col = next((c for c in df.columns if 'email address' in c or (any(k in c for k in ['email', 'mail', 'البريد', 'الايميل']) and 'official' not in c and 'fcis' not in c)), None)
    official_email_col = next((c for c in df.columns if any(k in c for k in ['official', 'fcis email', 'البريد الأكاديمي', 'الرسمي'])), None)
    phone_col = next((c for c in df.columns if any(k in c for k in ['mobile', 'phone', 'هاتف', 'موبايل'])), None)
    seat_col = next((c for c in df.columns if 'email' not in c and any(k in c for k in ['seat', 'الجلوس', 'seat number', 'رقم الجلوس'])), None)
    level_col = next((c for c in df.columns if any(k in c for k in ['level', 'year', 'مستوى', 'فرقة', 'عام'])), None)
    program_col = next((c for c in df.columns if any(k in c for k in ['program', 'برنامج', 'تخصص', 'قسم'])), None)
    role_col = next((c for c in df.columns if any(k in c for k in ['role', 'الرول', 'الدور', 'الوظيفة'])), None)
    supporter_col = next((c for c in df.columns if any(k in c for k in ['supporter', 'المساعد', 'السابورتر'])), None)
    hr_col = next((c for c in df.columns if any(k in c for k in ['hr_id', 'hr', 'إتش آر', 'اتش ار'])), None)

    if not name_col:
        return {
            "success": False, 
            "error": "الملف يجب أن يحتوي على عمود لـ اسم الطالب/المستخدم على الأقل."
        }

    imported_count = 0
    updated_count = 0
    recent_users = db.query(User).order_by(User.created_at.desc()).all()
    next_generated_num = None
    for u in recent_users:
        if u.id and u.id.isdigit():
            next_generated_num = int(u.id) + 1
            break

    if next_generated_num is None:
        next_generated_num = 20260100

    batch_seen_ids = set()

    for idx, row in df.iterrows():
        user_id = ""
        if id_col:
            user_id = clean_id(row[id_col])
        
        # Fallback to seat number column if ID column is empty
        if not user_id and seat_col and pd.notna(row[seat_col]):
            user_id = clean_id(row[seat_col])

        # Fallback to email prefix if ID is still empty
        if not user_id and email_col and pd.notna(row[email_col]):
            email_val = str(row[email_col]).strip()
            if "@" in email_val:
                user_id = email_val.split("@")[0]

        name = str(row[name_col]).strip()
        if not name or name.lower() == 'nan':
            continue

        # Master admin detection
        is_marwan = "مروان صبحي" in name

        if not user_id or user_id.lower() == 'nan':
            if is_marwan:
                user_id = "2023170570"
            else:
                user_id = str(next_generated_num)
                next_generated_num += 1

        # Deduplicate user_id in batch
        base_id = user_id
        dup_counter = 1
        while user_id in batch_seen_ids:
            user_id = f"{base_id}_{dup_counter}"
            dup_counter += 1
        batch_seen_ids.add(user_id)

        email = str(row[email_col]).strip() if email_col and pd.notna(row[email_col]) else f"{user_id}@lms.edu"
        official_email = str(row[official_email_col]).strip() if official_email_col and pd.notna(row[official_email_col]) else f"{user_id}@cis.asu.edu.eg"
        
        phone_val = clean_id(row[phone_col]) if phone_col and pd.notna(row[phone_col]) else ""
        if phone_val and not phone_val.startswith('0') and len(phone_val) == 10:
            phone_val = '0' + phone_val
        
        seat_num = clean_id(row[seat_col]) if seat_col and pd.notna(row[seat_col]) else user_id
        level_val = str(row[level_col]).strip() if level_col and pd.notna(row[level_col]) else ""
        program_val = str(row[program_col]).strip() if program_col and pd.notna(row[program_col]) else ""

        # Determine Role
        raw_role = str(row[role_col]).strip().lower() if role_col and pd.notna(row[role_col]) else "student"
        if is_marwan or "admin" in raw_role or "organiser" in raw_role or "أدمن" in raw_role or "ادمن" in raw_role:
            role = RoleEnum.ADMIN
        elif "instructor" in raw_role or "مدرس" in raw_role or "انستراكتور" in raw_role:
            role = RoleEnum.INSTRUCTOR
        elif "supporter" in raw_role or "سابورتر" in raw_role or "مساعد" in raw_role:
            role = RoleEnum.SUPPORTER
        elif "hr" in raw_role or "اتش ار" in raw_role or "إتش آر" in raw_role:
            role = RoleEnum.HR
        elif "media" in raw_role or "ميديا" in raw_role:
            role = RoleEnum.MEDIA
        else:
            role = RoleEnum.STUDENT

        assigned_supporter_id = clean_id(row[supporter_col]) if supporter_col and pd.notna(row[supporter_col]) else None
        assigned_hr_id = clean_id(row[hr_col]) if hr_col and pd.notna(row[hr_col]) else None

        existing_user = db.query(User).filter(User.id == user_id).first()
        if existing_user:
            # Preserve website UI edits: only update fields if DB currently has empty/default values
            if name and (not existing_user.name or existing_user.name == "طالب جديد"):
                existing_user.name = name
            if email and (not existing_user.email or "@lms.edu" in existing_user.email):
                existing_user.email = email
            if official_email and (not existing_user.official_email or "@cis.asu.edu.eg" in existing_user.official_email):
                existing_user.official_email = official_email
            if phone_val and not existing_user.phone:
                existing_user.phone = phone_val
            if seat_num and (not existing_user.seat_number or existing_user.seat_number == existing_user.id):
                existing_user.seat_number = seat_num
            if level_val and not existing_user.academic_level:
                existing_user.academic_level = level_val
            if program_val and not existing_user.program:
                existing_user.program = program_val
            
            # Preserve custom roles assigned via Website UI (e.g., admin, hr, supporter, media, instructor)
            # Only update role if Excel explicitly specifies a special staff role AND user is currently basic student
            if role != RoleEnum.STUDENT and existing_user.role == RoleEnum.STUDENT:
                existing_user.role = role

            if assigned_supporter_id and not existing_user.assigned_supporter_id:
                existing_user.assigned_supporter_id = assigned_supporter_id
            if assigned_hr_id and not existing_user.assigned_hr_id:
                existing_user.assigned_hr_id = assigned_hr_id

            updated_count += 1
        else:
            # Default password is the User ID itself!
            new_user = User(
                id=user_id,
                name=name,
                email=email,
                official_email=official_email,
                phone=phone_val,
                seat_number=seat_num,
                academic_level=level_val,
                program=program_val,
                role=role,
                password_hash=hash_password(user_id),
                must_change_password=True,
                assigned_supporter_id=assigned_supporter_id,
                assigned_hr_id=assigned_hr_id
            )
            db.add(new_user)
            imported_count += 1

    db.commit()
    return {
        "success": True,
        "message": f"تم استيراد {imported_count} مستخدم جديد وتحديث {updated_count} مستخدم بنجاح.",
        "imported": imported_count,
        "updated": updated_count
    }

def import_attendance_from_excel_or_csv(file_bytes: bytes, filename: str, session_id: int, db: Session, current_user: User = None) -> dict:
    """
    Parses Excel or CSV containing Student IDs and attendance status/checkbox, and records attendance.
    """
    session = db.query(SessionSchedule).filter(SessionSchedule.id == session_id).first()
    if not session:
        return {"success": False, "error": "السيشن غير موجودة."}

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes), dtype=str)
        else:
            df = pd.read_excel(io.BytesIO(file_bytes), dtype=str)
    except Exception as e:
        return {"success": False, "error": f"فشل في قراءة ملف الإكسيل/CSV: {str(e)}"}

    df.columns = [str(c).strip().lower() for c in df.columns]

    id_col = next((c for c in df.columns if c in ['id', 'student_id', 'user_id', 'كود', 'كود الطالب', 'الرقم التعريفي']), None)
    status_col = next((c for c in df.columns if c in ['status', 'attendance', 'present', 'الغياب', 'الحضور', 'حالة الحضور']), None)

    if not id_col:
        return {"success": False, "error": "الملف يجب أن يحتوي على عمود كود الطالب (ID)."}

    is_admin = False
    if current_user:
        raw_current = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        is_admin = "admin" in raw_current.lower()

    updated_records = 0
    created_records = 0

    for idx, row in df.iterrows():
        student_id = clean_id(row[id_col])
        if not student_id or student_id.lower() == 'nan':
            continue

        # Check if student exists
        student = db.query(User).filter((User.id == student_id) | (User.seat_number == student_id)).first()
        if not student:
            continue
            
        raw_st_role = student.role.value if hasattr(student.role, 'value') else str(student.role)
        st_roles = [r.strip().lower() for r in raw_st_role.split(',')]
        if not is_admin and ("hr" in st_roles or "admin" in st_roles or "instructor" in st_roles):
            return {"success": False, "error": f"عفواً، لا يمكن لمسؤول الـ HR تسجيل حضور للزملاء أو المسؤولين ({student.name}). الإدمن فقط من يمكنه ذلك."}

        status_val = AttendanceStatusEnum.ABSENT
        if status_col and pd.notna(row[status_col]):
            raw_s = str(row[status_col]).strip().lower()
            if raw_s in ['present', 'حاضر', 'حضور', '1', 'true', 'yes', 'نعم']:
                status_val = AttendanceStatusEnum.PRESENT
            elif raw_s in ['excused', 'مستأذن', 'عذر']:
                status_val = AttendanceStatusEnum.EXCUSED
            else:
                status_val = AttendanceStatusEnum.ABSENT

        att = db.query(Attendance).filter(
            Attendance.session_id == session_id,
            Attendance.student_id == student.id
        ).first()

        if att:
            att.status = status_val
            updated_records += 1
        else:
            att = Attendance(
                session_id=session_id,
                student_id=student.id,
                status=status_val
            )
            db.add(att)
            created_records += 1

    db.commit()
    return {
        "success": True,
        "message": f"تم تسجيل الحضور: {created_records} سطر جديد، وتم تحديث {updated_records} سطر بنجاح.",
        "created": created_records,
        "updated": updated_records
    }
