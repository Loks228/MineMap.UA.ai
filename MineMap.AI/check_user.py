import sqlite3

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Получение информации о пользователе
cursor.execute("SELECT * FROM users WHERE username = 'LordLoks'")
user = cursor.fetchone()

if user:
    print(f"Информация о пользователе:")
    print(f"ID: {user['id']}")
    print(f"Имя пользователя: {user['username']}")
    print(f"Email: {user['email']}")
    print(f"Полное имя: {user['full_name']}")
    print(f"Роль: {user['role']}")
    print(f"Дата создания: {user['created_at']}")
    print(f"Хэш пароля: {user['password']}")
else:
    print("Пользователь не найден.")

# Закрытие соединения
conn.close() 