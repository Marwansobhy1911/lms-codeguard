import re

path = r'd:\repos\lms-codeguard\src\lms\api.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    idx = i + 1
    
    if idx == 19:
        line = line.replace('Team, ', '')
    elif idx == 20:
        continue
    elif 221 <= idx <= 247:
        continue
    elif idx in [543, 565, 710, 714, 767, 772, 1361, 1362]:
        continue
    elif idx in [583, 584, 818, 819]:
        continue
    elif 685 <= idx <= 691:
        continue
    elif idx == 771:
        line = line.replace(', "team_id": None', '')
    elif 1346 <= idx <= 1348:
        if idx == 1346:
            new_lines.append('        query = db.query(User).filter(User.assigned_hr_id == user.id)\n')
        continue
    elif 1363 <= idx <= 1364: # Might be split over two lines
        if idx == 1363:
            new_lines.append('            "hr_name": s.assigned_hr.name if s.assigned_hr else "??? ????"\n')
        continue
    elif 1664 <= idx <= 1665:
        continue
    elif 1712 <= idx <= 1722:
        continue
        
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('api.py fixed')
