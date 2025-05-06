import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Get the list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tables in the database:")
for table in tables:
    print(f"\nTable: {table[0]}")
    # Get the table schema
    cursor.execute(f"PRAGMA table_info({table[0]})")
    columns = cursor.fetchall()
    
    print("Columns:")
    for column in columns:
        print(f"  {column[1]} ({column[2]}), {'PRIMARY KEY' if column[5] else ''}")
    
    # Count the number of rows in the table
    cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
    count = cursor.fetchone()[0]
    print(f"Row count: {count}")

conn.close() 