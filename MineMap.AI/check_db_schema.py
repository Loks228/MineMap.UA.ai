import sqlite3
import os

# База данных
DB_PATH = "minemap.db"

def main():
    try:
        # Соединяемся с базой данных
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Получаем информацию о схеме таблицы explosive_objects
        cursor.execute("PRAGMA table_info(explosive_objects)")
        columns = cursor.fetchall()
        
        print("Схема таблицы explosive_objects:")
        for column in columns:
            print(f"{column[0]}: {column[1]} ({column[2]}), {'NOT NULL' if column[3] else 'NULL'}, Default: {column[4]}, PK: {column[5]}")
        
        # Проверяем, существует ли директория для фотографий
        photos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "photos")
        if not os.path.exists(photos_dir):
            print(f"\nДиректория {photos_dir} не существует. Создаем...")
            os.makedirs(photos_dir, exist_ok=True)
            print(f"Директория {photos_dir} создана.")
        else:
            print(f"\nДиректория {photos_dir} существует.")
        
        # Закрываем соединение
        conn.close()
    except Exception as e:
        print(f"Ошибка: {str(e)}")

if __name__ == "__main__":
    main() 