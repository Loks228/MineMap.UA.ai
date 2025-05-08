import os
from model import (
    create_yolo_model, 
    prepare_yolo_data,
    train_yolo_model, 
    fine_tune_yolo,
    evaluate_yolo_model,
    predict_with_yolo,
    create_yolo_dataset_yaml,
    convert_dataset_to_yolo_format
)
import matplotlib.pyplot as plt
import cv2

# Пример использования

def main():
    # Пути к данным
    data_dir = "path/to/explosives_dataset"  # Путь к исходному датасету
    output_dir = "path/to/yolo_dataset"      # Путь для сохранения датасета в формате YOLO
    
    # Конвертация датасета в формат YOLO
    train_dir, val_dir = convert_dataset_to_yolo_format(data_dir, output_dir)
    
    # Создание файла конфигурации данных
    class_names = ["mine", "not_dangerous"]  # Пример классов
    data_yaml_path = create_yolo_dataset_yaml(train_dir, val_dir, class_names)
    
    # 1. Обучение с нуля
    print("=== Обучение новой модели YOLO ===")
    model = create_yolo_model(pretrained=False)  # Создание модели с нуля
    trained_model = train_yolo_model(model, data_yaml_path)
    
    # 2. Использование предобученной модели и fine-tuning
    print("=== Fine-tuning предобученной модели YOLO ===")
    pretrained_model = create_yolo_model(pretrained=True)  # Загрузка предобученной модели
    fine_tuned_model = fine_tune_yolo(pretrained_model, data_yaml_path)
    
    # Оценка модели
    print("=== Оценка модели ===")
    evaluation_results = evaluate_yolo_model(fine_tuned_model, data_yaml_path)
    print(f"Метрики модели: {evaluation_results}")
    
    # Предсказание на одном изображении
    print("=== Предсказание на изображении ===")
    test_image_path = "path/to/test_image.jpg"
    
    # Проверяем, существует ли файл
    if os.path.exists(test_image_path):
        results = predict_with_yolo(fine_tuned_model, test_image_path)
        
        # Отображение результатов
        for result in results:
            # Отображение изображения с обнаруженными объектами
            img = result.plot()  # Это создает изображение с размеченными обнаружениями
            plt.figure(figsize=(10, 8))
            plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            plt.axis('off')
            plt.show()
            
            # Вывод информации о обнаруженных объектах
            print("\nОбнаруженные объекты:")
            for box in result.boxes:
                class_id = int(box.cls.item())
                class_name = class_names[class_id]
                confidence = box.conf.item()
                coords = box.xyxy.tolist()[0]  # [x1, y1, x2, y2]
                
                print(f"Класс: {class_name}, Уверенность: {confidence:.2f}, Координаты: {coords}")
    else:
        print(f"Файл {test_image_path} не найден.")

if __name__ == "__main__":
    main() 