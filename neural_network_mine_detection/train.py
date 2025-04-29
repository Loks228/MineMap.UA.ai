import os
import argparse
import matplotlib.pyplot as plt
from model import create_model, prepare_data, train_model

def plot_training_history(history):
    """Визуализация процесса обучения"""
    plt.figure(figsize=(12, 4))
    
    # График точности
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Точность модели')
    plt.ylabel('Точность')
    plt.xlabel('Эпоха')
    plt.legend(['Обучение', 'Валидация'], loc='lower right')
    
    # График функции потерь
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Функция потерь')
    plt.ylabel('Потери')
    plt.xlabel('Эпоха')
    plt.legend(['Обучение', 'Валидация'], loc='upper right')
    
    plt.tight_layout()
    plt.savefig('training_history.png')
    plt.show()

def main():
    parser = argparse.ArgumentParser(description="Обучение модели обнаружения взрывоопасных предметов")
    parser.add_argument("--data", type=str, required=True, help="Путь к директории с данными")
    parser.add_argument("--output", type=str, default="mine_detection_model.h5", help="Путь для сохранения модели")
    parser.add_argument("--epochs", type=int, default=20, help="Количество эпох обучения")
    parser.add_argument("--batch_size", type=int, default=32, help="Размер батча")
    args = parser.parse_args()
    
    # Проверка наличия директории с данными
    if not os.path.exists(args.data):
        print(f"Ошибка: директория с данными '{args.data}' не найдена.")
        return
    
    # Проверка структуры директории с данными
    required_subdirs = ['dangerous', 'safe']
    missing_dirs = [d for d in required_subdirs if not os.path.exists(os.path.join(args.data, d))]
    
    if missing_dirs:
        print(f"Ошибка: в директории '{args.data}' отсутствуют подкаталоги: {', '.join(missing_dirs)}")
        print("Структура данных должна быть:")
        print(f" - {args.data}/dangerous/")
        print(f" - {args.data}/safe/")
        return
    
    print("Начинаем обучение модели...")
    print(f"Данные: {args.data}")
    print(f"Выходной файл модели: {args.output}")
    print(f"Эпохи: {args.epochs}")
    print(f"Размер батча: {args.batch_size}")
    
    # Создание модели
    model = create_model()
    print("Модель создана.")
    
    # Подготовка данных
    train_generator, validation_generator = prepare_data(args.data)
    print("Данные подготовлены.")
    
    # Обучение модели
    trained_model, history = train_model(model, train_generator, validation_generator)
    print("Обучение завершено.")
    
    # Сохранение модели
    trained_model.save(args.output)
    print(f"Модель сохранена в {args.output}")
    
    # Визуализация процесса обучения
    plot_training_history(history)

if __name__ == "__main__":
    main() 