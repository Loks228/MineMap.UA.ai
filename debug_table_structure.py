import sqlite3

# Connect to the database
conn = sqlite3.connect("MineMap.AI/minemap.db")
cursor = conn.cursor()

# Get table structure
print("Explosive Objects Table Structure:")
cursor.execute("PRAGMA table_info(explosive_objects)")
columns = cursor.fetchall()
for col in columns:
    print(f"Column {col[0]}: {col[1]} ({col[2]})")

# Close connection
conn.close() 