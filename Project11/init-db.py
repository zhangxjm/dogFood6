import sqlite3
import os

db_path = './database/ttc.db'
init_sql_path = './database/init.sql'

os.makedirs(os.path.dirname(db_path), exist_ok=True)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

with open(init_sql_path, 'r', encoding='utf-8') as f:
    sql_content = f.read()

statements = sql_content.split(';')

for stmt in statements:
    stmt = stmt.strip()
    if stmt and not stmt.startswith('--'):
        try:
            cursor.execute(stmt)
        except Exception as e:
            print(f"Warning: {e}")

conn.commit()
conn.close()

print("Database initialized successfully!")
