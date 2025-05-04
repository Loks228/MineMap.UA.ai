import sqlite3
from datetime import datetime

# База данных
DB_PATH = "minemap.db"

def main():
    try:
        # Соединяемся с базой данных
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Для доступа к колонкам по имени
        cursor = conn.cursor()
        
        # Получаем список всех взрывоопасных объектов
        cursor.execute("""
        SELECT eo.*, r.name as region_name, u.username as reported_by_username
        FROM explosive_objects eo
        JOIN regions r ON eo.region_id = r.id
        JOIN users u ON eo.reported_by = u.id
        ORDER BY eo.id DESC
        """)
        objects = cursor.fetchall()
        
        print(f"Найдено {len(objects)} взрывоопасных объектов:")
        for obj in objects:
            print(f"\nID: {obj['id']}")
            print(f"Название: {obj['title']}")
            print(f"Описание: {obj['description']}")
            print(f"Координаты: {obj['latitude']}, {obj['longitude']}")
            print(f"Статус: {obj['status']}")
            print(f"Приоритет: {obj['priority']}")
            print(f"Регион: {obj['region_name']} (ID: {obj['region_id']})")
            print(f"Добавил: {obj['reported_by_username']} (ID: {obj['reported_by']})")
            print(f"Дата добавления: {obj['reported_at']}")
            print(f"Дата обновления: {obj['updated_at']}")
            print("-" * 50)
        
        # Закрываем соединение
        conn.close()
    except Exception as e:
        print(f"Ошибка: {str(e)}")

if __name__ == "__main__":
    main() 