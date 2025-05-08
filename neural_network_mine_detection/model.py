import tensorflow as tf
import numpy as np
import os
import cv2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import matplotlib.pyplot as plt
from ultralytics import YOLO

# Константы
IMG_SIZE = 640  # Стандартный размер для YOLOv8
BATCH_SIZE = 16
EPOCHS = 50

def create_yolo_model(pretrained=True):
    """Создает модель YOLOv8 для обнаружения взрывоопасных предметов"""
    # Загрузка предобученной модели YOLOv8n
    if pretrained:
        # Используем предобученную модель YOLOv8n
        model = YOLO('yolov8n.pt')
    else:
        # Создаем новую модель с нуля
        model = YOLO('yolov8n.yaml')
    
    return model

def prepare_yolo_data(data_yaml_path):
    """
    Подготовка данных для YOLO
    
    Parameters:
    data_yaml_path (str): Путь к файлу YAML с конфигурацией данных
    
    Returns:
    str: Путь к файлу конфигурации данных
    """
    # YOLO использует файл YAML для определения путей к данным
    # Этот файл должен содержать:
    # - пути к тренировочным и валидационным данным
    # - список классов
    
    return data_yaml_path

def train_yolo_model(model, data_yaml_path, project_name='mine_detection'):
    """
    Обучение модели YOLOv8
    
    Parameters:
    model: Модель YOLO
    data_yaml_path (str): Путь к файлу конфигурации данных
    project_name (str): Имя проекта для сохранения результатов
    
    Returns:
    YOLO: Обученная модель
    """
    # Запуск обучения модели
    results = model.train(
        data=data_yaml_path,
        epochs=EPOCHS,
        batch=BATCH_SIZE,
        imgsz=IMG_SIZE,
        project=project_name,
        name='train',
        patience=5,  # Для ранней остановки
        save=True,  # Сохранять лучшие модели
        device='0' if tf.config.list_physical_devices('GPU') else 'cpu'
    )
    
    return model

def fine_tune_yolo(model, data_yaml_path, project_name='mine_detection'):
    """
    Дообучение (fine-tuning) модели YOLOv8
    
    Parameters:
    model: Модель YOLO
    data_yaml_path (str): Путь к файлу конфигурации данных
    project_name (str): Имя проекта для сохранения результатов
    
    Returns:
    YOLO: Дообученная модель
    """
    # Дообучение с меньшей скоростью обучения
    results = model.train(
        data=data_yaml_path,
        epochs=20,
        batch=BATCH_SIZE,
        imgsz=IMG_SIZE,
        project=project_name,
        name='fine_tune',
        patience=10,
        save=True,
        device='0' if tf.config.list_physical_devices('GPU') else 'cpu',
        lr0=0.0001  # Меньшая скорость обучения для fine-tuning
    )
    
    return model

def evaluate_yolo_model(model, data_yaml_path):
    """
    Оценка модели YOLOv8
    
    Parameters:
    model: Модель YOLO
    data_yaml_path (str): Путь к файлу конфигурации данных
    
    Returns:
    dict: Метрики оценки модели
    """
    # Валидация модели
    results = model.val(data=data_yaml_path)
    
    return results

def predict_with_yolo(model, image_path, conf_threshold=0.25):
    """
    Предсказание с использованием модели YOLOv8
    
    Parameters:
    model: Модель YOLO
    image_path (str): Путь к изображению для предсказания
    conf_threshold (float): Порог уверенности для детекции
    
    Returns:
    list: Список обнаруженных объектов
    """
    # Выполнение предсказания
    results = model.predict(image_path, conf=conf_threshold)
    
    return results

def create_yolo_dataset_yaml(train_path, val_path, class_names, output_path='data.yaml'):
    """
    Создает файл YAML для данных YOLO
    
    Parameters:
    train_path (str): Путь к тренировочным данным
    val_path (str): Путь к валидационным данным
    class_names (list): Список имен классов
    output_path (str): Путь для сохранения файла YAML
    
    Returns:
    str: Путь к созданному файлу YAML
    """
    # Создание содержимого YAML файла
    yaml_content = f"""
train: {train_path}
val: {val_path}

nc: {len(class_names)}
names: {class_names}
"""
    
    # Сохранение файла
    with open(output_path, 'w') as f:
        f.write(yaml_content)
    
    return output_path

def convert_dataset_to_yolo_format(source_dir, output_dir):
    """
    Конвертирует датасет из формата классификации в формат YOLO (детекция объектов)
    
    Parameters:
    source_dir (str): Путь к исходному датасету
    output_dir (str): Путь для сохранения конвертированного датасета
    
    Returns:
    tuple: Пути к тренировочным и валидационным данным
    """
    # Создание директорий
    train_dir = os.path.join(output_dir, 'train')
    val_dir = os.path.join(output_dir, 'val')
    
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(os.path.join(train_dir, 'images'), exist_ok=True)
    os.makedirs(os.path.join(train_dir, 'labels'), exist_ok=True)
    
    os.makedirs(val_dir, exist_ok=True)
    os.makedirs(os.path.join(val_dir, 'images'), exist_ok=True)
    os.makedirs(os.path.join(val_dir, 'labels'), exist_ok=True)
    
    # Здесь должен быть код для конвертации аннотаций
    # Для простой конвертации классификационных данных в данные для детекции
    # можно создать аннотации, которые покрывают большую часть изображения
    
    print("Необходимо реализовать логику конвертации аннотаций в формат YOLO!")
    
    return train_dir, val_dir 