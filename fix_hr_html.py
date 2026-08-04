path = r'd:\repos\lms-codeguard\src\lms\static\includes\views\hr.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
new_lines = lines[:3] + lines[31:]
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('hr.html cleaned')
