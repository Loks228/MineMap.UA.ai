import sqlite3

# Connect to the database
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Check current user's created_at value
cursor.execute("SELECT id, username, created_at FROM users WHERE username = 'LordLoks'")
user = cursor.fetchone()

if user:
    user_id, username, created_at = user
    print(f"User {username} current created_at: {created_at}")
    
    if created_at:
        print("created_at already has a value, no need to update")
else:
        cursor.execute("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
        conn.commit()
        print(f"Updated created_at for user {username}")

# Verify the update
    cursor.execute("SELECT created_at FROM users WHERE id = ?", (user_id,))
    updated_created_at = cursor.fetchone()[0]
    print(f"User {username} now has created_at: {updated_created_at}")

# Add radius column to explosive_objects table
print("\nAdding 'radius' column to explosive_objects table...")

# Check if the column already exists
cursor.execute("PRAGMA table_info(explosive_objects)")
columns = cursor.fetchall()
column_names = [column[1] for column in columns]

if 'radius' not in column_names:
    # Add the radius column
    cursor.execute("ALTER TABLE explosive_objects ADD COLUMN radius INTEGER DEFAULT NULL")
    conn.commit()
    print("Column 'radius' added successfully.")
else:
    print("Column 'radius' already exists.")

# Initialize the radius values based on priority
print("Initializing radius values based on priority...")
cursor.execute("UPDATE explosive_objects SET radius = CASE "
               "WHEN priority = 'high' THEN 20000 "
               "WHEN priority = 'medium' THEN 15000 "
               "WHEN priority = 'low' THEN 10000 "
               "ELSE 15000 END "
               "WHERE radius IS NULL")
conn.commit()

# Verify the update
cursor.execute("SELECT id, title, priority, radius FROM explosive_objects")
objects = cursor.fetchall()
print(f"Updated {len(objects)} objects with default radius values:")
for obj in objects[:5]:  # Show first 5 as example
    print(f"ID: {obj[0]}, Title: {obj[1]}, Priority: {obj[2]}, Radius: {obj[3]}")

if len(objects) > 5:
    print(f"... and {len(objects) - 5} more objects")

# Close connection
conn.close() 
print("Database update completed.") 