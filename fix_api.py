import re

path = r'd:\repos\lms-codeguard\src\lms\api.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('Task, Submission, PlagiarismReport, Team, Certificate, SystemSetting,', 'Task, Submission, PlagiarismReport, Certificate, SystemSetting,')
content = content.replace('TeamInvitation, TeamInvitationStatusEnum', '')

# 2. Pydantic Models (remove completely)
content = re.sub(r'class TeamCreateRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class AssignTeamRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class TeamSettingsUpdateRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class StudentJoinTeamRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class TeamInviteRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class TeamInviteRespondRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)
content = re.sub(r'class AssignTeamHRRequest\(BaseModel\):[\s\S]*?(?=\nclass |\Z)', '', content)

# 3. References in functions
content = re.sub(r'\s*\"team_name\":.*?,', '', content)
content = re.sub(r'\s*\"Team\":.*?,', '', content)
content = re.sub(r'\s*\"team_id\":.*?,', '', content)
content = re.sub(r'\"hr_name\": s\.team\.creator_hr\.name if \(s\.team and s\.team\.creator_hr\) else \(s\.assigned_hr\.name if s\.assigned_hr else \"??? ????\"\)', '\"hr_name\": s.assigned_hr.name if s.assigned_hr else \"??? ????\"', content)

content = re.sub(r'\s*if not hr_user and user\.team and user\.team\.creator_hr:.*?\n\s+hr_user = user\.team\.creator_hr', '', content)

content = re.sub(r'\s*teams = db\.query\(Team\)\.all\(\)[\s\S]*?\} for t in teams\]', '', content)
content = re.sub(r'\s*\"teams\": len\(teams_list\),', '', content)
content = re.sub(r'\s*\"teams\": teams_list,', '', content)

content = re.sub(r'\s*db\.query\(TeamInvitation\)\.delete\(\)', '', content)
content = content.replace('db.query(User).update({"assigned_supporter_id": None, "assigned_hr_id": None, "team_id": None})', 'db.query(User).update({"assigned_supporter_id": None, "assigned_hr_id": None})')
content = re.sub(r'\s*db\.query\(Team\)\.delete\(\)', '', content)

content = content.replace('query = db.query(User).join(Team, User.team_id == Team.id, isouter=True).filter(\n            or_(Team.hr_id == user.id, User.assigned_hr_id == user.id)\n        )', 'query = db.query(User).filter(User.assigned_hr_id == user.id)')

content = re.sub(r'\s*invites = db\.query\(TeamInvitation\)[\s\S]*?\}\)', '', content)
content = re.sub(r'\s*if u\.team_id:\n\s+badges\.append\(\"?? Team Captain\"\)', '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('api.py cleaned up')
