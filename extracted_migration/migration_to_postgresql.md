
# Инструкция: Миграция данных в PostgreSQL

## 1. Подготовка
1. Резервное копирование текущей базы (MySQL/SQLite/другая):
```bash
# Пример для MySQL
mysqldump -u user -p database_name > backup.sql

# Пример для SQLite
sqlite3 old.db .dump > backup.sql
```

2. Установите PostgreSQL и создайте новую пустую БД:
```bash
sudo -u postgres createdb minmap_db
```

## 2. Создание схемы в PostgreSQL
1. Экспорт структуры (DDL) из текущей базы и адаптация типов данных:
   - INT → INTEGER
   - DATETIME → TIMESTAMPTZ
   - TEXT/VARCHAR → TEXT/VARCHAR
2. Создайте таблицы в PostgreSQL, например:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role VARCHAR(16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Аналогично для других таблиц: login_history, banned_devices, points, zones, quiz_images и т.д.
```

## 3. Инструменты миграции
- **pgloader** (рекомендуется для автоматизации):
```bash
pgloader mysql://user:pass@localhost/old_db postgresql://postgres@localhost/minmap_db
```
- **Python-скрипт** с SQLAlchemy:
  - Подключение к обеим БД.
  - Чтение данных из старой и вставка в новую с учетом преобразования полей.

## 4. Пример Python-скрипта (SQLAlchemy)
```python
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker

# Подключение
old_engine = create_engine('mysql://user:pass@localhost/old_db')
new_engine = create_engine('postgresql://postgres@localhost/minmap_db')

old_meta = MetaData(bind=old_engine)
new_meta = MetaData(bind=new_engine)
old_meta.reflect()
new_meta.reflect()

SessionOld = sessionmaker(bind=old_engine)
SessionNew = sessionmaker(bind=new_engine)
session_old = SessionOld()
session_new = SessionNew()

# Миграция таблицы users
old_users = Table('users', old_meta, autoload_with=old_engine)
new_users = Table('users', new_meta, autoload_with=new_engine)

for row in session_old.query(old_users).all():
    insert_data = {
        'id': row.id,
        'email': row.email,
        'phone': row.phone,
        'role': row.role,
        'created_at': row.created_at
    }
    session_new.execute(new_users.insert().values(**insert_data))

session_new.commit()
```

## 5. Проверка и валидация
1. Сравните количество записей в каждой таблице:
```sql
SELECT count(*) FROM old_db.users;
SELECT count(*) FROM minmap_db.users;
```
2. Выполните выборки для проверки корректности полей и типов.

## 6. Переключение приложения
- Измените строку подключения в конфиге приложения на PostgreSQL.
- Проведите smoke-тесты всех операций (регистрация, добавление меток, квизы).

## 7. Резервное копирование и мониторинг
- Настройте регулярный бэкап PostgreSQL.
- Следите за логами ошибок и производительностью после миграции.
