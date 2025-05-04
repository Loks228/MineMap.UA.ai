import sqlite3
import os

def add_regions():
    # Connect to database
    conn = sqlite3.connect("MineMap.AI/minemap.db")
    cursor = conn.cursor()
    
    # Check existing regions
    cursor.execute("SELECT id, name FROM regions")
    existing_regions = {row[0]: row[1] for row in cursor.fetchall()}
    print("Existing regions in database:", existing_regions)
    
    # Define all Ukrainian regions
    regions = [
        (1, 'Київ', 'kyiv', 50.450001, 30.523333, 10),
        (2, 'Харків', 'kharkiv', 49.992599, 36.231078, 10),
        (3, 'Львів', 'lviv', 49.839683, 24.029717, 10),
        (4, 'Одеса', 'odesa', 46.482526, 30.723310, 10),
        (5, 'Дніпро', 'dnipro', 48.464700, 35.046200, 10),
        (6, 'Запоріжжя', 'zaporizhia', 47.838800, 35.139600, 10),
        (7, 'Вінниця', 'vinnytsia', 49.232800, 28.480970, 10),
        (8, 'Черкаси', 'cherkasy', 49.444430, 32.059770, 10),
        (9, 'Полтава', 'poltava', 49.588270, 34.551420, 10),
        (10, 'Чернігів', 'chernihiv', 51.498200, 31.289350, 10),
        (11, 'Суми', 'sumy', 50.907700, 34.798100, 10),
        (12, 'Житомир', 'zhytomyr', 50.254650, 28.658670, 10),
        (13, 'Ужгород', 'uzhhorod', 48.620800, 22.287880, 10),
        (14, 'Чернівці', 'chernivtsi', 48.291490, 25.935840, 10),
        (15, 'Тернопіль', 'ternopil', 49.553520, 25.594767, 10),
        (16, 'Хмельницький', 'khmelnytskyi', 49.421630, 26.996530, 10),
        (17, 'Івано-Франківськ', 'ivano-frankivsk', 48.922630, 24.711110, 10),
        (18, 'Луцьк', 'lutsk', 50.747230, 25.325380, 10),
        (19, 'Рівне', 'rivne', 50.619900, 26.251600, 10),
        (20, 'Миколаїв', 'mykolaiv', 46.975870, 31.994580, 10),
        (21, 'Херсон', 'kherson', 46.635420, 32.616870, 10),
        (22, 'Кропивницький', 'kirovohrad', 48.507933, 32.262317, 10),
        (23, 'Сєвєродонецьк', 'severodonetsk', 48.948230, 38.486050, 10),
        (24, 'Донецьк', 'donetsk', 48.015880, 37.802850, 10),
        (25, 'Луганськ', 'luhansk', 48.574041, 39.307815, 10),
        (26, 'Сімферополь', 'simferopol', 44.952117, 34.102417, 10)
    ]
    
    # Add regions that don't exist yet
    for region in regions:
        region_id = region[0]
        
        if region_id in existing_regions:
            print(f"Region {region_id} ({region[1]}) already exists")
        else:
            print(f"Adding region {region_id} ({region[1]})")
            cursor.execute(
                "INSERT INTO regions (id, name, code, center_lat, center_lng, zoom_level) VALUES (?, ?, ?, ?, ?, ?)",
                region
            )
    
    # Commit changes and close connection
    conn.commit()
    print("Region updates completed")
    
    # Verify all regions in database
    cursor.execute("SELECT id, name FROM regions ORDER BY id")
    all_regions = cursor.fetchall()
    print("\nAll regions in database:")
    for region in all_regions:
        print(f"ID {region[0]}: {region[1]}")
    
    conn.close()

if __name__ == "__main__":
    add_regions() 