import asyncio
import aiosqlite
import os
from dotenv import load_dotenv

# Хеш пароля, который мы сгенерировали ранее
ADMIN_PASSWORD_HASH = "$2b$12$ZyEQ5sNjYsdwhUQZlV2xwO/C9q5GWTn8NW9y2SeAeelercwaDc0qe"

# Загружаем переменные окружения
load_dotenv()
DATABASE_PATH = os.getenv("DATABASE_PATH", "minemap.db")

async def init_db():
    # Подключение к базе данных
    print("Connecting to database...")
    conn = await aiosqlite.connect(DATABASE_PATH)
    conn.row_factory = aiosqlite.Row
    
    try:
        # Создание таблицы users, если она не существует
        print("Creating tables...")
        await conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''')
        
        # Создание таблицы regions
        await conn.execute('''
        CREATE TABLE IF NOT EXISTS regions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            center_lat REAL NOT NULL,
            center_lng REAL NOT NULL,
            zoom_level INTEGER NOT NULL DEFAULT 10
        );
        ''')
        
        # Создание таблицы explosive_objects
        await conn.execute('''
        CREATE TABLE IF NOT EXISTS explosive_objects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            region_id INTEGER REFERENCES regions(id),
            reported_by INTEGER REFERENCES users(id),
            reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''')
        
        # Проверяем, существует ли администратор
        cursor = await conn.execute("SELECT COUNT(*) FROM users WHERE username = ?", ("LordLoks",))
        row = await cursor.fetchone()
        admin_exists = row[0] > 0
        
        if not admin_exists:
            print("Adding admin user...")
            # Добавляем администратора
            await conn.execute('''
            INSERT INTO users (username, email, password, full_name, role)
            VALUES (?, ?, ?, ?, ?)
            ''', ("LordLoks", "kolya20081983@gmail.com", ADMIN_PASSWORD_HASH, "Микола", "admin"))
            await conn.commit()
            print("Admin user added successfully!")
        else:
            print("Admin user already exists.")
        
        # Добавляем базовые регионы, если их еще нет
        cursor = await conn.execute("SELECT COUNT(*) FROM regions")
        row = await cursor.fetchone()
        region_exists = row[0] > 0
        
        if not region_exists:
            print("Adding base regions...")
            await conn.execute('''
            INSERT INTO regions (name, code, center_lat, center_lng, zoom_level)
            VALUES 
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?)
            ''', 
            ('Киев', 'kyiv', 50.4501, 30.5234, 10,
            'Харьков', 'kharkiv', 49.9935, 36.2304, 10,
            'Львов', 'lviv', 49.8397, 24.0297, 10,
            'Одесса', 'odesa', 46.4825, 30.7233, 10))
            await conn.commit()
            print("Base regions added successfully!")
            
        print("Database initialization complete!")
    finally:
        # Закрываем соединение
        await conn.close()
        print("Connection closed.")

# Запускаем инициализацию базы данных
if __name__ == "__main__":
    asyncio.run(init_db()) 