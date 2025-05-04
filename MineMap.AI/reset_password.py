import sqlite3

# Настройка для хэширования паролей
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def get_password_hash(password):
        return pwd_context.hash(password)
except Exception as e:
    # Обходное решение проблемы с bcrypt 4.x и passlib
    import bcrypt
    
    def get_password_hash(password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Новый очень простой пароль
new_password = "admin123"
hashed_password = get_password_hash(new_password)

# Обновление пароля для пользователя admin
cursor.execute("""
UPDATE users 
SET password = ?
WHERE username = 'admin'
""", (hashed_password,))

# Сохранение изменений
conn.commit()

# Проверка результата
cursor.execute("SELECT id, username FROM users WHERE username = 'admin'")
user = cursor.fetchone()
if user:
    print(f"Пароль для пользователя {user[1]} (ID: {user[0]}) успешно обновлен.")
    print(f"Новый пароль: {new_password}")
else:
    print("Пользователь не найден.")

# Закрытие соединения
conn.close() 