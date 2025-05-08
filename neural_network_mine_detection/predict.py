import os
import argparse
import cv2
import matplotlib.pyplot as plt
import time
from model import predict_with_yolo
from ultralytics import YOLO

def visualize_yolo_prediction(results, class_names, confidence_threshold=0.25, save_path=None):
    """
    Визуализация результатов предсказания YOLO
    
    Parameters:
    results: Результаты предсказания YOLO
    class_names: Список имен классов
    confidence_threshold: Порог уверенности для отображения
    save_path: Путь для сохранения результата
    """
    if not results:
        print("Нет результатов для визуализации!")
        return
    
    for i, result in enumerate(results):
        # Получаем изображение с размеченными обнаружениями
        img = result.plot()
        
        # Отображаем изображение
        plt.figure(figsize=(12, 8))
        plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        plt.axis('off')
        
        # Выводим статус и информацию
        detections = []
        has_mine = False
        highest_conf = 0
        
        for box in result.boxes:
            class_id = int(box.cls.item())
            confidence = float(box.conf.item())
            
            if confidence >= confidence_threshold:
                class_name = class_names[class_id]
                detections.append((class_name, confidence))
                
                if class_name == "mine" and confidence > highest_conf:
                    highest_conf = confidence
                    has_mine = True
        
        # Определяем общий статус
        if has_mine and highest_conf >= 0.8:
            status = "ОПАСНО!"
            color = 'red'
        elif has_mine and highest_conf >= 0.3:
            status = "ТРЕБУЕТ ПРОВЕРКИ"
            color = 'orange'
        else:
            status = "ВЕРОЯТНО БЕЗОПАСНО"
            color = 'green'
        
        # Добавляем информацию на график
        plt.title(f"{status}", fontsize=16, color=color, fontweight='bold')
        
        # Выводим информацию о обнаруженных объектах
        print(f"\nСтатус: {status}")
        print("Обнаруженные объекты:")
        
        for name, conf in detections:
            print(f"- {name}: {conf*100:.1f}% уверенности")
            
        if not detections:
            print("Объекты не обнаружены")
        
        # Сохраняем результат
        if save_path:
            result_filename = f"result_{os.path.basename(save_path)}" if i == 0 else f"result_{i}_{os.path.basename(save_path)}"
            result_path = os.path.join(os.path.dirname(save_path), result_filename)
            plt.savefig(result_path)
            print(f"Результат сохранен как {result_path}")
        
        plt.show()

def main():
    parser = argparse.ArgumentParser(description="Обнаружение взрывоопасных предметов с помощью YOLO")
    parser.add_argument("--model", type=str, required=True, help="Путь к файлу модели YOLO (.pt)")
    parser.add_argument("--image", type=str, required=True, help="Путь к изображению для анализа")
    parser.add_argument("--conf", type=float, default=0.25, help="Порог уверенности (0-1)")
    parser.add_argument("--classes", nargs='+', default=["mine", "not_dangerous"], help="Имена классов")
    args = parser.parse_args()
    
    # Проверка наличия файлов
    if not os.path.exists(args.model):
        print(f"Ошибка: файл модели '{args.model}' не найден.")
        return
        
    if not os.path.exists(args.image):
        print(f"Ошибка: файл изображения '{args.image}' не найден.")
        return
    
    print(f"Модель: {args.model}")
    print(f"Изображение: {args.image}")
    print(f"Порог уверенности: {args.conf}")
    print(f"Классы: {args.classes}")
    
    # Загрузка модели
    try:
        model = YOLO(args.model)
        print("Модель успешно загружена.")
    except Exception as e:
        print(f"Ошибка загрузки модели: {e}")
        return
    
    # Выполнение предсказания и замер времени
    start_time = time.time()
    results = predict_with_yolo(model, args.image, conf_threshold=args.conf)
    end_time = time.time()
    
    inference_time = end_time - start_time
    print(f"Время инференса: {inference_time:.4f} секунд")
    
    # Визуализация результатов
    visualize_yolo_prediction(results, args.classes, args.conf, args.image)
    
if __name__ == "__main__":
    main() 