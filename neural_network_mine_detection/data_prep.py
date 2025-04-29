import os
import argparse
import shutil
import random
from PIL import Image, ImageEnhance, ImageOps
import numpy as np
from tqdm import tqdm

def create_directory_structure(base_path):
    """Создание структуры директорий для датасета"""
    os.makedirs(os.path.join(base_path, 'dangerous'), exist_ok=True)
    os.makedirs(os.path.join(base_path, 'safe'), exist_ok=True)
    print(f"Созданы директории в {base_path}")

def preprocess_image(img_path, target_size=(224, 224)):
    """Предварительная обработка изображения"""
    try:
        img = Image.open(img_path).convert('RGB')
        img = img.resize(target_size, Image.LANCZOS)
        return img
    except Exception as e:
        print(f"Ошибка обработки изображения {img_path}: {e}")
        return None

def augment_image(img):
    """Аугментация изображения для увеличения датасета"""
    augmented_images = []
    
    # Оригинальное изображение
    augmented_images.append(img)
    
    # Горизонтальное отражение
    flip_h = ImageOps.mirror(img)
    augmented_images.append(flip_h)
    
    # Вертикальное отражение
    flip_v = ImageOps.flip(img)
    augmented_images.append(flip_v)
    
    # Поворот на 90 градусов
    rot_90 = img.rotate(90, expand=True)
    rot_90 = rot_90.resize(img.size, Image.LANCZOS)
    augmented_images.append(rot_90)
    
    # Случайный поворот
    angle = random.randint(-15, 15)
    rot_random = img.rotate(angle)
    augmented_images.append(rot_random)
    
    # Изменение яркости
    brightness = ImageEnhance.Brightness(img)
    bright_img = brightness.enhance(1.3)
    dark_img = brightness.enhance(0.7)
    augmented_images.append(bright_img)
    augmented_images.append(dark_img)
    
    # Изменение контраста
    contrast = ImageEnhance.Contrast(img)
    high_contrast = contrast.enhance(1.3)
    low_contrast = contrast.enhance(0.7)
    augmented_images.append(high_contrast)
    augmented_images.append(low_contrast)
    
    # Случайное изменение цветовой гаммы
    if random.random() > 0.5:
        color = ImageEnhance.Color(img)
        saturated = color.enhance(1.5)
        augmented_images.append(saturated)
    
    return augmented_images

def process_directory(input_dir, output_dir, category, augment=True):
    """Обработка всех изображений в директории"""
    if not os.path.exists(input_dir):
        print(f"Директория {input_dir} не существует!")
        return
    
    files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print(f"В директории {input_dir} не найдены изображения!")
        return
    
    print(f"Обработка {len(files)} изображений из {input_dir}...")
    
    for idx, file in enumerate(tqdm(files, desc=f"Обработка {category}")):
        img_path = os.path.join(input_dir, file)
        img = preprocess_image(img_path)
        
        if img is None:
            continue
        
        # Сохранение оригинального изображения
        base_name = os.path.splitext(file)[0]
        img.save(os.path.join(output_dir, category, f"{base_name}_orig.jpg"))
        
        # Аугментация если требуется
        if augment:
            augmented = augment_image(img)
            
            for i, aug_img in enumerate(augmented):
                aug_img.save(os.path.join(output_dir, category, f"{base_name}_aug{i}.jpg"))

def main():
    parser = argparse.ArgumentParser(description="Подготовка данных для модели распознавания взрывоопасных предметов")
    parser.add_argument("--dangerous", type=str, help="Директория с изображениями опасных предметов")
    parser.add_argument("--safe", type=str, help="Директория с изображениями безопасных предметов")
    parser.add_argument("--output", type=str, required=True, help="Директория для выходных данных")
    parser.add_argument("--no-augment", action="store_true", help="Отключить аугментацию изображений")
    args = parser.parse_args()
    
    # Создание структуры директорий
    create_directory_structure(args.output)
    
    # Обработка изображений опасных предметов
    if args.dangerous:
        process_directory(args.dangerous, args.output, 'dangerous', not args.no_augment)
    
    # Обработка изображений безопасных предметов
    if args.safe:
        process_directory(args.safe, args.output, 'safe', not args.no_augment)
    
    print("Обработка данных завершена.")
    print(f"Подготовленные данные находятся в {args.output}")

if __name__ == "__main__":
    main() 