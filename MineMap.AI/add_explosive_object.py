import sqlite3
import os
import base64
import sys
import time
import requests
from datetime import datetime

# База данных
DB_PATH = "minemap.db"

# Директория для фотографий
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PHOTOS_DIR = os.path.join(BASE_DIR, "static", "photos")
os.makedirs(PHOTOS_DIR, exist_ok=True)

# Данные об объекте
title = "Виявлено вибухонебезпечний об'єкт (ручне додавання)"
description = "Небезпечний об'єкт додано вручну через скрипт. Потребує термінової перевірки саперами."
latitude = 49.842957  # Координаты для Львова
longitude = 24.0315921  # Координаты для Львова
status = "dangerous"  # Статус "опасный" (красный флажок)
priority = "high"
region_id = 3  # ID региона Львов (из базы данных)
reported_by = 1  # ID пользователя-администратора

# Путь к временному файлу изображения
temp_image_path = "temp_image.jpg"

def download_image(url, destination_path):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        with open(destination_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Изображение успешно загружено и сохранено в {destination_path}")
        return True
    except Exception as e:
        print(f"Ошибка загрузки изображения: {str(e)}")
        return False

def main():
    try:
        # Проверяем, передан ли URL изображения
        image_url = None
        if len(sys.argv) > 1:
            image_url = sys.argv[1]
            
        # Если URL передан, загружаем изображение
        if image_url:
            if not download_image(image_url, temp_image_path):
                return
        # Если URL не передан, проверяем, существует ли файл
        elif not os.path.exists(temp_image_path):
            print(f"Файл {temp_image_path} не найден. Укажите URL изображения или подготовьте файл.")
            return
            
        # Генерируем уникальное имя файла для сохранения в папке static/photos
        # Но это только для справки, т.к. в базе данных нет поля photo_url
        photo_filename = f"{int(time.time())}_{reported_by}_manual.jpg"
        photo_path = os.path.join(PHOTOS_DIR, photo_filename)
        
        # Копируем файл в директорию фотографий (для будущего использования)
        with open(temp_image_path, 'rb') as src, open(photo_path, 'wb') as dst:
            dst.write(src.read())
        
        # Текущее время для полей reported_at и updated_at
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Соединяемся с базой данных
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Вставляем данные в базу (без поля photo_url)
        cursor.execute('''
        INSERT INTO explosive_objects 
        (title, description, latitude, longitude, status, priority, region_id, reported_by, reported_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (title, description, latitude, longitude, status, priority, region_id, reported_by, current_time, current_time))
        
        # Сохраняем изменения и закрываем соединение
        conn.commit()
        object_id = cursor.lastrowid
        conn.close()
        
        print(f"Объект успешно добавлен в базу данных с ID: {object_id}")
        print(f"Изображение сохранено по пути: {photo_path} (для будущего использования)")
        print(f"Примечание: В текущей схеме базы данных нет поля photo_url, поэтому фото хранится отдельно.")
        
        # Удаляем временный файл, если он был загружен из URL
        if image_url and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
            
    except Exception as e:
        print(f"Ошибка: {str(e)}")
        
if __name__ == "__main__":
    main() 