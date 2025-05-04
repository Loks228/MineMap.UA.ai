import sqlite3

# Connect to the database
conn = sqlite3.connect('minemap.db')
cur = conn.cursor()

# Execute query to get all regions
cur.execute('SELECT id, name, code, center_lat, center_lng FROM regions ORDER BY id')
regions = cur.fetchall()

# Write results to a file
with open('regions_list.txt', 'w', encoding='utf-8') as f:
    f.write("ID\tНазва\tКод\tШирота\tДовгота\n")
    f.write("-" * 60 + "\n")
    for region in regions:
        f.write(f"{region[0]}\t{region[1]}\t{region[2]}\t{region[3]}\t{region[4]}\n")
    
    f.write(f"\nTotal regions: {len(regions)}")

# Close the connection
conn.close()

print(f"Found {len(regions)} regions. Results saved to regions_list.txt") 