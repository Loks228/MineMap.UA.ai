import sqlite3
import bcrypt

def get_password_hash(password):
    """Хэширует пароль используя bcrypt напрямую, минуя passlib"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Получаем список всех пользователей
cursor.execute("SELECT id, username, password FROM users")
users = cursor.fetchall()

print(f"Найдено {len(users)} пользователей")

# Обработка каждого пользователя
for user in users:
    user_id = user['id']
    username = user['username']
    
    # Устанавливаем пароль пользователя на известное значение
    # В реальном приложении здесь следует использовать настоящие пароли пользователей
    # или отправить им временные пароли
    if username == 'admin':
        new_password = 'admin123'
    else:
        new_password = '1234'  # временный пароль для всех остальных пользователей
    
    hashed_password = get_password_hash(new_password)
    
    # Обновляем пароль
    cursor.execute(
        "UPDATE users SET password = ? WHERE id = ?", 
        (hashed_password, user_id)
    )
    
    print(f"Обновлен пароль для пользователя {username} (ID: {user_id})")
    print(f"Новый пароль: {new_password}")

# Сохранение изменений
conn.commit()
print("Все пароли успешно обновлены")

# Закрытие соединения
conn.close() 