import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt
import numpy as np
import os

# Константы
IMG_SIZE = 224  # Стандартный размер для EfficientNet
BATCH_SIZE = 32
EPOCHS = 20

def create_model():
    """Создает модель для классификации взрывоопасных предметов"""
    # Использование предобученной модели как базы
    base_model = EfficientNetB0(weights='imagenet', include_top=False, 
                               input_shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # "Заморозить" веса базовой модели
    base_model.trainable = False
    
    # Добавление новых слоев
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)  # Для предотвращения переобучения
    
    # Финальный слой с одним нейроном и sigmoid для получения вероятности
    predictions = Dense(1, activation='sigmoid')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Компиляция модели
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    
    return model

def prepare_data(data_dir):
    """Подготовка генераторов данных для обучения и валидации"""
    # Аугментация для тренировочных данных
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2  # 20% данных используем для валидации
    )
    
    # Только нормализация для валидационных данных
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Генератор тренировочных данных
    train_generator = train_datagen.flow_from_directory(
        directory=data_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='binary',  # 'binary' потому что у нас по сути задача бинарной классификации
        subset='training'
    )
    
    # Генератор валидационных данных
    validation_generator = val_datagen.flow_from_directory(
        directory=data_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation'
    )
    
    return train_generator, validation_generator

def train_model(model, train_generator, validation_generator):
    """Обучение модели"""
    # Callback для ранней остановки
    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    # Уменьшение learning rate при плато
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=0.00001
    )
    
    # Обучение модели
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        callbacks=[early_stopping, reduce_lr]
    )
    
    # Разблокируем верхние слои базовой модели и продолжим обучение с меньшим learning rate
    for layer in model.layers[:-3]:
        layer.trainable = True
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),  # меньший learning rate
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    
    # Продолжаем обучение
    fine_tuning_history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        epochs=10,  # меньше эпох для fine-tuning
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        callbacks=[early_stopping, reduce_lr]
    )
    
    return model, history 