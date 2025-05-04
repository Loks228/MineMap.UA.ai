import sqlite3

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Получение списка таблиц
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Таблицы в базе данных:")
for table in tables:
    table_name = table[0]
    print(f"\n=== Таблица: {table_name} ===")
    
    # Получение информации о структуре таблицы
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    print("Структура таблицы:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # Получение данных из таблицы (первые 5 записей)
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
    rows = cursor.fetchall()
    if rows:
        print(f"\nДанные (первые {len(rows)} записей):")
        for row in rows:
            print(f"  {row}")

# Закрытие соединения
conn.close() 