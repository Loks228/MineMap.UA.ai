import os
import argparse
import shutil
import random
from PIL import Image, ImageEnhance, ImageOps
import numpy as np
from tqdm import tqdm
import cv2

def create_directory_structure(base_path):
    """Создание структуры директорий для датасета"""
    os.makedirs(os.path.join(base_path, 'dangerous'), exist_ok=True)
    os.makedirs(os.path.join(base_path, 'safe'), exist_ok=True)
    print(f"Созданы директории в {base_path}")

def create_yolo_directory_structure(base_path):
    """Создание структуры директорий для YOLO датасета"""
    os.makedirs(os.path.join(base_path, 'train', 'images'), exist_ok=True)
    os.makedirs(os.path.join(base_path, 'train', 'labels'), exist_ok=True)
    os.makedirs(os.path.join(base_path, 'val', 'images'), exist_ok=True)
    os.makedirs(os.path.join(base_path, 'val', 'labels'), exist_ok=True)
    print(f"Созданы директории YOLO в {base_path}")

def create_yolo_dataset_yaml(base_path, class_names):
    """Создание YAML файла для конфигурации YOLO датасета"""
    yaml_path = os.path.join(base_path, 'data.yaml')
    train_path = os.path.abspath(os.path.join(base_path, 'train'))
    val_path = os.path.abspath(os.path.join(base_path, 'val'))
    
    yaml_content = f"""
train: {train_path}
val: {val_path}

nc: {len(class_names)}
names: {class_names}
"""
    
    with open(yaml_path, 'w') as f:
        f.write(yaml_content)
    
    print(f"Создан файл конфигурации {yaml_path}")
    return yaml_path

def preprocess_image(img_path, target_size=(224, 224)):
    """Предварительная обработка изображения"""
    try:
        img = Image.open(img_path).convert('RGB')
        img = img.resize(target_size, Image.LANCZOS)
        return img
    except Exception as e:
        print(f"Ошибка обработки изображения {img_path}: {e}")
        return None

def preprocess_image_yolo(img_path, target_size=(640, 640)):
    """Предварительная обработка изображения для YOLO"""
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

def process_files_yolo(files, input_dir, output_dir, subset, class_id):
    """Обработка файлов для формата YOLO"""
    for idx, file in enumerate(tqdm(files, desc=f"Обработка {subset}")):
        img_path = os.path.join(input_dir, file)
        img = cv2.imread(img_path)
        
        if img is None:
            print(f"Не удалось загрузить изображение {img_path}")
            continue
        
        # Обнаружение объектов на изображении (для примера используем простое обнаружение)
        # В реальном сценарии здесь должен быть алгоритм обнаружения объектов или ручная разметка
        height, width, _ = img.shape
        
        # Создаем аннотацию, размещая bounding box в центре изображения
        # Это упрощенный пример, в реальности нужна точная разметка объектов
        # Формат аннотации: <class_id> <x_center> <y_center> <width> <height>
        x_center = 0.5  # Центр по X в относительных координатах
        y_center = 0.5  # Центр по Y в относительных координатах
        bbox_width = 0.7  # Ширина в относительных единицах
        bbox_height = 0.7  # Высота в относительных единицах
        
        # Сохранение изображения
        base_name = os.path.splitext(file)[0]
        img_save_path = os.path.join(output_dir, subset, 'images', f"{base_name}.jpg")
        cv2.imwrite(img_save_path, img)
        
        # Сохранение аннотации
        label_save_path = os.path.join(output_dir, subset, 'labels', f"{base_name}.txt")
        with open(label_save_path, 'w') as f:
            f.write(f"{class_id} {x_center} {y_center} {bbox_width} {bbox_height}\n")

def convert_to_yolo_format(input_dir, output_dir, class_name, class_id, validation_split=0.2):
    """Конвертация данных в формат YOLO"""
    if not os.path.exists(input_dir):
        print(f"Директория {input_dir} не существует!")
        return
    
    files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print(f"В директории {input_dir} не найдены изображения!")
        return
    
    # Перемешивание файлов для случайного разделения
    random.shuffle(files)
    
    # Разделение на тренировочный и валидационный наборы
    split_idx = int(len(files) * (1 - validation_split))
    train_files = files[:split_idx]
    val_files = files[split_idx:]
    
    print(f"Конвертация {len(files)} изображений из {input_dir} в формат YOLO...")
    print(f"Тренировочный набор: {len(train_files)}, Валидационный набор: {len(val_files)}")
    
    # Обработка тренировочных данных
    process_files_yolo(train_files, input_dir, output_dir, 'train', class_id)
    
    # Обработка валидационных данных
    process_files_yolo(val_files, input_dir, output_dir, 'val', class_id)

def create_yolo_data_from_classification(input_dir, output_dir):
    """Создание данных YOLO из классификационного датасета"""
    # Создание структуры директорий
    create_yolo_directory_structure(output_dir)
    
    # Определение классов
    class_names = ["mine", "not_dangerous"]
    
    # Конвертация опасных предметов (class_id=0)
    dangerous_dir = os.path.join(input_dir, 'dangerous')
    if os.path.exists(dangerous_dir):
        convert_to_yolo_format(dangerous_dir, output_dir, 'mine', 0)
    
    # Конвертация безопасных предметов (class_id=1)
    safe_dir = os.path.join(input_dir, 'safe')
    if os.path.exists(safe_dir):
        convert_to_yolo_format(safe_dir, output_dir, 'not_dangerous', 1)
    
    # Создание YAML файла
    yaml_path = create_yolo_dataset_yaml(output_dir, class_names)
    
    print("Конвертация данных в формат YOLO завершена.")
    print(f"YAML файл: {yaml_path}")
    
    return yaml_path

def main():
    parser = argparse.ArgumentParser(description="Подготовка данных для модели распознавания взрывоопасных предметов")
    parser.add_argument("--input", type=str, required=True, help="Директория с исходными данными (в формате классификации)")
    parser.add_argument("--output", type=str, required=True, help="Директория для выходных данных в формате YOLO")
    parser.add_argument("--yolo", action="store_true", help="Конвертировать данные в формат YOLO")
    args = parser.parse_args()
    
    if args.yolo:
        create_yolo_data_from_classification(args.input, args.output)
    else:
        print("Для конвертации в формат YOLO используйте параметр --yolo")

if __name__ == "__main__":
    main() 