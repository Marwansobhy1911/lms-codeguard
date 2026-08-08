
// Safe DOM Helper Functions
function getEl(id) { return document.getElementById(id); }
function setDisplay(id, display) { const el = getEl(id); if (el) el.style.display = display; }
function setVal(id, val) { const el = getEl(id); if (el) el.value = val; }
function getVal(id, defaultVal = '') { const el = getEl(id); return el ? el.value : defaultVal; }
function setText(id, text) { const el = getEl(id); if (el) el.innerText = text; }
function setHTML(id, html) { const el = getEl(id); if (el) el.innerHTML = html; }
let currentToken = localStorage.getItem('lms_token') || '';
        let currentUser = null;
        let currentLang = localStorage.getItem('lms_lang') || 'ar';
        let allSupportersList = [];

        const I18N = {
            ar: {
                logout: "تسجيل الخروج",
                btn_profile: "✏️ البيانات الشخصية",
                login_title: "تسجيل الدخول إلى LMS",
                login_sub: "أدخل الـ ID الخاص بك للوصول لمنصة التعلم",
                label_id: "الرقم التعريفي (ID)",
                label_password: "كلمة المرور",
                btn_login: "تسجيل الدخول",
                login_note: "تنويه: عند أول دخول، سيطلب منك النظام تغيير كلمة المرور فوراً لأمان حسابك.",
                force_pass_title: "إجراء أمان إجباري: تغيير كلمة المرور",
                force_pass_sub: "أهلاً بك! نظراً لأن هذا أول تسجيل دخول لك، يجب عليك اختيار كلمة مرور جديدة خاصة بك للاستمرار.",
                label_current_pass: "كلمة المرور الحالية (الافتراضية)",
                label_new_pass: "كلمة المرور الجديدة",
                label_confirm_pass: "تأكيد كلمة المرور الجديدة",
                btn_save_pass: "حفظ كلمة المرور والدخول للنظام",
                edit_profile_title: "تحديث البيانات الشخصية",
                label_name: "الاسم الكامل",
                label_email: "البريد الإلكتروني",
                label_phone: "رقم الهاتف",
                label_bio: "نبذة / الملاحظات الشخصية",
                btn_save_profile: "حفظ البيانات",
                incomplete_banner_msg: "⚠️ تنبيه: بعض بياناتك الشخصية (كالبريد أو الهاتف) غير مكتملة. يمكنك استكمالها الآن!",
                btn_complete_profile: "تعديل البيانات",
                tab_student: "لوحة الطالب",
                tab_hr: "👔 لوحة الـ HR",
                tab_media: "🎨 لوحة الميديا (Media)",
                tab_supporter: "لوحة السابورتر (TA)",
                tab_instructor: "لوحة الانستراكتور",
                tab_admin: "لوحة الأدمن",
                tab_cheating: "🔍 نظام كشف الغش (CodeGuard Anti-Cheat)",
                cheating_title: "🔍 محرك فحص الغش البرمجي الشامل (CodeGuard System)",
                cheating_sub: "تحليل الخوارزميات (Winnowing Fingerprinting + Token LCS) لمقارنة أكواد كافة التسليمات آلياً.",
                btn_run_cheating_check: "⚡ تشغيل الفحص الآن",
                stat_supporter: "المساعد المسئول عنك",
                stat_attendance: "نسبة الحضور",
                stat_submissions: "التاسكات المسلمة",
                title_student_tasks: "التاسكات والواجبات المطلوب تسليمها",
                title_student_sessions: "مواعيد السيشنات والغياب",
                hr_attendance_title: "📊 إدارة حضور وغياب الطلاب",
                hr_attendance_sub: "قم برصد الحضور والغياب للطلاب المسندين إليك لكل سيشن يدويًا عبر التشيك بوكس، أو عبر رفع شيت الإكسيل.",
                hr_excel_title: "📁 رفع شيت إكسيل للغياب (Checkboxes / ID)",
                label_select_session: "اختر السيشن",
                label_excel_file: "ملف الإكسيل / CSV",
                btn_upload_attendance_excel: "📤 قراءة وتأكيد غياب الشيت",
                btn_sample_attendance_excel: "📥 تحميل نموذج شيت الغياب (Sample Excel)",
                hr_manual_title: "✍️ رصد الغياب يدويًا للسيشن",
                label_select_session_manual: "اختر السيشن المراد رصد غيابها:",
                th_attendance_check: "حالة الحضور",
                btn_save_attendance: "💾 حفظ غياب السيشن المحدد",
                title_unassigned_students: "الطلاب المتاحين للإسناد (Unassigned Students - Max 20 Limit)",
                unassigned_students_sub: "يمكنك إسناد أي طالب غير مخصص لمساعد حتى يصل إجمالي طلابك المسندين إلى 20 طالب كحد أقصى.",
                title_assigned_students: "الطلاب المسؤول عنهم",
                th_student_id: "ID الطالب",
                th_student_name: "اسم الطالب",
                th_email: "البريد الإلكتروني",
                th_submissions: "عدد التسليمات",
                title_submissions_review: "تسليمات الأكواد والمراجعة",
                th_student: "الطالب",
                th_task: "المهمة",
                th_submit_date: "تاريخ التسليم",
                th_score: "الدرجة المرصودة",
                th_actions: "إجراءات",
                btn_add_task: "+ إضافة مهمة جديدة (Task)",
                btn_add_session: "+ إضافة سيشن جديدة",
                title_instructor_tasks: "قائمة التاسكات والديدلاين",
                title_instructor_sessions: "جدول السيشنات",
                title_excel_sync: "استيراد شيت الإكسيل (Excel / CSV Database)",
                excel_sub: "قم برفع شيت الإكسيل لاستيراد الطلاب والمساعدين والأدوار وتحديث الداتابيز تلقائياً.",
                btn_upload_excel: "رفع واستيراد البيانات",
                btn_download_sample: "تحميل نموذج شيت الإكسيل",
                title_user_mgmt: "إدارة حسابات المستخدمين والصلاحيات (Users & Roles)",
                btn_clear_all: "⚠️ حذف جميع الحسابات",
                th_name: "الاسم",
                th_role: "الرول الحالي (Role)",
                th_supporter: "المساعد المسئول",
                modal_submit_title: "تسليم كود المهمة",
                label_filename: "اسم الملف البرمجي",
                label_code: "كود الحل البرمجي (Paste or Type Code)",
                btn_submit_code: "تم التسليم بنجاح",
                modal_grade_title: "تصحيح المهمة وفحص الغش",
                label_submitted_code: "كود الطالب المقدم:",
                label_score: "الدرجة المستحقة",
                label_feedback: "الملاحظات والتوجيهات (Feedback)",
                btn_save_grade: "حفظ التقييم ورصد الدرجة",
                plagiarism_title: "تقرير كشف الانتحال والسرقة البرمجية (CodeGuard Anti-Cheating)",
                modal_create_task: "إضافة مهمة / تاسك جديدة",
                label_task_title: "عنوان المهمة",
                label_task_desc: "وصف المهمة والمطلوب",
                label_task_deadline: "الموعد النهائي للتسليم (Deadline)",
                label_max_score: "الدرجة الكلية",
                btn_publish_task: "إنشاء المهمة ونشرها",
                modal_create_session: "إضافة موعد سيشن جديدة",
                label_session_title: "عنوان السيشن",
                label_session_datetime: "تاريخ ووقت السيشن",
                label_session_location: "المكان أو رابط الاجتماع",
                btn_save_session: "حفظ السيشن",
                admin_stats_title: "📊 إحصائيات وأعداد النظام الشاملة (System Overview Stats)",
                stat_card_students: "🔍 الطلاب 🎓",
                stat_card_supporters: "🔍 المساعدين 🛠️",
                stat_card_instructors: "🔍 المدربين 👨‍🏫",
                stat_card_hr: "🔍 الـ HR 📋",
                stat_card_media: "🔍 الميديا 📸",
                stat_card_admins: "🔍 الأدمنز 👑",
                stat_card_teams: "🔍 التيمات 🏆",
                stat_card_certificates: "🔍 الشهادات 📜",
                admin_team_settings_title: "⚙️ إعدادات فترة تسجيل التيمات والديدلاين (Team Registration Window)",
                admin_team_settings_sub: "تحديد فترة الديدلاين لإنشاء وانضمام الطلاب للتيمات، والحد الأقصى لأعضاء الفريق (1 Team per Student constraint enforced automatically).",
                btn_save_team_settings: "💾 حفظ إعدادات تسجيل التيمات والديدلاين",
                btn_backup_db: "📥 تحميل نسخة احتياطية (Backup DB)",
                st_ta_sub: "📞 اضغط لمعاينة البيانات",
                st_hr_sub: "📞 اضغط لمعاينة البيانات",
                st_att_sub: "🔍 اضغط لمعاينة التفاصيل",
                st_sub_sub: "🔍 اضغط لمعاينة التسليمات",
                loading_tasks: "...جاري تحميل التاسكات",
                loading_sessions: "...جاري تحميل المواعيد",
                title_my_team: "👥 فريقي ومجموعة العمل (My Team)",
                loading_team: "...جاري جلب معلومات الفريق",
                title_my_certificates: "🎓 شهاداتي المستحقة (My Certificates)",
                loading_certificates: "...جاري جلب الشهادات",
                loading: "...جاري التحميل",
                unassigned_hr_title: "📋 الطلاب غير المسندين لـ HR (يمكنك إسنادهم لك حتى 50 طالب)",
                unassigned_hr_sub: "يمكنك اختيار وإسناد أي طالب غير مخصص لمسؤول غياب آخر لمسؤوليتك المباشرة (حتى 50 طالب كحد أقصى).",
                btn_tab_login: "🔑 تسجيل الدخول",
                btn_tab_register: "✨ حساب طالب جديد",
                label_reg_name: "الاسم الكامل (ثلاثي أو رباعي بالعربية)",
                label_official_email: "البريد الأكاديمي الرسمي",
                label_personal_email: "البريد الإلكتروني الشخصي",
                label_phone_no: "رقم الموبايل",
                label_seat_no: "رقم الجلوس / الرقم الجامعي",
                label_level: "المستوى الدراسي / الفرقة",
                label_program: "البرنامج / التخصص",
                label_reg_password: "كلمة المرور للحساب",
                btn_register_submit: "✨ إنشاء الحساب وتوليد الـ ID والدخول فوراً",
                hr_contact_title: "👔 بيانات التواصل مع مسؤول الغياب (HR)",
                admin_edit_user_title: "🛠️ تعديل بيانات ورول الـ ID بصفة أدمن",
                admin_db_view_title: "📊 معاينة جدول الداتابيز الكاملة (Clean Database View)",
                btn_export_db_excel: "📥 تصدير الداتابيز شيت إكسيل (Clean Excel Export)",
                user_change_pass_title: "🔒 تغيير كلمة المرور للحساب",
                att_details_title: "📊 تفاصيل نسبة الحضور والسيشنات",
                sub_tasks_details_title: "📝 قائمة التاسكات التي قمت بتسليمها",
                leaderboard_title: "🏆 لوحة الطلاب المتميزين والأوسمة (Top Performers Leaderboard)",
                leaderboard_sub: "يتم تجميع وتحديث الترتيب آلياً بناءً على تقييمات التاسكات ونسبة حضور السيشنات.",
                th_rank: "الترتيب",
                th_total_assignments: "مجموع الواجبات",
                th_attendance_rate: "نسبة الحضور",
                th_badges: "الأوسمة المستحقة",
                ta_contact_title: "📞 بيانات التواصل مع المعيد / السابورتر",
                admin_team_status_label: "حالة فترة التسجيل:",
                admin_team_deadline_label: "الديدلاين وتاريخ الإغلاق:",
                admin_team_max_label: "الحد الأقصى للطلاب في التيم الواحد:",
                btn_change_password: "🔒 تغيير كلمة المرور",
                user_change_pass_sub: "يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة لحماية حسابك.",
                opt_open: "مفتوح للجميع (Open)",
                opt_closed: "مغلق (Closed)",
                hr_teams_title: "👥 إنشاء وإدارة التيمات (Team Management)",
                label_new_team_name: "اسم الفريق الجديد",
                btn_create_new_team: "+ إنشاء تيم جديد",
                hr_existing_teams_title: "التيمات الحالية وتخصيص الطلاب",
                media_upload_cert_title: "🎓 رفع شهادة جديدة (Upload Certificate)",
                media_upload_cert_sub: "يمكنك رفع شهادة مخصصة لطالب معين عبر كتابة كوده، أو ترك كود الطالب فارغاً لتكون شهادة عامة للجميع.",
                label_cert_title: "عنوان الشهادة / التفاصيل",
                label_cert_recipient: "كود الطالب المستلم (اختر أو اترك فارغاً للعامة)",
                opt_general_cert: "-- شهادة عامة للجميع --",
                label_cert_file: "ملف الشهادة (صورة / PDF / تصميم)",
                btn_upload_cert: "📤 رفع الشهادة وحفظها",
                media_certs_list_title: "📜 قائمة الشهادات المرفوعة",
                th_title: "العنوان",
                th_recipient: "المستلم",
                th_upload_date: "تاريخ الرفع",
                notif_header_title: "🔔 الإشعارات والتنبيهات",
                btn_clear_notifs: "🗑️ مسح الكل",
                btn_manage_bonus_students: "🏆 إدارة نقاط البونص للطلاب",
                btn_export_full_grades: "📥 تصدير شيت الدرجات والبونص (Excel Export)",
                manage_points_title: "🏆 إدارة نقاط البونص للطلاب",
                th_seat_phone: "رقم الجلوس / التليفون",
                th_current_bonus: "نقاط البونص الحالية",
                btn_close_modal: "❌ إغلاق النافذة"
            },
            en: {
                logout: "Logout",
                btn_profile: "✏️ Profile",
                login_title: "LMS Login",
                login_sub: "Enter your ID to access the learning platform",
                label_id: "User ID",
                label_password: "Password",
                btn_login: "Login",
                login_note: "Note: When creating a new student account, your User ID will be generated automatically.",
                force_pass_title: "Mandatory Security Action: Change Password",
                force_pass_sub: "Welcome! Since this is your first login, you must create a new password to proceed.",
                label_current_pass: "Current (Default) Password",
                label_new_pass: "New Password",
                label_confirm_pass: "Confirm New Password",
                btn_save_pass: "Save Password & Enter System",
                edit_profile_title: "Update Personal Profile",
                label_name: "Full Name",
                label_email: "Email Address",
                label_phone: "Phone Number",
                label_bio: "Bio / Personal Notes",
                btn_save_profile: "Save Profile",
                incomplete_banner_msg: "⚠️ Warning: Some personal info (like email or phone) is missing. Update it now!",
                btn_complete_profile: "Update Profile",
                tab_student: "Student Dashboard",
                tab_hr: "👔 HR Dashboard",
                tab_media: "🎨 Media Dashboard",
                tab_supporter: "Supporter Dashboard (TA)",
                tab_instructor: "Instructor Dashboard",
                tab_admin: "Admin Dashboard",
                tab_cheating: "🔍 CodeGuard Anti-Cheat System",
                cheating_title: "🔍 CodeGuard Plagiarism Detection Engine",
                cheating_sub: "Dual algorithm analysis (Winnowing Fingerprinting + Token LCS) to check all code submissions pairwise.",
                btn_run_cheating_check: "⚡ Run Plagiarism Check Now",
                stat_supporter: "Assigned TA / Supporter",
                stat_hr: "Assigned HR",
                stat_attendance: "Attendance Rate",
                stat_submissions: "Submitted Tasks",
                title_student_tasks: "Assigned Tasks & Assignments",
                title_student_sessions: "Sessions Schedule & Attendance",
                hr_attendance_title: "📊 Student Attendance Management",
                hr_attendance_sub: "Mark attendance for assigned students manually via checkboxes or upload an Excel sheet.",
                hr_excel_title: "📁 Upload Attendance Excel Sheet (Checkboxes / ID)",
                label_select_session: "Select Session",
                label_excel_file: "Excel / CSV File",
                btn_upload_attendance_excel: "📤 Read & Import Attendance Excel",
                btn_sample_attendance_excel: "📥 Download Sample Attendance Excel",
                hr_manual_title: "✍️ Manual Session Attendance",
                label_select_session_manual: "Select Session for Manual Attendance:",
                th_attendance_check: "Attendance Status",
                btn_save_attendance: "💾 Save Selected Session Attendance",
                title_unassigned_students: "Unassigned Students Available (Max 20 Limit)",
                unassigned_students_sub: "Assign any unassigned student to yourself up to a maximum limit of 20 students.",
                title_assigned_students: "My Assigned Students",
                th_student_id: "Student ID",
                th_student_name: "Student Name",
                th_email: "Email Address",
                th_submissions: "Submissions Count",
                title_submissions_review: "Submissions & Code Review",
                th_student: "Student",
                th_task: "Task",
                th_submit_date: "Submission Date",
                th_score: "Score",
                th_actions: "Actions",
                btn_add_task: "+ Add New Task",
                btn_add_session: "+ Add New Session",
                title_instructor_tasks: "Tasks & Deadlines List",
                title_instructor_sessions: "Sessions Schedule",
                title_excel_sync: "Excel / CSV Database Import",
                excel_sub: "Upload an Excel sheet to import users, roles, and update database automatically.",
                btn_upload_excel: "Upload & Sync Data",
                btn_download_sample: "Download Sample Excel",
                title_user_mgmt: "User Accounts & Role Management",
                btn_clear_all: "⚠️ Delete All Accounts",
                th_name: "Name",
                th_role: "Role",
                th_supporter: "Assigned TA",
                modal_submit_title: "Submit Code Solution",
                label_filename: "Source File Name",
                label_code: "Code Solution (Paste or Type Code)",
                btn_submit_code: "Submitted Successfully",
                modal_grade_title: "Grade Submission & Plagiarism Check",
                label_submitted_code: "Submitted Student Code:",
                label_score: "Score",
                label_feedback: "Feedback & Notes",
                btn_save_grade: "Save Grade & Feedback",
                plagiarism_title: "CodeGuard Plagiarism Analysis Report",
                modal_create_task: "Create New Task",
                label_task_title: "Task Title",
                label_task_desc: "Task Description & Instructions",
                label_task_deadline: "Submission Deadline",
                label_max_score: "Max Score",
                btn_publish_task: "Publish Task",
                modal_create_session: "Add New Session",
                label_session_title: "Session Title",
                label_session_datetime: "Session Date & Time",
                label_session_location: "Location / Meeting Link",
                btn_save_session: "Save Session",
                admin_stats_title: "📊 System Overview Statistics & Counts",
                stat_card_students: "🔍 Students 🎓",
                stat_card_supporters: "🔍 Supporters 🛠️",
                stat_card_instructors: "🔍 Instructors 👨‍🏫",
                stat_card_hr: "🔍 HR Team 📋",
                stat_card_media: "🔍 Media Team 📸",
                stat_card_admins: "🔍 Admins 👑",
                stat_card_teams: "🔍 Teams 🏆",
                stat_card_certificates: "🔍 Certificates 📜",
                admin_team_settings_title: "⚙️ Team Registration Window & Deadline Settings",
                admin_team_settings_sub: "Set registration deadline for student team creation/joining, and team size limits (1 Team per Student constraint enforced).",
                btn_save_team_settings: "💾 Save Team Registration Settings",
                btn_backup_db: "📥 Download DB Backup",
                st_ta_sub: "📞 Click for contact info",
                st_hr_sub: "📞 Click for contact info",
                st_att_sub: "🔍 Click for details",
                st_sub_sub: "🔍 Click for submissions",
                loading_tasks: "Loading assignments...",
                loading_sessions: "Loading schedule...",
                title_my_team: "👥 My Team & Group",
                loading_team: "Loading team info...",
                title_my_certificates: "🎓 My Certificates",
                loading_certificates: "Loading certificates...",
                loading: "Loading...",
                unassigned_hr_title: "📋 Unassigned Students for HR (Self-Assign up to 50)",
                unassigned_hr_sub: "Self-assign any unassigned student to your profile (Up to 50 students max capacity).",
                btn_tab_login: "🔑 Login",
                btn_tab_register: "✨ New Student",
                label_reg_name: "Full Name",
                label_official_email: "Official Academic Email",
                label_personal_email: "Personal Email",
                label_phone_no: "Mobile Number",
                label_seat_no: "Seat / Academic Number",
                label_level: "Academic Level",
                label_program: "Program / Major",
                label_reg_password: "Account Password",
                btn_register_submit: "✨ Register & Generate ID",
                hr_contact_title: "👔 HR Contact Details",
                admin_edit_user_title: "🛠️ Edit User Profile & Roles (Admin)",
                admin_db_view_title: "📊 Complete Database Inspector (Clean View)",
                btn_export_db_excel: "📥 Export Database to Excel",
                user_change_pass_title: "🔒 Change Account Password",
                user_change_pass_sub: "Please enter your current and new password to secure your account.",
                btn_change_password: "🔒 Change Password",
                att_details_title: "📊 Session Attendance Details",
                sub_tasks_details_title: "📝 Submitted Assignments List",
                leaderboard_title: "🏆 Top Performers Leaderboard & Badges",
                leaderboard_sub: "Rankings are updated automatically based on task scores and attendance rates.",
                th_rank: "Rank",
                th_total_assignments: "Total Score",
                th_attendance_rate: "Attendance Rate",
                th_badges: "Earned Badges",
                ta_contact_title: "📞 TA / Supporter Contact Details",
                admin_team_status_label: "Registration Status:",
                admin_team_deadline_label: "Deadline & Closing Date:",
                admin_team_max_label: "Max Students per Team:",
                notif_header_title: "🔔 Notifications & Alerts",
                btn_clear_notifs: "🗑️ Clear All",
                opt_open: "Open to all",
                opt_closed: "Closed",
                hr_teams_title: "👥 Team Management & Creation",
                label_new_team_name: "New Team Name",
                btn_create_new_team: "+ Create New Team",
                hr_existing_teams_title: "Current Teams & Student Assignments",
                media_upload_cert_title: "🎓 Upload New Certificate",
                media_upload_cert_sub: "Upload a custom certificate for a student or leave blank for a general certificate.",
                label_cert_title: "Certificate Title / Details",
                label_cert_recipient: "Recipient Student ID (Select or Leave Blank)",
                opt_general_cert: "-- General Certificate for All --",
                label_cert_file: "Certificate File (Image / PDF / Graphic)",
                btn_upload_cert: "📤 Upload & Save Certificate",
                media_certs_list_title: "📜 Uploaded Certificates List",
                th_title: "Title",
                th_recipient: "Recipient",
                th_upload_date: "Upload Date",
                btn_manage_bonus_students: "🏆 Manage Student Bonus Points",
                btn_export_full_grades: "📥 Export Full Grades & Bonus (Excel)",
                manage_points_title: "🏆 Manage Student Bonus Points",
                th_seat_phone: "Seat No. / Phone",
                th_current_bonus: "Current Bonus Points",
                btn_close_modal: "❌ Close Window"
            }
        };

        function t(key, fallback = '') {
            if (I18N[currentLang] && I18N[currentLang][key] !== undefined) {
                return I18N[currentLang][key];
            }
            if (I18N['ar'] && I18N['ar'][key] !== undefined) {
                return I18N['ar'][key];
            }
            return fallback || key;
        }

        function translateRole(roleStr) {
            if (!roleStr) return currentLang === 'ar' ? 'طالب' : 'Student';
            const roles = String(roleStr).split(',').map(r => r.trim().toLowerCase());
            const roleMap = {
                student: { ar: 'طالب', en: 'Student' },
                supporter: { ar: 'سابورتر (TA)', en: 'Supporter (TA)' },
                instructor: { ar: 'انستراكتور', en: 'Instructor' },
                hr: { ar: 'إتش آر (HR)', en: 'HR' },
                media: { ar: 'ميديا', en: 'Media' },
                admin: { ar: 'أدمن', en: 'Admin' }
            };
            return roles.map(r => (roleMap[r] ? roleMap[r][currentLang] || r : r)).join(', ');
        }

        function translateAttendanceStatus(statusStr) {
            if (!statusStr) return currentLang === 'ar' ? 'حاضر' : 'Present';
            const s = String(statusStr).toLowerCase();
            if (s === 'present' || s === 'حاضر') return currentLang === 'ar' ? 'حاضر' : 'Present';
            if (s === 'absent' || s === 'غائب' || s === 'غياب') return currentLang === 'ar' ? 'غائب' : 'Absent';
            if (s === 'excused' || s === 'مستأذن' || s === 'عذر') return currentLang === 'ar' ? 'مستأذن' : 'Excused';
            return statusStr;
        }

        function translateLevel(levelStr) {
            if (!levelStr) return '';
            const l = String(levelStr).trim().toLowerCase();
            if (l.includes('1') || l.includes('الأول') || l.includes('الاول')) return currentLang === 'ar' ? 'المستوى الأول (Level 1)' : 'Level 1';
            if (l.includes('2') || l.includes('الثاني')) return currentLang === 'ar' ? 'المستوى الثاني (Level 2)' : 'Level 2';
            if (l.includes('3') || l.includes('الثالث')) return currentLang === 'ar' ? 'المستوى الثالث (Level 3)' : 'Level 3';
            if (l.includes('4') || l.includes('الرابع')) return currentLang === 'ar' ? 'المستوى الرابع (Level 4)' : 'Level 4';
            return levelStr;
        }

        function translateProgram(progStr) {
            if (!progStr) return '';
            const p = String(progStr).trim().toLowerCase();
            if (p.includes('general') || p.includes('عام')) return currentLang === 'ar' ? 'عام (General)' : 'General';
            if (p.includes('cs') || p.includes('حاسب')) return currentLang === 'ar' ? 'علوم الحاسب (CS)' : 'Computer Science (CS)';
            if (p.includes('is') || p.includes('معلومات')) return currentLang === 'ar' ? 'نظم المعلومات (IS)' : 'Information Systems (IS)';
            if (p.includes('it') || p.includes('تكنولوجيا')) return currentLang === 'ar' ? 'تكنولوجيا المعلومات (IT)' : 'Information Technology (IT)';
            if (p.includes('ai') || p.includes('ذكاء')) return currentLang === 'ar' ? 'الذكاء الاصطناعي (AI)' : 'Artificial Intelligence (AI)';
            return progStr;
        }

        window.addEventListener('DOMContentLoaded', () => {
            applyLanguage(currentLang);
            if (currentToken) {
                checkAuth();
            } else {
                logout();
            }
        });

        function toggleLanguage() {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('lms_lang', currentLang);
            applyLanguage(currentLang);
            if (currentUser) {
                setupUserUI();
            }
        }

        function applyLanguage(lang) {
            const root = document.getElementById('html-root');
            root.setAttribute('lang', lang);
            root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

            const langBtn = document.getElementById('lang-toggle-btn');
            if (langBtn) langBtn.innerText = lang === 'ar' ? '🌐 English' : '🌐 العربية';
            
            const loginLangBtn = document.getElementById('login-lang-btn');
            if (loginLangBtn) loginLangBtn.innerText = lang === 'ar' ? '🌐 English' : '🌐 العربية';

            const searchInput = document.getElementById('admin-user-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'ar' 
                    ? '🔍 ابحث بالاسم، الرقم التعريفي، رقم الجلوس، أو الإيميل...' 
                    : '🔍 Search by name, ID, seat number, email, or role...';
            }

            const hrSearchInput = document.getElementById('hr-students-search-input');
            if (hrSearchInput) {
                hrSearchInput.placeholder = lang === 'ar'
                    ? '🔍 ابحث في طلابك بالاسم، الرقم التعريفي، أو رقم الجلوس...'
                    : '🔍 Search assigned students by name, ID, or seat number...';
            }

            const loginId = document.getElementById('login-id');
            if (loginId) loginId.placeholder = lang === 'ar' ? 'مثال: 2024001 أو 2023170570' : 'e.g., 2024001 or 2023170570';

            const loginPass = document.getElementById('login-password');
            if (loginPass) loginPass.placeholder = lang === 'ar' ? 'كلمة المرور الافتراضية هي الـ ID نفسه' : 'Default password is your User ID';

            const regName = document.getElementById('reg-name');
            if (regName) regName.placeholder = lang === 'ar' ? 'مثال: أحمد محمد علي' : 'e.g., Ahmed Mohamed Ali';

            const regSeat = document.getElementById('reg-seat');
            if (regSeat) regSeat.placeholder = lang === 'ar' ? 'مثال: 20251700588' : 'e.g., 20251700588';

            const regPass = document.getElementById('reg-password');
            if (regPass) regPass.placeholder = lang === 'ar' ? 'اختر كلمة مرور حسابك (4 خانات على الأقل)' : 'Choose account password (min 4 chars)';

            const pointsSearch = document.getElementById('manage-points-search');
            if (pointsSearch) {
                pointsSearch.placeholder = lang === 'ar'
                    ? 'ابحث بالاسم، الـ ID أو رقم الجلوس...'
                    : 'Search by name, ID, or seat number...';
            }

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (I18N[lang] && I18N[lang][key]) {
                    el.innerText = I18N[lang][key];
                }
            });

            if (window.allAdminUsers && window.allAdminUsers.length > 0) {
                filterAdminUsersTable();
            }
        }

        function togglePasswordVisibility(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerText = '🙈';
            } else {
                input.type = 'password';
                btn.innerText = '👁️';
            }
        }

        function clearPasswordInputs() {
            setVal('login-password', '');
            setVal('cp-current', '');
            setVal('cp-new', '');
            setVal('cp-confirm', '');
        }

        async function apiRequest(endpoint, method = 'GET', data = null) {
            const headers = { 'Content-Type': 'application/json' };
            if (currentToken) headers['X-Session-Token'] = currentToken;

            const config = { method, headers, cache: 'no-store' };
            if (data && method !== 'GET') config.body = JSON.stringify(data);

            try {
                const res = await fetch(endpoint, config);
                let result = null;
                try {
                    result = await res.json();
                } catch (e) {
                    if (!res.ok) throw new Error(`حدث خطأ في الاستجابة من السيرفر (${res.status})`);
                }

                if (!res.ok) {
                    let errMsg = 'حدث خطأ غير متوقع';
                    if (result) {
                        const rawDetail = result.detail || result.message || result.error;
                        if (typeof rawDetail === 'string') {
                            errMsg = rawDetail;
                        } else if (Array.isArray(rawDetail)) {
                            errMsg = rawDetail.map(d => (typeof d === 'string' ? d : d.msg || d.detail || JSON.stringify(d))).join('\n');
                        } else if (rawDetail && typeof rawDetail === 'object') {
                            errMsg = rawDetail.msg || rawDetail.message || JSON.stringify(rawDetail);
                        }
                    }
                    const err = new Error(errMsg);
                    err.detail = errMsg;
                    throw err;
                }
                return result;
            } catch (err) { throw err; }
        }

        async function handleLogin(e) {
            e.preventDefault();
            const userId = getVal('login-id').trim();
            const password = getVal('login-password');
            const alertBox = getEl('login-alert');
            if (alertBox) alertBox.style.display = 'none';

            try {
                const res = await apiRequest('/api/auth/login', 'POST', { user_id: userId, password });
                currentToken = res.token;
                localStorage.setItem('lms_token', currentToken);
                currentUser = res.user;

                clearPasswordInputs();

                if (res.must_change_password) {
                    openModal('force-password-modal');
                    document.getElementById('cp-current').value = password;
                } else {
                    setupUserUI();
                }
            } catch (err) {
                alertBox.innerText = err.message;
                alertBox.style.display = 'block';
            }
        }

        async function handleForceChangePassword(e) {
            e.preventDefault();
            const currentPass = getVal('cp-current');
            const newPass = getVal('cp-new');
            const confirmPass = getVal('cp-confirm');
            const alertBox = getEl('change-pass-alert');
            if (alertBox) alertBox.style.display = 'none';

            if (newPass === currentPass) {
                alertBox.innerText = currentLang === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' : 'New password must be different from current password';
                alertBox.style.display = 'block';
                return;
            }

            if (newPass !== confirmPass) {
                alertBox.innerText = currentLang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
                alertBox.style.display = 'block';
                return;
            }

            try {
                await apiRequest('/api/auth/change-password', 'POST', {
                    current_password: currentPass,
                    new_password: newPass
                });
                clearPasswordInputs();
                closeModal('force-password-modal');
                // Refresh currentUser
                currentUser = await apiRequest('/api/auth/me');
                setupUserUI();
            } catch (err) {
                alertBox.innerText = err.message;
                alertBox.style.display = 'block';
            }
        }

        async function checkAuth() {
            try {
                currentUser = await apiRequest('/api/auth/me');
                if (currentUser.must_change_password) {
                    openModal('force-password-modal');
                } else {
                    setupUserUI();
                }
            } catch (err) {
                logout();
            }
        }

        function logout() {
            if (currentToken) apiRequest('/api/auth/logout', 'POST').catch(() => {});
            currentToken = '';
            currentUser = null;
            localStorage.removeItem('lms_token');
            clearPasswordInputs();
            setDisplay('main-header', 'none');
            setDisplay('app-dashboard', 'none');
            if (getEl('login-view')) getEl('login-view').classList.add('active');
        }

        function setupUserUI() {
            if (getEl('login-view')) getEl('login-view').classList.remove('active');
            setDisplay('main-header', 'flex');
            setDisplay('app-dashboard', 'block');

            // Clean display name (remove "(HR)", "(Admin)", "مسؤول الموارد البشرية", etc.)
            let cleanName = currentUser.name
                .replace(/\(HR\)|\(Media\)|\(Admin\)|\(Instructor\)|\(TA\)/gi, '')
                .replace(/مسؤول الموارد البشرية|مسؤول الميديا/gi, '')
                .trim();

            setText('user-name-display', cleanName);
            
            const roles = currentUser.roles || (currentUser.role ? currentUser.role.split(',') : ['student']);
            
            const idDisp = document.getElementById('user-id-display');
            if (idDisp) {
                if (roles.includes('student')) {
                    idDisp.innerText = `ID: ${currentUser.id}`;
                    idDisp.style.display = 'block';
                } else {
                    idDisp.style.display = 'none';
                }
            }
            
            const badge = document.getElementById('user-role-badge');
            badge.innerText = roles.map(r => r.toUpperCase()).join(' & ');
            badge.className = `badge badge-${roles[0] || 'student'}`;

            const banner = document.getElementById('incomplete-profile-banner');
            if (currentUser.is_profile_incomplete) {
                banner.style.display = 'flex';
            } else {
                banner.style.display = 'none';
            }

            if (roles.includes('student')) {
                const taElem = document.getElementById('st-supporter-name');
                if (taElem) taElem.innerText = currentUser.assigned_supporter_name || 'غير معين';

                const hrElem = document.getElementById('st-hr-name');
                if (hrElem) hrElem.innerText = currentUser.assigned_hr_name || 'غير معين';
            }

            setDisplay('tab-student', (roles.includes('student') || roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-hr', (roles.includes('hr') || roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-media', (roles.includes('media') || roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-supporter', (roles.includes('supporter') || roles.includes('instructor') || roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-instructor', (roles.includes('instructor') || roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-admin', (roles.includes('admin')) ? 'block' : 'none');
            setDisplay('tab-cheating', (roles.includes('supporter') || roles.includes('instructor') || roles.includes('admin')) ? 'block' : 'none');

            if (roles.includes('admin')) {
                switchTab('admin-view');
            } else if (roles.includes('student')) {
                switchTab('student-view');
            } else if (roles.includes('hr')) {
                switchTab('hr-view');
            } else if (roles.includes('media')) {
                switchTab('media-view');
            } else if (roles.includes('instructor')) {
                switchTab('instructor-view');
            } else if (roles.includes('supporter')) {
                switchTab('supporter-view');
            }

            loadNotifications();
        }

        async function loadNotifications() {
            try {
                const notifs = await apiRequest('/api/notifications');
                window.latestNotifications = notifs;

                const userId = currentUser ? currentUser.id : 'guest';
                const deletedKey = `lms_deleted_notifs_${userId}`;
                const readKey = `lms_read_notifs_${userId}`;

                const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
                const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');

                const activeNotifs = notifs.filter(n => !deletedIds.includes(n.id));
                const unreadNotifs = activeNotifs.filter(n => !readIds.includes(n.id));

                const badge = document.getElementById('notif-badge');
                const list = document.getElementById('notif-list-container');

                if (unreadNotifs.length > 0) {
                    if (badge) {
                        badge.style.display = 'inline';
                        badge.innerText = unreadNotifs.length;
                    }
                } else {
                    if (badge) badge.style.display = 'none';
                }

                if (list) {
                    if (activeNotifs.length > 0) {
                        list.innerHTML = activeNotifs.map(n => `
                            <div style="background: rgba(30,41,59,0.7); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-right: 4px solid var(--accent-cyan); position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                                    <div style="font-weight: bold; font-size: 0.88rem; color: var(--accent-cyan); flex: 1;">${n.title}</div>
                                    <button onclick="handleDeleteSingleNotification('${n.id}')" style="background: transparent; border: none; color: #f43f5e; cursor: pointer; font-size: 0.9rem; padding: 0 4px; line-height: 1;" title="${currentLang === 'ar' ? 'حذف الإشعار' : 'Delete notification'}">&times;</button>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${n.body}</div>
                                <div style="font-size: 0.7rem; color: #64748b; margin-top: 4px; text-align: left;">⏱️ ${n.time}</div>
                            </div>
                        `).join('');
                    } else {
                        list.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 10px;">${currentLang === 'ar' ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}</div>`;
                    }
                }
            } catch (err) { console.error(err); }
        }

        function toggleNotificationDropdown() {
            const dropdown = document.getElementById('notif-dropdown');
            if (dropdown) {
                const isOpening = dropdown.style.display === 'none';
                dropdown.style.display = isOpening ? 'block' : 'none';
                if (isOpening) {
                    const badge = document.getElementById('notif-badge');
                    if (badge) badge.style.display = 'none';

                    if (window.latestNotifications && currentUser) {
                        const userId = currentUser.id;
                        const readKey = `lms_read_notifs_${userId}`;
                        const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');
                        window.latestNotifications.forEach(n => {
                            if (!readIds.includes(n.id)) readIds.push(n.id);
                        });
                        localStorage.setItem(readKey, JSON.stringify(readIds));
                    }
                }
            }
        }

        function handleDeleteSingleNotification(notifId) {
            if (!currentUser) return;
            const userId = currentUser.id;
            const deletedKey = `lms_deleted_notifs_${userId}`;
            const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
            if (!deletedIds.includes(notifId)) {
                deletedIds.push(notifId);
                localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
            }
            loadNotifications();
        }

        function handleClearAllNotifications() {
            if (!currentUser || !window.latestNotifications) return;
            const userId = currentUser.id;
            const deletedKey = `lms_deleted_notifs_${userId}`;
            const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
            window.latestNotifications.forEach(n => {
                if (!deletedIds.includes(n.id)) deletedIds.push(n.id);
            });
            localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
            loadNotifications();
        }

        async function loadLeaderboard() {
            try {
                const list = await apiRequest('/api/student/leaderboard');
                const tbody = document.getElementById('student-leaderboard-tbody');
                if (!tbody) return;
                if (list.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">لا توجد بيانات متاحة حالياً.</td></tr>`;
                } else {
                    tbody.innerHTML = list.map(s => `
                        <tr>
                            <td><strong style="color: ${s.rank === 1 ? '#fbbf24' : (s.rank === 2 ? '#94a3b8' : (s.rank === 3 ? '#b45309' : 'var(--text-main)'))}">#${s.rank} ${s.rank === 1 ? '🥇' : (s.rank === 2 ? '🥈' : (s.rank === 3 ? '🥉' : ''))}</strong></td>
                            <td><strong>${s.name}</strong> (${s.id})</td>
                            <td>${s.seat_number || 'غير مسجل'}</td>
                            <td><span style="color: var(--accent-cyan); font-weight: bold;">${s.total_score} pt</span></td>
                            <td><span style="color: var(--accent-emerald); font-weight: bold;">${s.attendance_rate}</span></td>
                            <td>
                                ${s.badges.map(b => `<span class="badge badge-supporter" style="font-size: 0.75rem; margin-right: 4px;">${b}</span>`).join('')}
                            </td>
                        </tr>
                    `).join('');
                }
            } catch (err) { console.error(err); }
        }

        function renderAdminRolesChart(c) {
            const ctx = document.getElementById('admin-roles-chart');
            if (!ctx) return;
            if (window.adminChartInstance) {
                window.adminChartInstance.destroy();
            }
            window.adminChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['الطلاب', 'المساعدين', 'المدربين', 'الـ HR', 'الميديا', 'الأدمنز'],
                    datasets: [{
                        data: [c.students || 0, c.supporters || 0, c.instructors || 0, c.hr || 0, c.media || 0, c.admins || 0],
                        backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f43f5e', '#a78bfa', '#c084fc']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#f8fafc', font: { family: 'Cairo' } } }
                    }
                }
            });
        }

        function exportHrAttendanceSheet() {
            const sessId = document.getElementById('hr-manual-session-select').value;
            if (!sessId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار السيشن أولاً لتصدير الغياب' : 'Please select a session first');
                return;
            }
            window.open(`/api/hr/attendance/export-excel/${sessId}?token=${localStorage.getItem('lms_token') || ''}`);
        }

        function exportPlagiarismExcel() {
            const taskId = document.getElementById('cheating-task-select').value;
            if (!taskId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار المهمة أولاً لتصدير التقرير' : 'Please select a task first');
                return;
            }
            window.open(`/api/plagiarism/export-excel/${taskId}?token=${localStorage.getItem('lms_token') || ''}`);
        }

        function openProfileModal() {
            if (currentUser) {
                document.getElementById('pe-id').value = currentUser.id || '';
                document.getElementById('pe-name').value = currentUser.name || '';
                document.getElementById('pe-email').value = currentUser.email || '';
                document.getElementById('pe-official-email').value = currentUser.official_email || '';
                document.getElementById('pe-phone').value = currentUser.phone || '';
                document.getElementById('pe-seat').value = currentUser.seat_number || '';
                document.getElementById('pe-level').value = currentUser.academic_level || '';
                document.getElementById('pe-program').value = currentUser.program || '';
                document.getElementById('pe-bio').value = currentUser.bio || '';
            }
            openModal('profile-edit-modal');
        }

        async function handleUpdateProfile(e) {
            e.preventDefault();
            const name = document.getElementById('pe-name').value.trim();
            const email = document.getElementById('pe-email').value.trim();
            const officialEmail = document.getElementById('pe-official-email').value.trim();
            const phone = document.getElementById('pe-phone').value.trim();
            const seatNumber = document.getElementById('pe-seat').value.trim();
            const academicLevel = document.getElementById('pe-level').value.trim();
            const program = document.getElementById('pe-program').value.trim();
            const bio = document.getElementById('pe-bio').value.trim();

            try {
                const res = await apiRequest('/api/user/profile', 'POST', {
                    name,
                    email,
                    official_email: officialEmail,
                    phone,
                    seat_number: seatNumber,
                    academic_level: academicLevel,
                    program,
                    bio
                });
                alert(res.message);
                closeModal('profile-edit-modal');
                checkAuth();
            } catch (err) { alert(err.message); }
        }

        function switchAuthTab(mode) {
            const loginBtn = document.getElementById('auth-tab-login-btn');
            const regBtn = document.getElementById('auth-tab-reg-btn');
            const loginForm = document.getElementById('auth-login-form');
            const regForm = document.getElementById('auth-register-form');
            const titleEl = document.getElementById('auth-box-title');
            const subEl = document.getElementById('auth-box-sub');

            if (mode === 'register') {
                loginBtn.className = 'btn btn-outline';
                regBtn.className = 'btn btn-primary';
                loginForm.style.display = 'none';
                regForm.style.display = 'block';
                titleEl.innerText = currentLang === 'ar' ? 'إنشاء حساب طالب جديد' : 'Student Registration';
                subEl.innerText = currentLang === 'ar' ? 'أدخل بياناتك للتسجيل وسيتم إنشاء الـ ID الخاص بك آلياً' : 'Enter your details to generate your ID automatically';
            } else {
                loginBtn.className = 'btn btn-primary';
                regBtn.className = 'btn btn-outline';
                loginForm.style.display = 'block';
                regForm.style.display = 'none';
                titleEl.innerText = currentLang === 'ar' ? 'تسجيل الدخول إلى LMS' : 'LMS Login';
                subEl.innerText = currentLang === 'ar' ? 'أدخل الـ ID الخاص بك للوصول لمنصة التعلم' : 'Enter your ID to access the platform';
            }
        }

        async function handleRegisterStudent(e) {
            e.preventDefault();
            const name = (document.getElementById('reg-name').value || '').trim();
            const officialEmail = (document.getElementById('reg-official-email').value || '').trim();
            const email = (document.getElementById('reg-email').value || '').trim();
            const phone = (document.getElementById('reg-phone').value || '').trim();
            const seatNumber = (document.getElementById('reg-seat').value || '').trim();
            const level = (document.getElementById('reg-level').value || '').trim();
            const program = (document.getElementById('reg-program').value || '').trim();
            const password = (document.getElementById('reg-password').value || '').trim();

            if (!name) { alert(currentLang === 'ar' ? 'الاسم مطلوب.' : 'Name is required.'); return; }
            if (!password || password.length < 4) { alert(currentLang === 'ar' ? 'كلمة المرور يجب أن تكون 4 خانات على الأقل.' : 'Password must be at least 4 characters.'); return; }

            try {
                const res = await apiRequest('/api/auth/register', 'POST', {
                    name,
                    official_email: officialEmail || null,
                    email: email || null,
                    phone: phone || null,
                    seat_number: seatNumber || null,
                    academic_level: level || null,
                    program: program || null,
                    password
                });
                alert(currentLang === 'ar'
                    ? `✅ تم إنشاء حسابك بنجاح!\nالـ ID الخاص بك: ${res.user.id}\nاحتفظ بهذا الرقم للدخول.`
                    : `✅ Account created successfully!\nYour ID: ${res.user.id}\nSave this ID to log in.`
                );
                switchAuthTab('login');
                document.getElementById('login-id').value = res.user.id;
            } catch (err) {
                alert(err.message || (currentLang === 'ar' ? 'حدث خطأ أثناء التسجيل.' : 'Registration failed.'));
            }
        }

        window.adminCrewList = [];
        window.adminCrewSessionAttendanceMap = {};

        function renderAdminCrewTable() {
            const tbody = document.getElementById('admin-crew-attendance-tbody');
            if (!tbody) return;
            const sessId = document.getElementById('admin-crew-session-select').value;
            if (!sessId) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'يرجى اختيار السيشن أولاً' : 'Please select a session first'}</td></tr>`;
                document.getElementById('admin-crew-present-count-badge').innerText = currentLang === 'ar' ? 'الحضور: 0' : 'Present: 0';
                return;
            }
            if (window.adminCrewList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد أعضاء فريق.' : 'No crew members found.'}</td></tr>`;
                return;
            }
            
            const attMap = window.adminCrewSessionAttendanceMap || {};
            tbody.innerHTML = window.adminCrewList.map(s => {
                const status = attMap[s.id] ? attMap[s.id].toLowerCase() : 'absent';
                return `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.name}</td>
                    <td><span class="badge" style="background: var(--accent-indigo);">${translateRole(s.role)}</span></td>
                    <td>
                        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                            <label style="margin: 0; cursor: pointer; color: #34d399; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                <input type="radio" name="crew-att-${s.id}" value="present" ${status === 'present' ? 'checked' : ''} onchange="handleAdminCrewAutoSave('${s.id}', 'present')"> ${currentLang === 'ar' ? 'حاضر (P)' : 'Present'}
                            </label>
                            <label style="margin: 0; cursor: pointer; color: #f43f5e; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                <input type="radio" name="crew-att-${s.id}" value="absent" ${status === 'absent' ? 'checked' : ''} onchange="handleAdminCrewAutoSave('${s.id}', 'absent')"> ${currentLang === 'ar' ? 'غائب (A)' : 'Absent'}
                            </label>
                            <label style="margin: 0; cursor: pointer; color: #fbbf24; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                <input type="radio" name="crew-att-${s.id}" value="excused" ${status === 'excused' ? 'checked' : ''} onchange="handleAdminCrewAutoSave('${s.id}', 'excused')"> ${currentLang === 'ar' ? 'مستأذن (E)' : 'Excused'}
                            </label>
                        </div>
                    </td>
                </tr>`;
            }).join('');
            
            updateAdminCrewPresentCount();
        }

        function updateAdminCrewPresentCount() {
            let presentCount = 0;
            const attMap = window.adminCrewSessionAttendanceMap || {};
            window.adminCrewList.forEach(s => {
                if (attMap[s.id] === 'present') presentCount++;
            });
            const badge = document.getElementById('admin-crew-present-count-badge');
            if (badge) {
                badge.innerText = (currentLang === 'ar' ? 'الحضور: ' : 'Present: ') + presentCount;
            }
        }

        async function handleAdminCrewAutoSave(crewId, status) {
            const sessId = document.getElementById('admin-crew-session-select').value;
            if (!sessId) return;

            try {
                const res = await apiRequest('/api/hr/attendance/single', 'POST', {
                    session_id: parseInt(sessId),
                    student_id: crewId,
                    status: status.toLowerCase()
                });
                
                window.adminCrewSessionAttendanceMap[crewId] = status.toLowerCase();
                updateAdminCrewPresentCount();
                showToast(res.message || (currentLang === 'ar' ? 'تم الحفظ' : 'Saved'));
            } catch (err) { alert(err.message); }
        }

        function handleDownloadCrewAttendanceExcel() {
            const sessId = document.getElementById('admin-crew-session-select').value;
            if (!sessId) {
                alert(currentLang === 'ar' ? 'الرجاء اختيار سيشن أولاً' : 'Please select a session first');
                return;
            }
            window.open(`/api/admin/crew-attendance/export-excel/${sessId}?token=${encodeURIComponent(currentToken)}`, '_blank');
        }

        async function handleAdminRegisterCrew(e) {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const officialEmail = document.getElementById('reg-official-email').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const seatNumber = document.getElementById('reg-seat').value.trim();
            const academicLevel = document.getElementById('reg-level').value.trim();
            const program = document.getElementById('reg-program').value.trim();
            const password = document.getElementById('reg-password').value.trim();

            const alertEl = document.getElementById('login-alert');
            alertEl.style.display = 'none';

            try {
                const res = await apiRequest('/api/auth/register', 'POST', {
                    name,
                    official_email: officialEmail,
                    email,
                    phone,
                    seat_number: seatNumber,
                    academic_level: academicLevel,
                    program,
                    password
                });
                alert(res.message);
                currentToken = res.token;
                localStorage.setItem('lms_token', currentToken);
                checkAuth();
            } catch (err) {
                alertEl.innerText = err.message;
                alertEl.style.display = 'block';
            }
        }

        function openAdminEditUserModal(targetUserId) {
            if (!window.allAdminUsers) return;
            const u = window.allAdminUsers.find(x => x.id === targetUserId);
            if (!u) return;

            document.getElementById('ae-original-id').value = u.id || '';
            document.getElementById('ae-id').value = u.id || '';
            document.getElementById('ae-name').value = u.name || '';
            document.getElementById('ae-email').value = u.email || '';
            document.getElementById('ae-official-email').value = u.official_email || '';
            document.getElementById('ae-phone').value = u.phone || '';
            document.getElementById('ae-seat').value = u.seat_number || '';
            document.getElementById('ae-level').value = u.academic_level || '';
            document.getElementById('ae-program').value = u.program || '';
            document.getElementById('ae-bio').value = u.bio || '';

            const uRoles = u.roles || (u.role ? u.role.split(',').map(r => r.trim()) : ['student']);
            document.querySelectorAll('input[name="ae-role-cb"]').forEach(cb => {
                cb.checked = uRoles.includes(cb.value);
            });

            openModal('admin-edit-user-modal');
        }

        async function handleAdminUpdateUserProfile(e) {
            e.preventDefault();
            const targetUserId = document.getElementById('ae-original-id').value;
            const newUserId = document.getElementById('ae-id').value.trim();
            const name = document.getElementById('ae-name').value.trim();
            const email = document.getElementById('ae-email').value.trim();
            const officialEmail = document.getElementById('ae-official-email').value.trim();
            const phone = document.getElementById('ae-phone').value.trim();
            const seatNumber = document.getElementById('ae-seat').value.trim();
            const academicLevel = document.getElementById('ae-level').value.trim();
            const program = document.getElementById('ae-program').value.trim();
            const bio = document.getElementById('ae-bio').value.trim();

            const selectedRoles = Array.from(document.querySelectorAll('input[name="ae-role-cb"]:checked')).map(cb => cb.value);

            if (selectedRoles.length === 0) {
                alert(currentLang === 'ar' ? 'يرجى اختيار رول واحد على الأقل للمستخدم!' : 'Please select at least one role for the user!');
                return;
            }

            try {
                const res = await apiRequest('/api/admin/users/update-profile', 'POST', {
                    target_user_id: targetUserId,
                    new_user_id: newUserId,
                    name,
                    email,
                    official_email: officialEmail,
                    phone,
                    seat_number: seatNumber,
                    academic_level: academicLevel,
                    program,
                    roles: selectedRoles,
                    bio
                });
                alert(res.message);
                closeModal('admin-edit-user-modal');
                loadAdminDashboard();
            } catch (err) { alert(err.message); }
        }

        async function openAdminDatabaseViewModal() {
            try {
                const res = await apiRequest('/api/admin/database-view');
                const tbody = document.getElementById('admin-db-view-tbody');
                const records = res.records || [];
                if (records.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--text-muted);">لا توجد بيانات بداخل الداتابيز.</td></tr>';
                } else {
                    tbody.innerHTML = records.map(r => `
                        <tr>
                            <td><strong>${r.id}</strong></td>
                            <td>${r.name}</td>
                            <td><span class="badge badge-${r.role}">${r.role}</span></td>
                            <td><small style="color:#38bdf8;">${r.official_email || '---'}</small></td>
                            <td><strong style="color:#fbbf24;">${r.phone || '---'}</strong></td>
                            <td>${r.seat_number || '---'}</td>
                            <td>${r.academic_level || '---'} (${r.program || '---'})</td>
                            <td>${r.assigned_supporter}</td>
                            <td>${r.assigned_hr}</td>
                            <td>${r.team_name}</td>
                            <td><small style="color:var(--text-muted);">${r.created_at}</small></td>
                        </tr>
                    `).join('');
                }
                openModal('admin-database-view-modal');
            } catch (err) { alert(err.message); }
        }

        function openUserChangePasswordModal() {
            document.getElementById('ucp-current').value = '';
            document.getElementById('ucp-new').value = '';
            document.getElementById('ucp-confirm').value = '';
            const alertBox = document.getElementById('user-change-pass-alert');
            if (alertBox) alertBox.style.display = 'none';
            openModal('user-change-password-modal');
        }

        async function handleUserManualChangePassword(e) {
            e.preventDefault();
            const currentPass = document.getElementById('ucp-current').value;
            const newPass = document.getElementById('ucp-new').value;
            const confirmPass = document.getElementById('ucp-confirm').value;
            const alertBox = document.getElementById('user-change-pass-alert');
            if (alertBox) alertBox.style.display = 'none';

            if (newPass === currentPass) {
                if (alertBox) {
                    alertBox.innerText = currentLang === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' : 'New password must be different from current password';
                    alertBox.style.display = 'block';
                }
                return;
            }

            if (newPass !== confirmPass) {
                if (alertBox) {
                    alertBox.innerText = currentLang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
                    alertBox.style.display = 'block';
                }
                return;
            }

            try {
                const res = await apiRequest('/api/auth/change-password', 'POST', {
                    current_password: currentPass,
                    new_password: newPass
                });
                alert(res.message);
                closeModal('user-change-password-modal');
            } catch (err) {
                alertBox.innerText = err.message;
                alertBox.style.display = 'block';
            }
        }

        function switchTab(viewId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));

            const targetSec = document.getElementById(viewId);
            if (targetSec) targetSec.classList.add('active');

            if (viewId === 'student-view') {
                document.getElementById('tab-student').classList.add('active');
                loadStudentDashboard();
            } else if (viewId === 'hr-view') {
                document.getElementById('tab-hr').classList.add('active');
                loadHrDashboard();
            } else if (viewId === 'media-view') {
                document.getElementById('tab-media').classList.add('active');
                loadMediaDashboard();
            } else if (viewId === 'supporter-view') {
                document.getElementById('tab-supporter').classList.add('active');
                loadSupporterDashboard();
            } else if (viewId === 'instructor-view') {
                document.getElementById('tab-instructor').classList.add('active');
                loadInstructorDashboard();
            } else if (viewId === 'admin-view') {
                document.getElementById('tab-admin').classList.add('active');
                loadAdminDashboard();
            } else if (viewId === 'cheating-view') {
                document.getElementById('tab-cheating').classList.add('active');
                loadCheatingDashboard();
            }
        }

        function openTAContactModal() {
            const s = window.currentSupporterDetails;
            if (!s) {
                alert(currentLang === 'ar' ? 'لم يتم تخصيص مساعد لك حتى الآن.' : 'No TA assigned to you yet.');
                return;
            }
            document.getElementById('ta-info-name').innerText = s.name;
            document.getElementById('ta-info-email').innerText = s.email;
            document.getElementById('ta-info-phone').innerText = s.phone || (currentLang === 'ar' ? 'غير مسجل' : 'Not specified');
            document.getElementById('ta-info-bio').innerText = s.bio || (currentLang === 'ar' ? 'لا توجد ملاحظات إضافية' : 'No additional bio');
            openModal('ta-contact-modal');
        }

        function openHRContactModal() {
            if (!currentUser || !currentUser.assigned_hr_name || currentUser.assigned_hr_name === 'غير معين') {
                alert(currentLang === 'ar' ? 'لم يتم تخصيص مسؤول HR لك حتى الآن.' : 'No HR assigned to you yet.');
                return;
            }
            document.getElementById('ta-info-name').innerText = currentUser.assigned_hr_name;
            document.getElementById('ta-info-email').innerText = currentUser.assigned_hr_email || (currentLang === 'ar' ? 'غير مسجل' : 'Not specified');
            document.getElementById('ta-info-phone').innerText = currentUser.assigned_hr_phone || (currentLang === 'ar' ? 'غير مسجل' : 'Not specified');
            document.getElementById('ta-info-bio').innerText = currentUser.assigned_hr_bio || (currentLang === 'ar' ? 'مسؤول غياب وإدارات الفرق' : 'HR Manager');
            openModal('ta-contact-modal');
        }

        async function loadStudentDashboard() {
            try {
                try {
                    const driveRes = await apiRequest('/api/settings/material-drive');
                    const btn = document.getElementById('student-drive-link-btn');
                    if (btn && driveRes.url) btn.href = driveRes.url;
                } catch (e) {}

                const dash = await apiRequest('/api/student/dashboard');
                const supporter = dash.user_info.assigned_supporter;
                window.currentSupporterDetails = supporter;
                
                const supNameContainer = document.getElementById('st-supporter-name');
                if (supporter && typeof supporter === 'object') {
                    supNameContainer.innerHTML = `
                        <div style="font-size: 1.1rem; color: #60a5fa;">${supporter.name}</div>
                        <button class="btn btn-outline" style="padding: 2px 10px; font-size: 0.8rem; margin-top: 6px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" onclick="openTAContactModal()">
                            📞 ${currentLang === 'ar' ? 'بيانات التواصل' : 'Contact Info'}
                        </button>
                    `;
                } else {
                    supNameContainer.innerText = currentLang === 'ar' ? 'غير معين' : 'Unassigned';
                }

                const hrNameContainer = document.getElementById('st-hr-name');
                if (currentUser && currentUser.assigned_hr_name && currentUser.assigned_hr_name !== 'غير معين') {
                    if (hrNameContainer) {
                        hrNameContainer.innerHTML = `
                            <div style="font-size: 1.1rem; color: #f43f5e;">${currentUser.assigned_hr_name}</div>
                            <button class="btn btn-outline" style="padding: 2px 10px; font-size: 0.8rem; margin-top: 6px; color: #fb7185; border-color: rgba(251, 113, 133, 0.4);" onclick="openHRContactModal()">
                                📞 ${currentLang === 'ar' ? 'بيانات التواصل' : 'Contact Info'}
                            </button>
                        `;
                    }
                } else if (hrNameContainer) {
                    hrNameContainer.innerText = currentLang === 'ar' ? 'غير معين' : 'Unassigned';
                }

                document.getElementById('st-attendance-rate').innerText = `${dash.attendance.rate}%`;
                document.getElementById('st-submissions-count').innerText = dash.submissions_count;

                loadLeaderboard();

                const tasks = await apiRequest('/api/student/tasks');
                const tasksContainer = document.getElementById('student-tasks-list');
                
                if (tasks.length === 0) {
                    tasksContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد تاسكات مطلوبة حالياً.' : 'No active tasks.'}</p>`;
                } else {
                    tasksContainer.innerHTML = tasks.map(t => {
                        const hasSub = t.submission !== null;
                        const subId = hasSub ? t.submission.id : null;
                        const isExpiredNoSub = t.is_expired && !subId;

                        let badgeClass = 'badge-student';
                        let badgeText = currentLang === 'ar' ? 'مطلوب' : 'Pending';

                        if (hasSub && subId !== null) {
                            badgeClass = 'badge-supporter';
                            badgeText = currentLang === 'ar' ? 'تم التسليم' : 'Submitted';
                        } else if (t.is_expired) {
                            badgeClass = 'badge-admin';
                            badgeText = currentLang === 'ar' ? '⛔ انتهى الموعد (0)' : '⛔ Expired (0)';
                        }

                        return `
                        <div class="glass-card" style="margin-bottom: 16px; padding: 18px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <h4 style="font-size: 1.1rem;">${t.title}</h4>
                                <span class="badge ${badgeClass}">${badgeText}</span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">${t.description}</p>
                            ${t.reference_link ? `<div style="margin-bottom: 12px;"><a href="${t.reference_link}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-size: 0.9rem;">🔗 ${currentLang === 'ar' ? 'افتح رابط المهمة' : 'Open Task Link'}</a></div>` : ''}
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
                                <div>⏱️ ${currentLang === 'ar' ? 'الموعد النهائي:' : 'Deadline:'} <strong style="color: ${t.is_expired ? '#f43f5e' : '#38bdf8'};">${t.deadline.replace('T', ' ')}</strong></div>
                                <div>${currentLang === 'ar' ? 'الدرجة الكلية:' : 'Max Score:'} ${t.max_score}</div>
                            </div>
                            
                            ${hasSub ? `
                                <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: 10px; margin-top: 12px; font-size: 0.9rem; border: 1px solid var(--border-card);">
                                    <div style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 6px;">
                                        📅 <strong>${currentLang === 'ar' ? 'وقت التسليم الفعلي:' : 'Submitted At:'}</strong> ${t.submission.submitted_at}
                                    </div>
                                    ${t.submission.code_content ? `
                                        <div style="font-size: 0.85rem; color: #a78bfa; margin-bottom: 6px; word-break: break-all;">
                                            🔗 <strong>${currentLang === 'ar' ? 'رابط التسليم الحالي:' : 'Submitted Link:'}</strong> <a href="${t.submission.code_content}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${t.submission.code_content}</a>
                                        </div>
                                    ` : ''}
                                    <div><strong>${currentLang === 'ar' ? 'الدرجة المرصودة:' : 'Graded Score:'}</strong> 
                                        <span style="color: ${t.submission.score === 0 ? '#f43f5e' : '#34d399'}; font-weight: bold;">
                                            ${t.submission.score !== null ? t.submission.score + ' / ' + t.max_score : (currentLang === 'ar' ? 'في انتظار التقييم' : 'Pending Evaluation')}
                                        </span>
                                    </div>
                                    ${t.submission.feedback ? `<div style="color: ${t.submission.score === 0 ? '#f43f5e' : '#34d399'}; margin-top: 6px;"><strong>${currentLang === 'ar' ? 'ملاحظات:' : 'Feedback:'}</strong> ${t.submission.feedback}</div>` : ''}
                                </div>
                                ${!t.is_expired ? `
                                    <button class="btn btn-outline" style="margin-top: 12px; width: 100%; justify-content: center; color: var(--accent-cyan); border-color: rgba(56, 189, 248, 0.4);" onclick="openSubmitModal(${t.id}, '${t.title.replace(/'/g, "\\'")}', '${(t.submission.code_content || '').replace(/'/g, "\\'")}')">
                                        ✏️ ${currentLang === 'ar' ? 'تعديل رابط التسليم' : 'Edit Submission Link'}
                                    </button>
                                ` : ''}
                            ` : ''}

                            ${!hasSub && !t.is_expired ? `
                                <button class="btn btn-primary" style="margin-top: 14px; width: 100%; justify-content: center;" onclick="openSubmitModal(${t.id}, '${t.title.replace(/'/g, "\\'")}')">
                                    ${currentLang === 'ar' ? 'تقديم وتعميم كود الحل' : 'Submit Code Solution'}
                                </button>
                            ` : ''}

                            ${isExpiredNoSub ? `
                                <div class="alert alert-danger" style="margin-top: 14px; padding: 10px 14px; font-size: 0.85rem; text-align: center;">
                                    ⛔ ${currentLang === 'ar' ? 'انتهى الموعد النهائي وتم إغلاق التقديم تلقائياً (الدرجة: 0 / ' + t.max_score + ')' : 'Deadline Passed. Task Closed (Score: 0 / ' + t.max_score + ')'}
                                </div>
                            ` : ''}
                        </div>
                    `}).join('');
                }

                const sessions = await apiRequest('/api/sessions');
                const sessContainer = document.getElementById('student-sessions-list');
                if (sessions.length === 0) {
                    sessContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد سيشنات مجدولة حالياً.' : 'No scheduled sessions.'}</p>`;
                } else {
                    sessContainer.innerHTML = sessions.map(s => {
                        let attBadgeHtml = `<span class="badge" style="background: rgba(255,255,255,0.08); color: var(--text-muted);">${currentLang === 'ar' ? 'لم يُرصد بعد' : 'Not Recorded'}</span>`;
                        if (s.my_attendance === 'present') {
                            attBadgeHtml = `<span class="badge badge-supporter">✓ ${currentLang === 'ar' ? 'حاضر' : 'Present'}</span>`;
                        } else if (s.my_attendance === 'absent') {
                            attBadgeHtml = `<span class="badge badge-admin">✗ ${currentLang === 'ar' ? 'غائب' : 'Absent'}</span>`;
                        } else if (s.my_attendance === 'excused') {
                            attBadgeHtml = `<span class="badge badge-instructor">⏳ ${currentLang === 'ar' ? 'مستأذن' : 'Excused'}</span>`;
                        }

                        return `
                        <div style="background: rgba(15,23,42,0.5); border: 1px solid var(--border-card); padding: 14px; border-radius: 10px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="font-weight: bold; font-size: 1.05rem; color: var(--accent-cyan);">${s.title}</div>
                                ${attBadgeHtml}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">📅 ${currentLang === 'ar' ? 'التاريخ والوقت:' : 'Date & Time:'} ${s.date_time}</div>
                            ${s.location_or_link ? `<div style="font-size: 0.85rem; color: #a78bfa; margin-top: 4px;">📍 ${currentLang === 'ar' ? 'المكان/الرابط:' : 'Location/Link:'} ${s.location_or_link}</div>` : ''}
                        </div>
                    `;}).join('');
                }

                // Load Student Certificates
                try {
                    const certs = await apiRequest('/api/certificates');
                    const certsContainer = document.getElementById('student-certificates-container');
                    if (certs.length === 0) {
                        certsContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد شهادات صادرة لك حتى الآن.' : 'No certificates issued for you yet.'}</p>`;
                    } else {
                        certsContainer.innerHTML = certs.map(c => `
                            <div style="background: rgba(15,23,42,0.6); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border-card); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="color: var(--accent-cyan); font-size: 1rem;">📜 ${c.title}</strong>
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${currentLang === 'ar' ? 'بواسطة:' : 'By:'} ${c.uploader} | ${c.created_at}</div>
                                </div>
                                <a href="${c.file_path}" target="_blank" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.85rem; color: #22d3ee; border-color: rgba(34, 211, 238, 0.4);">
                                    📥 ${currentLang === 'ar' ? 'تحميل الشهادة' : 'Download Certificate'}
                                </a>
                            </div>
                        `).join('');
                    }
                } catch (e) { console.error(e); }

            } catch (err) { console.error(err); }
        }

        async function loadHrDashboard() {
            try {

                const allSessions = await apiRequest('/api/sessions');
                const sessions = allSessions.filter(s => s.is_hr_attendance_open);
                const sessSelectExcel = document.getElementById('hr-excel-session-select');
                const sessSelectManual = document.getElementById('hr-manual-session-select');
                const optionsHtml = '<option value="">-- ' + (currentLang === 'ar' ? 'اختر السيشن المفتوحة' : 'Select Open Session') + ' --</option>' + sessions.map(s => `
                    <option value="${s.id}">${s.title} (${s.date_time})</option>
                `).join('');
                
                if (sessSelectExcel) sessSelectExcel.innerHTML = optionsHtml;
                if (sessSelectManual) {
                    sessSelectManual.innerHTML = optionsHtml;
                    sessSelectManual.addEventListener('change', async function() {
                        const sessId = this.value;
                        if (!sessId) {
                            window.hrSessionAttendanceMap = {};
                            renderHrStudentsTable(window.hrAssignedStudents || []);
                            return;
                        }
                        try {
                            const res = await apiRequest(`/api/hr/attendance/${sessId}`);
                            if (res && res.success) {
                                window.hrSessionAttendanceMap = res.attendance || {};
                            } else {
                                window.hrSessionAttendanceMap = {};
                            }
                        } catch (e) {
                            window.hrSessionAttendanceMap = {};
                        }
                        filterHrStudentsTable();
                    });
                }

                const students = await apiRequest('/api/hr/assigned-students');
                window.hrAssignedStudents = students;
                
                const countBadge = document.getElementById('hr-students-count-badge');
                if (countBadge) {
                    countBadge.innerText = (currentLang === 'ar' ? 'الطلاب المسندين: ' : 'Assigned Students: ') + students.length;
                }

                renderHrStudentsTable(students);
            } catch (err) { console.error(err); }
        }


        function renderHrStudentsTable(students) {
            const tbody = document.getElementById('hr-students-table');
            if (!tbody) return;
            if (students.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد طلاب مسندين مطبق عليهم البحث.' : 'No assigned students found.'}</td></tr>`;
            } else {
                const attMap = window.hrSessionAttendanceMap || {};
                tbody.innerHTML = students.map(s => {
                    const status = attMap[s.id] ? attMap[s.id].toLowerCase() : 'absent';
                    return `
                    <tr>
                        <td><strong>${s.id}</strong></td>
                        <td>${s.name}</td>
                        <td>${s.seat_number || '-'}</td>
                        <td>
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                <label style="margin: 0; cursor: pointer; color: #34d399; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                    <input type="radio" name="att-status-${s.id}" value="present" ${status === 'present' ? 'checked' : ''} onchange="handleAutoSaveAttendance('${s.id}', 'present')"> ${currentLang === 'ar' ? 'حاضر (✓)' : 'Present'}
                                </label>
                                <label style="margin: 0; cursor: pointer; color: #f43f5e; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                    <input type="radio" name="att-status-${s.id}" value="absent" ${status === 'absent' ? 'checked' : ''} onchange="handleAutoSaveAttendance('${s.id}', 'absent')"> ${currentLang === 'ar' ? 'غائب (✗)' : 'Absent'}
                                </label>
                                <label style="margin: 0; cursor: pointer; color: #fbbf24; font-weight: normal; display: flex; align-items: center; gap: 4px;">
                                    <input type="radio" name="att-status-${s.id}" value="excused" ${status === 'excused' ? 'checked' : ''} onchange="handleAutoSaveAttendance('${s.id}', 'excused')"> ${currentLang === 'ar' ? 'مستأذن' : 'Excused'}
                                </label>
                    </div>
                        </td>
                    </tr>
                    `
                }).join('');
            }
            updateHrPresentCount();
        }

        function updateHrPresentCount() {
            const attMap = window.hrSessionAttendanceMap || {};
            let presentCount = 0;
            const students = window.hrAssignedStudents || [];
            students.forEach(s => {
                if (attMap[s.id] && attMap[s.id].toLowerCase() === 'present') {
                    presentCount++;
                }
            });
            const presentBadge = document.getElementById('hr-present-count-badge');
            if (presentBadge) {
                presentBadge.innerText = (currentLang === 'ar' ? 'الحضور: ' : 'Present: ') + presentCount;
            }
        }

        function filterHrStudentsTable() {
            const query = (document.getElementById('hr-students-search-input').value || '').toLowerCase().trim();
            if (!window.hrAssignedStudents) return;
            const filtered = window.hrAssignedStudents.filter(s => 
                (s.id && String(s.id).toLowerCase().includes(query)) ||
                (s.name && String(s.name).toLowerCase().includes(query)) ||
                (s.seat_number && String(s.seat_number).toLowerCase().includes(query))
            );
            renderHrStudentsTable(filtered);
        }

        async function handleQuickIdAttendance(e) {
            e.preventDefault();
            const sessId = document.getElementById('hr-manual-session-select').value;
            const inputEl = document.getElementById('hr-quick-id-input');
            const studentId = inputEl.value.trim();

            if (!sessId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار السيشن المراد رصد غيابها أولاً من القائمة أعلاه.' : 'Please select a session first from the dropdown above.');
                return;
            }
            if (!studentId) return;

            if (window.hrSessionAttendanceMap && window.hrSessionAttendanceMap[studentId] && window.hrSessionAttendanceMap[studentId].toLowerCase() === 'present') {
                alert(currentLang === 'ar' ? 'هذا الطالب مسجل حضور بالفعل في هذه السيشن!' : 'This student is already marked present in this session!');
                inputEl.value = '';
                inputEl.focus();
                return;
            }

            try {
                const res = await apiRequest('/api/hr/attendance/manual-id', 'POST', {
                    session_id: parseInt(sessId),
                    student_id: studentId
                });
                alert(res.message);
                
                if (!window.hrSessionAttendanceMap) {
                    window.hrSessionAttendanceMap = {};
                }
                window.hrSessionAttendanceMap[studentId] = 'present';
                updateHrPresentCount();
                filterHrStudentsTable();
                
                inputEl.value = ''; 
                inputEl.focus(); 
            } catch (err) {
                alert(err.message);
            }
        }

        async function handleAutoSaveAttendance(studentId, status) {
            const sessId = document.getElementById('hr-manual-session-select').value;
            if (!sessId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار السيشن المراد رصد غيابها أولاً.' : 'Please select a session first.');
                return;
            }

            try {
                const res = await apiRequest('/api/hr/attendance/single', 'POST', {
                    session_id: parseInt(sessId),
                    student_id: studentId,
                    status: status.toLowerCase()
                });
                
                // Update local map
                if (!window.hrSessionAttendanceMap) {
                    window.hrSessionAttendanceMap = {};
                }
                window.hrSessionAttendanceMap[studentId] = status.toLowerCase();
                updateHrPresentCount();
                
                showToast(res.message || (currentLang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'));
            } catch (err) { alert(err.message); }
        }





        async function loadMediaDashboard() {
            try {
                const students = await apiRequest('/api/hr/assigned-students').catch(() => []);
                const userSelect = document.getElementById('media-cert-user-select');
                userSelect.innerHTML = '<option value="">-- شهادة عامة للجميع --</option>' + students.map(s => `
                    <option value="${s.id}">${s.name} (${s.id})</option>
                `).join('');

                const certs = await apiRequest('/api/certificates');
                const tbody = document.getElementById('media-certs-table');
                if (certs.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">لا توجد شهادات مرفوعة حالياً.</td></tr>`;
                } else {
                    tbody.innerHTML = certs.map(c => `
                        <tr>
                            <td><strong>${c.title}</strong></td>
                            <td>${c.recipient ? c.recipient.name : 'عام للجميع'}</td>
                            <td>${c.created_at}</td>
                            <td>
                                <a href="${c.file_path}" target="_blank" class="btn btn-outline" style="padding: 2px 8px; font-size: 0.8rem;">معاينة</a>
                                <button class="btn btn-danger" style="padding: 2px 8px; font-size: 0.8rem;" onclick="handleDeleteCert(${c.id})">حذف</button>
                            </td>
                        </tr>
                    `).join('');
                }
            } catch (err) { console.error(err); }
        }

        async function handleUploadCertificate(e) {
            e.preventDefault();
            const title = document.getElementById('media-cert-title').value.trim();
            const userId = document.getElementById('media-cert-user-select').value;
            const fileInput = document.getElementById('media-cert-file');
            if (!title || fileInput.files.length === 0) return;

            const formData = new FormData();
            formData.append('title', title);
            if (userId) formData.append('user_id', userId);
            formData.append('file', fileInput.files[0]);

            try {
                const res = await fetch('/api/media/certificates/upload', {
                    method: 'POST',
                    headers: { 'X-Session-Token': currentToken },
                    body: formData
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.detail || 'فشل رفع الشهادة');
                alert(result.message);
                document.getElementById('media-cert-title').value = '';
                fileInput.value = '';
                loadMediaDashboard();
            } catch (err) { alert(err.message); }
        }

        async function handleDeleteCert(certId) {
            if (!confirm('هل أنت تأكد من حذف هذه الشهادة؟')) return;
            try {
                const res = await apiRequest(`/api/media/certificates/${certId}`, 'DELETE');
                alert(res.message);
                loadMediaDashboard();
            } catch (err) { alert(err.message); }
        }

        function renderSupporterStudentsTable(list) {
            const tbodyStudents = document.getElementById('supporter-students-table');
            if (!list || list.length === 0) {
                tbodyStudents.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد طلاب مسئول عنهم' : 'No assigned students'}</td></tr>`;
                return;
            }
            tbodyStudents.innerHTML = list.map(s => `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.seat_number || ''}</td>
                    <td>${s.email}</td>
                    <td><span style="color: var(--accent-emerald); font-weight: 500;">${s.phone || 'غير مسجل'}</span></td>
                    <td><span style="color: var(--accent-cyan); font-weight: bold;">${s.bonus_points || 0} pt</span></td>
                    <td>${s.submissions_count} ${currentLang === 'ar' ? 'تسليمات' : 'submissions'}</td>
                    <td>
                        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="handleAddBonusPoints('${s.id}')">+ / - نقاط</button>
                    </td>
                </tr>
            `).join('');
        }

        function filterSupporterStudentsTable() {
            const query = document.getElementById('supporter-students-search').value.toLowerCase();
            if (!window.supporterStudentsData) return;
            const filtered = window.supporterStudentsData.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.id.toLowerCase().includes(query) || 
                (s.seat_number && s.seat_number.toLowerCase().includes(query))
            );
            renderSupporterStudentsTable(filtered);
        }

        async function loadSupporterDashboard() {
            try {
                // Load unassigned students
                const unassigned = await apiRequest('/api/supporter/unassigned-students');
                const tbodyUnassigned = document.getElementById('supporter-unassigned-table');
                if (unassigned.length === 0) {
                    tbodyUnassigned.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد طلاب غير مخصصين حالياً' : 'No unassigned students'}</td></tr>`;
                } else {
                    tbodyUnassigned.innerHTML = unassigned.map(s => `
                        <tr>
                            <td><strong>${s.id}</strong></td>
                            <td>${s.name}</td>
                            <td>${s.email}</td>
                            <td>
                                <button class="btn btn-success" style="padding: 4px 10px; font-size: 0.8rem;" onclick="handleSelfAssignStudent('${s.id}')">
                                    + ${currentLang === 'ar' ? 'إسناد لحسابي (Max 20)' : 'Self Assign'}
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }

                const students = await apiRequest('/api/supporter/assigned-students');
                window.supporterStudentsData = students;
                filterSupporterStudentsTable();

                window.currentSubmissionsMap = {};
                const subs = await apiRequest('/api/supporter/submissions');
                const tbodySubs = document.getElementById('supporter-submissions-table');
                if (subs.length === 0) {
                    tbodySubs.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد تسليمات متاحة للمراجعة والتصحيح حالياً.' : 'No submissions available.'}</td></tr>`;
                } else {
                    tbodySubs.innerHTML = subs.map(s => {
                        window.currentSubmissionsMap[s.id] = s;
                        const isGraded = s.score !== null && s.score !== undefined;
                        const isAutoZero = s.is_auto_zero === true || s.can_grade === false;

                        return `
                        <tr>
                            <td><strong>${s.student_name}</strong> (${s.student_id})</td>
                            <td>${s.task_title}</td>
                            <td>${s.submitted_at}</td>
                            <td>
                                ${isAutoZero ? 
                                    `<span class="badge badge-admin">⛔ ${currentLang === 'ar' ? 'لم يُسلم (0 تلقائي)' : 'Auto-Zero (0)'}</span>` : 
                                    (isGraded ? 
                                        `<span class="badge badge-supporter">✅ ${currentLang === 'ar' ? 'تم التصحيح:' : 'Graded:'} ${s.score} / ${s.max_score}</span>` : 
                                        `<span class="badge badge-instructor">⏳ ${currentLang === 'ar' ? 'في انتظار التصحيح' : 'Pending'}</span>`
                                    )
                                }
                            </td>
                            <td>
                                ${isAutoZero ? `
                                    <button class="btn btn-outline" disabled style="opacity: 0.55; cursor: not-allowed; padding: 6px 12px; font-size: 0.85rem; color: #f43f5e; border-color: rgba(244, 63, 94, 0.3);">
                                        🚫 ${currentLang === 'ar' ? 'مغلق تلقائياً (0)' : 'Closed (0)'}
                                    </button>
                                ` : (isGraded ? `
                                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; color: #34d399; border-color: rgba(52, 211, 153, 0.4);" onclick="openGradeModalById(${s.id})">
                                        ✏️ ${currentLang === 'ar' ? 'تعديل التقييم' : 'Edit Score'}
                                    </button>
                                ` : `
                                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="openGradeModalById(${s.id})">
                                        ⚡ ${currentLang === 'ar' ? 'تصحيح وفحص الغش' : 'Grade & Anti-Cheat'}
                                    </button>
                                `)}
                            </td>
                        </tr>
                    `}).join('');
                }
            } catch (err) { console.error(err); }
        }

        async function handleSelfAssignStudent(studentId) {
            try {
                const res = await apiRequest(`/api/supporter/self-assign/${studentId}`, 'POST');
                alert(res.message);
                loadSupporterDashboard();
            } catch (err) { alert(err.message); }
        }

        async function handleDeleteTask(taskId) {
            if (!confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذه المهمة وكافة تسليماتها؟' : 'Delete this task and all its submissions?')) return;
            try {
                const res = await apiRequest(`/api/instructor/tasks/${taskId}`, 'DELETE');
                showToast(currentLang === 'ar' ? '✓ تم حذف المهمة' : '✓ Task deleted');
                loadInstructorDashboard();
            } catch (err) { alert(err.message); }
        }

        async function handleDeleteSession(sessionId) {
            if (!confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذه السيشن وسجلات غيابها؟' : 'Delete this session and its attendance records?')) return;
            try {
                const res = await apiRequest(`/api/instructor/sessions/${sessionId}`, 'DELETE');
                showToast(currentLang === 'ar' ? '✓ تم حذف السيشن' : '✓ Session deleted');
                loadInstructorDashboard();
            } catch (err) { alert(err.message); }
        }

        async function loadInstructorDashboard() {
            try {
                const tasks = await apiRequest('/api/instructor/tasks');
                const tasksContainer = document.getElementById('instructor-tasks-list');
                if (tasks.length === 0) {
                    tasksContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد مهمات مضافة بعد.' : 'No tasks created yet.'}</p>`;
                } else {
                    tasksContainer.innerHTML = tasks.map(t => `
                        <div style="background: rgba(15,23,42,0.5); border: 1px solid var(--border-card); padding: 14px 18px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-weight: bold; font-size: 1.1rem; color: var(--accent-cyan);">${t.title}</div>
                                ${t.reference_link ? `<div style="margin-top: 4px;"><a href="${t.reference_link}" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-size: 0.85rem;">🔗 الرابط المرجعي</a></div>` : ''}
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">⏱️ ${currentLang === 'ar' ? 'الديدلاين:' : 'Deadline:'} ${t.deadline.replace('T', ' ')} | 📥 ${currentLang === 'ar' ? 'التسليمات:' : 'Submissions:'} ${t.submissions_count}</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="handleEditDeadline(${t.id}, '${t.deadline}')">
                                    ✏️ ${currentLang === 'ar' ? 'تعديل الموعد' : 'Edit Deadline'}
                                </button>
                                <button class="btn btn-danger" style="padding: 4px 12px; font-size: 0.8rem;" onclick="handleDeleteTask(${t.id})">
                                    🗑️ ${currentLang === 'ar' ? 'حذف المهمة' : 'Delete Task'}
                                </button>
                            </div>
                        </div>
                    `).join('');
                }

                const sessions = await apiRequest('/api/sessions');
                const sessionsContainer = document.getElementById('instructor-sessions-list');
                if (sessions.length === 0) {
                    sessionsContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد سيشنات مجدولة بعد.' : 'No scheduled sessions yet.'}</p>`;
                } else {
                    sessionsContainer.innerHTML = sessions.map(s => `
                        <div style="background: rgba(15,23,42,0.5); border: 1px solid var(--border-card); padding: 14px 18px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-weight: bold; font-size: 1.1rem; color: var(--accent-emerald);">${s.title}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">📅 ${currentLang === 'ar' ? 'الموعد:' : 'Time:'} ${s.date_time}</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                ${(window.currentUser && window.currentUser.role && window.currentUser.role.includes('admin')) ? `
                                <button class="btn btn-${s.is_hr_attendance_open ? 'success' : 'outline'}" style="padding: 4px 12px; font-size: 0.8rem; ${!s.is_hr_attendance_open ? 'color: var(--accent-cyan); border-color: var(--accent-cyan);' : ''}" onclick="handleToggleHrSession(${s.id})">
                                    ${s.is_hr_attendance_open ? (currentLang === 'ar' ? 'إغلاق تسجيل HR' : 'Close HR') : (currentLang === 'ar' ? 'فتح تسجيل HR' : 'Open HR')}
                                </button>
                                ` : ''}
                                <button class="btn btn-danger" style="padding: 4px 12px; font-size: 0.8rem;" onclick="handleDeleteSession(${s.id})">
                                    🗑️ ${currentLang === 'ar' ? 'حذف السيشن' : 'Delete Session'}
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (err) { console.error(err); }
        }

        async function handleToggleHrSession(sessionId) {
            try {
                const res = await apiRequest(`/api/admin/sessions/${sessionId}/toggle-hr`, 'POST');
                showToast(res.message);
                loadInstructorDashboard(); // Refresh session list
                if (document.getElementById('admin-view').classList.contains('active') || document.getElementById('tab-admin').classList.contains('active')) {
                    loadAdminDashboard(); // Refresh admin list as well
                }
            } catch (err) { alert(err.message); }
        }


        function downloadAdminAttendanceSheet() {
            const selectEl = document.getElementById('admin-download-session-select') || document.getElementById('admin-student-session-select');
            const sessId = selectEl ? selectEl.value : '';
            if (!sessId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار السيشن أولاً.' : 'Please select a session first.');
                return;
            }
            const token = localStorage.getItem('lms_token') || '';
            window.open(`/api/admin/attendance/export-excel/${sessId}?token=${encodeURIComponent(token)}`, '_blank');
        }

        function renderAdminStudentsTable(students) {
            const tbody = document.getElementById('admin-students-table');
            if (!tbody) return;
            const attMap = window.adminSessionAttendanceMap || {};
            if (students.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">لا يوجد طلاب مسجلين بالنظام.</td></tr>`;
                return;
            }
            tbody.innerHTML = students.map(s => {
                const status = attMap[s.id] ? attMap[s.id].toLowerCase() : 'absent';
                return `<tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.seat_number || '-'}</td>
                    <td>
                        <label class="toggle-switch">
                            <input type="checkbox" ${status === 'present' ? 'checked' : ''} onchange="handleAdminAutoSaveAttendance('${s.id}', this.checked ? 'present' : 'absent')">
                            <span class="slider"></span>
                        </label>
                        <span style="font-size: 0.8rem; margin-left: 8px; color: ${status === 'present' ? '#34d399' : 'var(--text-muted)'}">
                            ${status === 'present' ? 'حاضر' : 'غائب'}
                        </span>
                    </td>
                </tr>`;
            }).join('');
            updateAdminPresentCount();
        }

        function updateAdminPresentCount() {
            const attMap = window.adminSessionAttendanceMap || {};
            const students = window.adminAllStudents || [];
            let presentCount = 0;
            students.forEach(s => { if (attMap[s.id] && attMap[s.id].toLowerCase() === 'present') presentCount++; });
            const pb = document.getElementById('admin-present-count-badge');
            if (pb) pb.innerText = 'الحضور: ' + presentCount;
            const tb = document.getElementById('admin-students-count-badge');
            if (tb) tb.innerText = 'إجمالي الطلاب: ' + students.length;
        }

        function filterAdminStudentsTable() {
            const query = (document.getElementById('admin-students-search-input').value || '').toLowerCase().trim();
            if (!window.adminAllStudents) return;
            const filtered = window.adminAllStudents.filter(s =>
                (s.id && String(s.id).toLowerCase().includes(query)) ||
                (s.name && String(s.name).toLowerCase().includes(query)) ||
                (s.seat_number && String(s.seat_number).toLowerCase().includes(query)) ||
                (s.email && String(s.email).toLowerCase().includes(query))
            );
            renderAdminStudentsTable(filtered);
        }

        async function handleAdminQuickIdAttendance(e) {
            e.preventDefault();
            const sessId = document.getElementById('admin-student-session-select').value;
            const inputEl = document.getElementById('admin-quick-id-input');
            const studentId = inputEl.value.trim();
            if (!sessId) { alert('يرجى اختيار السيشن أولاً.'); return; }
            if (!studentId) return;
            if (window.adminSessionAttendanceMap && window.adminSessionAttendanceMap[studentId] && window.adminSessionAttendanceMap[studentId].toLowerCase() === 'present') {
                alert('هذا الطالب مسجل حضور بالفعل في هذه السيشن!');
                inputEl.value = '';
                inputEl.focus();
                return;
            }
            try {
                const res = await apiRequest('/api/hr/attendance/manual-id', 'POST', {
                    session_id: parseInt(sessId),
                    student_id: studentId
                });
                alert(res.message);
                if (!window.adminSessionAttendanceMap) window.adminSessionAttendanceMap = {};
                window.adminSessionAttendanceMap[studentId] = 'present';
                filterAdminStudentsTable();
                inputEl.value = '';
                inputEl.focus();
            } catch (err) { alert(err.message); }
        }

        async function handleAdminAutoSaveAttendance(studentId, status) {
            const sessId = document.getElementById('admin-student-session-select').value;
            if (!sessId) { alert('يرجى اختيار السيشن أولاً.'); return; }
            try {
                const res = await apiRequest('/api/hr/attendance/single', 'POST', {
                    session_id: parseInt(sessId),
                    student_id: studentId,
                    status: status
                });
                if (!window.adminSessionAttendanceMap) window.adminSessionAttendanceMap = {};
                window.adminSessionAttendanceMap[studentId] = status.toLowerCase();
                updateAdminPresentCount();
                showToast(res.message || 'تم الحفظ بنجاح');
            } catch (err) { alert(err.message); }
        }


        async function loadAdminDashboard() {
            try {
                try {

                    const driveRes = await apiRequest('/api/settings/material-drive');
                    const dInput = document.getElementById('admin-drive-url-input');
                    if(dInput) dInput.value = driveRes.url || '';
                } catch (e) {}

                try {
                    const cheatRes = await apiRequest('/api/settings/cheating');
                    const toggle = document.getElementById('admin-cheating-toggle');
                    const statusText = document.getElementById('admin-cheating-status-text');
                    if (toggle) {
                        toggle.checked = cheatRes.enabled;
                        if (statusText) statusText.innerText = cheatRes.enabled ? (currentLang === 'ar' ? 'مفعل' : 'Enabled') : (currentLang === 'ar' ? 'معطل' : 'Disabled');
                    }
                } catch (e) {}
                
                // Fetch System Stats
                try {
                    const stats = await apiRequest('/api/admin/system-stats');
                    window.latestSystemStats = stats;
                    const c = stats.counts || {};
                    if (document.getElementById('admin-stat-students')) document.getElementById('admin-stat-students').innerText = c.students || 0;
                    if (document.getElementById('admin-stat-supporters')) document.getElementById('admin-stat-supporters').innerText = c.supporters || 0;
                    if (document.getElementById('admin-stat-instructors')) document.getElementById('admin-stat-instructors').innerText = c.instructors || 0;
                    if (document.getElementById('admin-stat-hr')) document.getElementById('admin-stat-hr').innerText = c.hr || 0;
                    if (document.getElementById('admin-stat-media')) document.getElementById('admin-stat-media').innerText = c.media || 0;
                    if (document.getElementById('admin-stat-admins')) document.getElementById('admin-stat-admins').innerText = c.admins || 0;
                    if (document.getElementById('admin-stat-teams')) document.getElementById('admin-stat-teams').innerText = c.teams || 0;
                    if (document.getElementById('admin-stat-certificates')) document.getElementById('admin-stat-certificates').innerText = c.certificates || 0;
                    renderAdminRolesChart(c);
                } catch (e) { console.error(e); }

                // Fetch All Students for Admin Attendance Panel
                try {
                    const adminStudents = await apiRequest('/api/admin/students');
                    window.adminAllStudents = adminStudents;
                    window.adminSessionAttendanceMap = {};
                    renderAdminStudentsTable(adminStudents);

                    const sessionsForAdmin = await apiRequest('/api/sessions');
                    const sessionOptions = '<option value="">-- اختر السيشن --</option>' +
                        sessionsForAdmin.map(s => `<option value="${s.id}">${s.title} (${new Date(s.date_time).toLocaleDateString()})</option>`).join('');

                    const adminSessSelect = document.getElementById('admin-student-session-select');
                    if (adminSessSelect) {
                        adminSessSelect.innerHTML = sessionOptions;
                        adminSessSelect.addEventListener('change', async function() {
                            const sid = this.value;
                            window.adminSessionAttendanceMap = {};
                            if (sid) {
                                try {
                                    const res = await apiRequest(`/api/hr/attendance/${sid}`);
                                    if (res && res.success) window.adminSessionAttendanceMap = res.attendance || {};
                                } catch(e) {}
                            }
                            filterAdminStudentsTable();
                        });
                    }

                    const adminDownloadSelect = document.getElementById('admin-download-session-select');
                    if (adminDownloadSelect) {
                        adminDownloadSelect.innerHTML = sessionOptions;
                    }
                } catch (e) { console.error(e); }


                // Fetch Sessions for Admin Control
                const sessions = await apiRequest('/api/sessions');
                const adminSessionsContainer = document.getElementById('admin-sessions-list');
                if (adminSessionsContainer) {
                    if (sessions.length === 0) {
                        adminSessionsContainer.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد سيشنات مجدولة بعد.' : 'No scheduled sessions yet.'}</p>`;
                    } else {
                        adminSessionsContainer.innerHTML = sessions.map(s => `
                            <div style="background: rgba(15,23,42,0.5); border: 1px solid var(--border-card); padding: 14px 18px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <div>
                                    <div style="font-weight: bold; font-size: 1.1rem; color: var(--accent-emerald);">${s.title}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">📅 ${currentLang === 'ar' ? 'الموعد:' : 'Time:'} ${s.date_time}</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-${s.is_hr_attendance_open ? 'success' : 'outline'}" style="padding: 4px 12px; font-size: 0.8rem; ${!s.is_hr_attendance_open ? 'color: var(--accent-cyan); border-color: var(--accent-cyan);' : ''}" onclick="handleToggleHrSession(${s.id})">
                                        ${s.is_hr_attendance_open ? (currentLang === 'ar' ? 'إغلاق تسجيل HR' : 'Close HR') : (currentLang === 'ar' ? 'فتح تسجيل HR' : 'Open HR')}
                                    </button>
                                </div>
                            </div>
                        `).join('');
                    }
                }

                const users = await apiRequest('/api/admin/users');
                window.allAdminUsers = users;
                allSupportersList = users.filter(u => u.role === 'supporter' || u.role === 'instructor' || u.role === 'admin');

                window.adminCrewList = users.filter(u => u.role && (u.role.includes('admin') || u.role.includes('hr') || u.role.includes('media') || u.role.includes('supporter') || u.role.includes('instructor')));
                
                const crewSessSelect = document.getElementById('admin-crew-session-select');
                if (crewSessSelect) {
                    const optionsHtml = '<option value="">-- ' + (currentLang === 'ar' ? 'اختر السيشن' : 'Select Session') + ' --</option>' + sessions.map(s => `
                        <option value="${s.id}">${s.title} (${s.date_time})</option>
                    `).join('');
                    crewSessSelect.innerHTML = optionsHtml;
                    crewSessSelect.onchange = async function() {
                        const sessId = this.value;
                        if (!sessId) {
                            window.adminCrewSessionAttendanceMap = {};
                            renderAdminCrewTable();
                            return;
                        }
                        try {
                            const res = await apiRequest(`/api/hr/attendance/${sessId}`);
                            window.adminCrewSessionAttendanceMap = res.attendance || {};
                            renderAdminCrewTable();
                        } catch (err) { alert(err.message); }
                    };
                }
                renderAdminCrewTable();

                renderAdminUsersTable(users);
            } catch (err) { console.error(err); }
        }

        function openStatsDetailModal(cat) {
            if (!window.latestSystemStats) return;
            const stats = window.latestSystemStats;
            const titleEl = document.getElementById('stats-detail-modal-title');
            const theadEl = document.getElementById('stats-detail-modal-thead');
            const tbodyEl = document.getElementById('stats-detail-modal-tbody');

            const catTitles = {
                admin: currentLang === 'ar' ? '👑 قائمة الأدمنز الحالية' : '👑 Current Admins List',
                instructor: currentLang === 'ar' ? '👨‍🏫 قائمة المدربين (Instructors)' : '👨‍🏫 Instructors List',
                supporter: currentLang === 'ar' ? '🛠️ قائمة المساعدين (Supporters)' : '🛠️ TAs / Supporters List',
                hr: currentLang === 'ar' ? '📋 قائمة مسؤولي الغياب (HR)' : '📋 HR Team List',
                media: currentLang === 'ar' ? '📸 قائمة مسؤولين الميديا (Media)' : '📸 Media Team List',
                student: currentLang === 'ar' ? '🎓 قائمة الطلاب (Students)' : '🎓 Students List',
                teams: currentLang === 'ar' ? '🏆 قائمة التيمات وأعضائها' : '🏆 Teams & Members List',
                certificates: currentLang === 'ar' ? '📜 قائمة الشهادات الصادرة' : '📜 Issued Certificates List'
            };

            titleEl.innerText = catTitles[cat] || (currentLang === 'ar' ? 'تفاصيل القائمة' : 'List Details');

            if (cat === 'teams') {
                theadEl.innerHTML = currentLang === 'ar'
                    ? '<th>ID الفريق</th><th>اسم الفريق</th><th>عدد الأعضاء</th><th>أسماء الأعضاء</th>'
                    : '<th>Team ID</th><th>Team Name</th><th>Members Count</th><th>Members List</th>';
                const teams = stats.teams || [];
                if (teams.length === 0) {
                    tbodyEl.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد تيمات بعد.' : 'No teams found.'}</td></tr>`;
                } else {
                    tbodyEl.innerHTML = teams.map(t => `
                        <tr>
                            <td><strong>${t.id}</strong></td>
                            <td>${t.name}</td>
                            <td>${t.members_count}</td>
                            <td>${(t.members_names || []).join('، ') || (currentLang === 'ar' ? 'لا يوجد' : 'None')}</td>
                        </tr>
                    `).join('');
                }
            } else if (cat === 'certificates') {
                theadEl.innerHTML = currentLang === 'ar'
                    ? '<th>ID الشهادة</th><th>اسم الطالب</th><th>عنوان الشهادة</th><th>تاريخ الإصدار</th>'
                    : '<th>Cert ID</th><th>Student Name</th><th>Certificate Title</th><th>Issue Date</th>';
                const certs = stats.certificates || [];
                if (certs.length === 0) {
                    tbodyEl.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد شهادات صادرة بعد.' : 'No certificates issued yet.'}</td></tr>`;
                } else {
                    tbodyEl.innerHTML = certs.map(c => `
                        <tr>
                            <td><strong>${c.id}</strong></td>
                            <td>${c.student_name} (${c.student_id})</td>
                            <td>${c.title}</td>
                            <td>${c.issue_date}</td>
                        </tr>
                    `).join('');
                }
            } else {
                theadEl.innerHTML = currentLang === 'ar'
                    ? '<th>الرقم (ID) / رقم الجلوس</th><th>اسم المستخدم</th><th>رقم الموبايل</th><th>إيميل الكلية الرسمي</th><th>المستوى والتخصص</th>'
                    : '<th>ID / Seat No.</th><th>User Name</th><th>Mobile Phone</th><th>Official FCIS Email</th><th>Level & Program</th>';
                const users = (stats.details && stats.details[cat]) ? stats.details[cat] : [];
                if (users.length === 0) {
                    tbodyEl.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد مستخدمون في هذه الفئة.' : 'No users found in this category.'}</td></tr>`;
                } else {
                    tbodyEl.innerHTML = users.map(u => `
                        <tr>
                            <td><strong>${u.id}</strong> ${u.seat_number && u.seat_number !== u.id ? `<br><small style="color:var(--accent-cyan);">${currentLang === 'ar' ? 'جلوس' : 'Seat'}: ${u.seat_number}</small>` : ''}</td>
                            <td>${u.name} ${u.id === '2023170570' ? '<span class="badge badge-admin">Master Admin 👑</span>' : ''}</td>
                            <td><strong style="color:#fbbf24;">${u.phone || (currentLang === 'ar' ? 'غير مسجل' : 'Not Set')}</strong></td>
                            <td><small style="color:#38bdf8;">${u.official_email || u.email || '---'}</small></td>
                            <td>${u.academic_level || '---'} ${u.program ? `(${u.program})` : ''}</td>
                        </tr>
                    `).join('');
                }
            }

            openModal('admin-stats-detail-modal');
        }

        function renderAdminUsersTable(users) {
            const tbody = document.getElementById('admin-users-table');
            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد حسابات مطابقة للبحث.' : 'No matching users found.'}</td></tr>`;
                return;
            }

            const allHRList = (window.allAdminUsers || []).filter(x => x.role === 'hr' || x.role === 'admin');

            tbody.innerHTML = users.map(u => {
                const isStudent = u.role === 'student';
                return `
                <tr>
                    <td><strong>${u.id}</strong></td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>
                        <select onchange="handleRoleChange('${u.id}', this.value)" style="padding: 4px 8px; font-size: 0.85rem;">
                            <option value="student" ${u.role === 'student' ? 'selected' : ''}>${currentLang === 'ar' ? 'طالب (Student)' : 'Student'}</option>
                            <option value="hr" ${u.role === 'hr' ? 'selected' : ''}>${currentLang === 'ar' ? 'إتش آر (HR)' : 'HR'}</option>
                            <option value="media" ${u.role === 'media' ? 'selected' : ''}>${currentLang === 'ar' ? 'ميديا (Media)' : 'Media'}</option>
                            <option value="supporter" ${u.role === 'supporter' ? 'selected' : ''}>${currentLang === 'ar' ? 'سابورتر (TA)' : 'Supporter (TA)'}</option>
                            <option value="instructor" ${u.role === 'instructor' ? 'selected' : ''}>${currentLang === 'ar' ? 'انستراكتور (Instructor)' : 'Instructor'}</option>
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>${currentLang === 'ar' ? 'أدمن (Admin)' : 'Admin'}</option>
                        </select>
                    </td>
                    <td>
                        ${isStudent ? `
                            <select onchange="handleAssignSupporter('${u.id}', this.value)" style="padding: 4px 8px; font-size: 0.85rem; max-width: 140px;">
                                <option value="">${currentLang === 'ar' ? '-- بدون مساعد --' : '-- No TA --'}</option>
                                ${allSupportersList.map(sup => `<option value="${sup.id}" ${u.assigned_supporter_id === sup.id ? 'selected' : ''}>${sup.name}</option>`).join('')}
                            </select>
                        ` : `<span style="color: var(--text-muted);">${currentLang === 'ar' ? 'غير متاح (إدارة)' : 'N/A (Staff)'}</span>`}
                    </td>
                    <td>
                        ${isStudent ? `
                            <select onchange="handleAssignHR('${u.id}', this.value)" style="padding: 4px 8px; font-size: 0.85rem; max-width: 140px; border-color: #fb7185;">
                                <option value="">${currentLang === 'ar' ? '-- بدون HR --' : '-- No HR --'}</option>
                                ${allHRList.map(hr => `<option value="${hr.id}" ${u.assigned_hr_id === hr.id ? 'selected' : ''}>${hr.name}</option>`).join('')}
                            </select>
                        ` : `<span style="color: var(--text-muted);">${currentLang === 'ar' ? 'غير متاح (إدارة)' : 'N/A (Staff)'}</span>`}
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #38bdf8;" onclick="openAdminEditUserModal('${u.id}')">
                                ✏️ ${currentLang === 'ar' ? 'تعديل البيانات' : 'Edit Profile'}
                            </button>
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem; color: #fbbf24;" onclick="handleResetPassword('${u.id}')">
                                🔄 ${currentLang === 'ar' ? 'ريست الباسورد للـ ID' : 'Reset to ID'}
                            </button>
                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="handleDeleteUser('${u.id}', '${u.name}')">
                                🗑️ ${currentLang === 'ar' ? 'حذف الحساب' : 'Delete User'}
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        function showToast(msg) {
            let toast = document.getElementById('auto-save-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'auto-save-toast';
                toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(34, 197, 94, 0.95); color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.9rem; font-weight: bold; z-index: 9999; box-shadow: 0 6px 16px rgba(0,0,0,0.3); transition: opacity 0.3s;';
                document.body.appendChild(toast);
            }
            toast.innerText = msg;
            toast.style.opacity = '1';
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { toast.style.display = 'none'; }, 300);
            }, 2200);
        }

        async function handleAssignSupporter(studentId, supporterId) {
            try {
                const res = await apiRequest('/api/admin/assign-supporter', 'POST', {
                    student_id: studentId,
                    supporter_id: supporterId || null
                });
                showToast(currentLang === 'ar' ? '✓ تم إسناد المساعد تلقائياً' : '✓ Auto-assigned TA');
            } catch (err) { alert(err.message); loadAdminDashboard(); }
        }

        async function handleAssignHR(studentId, hrId) {
            try {
                const res = await apiRequest('/api/admin/assign-hr', 'POST', {
                    student_id: studentId,
                    hr_id: hrId || null
                });
                showToast(currentLang === 'ar' ? '✓ تم إسناد الـ HR تلقائياً' : '✓ Auto-assigned HR');
            } catch (err) { alert(err.message); loadAdminDashboard(); }
        }

        function openHrContactModal() {
            if (!currentUser) return;
            document.getElementById('hr-info-name').innerText = currentUser.assigned_hr_name || 'غير معين بعد';
            document.getElementById('hr-info-email').innerText = currentUser.assigned_hr_email || 'غير مسجل';
            document.getElementById('hr-info-phone').innerText = currentUser.assigned_hr_phone || 'غير مسجل';
            document.getElementById('hr-info-bio').innerText = currentUser.assigned_hr_bio || 'لا توجد ملاحظات من مسؤول الغياب.';
            openModal('hr-contact-modal');
        }

        async function openTaContactModal() {
            if (window.currentSupporterDetails) {
                openTAContactModal();
                return;
            }
            if (!currentUser || !currentUser.assigned_supporter_id) {
                alert(currentLang === 'ar' ? 'لم يتم إسناد مساعد (TA) لحسابك بعد.' : 'No TA assigned to your account yet.');
                return;
            }
            try {
                const res = await apiRequest('/api/student/supporter-info');
                document.getElementById('ta-info-name').innerText = res.name || '---';
                document.getElementById('ta-info-email').innerText = res.email || '---';
                document.getElementById('ta-info-phone').innerText = res.phone || '---';
                document.getElementById('ta-info-bio').innerText = res.bio || 'لا توجد ملاحظات';
                openModal('ta-contact-modal');
            } catch (err) { alert(err.message); }
        }

        function filterAdminUsersTable() {
            const query = (document.getElementById('admin-user-search-input').value || '').toLowerCase().trim();
            if (!window.allAdminUsers) return;
            const filtered = window.allAdminUsers.filter(u => 
                (u.id && String(u.id).toLowerCase().includes(query)) ||
                (u.name && String(u.name).toLowerCase().includes(query)) ||
                (u.email && String(u.email).toLowerCase().includes(query)) ||
                (u.role && String(u.role).toLowerCase().includes(query)) ||
                (u.seat_number && String(u.seat_number).toLowerCase().includes(query))
            );
            renderAdminUsersTable(filtered);
        }

        async function handleDownloadDBBackup() {
            try {
                const res = await fetch('/api/admin/backup-db', {
                    headers: { 'X-Session-Token': currentToken }
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.detail || 'فشل تنزيل ملف الـ Backup');
                    return;
                }
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lms_database_backup_${new Date().toISOString().slice(0,10)}.db`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) { alert(err.message); }
        }








        async function handleAssignSupporter(studentId, supporterId) {
            try {
                const res = await apiRequest('/api/admin/assign-supporter', 'POST', {
                    student_id: studentId,
                    supporter_id: supporterId || null
                });
                alert(res.message);
                loadAdminDashboard();
            } catch (err) { alert(err.message); }
        }

        // CODEGUARD ANTI-CHEATING DASHBOARD
        async function loadCheatingDashboard() {
            try {
                const tasks = await apiRequest('/api/instructor/tasks');
                const select = document.getElementById('cheating-task-select');
                select.innerHTML = `<option value="">${currentLang === 'ar' ? '-- اختر المهمة للفحص --' : '-- Select Task --'}</option>` +
                    tasks.map(t => `<option value="${t.id}">${t.title} (${t.submissions_count} ${currentLang === 'ar' ? 'تسليمات' : 'subs'})</option>`).join('');
                
                if (tasks.length > 0) {
                    select.value = tasks[0].id;
                    loadCheatingTaskReports();
                }
            } catch (err) { console.error(err); }
        }

        async function loadCheatingTaskReports() {
            const taskId = document.getElementById('cheating-task-select').value;
            const container = document.getElementById('cheating-matrix-results');

            if (!taskId) {
                container.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'يرجى اختيار مهمة من القائمة للفحص.' : 'Please select a task.'}</p>`;
                return;
            }

            container.innerHTML = `<p style="color: var(--text-muted);">${currentLang === 'ar' ? 'جاري جلب وتحليل تقارير الانتحال والتشابه...' : 'Fetching plagiarism reports...'}</p>`;

            try {
                const reports = await apiRequest(`/api/plagiarism/reports/${taskId}`);
                if (reports.length === 0) {
                    container.innerHTML = `<div class="alert alert-success">${currentLang === 'ar' ? '✅ لم يتم العثور على أية انتحالات أو تشابهات ملحوظة لهذه المهمة حتى الآن.' : '✅ No plagiarism detected.'}</div>`;
                } else {
                    container.innerHTML = reports.map(r => `
                        <div class="glass-card" style="margin-bottom: 20px; border-left: 6px solid ${r.similarity_score > 50 ? 'var(--accent-rose)' : 'var(--accent-amber)'}">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                                <div>
                                    <h4 style="font-size: 1.1rem; color: var(--accent-cyan);">⚡ ${currentLang === 'ar' ? 'تقرير حالة تشابه برمجي' : 'Plagiarism Match Alert'}</h4>
                                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">Winnowing Fingerprint + Token LCS Match</div>
                                </div>
                                <div style="font-size: 1.4rem; font-weight: 800; color: ${r.similarity_score > 50 ? '#f43f5e' : '#fbbf24'}; background: rgba(0,0,0,0.3); padding: 4px 14px; border-radius: 8px;">
                                    ${r.similarity_score}% ${currentLang === 'ar' ? 'تشابه' : 'Match'}
                                </div>
                            </div>
                            
                            <!-- Detailed Comparison Cards for Student A and Student B -->
                            <div class="grid-2" style="gap: 12px; margin-bottom: 14px;">
                                <div style="background: rgba(15,23,42,0.6); padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-card);">
                                    <div style="font-weight: bold; font-size: 1rem; color: #60a5fa; margin-bottom: 6px;">
                                        👤 ${r.student_a.name} <small style="color:var(--text-muted);">(${r.student_a.id})</small>
                                    </div>
                                    <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
                                        <div><strong>${currentLang === 'ar' ? 'رقم الجلوس:' : 'Seat Number:'}</strong> ${r.student_a.seat_number || (currentLang === 'ar' ? 'غير مسجل' : 'Not set')}</div>
                                        <div><strong>${currentLang === 'ar' ? 'المساعد (TA) المسئول:' : 'Assigned TA:'}</strong> <span style="color: #60a5fa;">${r.student_a.supporter_name}</span></div>
                                        <div><strong>${currentLang === 'ar' ? 'مسؤول الغياب (HR):' : 'Assigned HR:'}</strong> <span style="color: #fb7185;">${r.student_a.hr_name}</span></div>
                                    </div>
                                </div>
                                <div style="background: rgba(15,23,42,0.6); padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-card);">
                                    <div style="font-weight: bold; font-size: 1rem; color: #f472b6; margin-bottom: 6px;">
                                        👤 ${r.student_b.name} <small style="color:var(--text-muted);">(${r.student_b.id})</small>
                                    </div>
                                    <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
                                        <div><strong>${currentLang === 'ar' ? 'رقم الجلوس:' : 'Seat Number:'}</strong> ${r.student_b.seat_number || (currentLang === 'ar' ? 'غير مسجل' : 'Not set')}</div>
                                        <div><strong>${currentLang === 'ar' ? 'المساعد (TA) المسئول:' : 'Assigned TA:'}</strong> <span style="color: #60a5fa;">${r.student_b.supporter_name}</span></div>
                                        <div><strong>${currentLang === 'ar' ? 'مسؤول الغياب (HR):' : 'Assigned HR:'}</strong> <span style="color: #fb7185;">${r.student_b.hr_name}</span></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Code Split -->
                            <div class="code-split">
                                <div class="code-box"><strong>${r.student_a.name}:</strong><br>${escapeHtml(r.code_a)}</div>
                                <div class="code-box"><strong>${r.student_b.name}:</strong><br>${escapeHtml(r.code_b)}</div>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (err) {
                container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
            }
        }

        async function runCheatingAnalysisOnSelectedTask() {
            const taskId = document.getElementById('cheating-task-select').value;
            if (!taskId) {
                alert(currentLang === 'ar' ? 'يرجى اختيار المهمة أولاً' : 'Please select a task first');
                return;
            }

            try {
                const res = await apiRequest(`/api/plagiarism/run-analysis/${taskId}`, 'POST');
                alert(res.message);
                loadCheatingTaskReports();
            } catch (err) { alert(err.message); }
        }

        async function handleRoleChange(userId, newRole) {
            try {
                await apiRequest('/api/admin/change-role', 'POST', { user_id: userId, new_role: newRole });
                showToast(currentLang === 'ar' ? `✓ تم تغيير دور ${userId} إلى ${newRole}` : `✓ Updated role of ${userId} to ${newRole}`);
            } catch (err) { alert(err.message); }
        }

        async function handleResetPassword(userId) {
            if (!confirm(currentLang === 'ar' ? `هل أنت تأكد من ريست كلمة مرور المستخدم ${userId} للـ ID؟` : `Reset password of ${userId} to ID?`)) return;
            const formData = new FormData();
            formData.append('user_id', userId);
            try {
                const res = await fetch('/api/admin/reset-password', {
                    method: 'POST',
                    headers: { 'X-Session-Token': currentToken },
                    body: formData
                });
                const result = await res.json();
                alert(result.message);
            } catch (err) { alert(err.message); }
        }

        async function handleDeleteUser(userId, userName) {
            if (!confirm(currentLang === 'ar' ? `هل أنت تأكد من حذف حساب ${userName} (${userId}) نهائياً؟` : `Delete account ${userName} (${userId}) permanently?`)) return;
            try {
                const res = await apiRequest(`/api/admin/users/${userId}`, 'DELETE');
                alert(res.message);
                loadAdminDashboard();
            } catch (err) { alert(err.message); }
        }

        async function fetchAdminStudentSubmissions() {
            const studentId = document.getElementById('admin-student-id-input').value.trim();
            if (!studentId) return;
            const tbody = document.getElementById('admin-student-submissions-tbody');
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</td></tr>`;
            try {
                const subs = await apiRequest(`/api/admin/student-submissions/${studentId}`);
                if (subs.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد تسليمات لهذا الطالب' : 'No submissions found'}</td></tr>`;
                } else {
                    tbody.innerHTML = subs.map(s => `
                        <tr>
                            <td>${escapeHtml(s.task_title)}</td>
                            <td><span style="font-size: 0.85rem; color: var(--text-muted);">${s.submitted_at}</span></td>
                            <td><span class="badge ${s.score === 'لم يتم التقييم' ? '' : 'badge-hr'}">${s.score}</span></td>
                            <td>
                                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteAdminStudentSubmission(${s.id})">🗑️ مسح</button>
                            </td>
                        </tr>
                    `).join('');
                }
            } catch (err) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--accent-red);">${err.message}</td></tr>`;
            }
        }

        async function deleteAdminStudentSubmission(subId) {
            if (!confirm(currentLang === 'ar' ? 'هل أنت متأكد من مسح هذا التسليم نهائياً؟' : 'Are you sure you want to delete this submission?')) return;
            try {
                const res = await apiRequest(`/api/admin/submissions/${subId}`, 'DELETE');
                showToast(res.message);
                fetchAdminStudentSubmissions();
            } catch (err) {
                alert(err.message);
            }
        }


        async function handleClearAllUsers() {
            if (!confirm(currentLang === 'ar' ? '⚠️ تحذير: هل أنت متأكد من حذف كافة حسابات النظام والإبقاء على حساب الأدمن الخاص بك فقط؟' : '⚠️ Warning: Are you sure you want to delete ALL user accounts?')) return;
            const pwd = prompt(currentLang === 'ar' ? 'تأكيد أمني: يرجى إدخال كلمة المرور الحالية للأدمن للمتابعة:' : 'Security Check: Please enter current admin password to proceed:');
            if (!pwd) return;
            try {
                const res = await fetch('/api/admin/users/all/clear', {
                    method: 'DELETE',
                    headers: {
                        'X-Session-Token': currentToken,
                        'X-Confirm-Password': pwd
                    }
                }).then(r => r.json());
                if (res.detail) throw new Error(res.detail);
                alert(res.message);
                loadAdminDashboard();
            } catch (err) { alert(err.message); }
        }



        async function handleSaveDriveUrl() {
            const url = document.getElementById('admin-drive-url-input').value;
            try {
                const res = await apiRequest('/api/settings/material-drive', 'POST', { url });
                alert(res.message || 'Saved successfully');
            } catch (err) {
                alert(err.message);
            }
        }

        async function handleToggleCheating() {
            const toggle = document.getElementById('admin-cheating-toggle');
            const statusText = document.getElementById('admin-cheating-status-text');
            const enabled = toggle.checked;
            
            try {
                const res = await apiRequest('/api/settings/cheating', 'POST', { enabled });
                if (statusText) statusText.innerText = enabled ? (currentLang === 'ar' ? 'مفعل' : 'Enabled') : (currentLang === 'ar' ? 'معطل' : 'Disabled');
                showToast(res.message || 'Saved successfully');
            } catch (err) {
                toggle.checked = !enabled; // revert on error
                alert(err.message);
            }
        }

        async function handleDeleteAllCheatingReports() {
            if (!confirm(currentLang === 'ar' ? 'هل أنت متأكد من رغبتك في مسح كافة تقارير الغش؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete all cheating reports? This cannot be undone.')) {
                return;
            }
            try {
                const res = await apiRequest('/api/settings/cheating/reports', 'DELETE');
                showToast(res.message || 'Deleted successfully');
            } catch (err) {
                alert(err.message);
            }
        }

        function handleDownloadFullGradesExcel() {
            window.open(`/api/admin/grades-export-excel?token=${encodeURIComponent(localStorage.getItem('lms_token') || '')}`, '_blank');
        }

        async function handleAddBonusPoints(studentId) {
            const pointsStr = prompt(currentLang === 'ar' ? 'أدخل عدد النقاط لإضافتها أو خصمها (مثال: 10 أو -5):' : 'Enter points to add/subtract (e.g. 10 or -5):');
            if (!pointsStr) return;
            const points = parseFloat(pointsStr);
            if (isNaN(points)) {
                alert(currentLang === 'ar' ? 'الرجاء إدخال رقم صحيح.' : 'Please enter a valid number.');
                return;
            }
            try {
                const res = await apiRequest('/api/points/add', 'POST', { student_id: studentId, points_to_add: points });
                alert(res.message);
                
                const pointsModal = document.getElementById('manage-points-modal');
                if (pointsModal && pointsModal.classList.contains('open')) {
                    openManagePointsModal();
                }
                try { loadSupporterDashboard(); } catch(e) {}
                try { loadLeaderboard(); } catch(e) {}
            } catch (err) {
                alert(err.message);
            }
        }

        async function openManagePointsModal() {
            openModal('manage-points-modal');
            try {
                const list = await apiRequest('/api/students/all-bonus-list');
                window.managePointsData = list;
                filterManagePointsTable();
            } catch (err) {
                alert(err.message);
                closeModal('manage-points-modal');
            }
        }

        function renderManagePointsTable(list) {
            const tbody = document.getElementById('manage-points-tbody');
            if (!list || list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا يوجد طلاب.' : 'No students found.'}</td></tr>`;
                return;
            }
            tbody.innerHTML = list.map(s => `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.seat_number || ''} ${s.phone ? `<br><small style="color: var(--accent-emerald);">${s.phone}</small>` : ''}</td>
                    <td><span style="color: var(--accent-cyan); font-weight: bold;">${s.bonus_points || 0} pt</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="handleAddBonusPoints('${s.id}')">
                            + / - ${currentLang === 'ar' ? 'نقاط' : 'Points'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function filterManagePointsTable() {
            const query = document.getElementById('manage-points-search').value.toLowerCase();
            if (!window.managePointsData) return;
            const filtered = window.managePointsData.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.id.toLowerCase().includes(query) || 
                (s.seat_number && s.seat_number.toLowerCase().includes(query))
            );
            renderManagePointsTable(filtered);
        }

        function openSubmitModal(taskId, title, currentLink = '') {
            document.getElementById('sub-task-id').value = taskId;
            document.getElementById('sub-link').value = currentLink || ''; 
            document.getElementById('submit-modal-task-title').innerText = `${currentLang === 'ar' ? (currentLink ? 'تعديل رابط التسليم:' : 'تسليم مهمة:') : (currentLink ? 'Edit Submission Link:' : 'Submit Task:')} ${title}`;
            openModal('submit-task-modal');
        }

        async function handleCodeSubmission(e) {
            e.preventDefault();
            const taskId = parseInt(document.getElementById('sub-task-id').value);
            const submissionLink = document.getElementById('sub-link').value;

            try {
                const res = await apiRequest('/api/student/submit-task', 'POST', {
                    task_id: taskId,
                    submission_link: submissionLink
                });
                alert(currentLang === 'ar' ? 'تم التسليم بنجاح!' : 'Submitted Successfully!');
                closeModal('submit-task-modal');
                loadStudentDashboard();
            } catch (err) { alert(err.message); }
        }

        async function openAttendanceModal() {
            try {
                const sessions = await apiRequest('/api/sessions');
                let attended = 0, absent = 0, excused = 0, total = sessions.length;

                const tbody = document.getElementById('att-details-table');
                if (sessions.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد سيشنات مجدولة حتى الآن.' : 'No scheduled sessions.'}</td></tr>`;
                } else {
                    tbody.innerHTML = sessions.map(s => {
                        let statusText = `<span class="badge" style="background: rgba(255,255,255,0.08); color: var(--text-muted);">${currentLang === 'ar' ? 'لم يُرصد بعد' : 'Not Recorded'}</span>`;
                        if (s.my_attendance === 'present') {
                            attended++;
                            statusText = `<span class="badge badge-supporter">✓ ${currentLang === 'ar' ? 'حاضر' : 'Present'}</span>`;
                        } else if (s.my_attendance === 'absent') {
                            absent++;
                            statusText = `<span class="badge badge-admin">✗ ${currentLang === 'ar' ? 'غائب' : 'Absent'}</span>`;
                        } else if (s.my_attendance === 'excused') {
                            excused++;
                            statusText = `<span class="badge badge-instructor">⏳ ${currentLang === 'ar' ? 'مستأذن' : 'Excused'}</span>`;
                        }

                        return `
                            <tr>
                                <td><strong>${s.title}</strong></td>
                                <td>${s.date_time}</td>
                                <td>${s.location_or_link || '---'}</td>
                                <td>${statusText}</td>
                            </tr>
                        `;
                    }).join('');
                }

                const rate = total > 0 ? Math.round((attended / total) * 100) : 100;
                document.getElementById('att-details-summary').innerHTML = `
                    <div style="background: rgba(16,185,129,0.15); padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(16,185,129,0.3);">
                        <strong>نسبة الحضور الإجمالية:</strong> <span style="color: #34d399; font-weight: bold; font-size: 1.1rem;">${rate}%</span>
                    </div>
                    <div style="background: rgba(59,130,246,0.15); padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(59,130,246,0.3);">
                        <strong>عدد سيشنات الحضور:</strong> <span style="color: #60a5fa; font-weight: bold;">${attended} من أصل ${total}</span>
                    </div>
                    <div style="background: rgba(244,63,94,0.15); padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(244,63,94,0.3);">
                        <strong>عدد سيشنات الغياب:</strong> <span style="color: #f43f5e; font-weight: bold;">${absent}</span>
                    </div>
                `;

                openModal('attendance-details-modal');
            } catch (err) { alert(err.message); }
        }

        async function openSubmissionsModal() {
            try {
                const tasks = await apiRequest('/api/student/tasks');
                const submittedTasks = tasks.filter(t => t.submission !== null);
                const tbody = document.getElementById('sub-tasks-details-table');
                
                if (submittedTasks.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${currentLang === 'ar' ? 'لم تقم بتسليم أي تاسك حتى الآن.' : 'No submitted tasks yet.'}</td></tr>`;
                } else {
                    tbody.innerHTML = submittedTasks.map(t => `
                        <tr>
                            <td><strong>${t.title}</strong></td>
                            <td><code>${t.submission.file_name || 'solution.py'}</code></td>
                            <td>${t.submission.submitted_at}</td>
                            <td><strong style="color: ${t.submission.score === 0 ? '#f43f5e' : '#34d399'};">${t.submission.score !== null ? t.submission.score + ' / ' + t.max_score : (currentLang === 'ar' ? 'في انتظار التقييم' : 'Pending Evaluation')}</strong></td>
                            <td>${t.submission.feedback || (currentLang === 'ar' ? 'لا توجد ملاحظات' : 'No feedback')}</td>
                        </tr>
                    `).join('');
                }

                openModal('submitted-tasks-modal');
            } catch (err) { alert(err.message); }
        }

        function openGradeModalById(subId) {
            const s = (window.currentSubmissionsMap || {})[subId];
            if (!s) return;

            document.getElementById('grade-sub-id').value = s.id;
            document.getElementById('grade-student-info').innerText = `${currentLang === 'ar' ? 'تصحيح مهمة الطالب:' : 'Grading Task for:'} ${s.student_name}`;
            document.getElementById('grade-code-display').innerHTML = `<a href="${s.code_content || '#'}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${s.code_content || 'No link provided'}</a>`;
            document.getElementById('grade-score').value = s.score !== null && s.score !== undefined ? s.score : '';
            document.getElementById('grade-feedback').value = s.feedback || '';

            openModal('grade-modal');
        }

        async function handleGradeSubmit(e) {
            e.preventDefault();
            const subId = parseInt(document.getElementById('grade-sub-id').value);
            const score = parseFloat(document.getElementById('grade-score').value);
            const feedback = document.getElementById('grade-feedback').value;

            try {
                const res = await apiRequest('/api/supporter/grade', 'POST', {
                    submission_id: subId,
                    score: score,
                    feedback: feedback
                });
                alert(res.message);
                closeModal('grade-modal');
                loadSupporterDashboard();
            } catch (err) { alert(err.message); }
        }

        async function openSupportersProgressModal() {
            openModal('supporters-progress-modal');
            const container = document.getElementById('supporters-progress-container');
            container.innerHTML = 'جاري التحميل...';
            try {
                const res = await apiRequest('/api/instructor/supporters-progress');
                if (res.length === 0) {
                    container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">لا يوجد مساعدين مسجلين</p>';
                    return;
                }
                
                let html = '';
                res.forEach(supp => {
                    let tasksHtml = '';
                    if (supp.ungraded_tasks && supp.ungraded_tasks.length > 0) {
                        tasksHtml = '<ul style="margin-top: 10px; padding-right: 20px; color: var(--text-muted); font-size: 0.9rem;">';
                        supp.ungraded_tasks.forEach(t => {
                            let studentsList = (t.ungraded_students && t.ungraded_students.length > 0) 
                                ? t.ungraded_students.map(s => `<div style="margin-bottom: 2px;">• ${s}</div>`).join('') 
                                : '';
                            let studentsHtml = studentsList ? `<div style="font-size: 0.85rem; color: var(--accent-rose); margin-top: 4px; padding-right: 10px;">${studentsList}</div>` : '';
                            tasksHtml += `<li style="margin-bottom: 8px;">تاسك: <strong>${t.task_title}</strong> (${t.ungraded_count} تسليم لم يصحح)${studentsHtml}</li>`;
                        });
                        tasksHtml += '</ul>';
                    } else if (supp.students_count > 0) {
                        tasksHtml = '<p style="margin-top: 10px; color: var(--accent-emerald); font-size: 0.9rem;">✅ جميع التاسكات مصححة</p>';
                    } else {
                        tasksHtml = '<p style="margin-top: 10px; color: var(--text-muted); font-size: 0.9rem;">لا يوجد طلاب مع هذا المساعد</p>';
                    }
                    
                    html += `
                    <div style="background: rgba(15, 23, 42, 0.5); padding: 16px; border-radius: 8px; border: 1px solid var(--border-card);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="color: var(--text-main); margin: 0;">${supp.supporter_name}</h4>
                            <span style="background: var(--accent-cyan); color: #000; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">
                                ${supp.students_count} طالب
                            </span>
                        </div>
                        ${tasksHtml}
                    </div>
                    `;
                });
                container.innerHTML = html;
            } catch (err) {
                container.innerHTML = `<p style="color: var(--accent-rose); text-align: center;">خطأ: ${err.message}</p>`;
            }
        }

        function openCreateTaskModal() {
            document.getElementById('ct-title').value = '';
            document.getElementById('ct-desc').value = '';
            document.getElementById('ct-deadline').value = '';
            document.getElementById('ct-max-score').value = '100';
            openModal('create-task-modal');
        }

        function openCreateSessionModal() {
            document.getElementById('cs-title').value = '';
            document.getElementById('cs-datetime').value = '';
            document.getElementById('cs-location').value = '';
            openModal('create-session-modal');
        }

        async function handleCreateTask(e) {
            e.preventDefault();
            const title = document.getElementById('ct-title').value;
            const description = document.getElementById('ct-desc').value;
            const link = document.getElementById('ct-link').value;
            const deadline = document.getElementById('ct-deadline').value;
            const maxScore = parseFloat(document.getElementById('ct-max-score').value);

            try {
                const res = await apiRequest('/api/instructor/tasks', 'POST', {
                    title, description, reference_link: link, deadline, max_score: maxScore
                });
                alert(res.message);
                closeModal('create-task-modal');
                loadInstructorDashboard();
            } catch (err) { alert(err.message); }
        }

        async function handleCreateSession(e) {
            e.preventDefault();
            const title = document.getElementById('cs-title').value;
            const dateTime = document.getElementById('cs-datetime').value;
            const location = document.getElementById('cs-location').value;

            try {
                const res = await apiRequest('/api/instructor/sessions', 'POST', {
                    title, date_time: dateTime, location_or_link: location
                });
                alert(res.message);
                closeModal('create-session-modal');
                loadInstructorDashboard();
            } catch (err) { alert(err.message); }
        }

        function openModal(id) { document.getElementById(id).classList.add('open'); }
        function closeModal(id) { document.getElementById(id).classList.remove('open'); }
        function escapeCode(str) { return (str || '').replace(/`/g, '\\`'); }
        function escapeHtml(str) { return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
        async function handleEditDeadline(id, currentDeadline) {
            let defaultVal = currentDeadline;
            if (defaultVal.includes('Z')) {
                defaultVal = defaultVal.replace('Z', '');
            }
            if (defaultVal.length === 19) {
                // Remove seconds
                defaultVal = defaultVal.substring(0, 16);
            }
            const newDateStr = prompt(currentLang === 'ar' ? 'أدخل موعد التسليم الجديد (YYYY-MM-DDTHH:MM):' : 'Enter new deadline (YYYY-MM-DDTHH:MM):', defaultVal);
            if (!newDateStr) return;
            
            // Format check
            if (!newDateStr.includes('T')) {
                alert(currentLang === 'ar' ? 'صيغة التاريخ غير صحيحة. استخدم YYYY-MM-DDTHH:MM' : 'Invalid format. Use YYYY-MM-DDTHH:MM');
                return;
            }

            try {
                const res = await apiRequest(`/api/instructor/tasks/${id}/deadline`, 'PUT', { new_deadline: newDateStr + ':00' });
                alert(res.message);
                loadInstructorDashboard();
            } catch (err) { alert(err.message); }
        }

        // Global Event Listeners for smooth modal close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('open');
            }
        });
