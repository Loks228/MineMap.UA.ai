import sqlite3

# Connect to database
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Check current created_at value
cursor.execute('SELECT username, created_at FROM users WHERE username = ?', ('LordLoks',))
user = cursor.fetchone()
if user:
    print(f"User {user[0]} current created_at: {user[1]}")
    
    # Update created_at value
    cursor.execute('UPDATE users SET created_at = ? WHERE username = ?', 
                   ('2023-05-03 12:17:45', 'LordLoks'))
    conn.commit()
    print("Updated created_at for LordLoks to '2023-05-03 12:17:45'")
else:
    print("User not found")

# Verify the update
cursor.execute('SELECT username, created_at FROM users WHERE username = ?', ('LordLoks',))
user = cursor.fetchone()
if user:
    print(f"User {user[0]} now has created_at: {user[1]}")
else:
    print("User not found")

# Close connection
conn.close() 