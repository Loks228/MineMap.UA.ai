import asyncio
import aiosqlite
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()
DATABASE_PATH = os.getenv("DATABASE_PATH", "minemap.db")

# Дані регіонів для вставки
regions_data = [
    (5, 'Дніпро', 'dnipro', 48.464700, 35.046200),
    (6, 'Запоріжжя', 'zaporizhia', 47.838800, 35.139600),
    (7, 'Вінниця', 'vinnytsia', 49.232800, 28.480970),
    (8, 'Черкаси', 'cherkasy', 49.444430, 32.059770),
    (9, 'Полтава', 'poltava', 49.588270, 34.551420),
    (10, 'Чернігів', 'chernihiv', 51.498200, 31.289350),
    (11, 'Суми', 'sumy', 50.907700, 34.798100),
    (12, 'Житомир', 'zhytomyr', 50.254650, 28.658670),
    (13, 'Ужгород', 'uzhhorod', 48.620800, 22.287880),
    (14, 'Чернівці', 'chernivtsi', 48.291490, 25.935840),
    (15, 'Тернопіль', 'ternopil', 49.553520, 25.594767),
    (16, 'Хмельницький', 'khmelnytskyi', 49.421630, 26.996530),
    (17, 'Івано-Франківськ', 'ivano-frankivsk', 48.922630, 24.711110),
    (18, 'Луцьк', 'lutsk', 50.747230, 25.325380),
    (19, 'Рівне', 'rivne', 50.619900, 26.251600),
    (20, 'Миколаїв', 'mykolaiv', 46.975870, 31.994580),
    (21, 'Херсон', 'kherson', 46.635420, 32.616870),
    (22, 'Кропивницький', 'kirovohrad', 48.507933, 32.262317),
    (23, 'Сєвєродонецьк', 'severodonetsk', 48.948230, 38.486050),
    (24, 'Донецьк', 'donetsk', 48.015880, 37.802850),
    (25, 'Луганськ', 'luhansk', 48.574041, 39.307815),
    (26, 'Сімферополь', 'simferopol', 44.952117, 34.102417)
]

async def add_regions():
    # Підключення до бази даних
    print("Підключення до бази даних...")
    conn = await aiosqlite.connect(DATABASE_PATH)
    conn.row_factory = aiosqlite.Row
    
    try:
        # Перевірка, чи існують вже регіони з такими ID
        existing_regions = []
        for region_id, _, _, _, _ in regions_data:
            cursor = await conn.execute("SELECT id FROM regions WHERE id = ?", (region_id,))
            row = await cursor.fetchone()
            if row:
                existing_regions.append(region_id)
        
        # Інформування про існуючі регіони
        if existing_regions:
            print(f"Увага: Наступні регіони вже існують: {existing_regions}")
            delete = input("Бажаєте видалити існуючі регіони перед вставкою нових? (y/n): ")
            if delete.lower() == 'y':
                for region_id in existing_regions:
                    await conn.execute("DELETE FROM regions WHERE id = ?", (region_id,))
                print(f"Видалено регіони з ID: {existing_regions}")
        
        # Додавання нових регіонів
        print("Додавання регіонів...")
        for region_id, name, code, lat, lng in regions_data:
            try:
                # Перевірка, чи існує вже регіон з таким кодом
                cursor = await conn.execute("SELECT id FROM regions WHERE code = ?", (code,))
                row = await cursor.fetchone()
                if row and row[0] != region_id:
                    print(f"Увага: Регіон з кодом '{code}' вже існує з ID {row[0]}. Оновлюємо інформацію.")
                    await conn.execute('''
                    UPDATE regions SET id = ?, name = ?, center_lat = ?, center_lng = ?, zoom_level = 10
                    WHERE code = ?
                    ''', (region_id, name, lat, lng, code))
                else:
                    # Вставка нового регіону
                    await conn.execute('''
                    INSERT OR REPLACE INTO regions (id, name, code, center_lat, center_lng, zoom_level)
                    VALUES (?, ?, ?, ?, ?, 10)
                    ''', (region_id, name, code, lat, lng))
                print(f"Додано/оновлено регіон: {name} (ID: {region_id})")
            except Exception as e:
                print(f"Помилка при додаванні регіону {name}: {e}")
        
        await conn.commit()
        print("Усі регіони успішно додано!")
        
        # Виведення підсумків
        cursor = await conn.execute("SELECT id, name, code FROM regions ORDER BY id")
        rows = await cursor.fetchall()
        print("\nСписок усіх регіонів у базі даних:")
        for row in rows:
            print(f"ID: {row['id']}, Назва: {row['name']}, Код: {row['code']}")
        
    finally:
        # Закриваємо з'єднання
        await conn.close()
        print("З'єднання закрито.")

# Запускаємо додавання регіонів
if __name__ == "__main__":
    asyncio.run(add_regions()) 