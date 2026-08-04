import re

path = r'd:\repos\lms-codeguard\src\lms\api.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

patterns = [
    r'@app\.(get|post)\(\"/api/system/team-settings\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/admin/team-settings\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/teams/create\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/teams/invite\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/invitations\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/invitations/\{inv_id\}/respond\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/unassigned-students\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/teams/leave\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/admin/teams/assign-hr\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/hr/teams/create\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/hr/teams\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/hr/teams/assign\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(delete)\(\"/api/hr/teams/\{team_id\}\"\)\ndef [\s\S]*?(?=\n@app|\Z)',
    r'@app\.(get|post)\(\"/api/student/team\"\)\ndef [\s\S]*?(?=\n@app|\Z)'
]

for pattern in patterns:
    content = re.sub(pattern, '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('api.py team endpoints removed')
