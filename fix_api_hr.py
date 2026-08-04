import re

path = r'd:\repos\lms-codeguard\src\lms\api.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'@app\.get\(\"/api/hr/unassigned-students\"\)\ndef get_hr_unassigned_students[\s\S]*?return res\n', '', content)
content = re.sub(r'@app\.post\(\"/api/hr/self-assign/\{student_id\}\"\)\ndef self_assign_student_hr[\s\S]*?return \{\"success\": True.*?\n', '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('api.py cleaned from HR unassigned')
