import os

message = input('Enter message to commit: ')
if not message:
    print('message is unvalid')
    exit()

commands = [
    'git add .',
    f'git commit -m "{message}"',
    'git push origin main',
]

for cmd in commands:
    os.system(cmd)