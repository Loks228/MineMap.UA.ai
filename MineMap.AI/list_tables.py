import sqlite3

# База данных
DB_PATH = "minemap.db"

def main():
    try:
        # Соединяемся с базой данных
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Получаем список всех таблиц
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("Таблицы в базе данных:")
        for table in tables:
            print(f"- {table[0]}")
            
            # Получаем информацию о схеме таблицы
            cursor.execute(f"PRAGMA table_info({table[0]})")
            columns = cursor.fetchall()
            
            print(f"  Колонки таблицы {table[0]}:")
            for column in columns:
                print(f"    {column[1]} ({column[2]})")
            print()
        
        # Закрываем соединение
        conn.close()
    except Exception as e:
        print(f"Ошибка: {str(e)}")

if __name__ == "__main__":
    main() 