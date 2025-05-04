import sqlite3
from passlib.context import CryptContext
from datetime import datetime

# Настройка для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Информация о новом пользователе
username = "admin"
email = "admin@example.com"
password = "admin123"
full_name = "Администратор"
role = "admin"
created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Хэширование пароля
hashed_password = get_password_hash(password)

# Проверка, существует ли пользователь
cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
existing_user = cursor.fetchone()

if existing_user:
    print(f"Пользователь с таким именем или email уже существует.")
else:
    # Создание нового пользователя
    cursor.execute("""
    INSERT INTO users (username, email, password, full_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (username, email, hashed_password, full_name, role, created_at))
    
    # Сохранение изменений
    conn.commit()
    
    print(f"Пользователь {username} успешно создан.")
    print(f"Имя пользователя: {username}")
    print(f"Пароль: {password}")

# Проверка списка пользователей
cursor.execute("SELECT id, username, email, role FROM users")
users = cursor.fetchall()
print("\nСписок пользователей в системе:")
for user in users:
    print(f"ID: {user[0]}, Имя: {user[1]}, Email: {user[2]}, Роль: {user[3]}")

# Закрытие соединения
conn.close() 