import os
import argparse
import matplotlib.pyplot as plt
from model import create_yolo_model, train_yolo_model, fine_tune_yolo, evaluate_yolo_model

def main():
    parser = argparse.ArgumentParser(description="Обучение модели YOLO для обнаружения взрывоопасных предметов")
    parser.add_argument("--data", type=str, required=True, help="Путь к YAML файлу с конфигурацией данных")
    parser.add_argument("--output", type=str, default="runs/train", help="Директория для сохранения результатов")
    parser.add_argument("--epochs", type=int, default=50, help="Количество эпох обучения")
    parser.add_argument("--batch_size", type=int, default=16, help="Размер батча")
    parser.add_argument("--pretrained", action="store_true", help="Использовать предобученную модель")
    parser.add_argument("--fine_tune", action="store_true", help="Дообучить предобученную модель")
    parser.add_argument("--img_size", type=int, default=640, help="Размер изображения для обучения")
    args = parser.parse_args()
    
    # Проверка наличия файла данных
    if not os.path.exists(args.data):
        print(f"Ошибка: файл данных '{args.data}' не найден.")
        return
    
    print("Начинаем обучение модели YOLO...")
    print(f"Файл данных: {args.data}")
    print(f"Выходная директория: {args.output}")
    print(f"Эпохи: {args.epochs}")
    print(f"Размер батча: {args.batch_size}")
    print(f"Размер изображения: {args.img_size}x{args.img_size}")
    print(f"Использование предобученной модели: {'Да' if args.pretrained else 'Нет'}")
    print(f"Fine-tuning: {'Да' if args.fine_tune else 'Нет'}")
    
    # Создание модели
    model = create_yolo_model(pretrained=args.pretrained)
    print("Модель создана.")
    
    # Обучение или fine-tuning модели
    if args.fine_tune and args.pretrained:
        print("Выполняем fine-tuning предобученной модели...")
        trained_model = fine_tune_yolo(model, args.data, project_name=args.output)
    else:
        print("Обучаем модель...")
        trained_model = train_yolo_model(model, args.data, project_name=args.output)
    
    print("Обучение завершено.")
    
    # Оценка модели
    print("Оцениваем модель...")
    results = evaluate_yolo_model(trained_model, args.data)
    
    print(f"Метрики модели: {results}")
    print(f"Модель сохранена в директории {args.output}")

if __name__ == "__main__":
    main() 