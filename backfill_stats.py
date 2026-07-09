import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv()
db_url = os.getenv('DATABASE_URL')
if not db_url:
    print('No DATABASE_URL')
    sys.exit(1)

import psycopg2, psycopg2.extras
conn = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)
cur = conn.cursor()

cur.execute('SELECT id, username FROM users')
users = cur.fetchall()

for u in users:
    uid = u['id']
    uname = u['username']

    cur.execute('SELECT COUNT(*) as cnt FROM sessions WHERE user_id = %s AND riepilogo IS NOT NULL', (uid,))
    paths = cur.fetchone()['cnt']

    cur.execute('SELECT COUNT(*) as cnt FROM sessions WHERE user_id = %s', (uid,))
    total_sessions = cur.fetchone()['cnt']

    cur.execute('''
        SELECT a.esito, COUNT(*) as cnt 
        FROM attempts a JOIN modules m ON a.module_id = m.id 
        JOIN sessions s ON m.session_id = s.id 
        WHERE s.user_id = %s 
        GROUP BY a.esito
    ''', (uid,))
    total_correct = 0
    total_wrong = 0
    for row in cur.fetchall():
        if row['esito'] == 'corretta':
            total_correct = row['cnt']
        else:
            total_wrong += row['cnt']

    cur.execute('''
        SELECT COUNT(*) as cnt FROM modules m 
        JOIN sessions s ON m.session_id = s.id 
        WHERE s.user_id = %s AND m.completed = 1
    ''', (uid,))
    modules_done = cur.fetchone()['cnt']

    xp = modules_done * 15 + paths * 25
    level = 1
    for i, t in enumerate([0, 50, 120, 220, 350, 520, 740, 1020, 1370, 1800]):
        if xp >= t:
            level = i + 1

    cur.execute('SELECT user_id FROM user_stats WHERE user_id = %s', (uid,))
    if cur.fetchone():
        cur.execute('''
            UPDATE user_stats SET 
                xp = %s, level = %s, total_paths_completed = %s, total_sessions = %s,
                total_correct = %s, total_wrong = %s, total_modules_completed = %s
            WHERE user_id = %s
        ''', (xp, level, paths, total_sessions, total_correct, total_wrong, modules_done, uid))
    else:
        cur.execute('''
            INSERT INTO user_stats (user_id, xp, level, total_paths_completed, total_sessions, total_correct, total_wrong, total_modules_completed)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (uid, xp, level, paths, total_sessions, total_correct, total_wrong, modules_done))

    print(f'{uname}: paths={paths}, sessions={total_sessions}, modules={modules_done}, correct={total_correct}, wrong={total_wrong}, xp={xp}')

conn.commit()
conn.close()
print('Backfill complete!')
