import sqlite3
from datetime import datetime

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Текущая дата и время
current_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Обновление даты создания для всех пользователей
cursor.execute("""
UPDATE users 
SET created_at = ?
""", (current_datetime,))

# Сохранение изменений
conn.commit()

# Проверка результата
cursor.execute("SELECT id, username, created_at FROM users")
users = cursor.fetchall()
print("Пользователи после обновления:")
for user in users:
    print(f"ID: {user[0]}, Имя: {user[1]}, Дата создания: {user[2]}")

# Закрытие соединения
conn.close()

print("Дата создания пользователей успешно обновлена.") 