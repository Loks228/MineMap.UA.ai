import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import argparse
import os
import time
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont

def load_and_prepare_image(image_path, target_size=(224, 224)):
    """Загрузка и подготовка изображения для предсказания"""
    img = image.load_img(image_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Нормализация
    return img_array, img

def predict_danger(model_path, image_path):
    """Предсказание опасности изображения"""
    # Загрузка модели
    try:
        model = load_model(model_path)
        print(f"Модель загружена из {model_path}")
    except Exception as e:
        print(f"Ошибка загрузки модели: {e}")
        return None
    
    # Загрузка и подготовка изображения
    try:
        img_array, original_img = load_and_prepare_image(image_path)
    except Exception as e:
        print(f"Ошибка загрузки изображения: {e}")
        return None
    
    # Замер времени предсказания
    start_time = time.time()
    prediction = model.predict(img_array)[0][0]
    end_time = time.time()
    
    inference_time = end_time - start_time
    print(f"Время инференса: {inference_time:.4f} секунд")
    
    # Подготовка результата
    percentage = prediction * 100
    
    if percentage >= 80:
        status = "ОПАСНО!"
        confidence = f"Вероятность взрывоопасного предмета: {percentage:.1f}%"
        color = "red"
    elif percentage >= 30:
        status = "ТРЕБУЕТ ПРОВЕРКИ"
        confidence = f"Вероятность взрывоопасного предмета: {percentage:.1f}%"
        color = "orange"
    else:
        status = "БЕЗОПАСНО"
        confidence = f"Вероятность взрывоопасного предмета: {percentage:.1f}%"
        color = "green"
    
    # Визуализация результата
    visualize_prediction(original_img, status, confidence, color, image_path)
    
    return percentage, status, confidence, inference_time

def visualize_prediction(img, status, confidence, color, save_path=None):
    """Визуализация предсказания на изображении"""
    # Преобразование в PIL Image если нужно
    if not isinstance(img, Image.Image):
        img = Image.fromarray(np.uint8(img))
    
    # Создание копии для рисования
    result_img = img.copy()
    draw = ImageDraw.Draw(result_img)
    
    # Определение цвета
    color_map = {
        "red": (255, 0, 0),
        "orange": (255, 165, 0),
        "green": (0, 255, 0)
    }
    rgb_color = color_map.get(color, (255, 0, 0))
    
    # Попытка загрузить шрифт (может потребоваться путь к TTF файлу)
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # Добавление текста статуса
    draw.text((10, 10), status, fill=rgb_color, font=font)
    draw.text((10, 40), confidence, fill=rgb_color, font=font)
    
    # Отображение или сохранение
    result_img.show()
    
    if save_path:
        # Создаем имя для результирующего файла
        base_name = os.path.basename(save_path)
        dir_name = os.path.dirname(save_path)
        result_filename = os.path.join(dir_name, f"result_{base_name}")
        result_img.save(result_filename)
        print(f"Результат сохранен как {result_filename}")

def main():
    parser = argparse.ArgumentParser(description="Обнаружение мин и взрывоопасных предметов")
    parser.add_argument("--model", type=str, required=True, help="Путь к файлу модели (.h5)")
    parser.add_argument("--image", type=str, required=True, help="Путь к изображению для анализа")
    args = parser.parse_args()
    
    result = predict_danger(args.model, args.image)
    
    if result:
        percentage, status, confidence, _ = result
        print(f"\n{status}")
        print(confidence)

if __name__ == "__main__":
    main() 