import sqlite3
import datetime
from pprint import pprint

# Connect to DB
conn = sqlite3.connect('minemap.db')
conn.row_factory = sqlite3.Row

# Get user data
cursor = conn.execute('SELECT * FROM users')
users = cursor.fetchall()

print("=== User Data ===")
for user in users:
    user_dict = {key: user[key] for key in user.keys()}
    print(f"\nUsername: {user_dict.get('username')}")
    print(f"ID: {user_dict.get('id')}")
    
    # Print created_at
    created_at = user_dict.get('created_at')
    if created_at:
        try:
            # Try to parse it as a datetime
            if isinstance(created_at, str):
                dt = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                print(f"Created At: {created_at} (parsed as: {dt.strftime('%d.%m.%Y %H:%M')})")
            else:
                print(f"Created At: {created_at} (type: {type(created_at)})")
        except Exception as e:
            print(f"Created At: {created_at} (Error parsing: {str(e)})")
    else:
        print("Created At: None")
    
    # Print avatar_url
    print(f"Avatar URL: {user_dict.get('avatar_url')}")

# Check column info
cursor = conn.execute('PRAGMA table_info(users)')
columns = cursor.fetchall()

print("\n=== User Table Schema ===")
for col in columns:
    print(f"Column {col[1]}: type={col[2]}, notnull={col[3]}, default={col[4]}")

conn.close() 