import sqlite3

# Connect to database
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Set the date to a specific value for LordLoks
cursor.execute('UPDATE users SET created_at = ? WHERE username = ?', 
               ('2023-05-03 12:17:45', 'LordLoks'))
conn.commit()
print("Updated LordLoks created_at to '2023-05-03 12:17:45'")

# Verify the update
cursor.execute('SELECT id, username, created_at FROM users')
users = cursor.fetchall()
for user in users:
    print(f"ID: {user[0]}, Username: {user[1]}, Created At: {user[2]}")

# Close connection
conn.close() 