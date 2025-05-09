import re

# Путь к файлу main.py
file_path = "MineMap.AI/main.py"

# Чтение содержимого файла
with open(file_path, 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Ищем проблемное место - строку с "else:" и следующую за ней строку с "await conn.execute("
for i in range(len(lines) - 1):
    if "else:" in lines[i] and "await conn.execute(" in lines[i+1].strip():
        # Получаем текущий отступ из строки с "else:"
        else_indentation = re.match(r'^(\s*)', lines[i]).group(1)
        
        # Вычисляем отступ для строки после "else:" (добавляем 4 пробела)
        await_indentation = else_indentation + "    "
        
        # Если отступ не соответствует ожидаемому, исправляем
        current_await_indentation = re.match(r'^(\s*)', lines[i+1]).group(1)
        if current_await_indentation != await_indentation:
            lines[i+1] = await_indentation + lines[i+1].lstrip()
        
        # Проверяем отступы для SQL запроса (строки с """)
        j = i + 2
        if j < len(lines) and '"""' in lines[j]:
            sql_indentation = await_indentation + "    "  # Еще 4 пробела для SQL запроса
            lines[j] = sql_indentation + lines[j].lstrip()
            
            # Находим все строки SQL запроса до закрывающих """
            j += 1
            while j < len(lines) and '"""' not in lines[j]:
                lines[j] = sql_indentation + lines[j].lstrip()
                j += 1
            
            # Обрабатываем строку с закрывающими """
            if j < len(lines) and '"""' in lines[j]:
                lines[j] = sql_indentation + lines[j].lstrip()
            
            # Обрабатываем аргументы запроса и закрывающую скобку
            j += 1
            while j < len(lines) and lines[j].strip() and not lines[j].strip().startswith(')'):
                lines[j] = sql_indentation + lines[j].lstrip()
                j += 1
            
            # Обрабатываем закрывающую скобку
            if j < len(lines) and lines[j].strip().startswith(')'):
                lines[j] = await_indentation + lines[j].lstrip()
            
            # Проверяем, есть ли следующий оператор (например, await conn.commit())
            j += 1
            if j < len(lines) and lines[j].strip().startswith('await'):
                lines[j] = await_indentation + lines[j].lstrip()

# Записываем исправленное содержимое обратно в файл
with open(file_path, 'w', encoding='utf-8') as file:
    file.writelines(lines)

print("Индентация исправлена в файле", file_path) 