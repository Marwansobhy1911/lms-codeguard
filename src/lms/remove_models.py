import re

path = r'd:\repos\lms-codeguard\src\lms\models.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove Team model
content = re.sub(r'class Team\(Base\):[\s\S]*?(?=\nclass |\Z)', '', content)

# Remove TeamInvitationStatusEnum
content = re.sub(r'class TeamInvitationStatusEnum\(str, enum\.Enum\):[\s\S]*?(?=\nclass |\Z)', '', content)

# Remove TeamInvitation model
content = re.sub(r'class TeamInvitation\(Base\):[\s\S]*?(?=\nclass |\Z)', '', content)

# Remove User columns
content = re.sub(r'\s*team_id = Column\(Integer, ForeignKey\(\"teams\.id\"\), nullable=True\)', '', content)
content = re.sub(r'\s*team_role = Column\(String, nullable=True\)', '', content)
content = re.sub(r'\s*team = relationship\(\"Team\", foreign_keys=\[team_id\]\)', '', content)

# Remove SystemSettings team columns
content = re.sub(r'\s*is_team_registration_open = Column\(Boolean, default=False\)', '', content)
content = re.sub(r'\s*team_registration_deadline = Column\(DateTime, nullable=True\)', '', content)
content = re.sub(r'\s*max_students_per_team = Column\(Integer, default=5\)', '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('models.py updated')
