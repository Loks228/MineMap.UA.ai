import sqlite3
from passlib.context import CryptContext

# Настройка для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# Подключение к базе данных
conn = sqlite3.connect('minemap.db')
cursor = conn.cursor()

# Новый очень простой пароль
new_password = "1234"
hashed_password = get_password_hash(new_password)

# Обновление пароля для пользователя LordLoks
cursor.execute("""
UPDATE users 
SET password = ?
WHERE username = 'LordLoks'
""", (hashed_password,))

# Сохранение изменений
conn.commit()

# Проверка результата
cursor.execute("SELECT id, username FROM users WHERE username = 'LordLoks'")
user = cursor.fetchone()
if user:
    print(f"Пароль для пользователя {user[1]} (ID: {user[0]}) успешно обновлен.")
    print(f"Новый пароль: {new_password}")
else:
    print("Пользователь не найден.")

# Закрытие соединения
conn.close() 