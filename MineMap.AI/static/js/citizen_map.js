// Глобальные переменные
let map;
let markers = [];
let markerCluster = null;
let explosiveObjects = [];
let users = [];
let regions = [];
let googleMapsLoaded = true;
let gpsWatchId = null;
let gpsPositions = [];
let cameraStream = null;
let photoCountdown = 0;
let locationStable = false;

// Глобальная переменная для хранения информации о текущем пользователе
let currentUser = null;

// Инициализация карты Google Maps
function initMap() {
    try {
        // Проверка доступности Google Maps API
        if (typeof google === 'undefined') {
            console.warn('Google Maps API не доступен');
            return;
        }
        
        googleMapsLoaded = true;
        
        // Получаем элемент карты
        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.warn('Элемент карты не найден на странице');
            return;
        }
        
        // Центр Украины
        const center = { lat: 49.0, lng: 31.0 };
        
        // Создаем карту
        map = new google.maps.Map(mapElement, {
            zoom: 6,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false
        });

        // Добавляем обработчики событий для кнопок
        document.getElementById('zoomIn').addEventListener('click', () => {
            map.setZoom(map.getZoom() + 1);
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            map.setZoom(map.getZoom() - 1);
        });

        // Обработчик кнопки сообщения об опасности
        const reportBtn = document.getElementById('reportModal');
        if (reportBtn) {
            reportBtn.addEventListener('show.bs.modal', onReportModalShow);
        }

        // Обработчик кнопки отправки сообщения
        const submitReportBtn = document.getElementById('submitReport');
        if (submitReportBtn) {
            submitReportBtn.addEventListener('click', submitReport);
        }
        
        console.log('Карта инициализирована успешно');

        // Загружаем данные о взрывоопасных объектах
        loadExplosiveObjects();

        // Получаем текущего пользователя
        getCurrentUser();
        
    } catch (error) {
        console.error('Ошибка при инициализации карты:', error);
        const mapElement = document.getElementById("map");
        if (mapElement) {
            mapElement.innerHTML = '<div class="alert alert-danger">Ошибка при инициализации карты: ' + error.message + '</div>';
            mapElement.style.height = 'auto';
        }
    }
}

// Функция для получения информации о текущем пользователе
async function getCurrentUser() {
    try {
        const response = await fetch('/api/current-user');
        if (response.ok) {
            currentUser = await response.json();
            console.log('Текущий пользователь:', currentUser);
        } else {
            console.error('Ошибка при получении данных пользователя:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
    }
}

// Функция загрузки данных о взрывоопасных объектах
async function loadExplosiveObjects() {
    try {
        const response = await fetch('/api/explosive-objects');
        if (response.ok) {
            explosiveObjects = await response.json();
            console.log('Загружено объектов:', explosiveObjects.length);
            addMarkersToMap();
        } else {
            console.error('Ошибка при загрузке данных:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

// Функция вызывается при открытии модального окна "Сообщить об опасности"
function onReportModalShow() {
    // Находим или создаем элементы для камеры и GPS данных
    let modalBody = document.querySelector('#reportModal .modal-body');
    
    // Добавляем контейнер для камеры, если его еще нет
    if (!document.getElementById('cameraContainer')) {
        const cameraContainer = document.createElement('div');
        cameraContainer.id = 'cameraContainer';
        cameraContainer.className = 'mb-3';
        cameraContainer.innerHTML = `
            <label class="form-label">Фото ситуации</label>
            <div class="camera-wrapper position-relative mb-2" style="width:100%; height:300px; background-color:#000;">
                <video id="cameraPreview" style="width:100%; height:100%; object-fit:cover;" autoplay muted></video>
                <canvas id="photoCanvas" style="display:none; width:100%; height:100%;"></canvas>
                <div id="gpsStatus" class="position-absolute top-0 end-0 p-2 badge bg-warning">Получение GPS...</div>
                <div id="photoCountdown" class="position-absolute top-50 start-50 translate-middle badge bg-danger fs-1" style="display:none;">10</div>
            </div>
            <div class="d-flex justify-content-between">
                <button type="button" id="startCamera" class="btn btn-sm btn-primary">Включить камеру</button>
                <button type="button" id="takePhoto" class="btn btn-sm btn-success" disabled>Сделать фото</button>
                <button type="button" id="retakePhoto" class="btn btn-sm btn-secondary" style="display:none;">Переснять</button>
            </div>
            <input type="hidden" id="photoData" name="photoData">
        `;
        
        // Вставляем контейнер в начало формы
        const reportForm = document.getElementById('reportForm');
        reportForm.insertBefore(cameraContainer, reportForm.firstChild);
        
        // Добавляем обработчики событий для новых кнопок
        setTimeout(() => {
            document.getElementById('startCamera').addEventListener('click', startCamera);
            document.getElementById('takePhoto').addEventListener('click', startPhotoCountdown);
            document.getElementById('retakePhoto').addEventListener('click', retakePhoto);
        }, 100);
    }
    
    // Запускаем отслеживание GPS
    startGpsTracking();
}

// Функция для запуска камеры
async function startCamera() {
    try {
        // Проверяем поддержку камеры в браузере
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Ваш браузер не поддерживает доступ к камере');
            return;
        }
        
        // Запрашиваем доступ к камере
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Используем заднюю камеру на мобильных устройствах
            audio: false
        });
        
        // Отображаем превью камеры
        const videoElement = document.getElementById('cameraPreview');
        videoElement.srcObject = cameraStream;
        videoElement.style.display = 'block';
        
        // Скрываем canvas с фото, если он был отображен
        document.getElementById('photoCanvas').style.display = 'none';
        
        // Активируем кнопку фото и деактивируем кнопку запуска камеры
        document.getElementById('takePhoto').disabled = false;
        document.getElementById('startCamera').disabled = true;
        document.getElementById('retakePhoto').style.display = 'none';
        
        console.log('Камера успешно запущена');
    } catch (error) {
        console.error('Ошибка при запуске камеры:', error);
        alert('Не удалось получить доступ к камере: ' + error.message);
    }
}

// Функция запуска отсчета для фото
function startPhotoCountdown() {
    // Проверяем, стабильна ли позиция GPS
    if (!locationStable) {
        alert('Дождитесь стабилизации GPS для точных координат (необходимо оставаться на месте)');
        return;
    }
    
    // Начинаем отсчет с 10 секунд
    photoCountdown = 10;
    const countdownElement = document.getElementById('photoCountdown');
    countdownElement.textContent = photoCountdown;
    countdownElement.style.display = 'block';
    
    // Деактивируем кнопку фото во время отсчета
    document.getElementById('takePhoto').disabled = true;
    
    // Запускаем интервал для отсчета
    const countdownInterval = setInterval(() => {
        photoCountdown--;
        countdownElement.textContent = photoCountdown;
        
        // Если позиция изменилась значительно, прерываем отсчет
        if (!locationStable) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            document.getElementById('takePhoto').disabled = false;
            alert('Вы двигаетесь. Оставайтесь на месте для получения точных координат.');
            return;
        }
        
        // Если отсчет завершен, делаем фото
        if (photoCountdown <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            takePhoto();
        }
    }, 1000);
}

// Функция для создания фото
function takePhoto() {
    if (!cameraStream) {
        alert('Камера не активирована');
        return;
    }
    
    try {
        // Получаем элементы видео и canvas
        const videoElement = document.getElementById('cameraPreview');
        const canvasElement = document.getElementById('photoCanvas');
        const context = canvasElement.getContext('2d');
        
        // Устанавливаем размеры canvas равными размерам видео
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        // Рисуем текущий кадр видео на canvas
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Получаем данные фото в формате Base64
        const photoData = canvasElement.toDataURL('image/jpeg');
        
        // Сохраняем данные фото в скрытое поле
        document.getElementById('photoData').value = photoData;
        
        // Показываем canvas с фото и скрываем видео
        videoElement.style.display = 'none';
        canvasElement.style.display = 'block';
        
        // Останавливаем камеру
        stopCamera();
        
        // Показываем кнопку "Переснять" и деактивируем кнопку "Сделать фото"
        document.getElementById('retakePhoto').style.display = 'inline-block';
        document.getElementById('takePhoto').disabled = true;
        document.getElementById('startCamera').disabled = false;
        
        console.log('Фото успешно сделано');
    } catch (error) {
        console.error('Ошибка при создании фото:', error);
        alert('Не удалось сделать фото: ' + error.message);
    }
}

// Функция для повторного создания фото
function retakePhoto() {
    // Очищаем данные предыдущего фото
    document.getElementById('photoData').value = '';
    
    // Запускаем камеру заново
    startCamera();
}

// Функция для остановки камеры
function stopCamera() {
    if (cameraStream) {
        // Останавливаем все треки камеры
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// Функция для запуска отслеживания GPS
function startGpsTracking() {
    // Очищаем предыдущие данные
    gpsPositions = [];
    locationStable = false;
    
    // Проверяем поддержку геолокации в браузере
    if (!navigator.geolocation) {
        alert('Ваш браузер не поддерживает геолокацию');
        return;
    }
    
    // Обновляем интерфейс
    const gpsStatus = document.getElementById('gpsStatus');
    gpsStatus.textContent = 'Получение GPS...';
    gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-warning';
    
    // Запускаем отслеживание позиции
    gpsWatchId = navigator.geolocation.watchPosition(
        // Успешное получение позиции
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`GPS: ${latitude}, ${longitude} (точность: ${accuracy}м)`);
            
            // Добавляем новую позицию в массив
            gpsPositions.push({ latitude, longitude, accuracy, timestamp: Date.now() });
            
            // Если у нас собрано более 5 позиций
            if (gpsPositions.length > 5) {
                // Удаляем самую старую позицию
                gpsPositions.shift();
                
                // Проверяем стабильность позиции
                checkPositionStability();
            }
            
            // Обновляем поля формы
            document.getElementById('latitude').value = latitude;
            document.getElementById('longitude').value = longitude;
        },
        // Ошибка получения позиции
        (error) => {
            console.error('Ошибка GPS:', error);
            gpsStatus.textContent = 'Ошибка GPS!';
            gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-danger';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Вы запретили доступ к геолокации');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Информация о позиции недоступна');
                    break;
                case error.TIMEOUT:
                    alert('Истекло время ожидания получения позиции');
                    break;
                default:
                    alert('Неизвестная ошибка геолокации');
            }
        },
        // Опции геолокации
        {
            enableHighAccuracy: true, // Высокая точность
            maximumAge: 0,           // Не использовать кэшированные данные
            timeout: 10000           // Таймаут 10 секунд
        }
    );
}

// Функция для проверки стабильности позиции
function checkPositionStability() {
    // Берем последние 5 позиций
    const recentPositions = gpsPositions.slice(-5);
    
    // Рассчитываем среднюю точность
    const avgAccuracy = recentPositions.reduce((sum, pos) => sum + pos.accuracy, 0) / recentPositions.length;
    
    // Проверяем, не слишком ли большой разброс в координатах
    let maxDistance = 0;
    for (let i = 0; i < recentPositions.length - 1; i++) {
        for (let j = i + 1; j < recentPositions.length; j++) {
            const distance = calculateDistance(
                recentPositions[i].latitude, recentPositions[i].longitude,
                recentPositions[j].latitude, recentPositions[j].longitude
            );
            maxDistance = Math.max(maxDistance, distance);
        }
    }
    
    // Если максимальное расстояние меньше средней точности, считаем позицию стабильной
    locationStable = maxDistance < avgAccuracy;
    
    // Обновляем интерфейс
    const gpsStatus = document.getElementById('gpsStatus');
    if (locationStable) {
        gpsStatus.textContent = 'GPS стабилен';
        gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-success';
    } else {
        gpsStatus.textContent = 'Стабилизация GPS...';
        gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-warning';
    }
}

// Функция для остановки отслеживания GPS
function stopGpsTracking() {
    if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
}

// Функция для расчета расстояния между двумя точками (формула гаверсинуса)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Радиус Земли в метрах
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Расстояние в метрах
}

// Конвертация градусов в радианы
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Функция отправки сообщения об опасности
async function submitReport() {
    // Проверяем, получены ли координаты
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    if (!latitude || !longitude) {
        alert('Невозможно отправить сообщение без координат. Дождитесь получения GPS данных.');
        return;
    }
    
    if (!locationStable) {
        alert('Локация не стабильна. Оставайтесь на месте для получения точных координат.');
        return;
    }
    
    // Проверяем, сделано ли фото
    const photoData = document.getElementById('photoData').value;
    if (!photoData) {
        alert('Пожалуйста, сделайте фото опасной ситуации');
        return;
    }
    
    // Собираем данные формы
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const regionId = document.getElementById('region').value;
    
    // Проверяем заполнение обязательных полей
    if (!title || !regionId) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Создаем объект с данными для отправки
    const reportData = {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: 'unconfirmed', // Статус по умолчанию - непроверено
        priority: 'medium',    // Приоритет по умолчанию - средний
        region_id: parseInt(regionId),
        photo_data: photoData  // Данные фото в формате Base64
    };
    
    try {
        // Отправляем данные на сервер
        const response = await fetch('/api/report-danger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            // Если запрос успешен, закрываем модальное окно и показываем сообщение
            const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
            modal.hide();
            
            alert('Сообщение об опасности успешно отправлено. Спасибо за вашу бдительность!');
            
            // Очищаем данные формы
            document.getElementById('reportForm').reset();
            document.getElementById('photoData').value = '';
            
            // Останавливаем камеру и GPS
            stopCamera();
            stopGpsTracking();
        } else {
            // Если сервер вернул ошибку
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Произошла ошибка при отправке сообщения');
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Не удалось отправить сообщение: ' + error.message);
    }
}

// Очистка ресурсов при закрытии модального окна
document.addEventListener('DOMContentLoaded', () => {
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        // Обработчик события перед скрытием модального окна
        reportModal.addEventListener('hide.bs.modal', () => {
            // Убираем фокус с кнопки закрытия перед скрытием модального окна
            document.activeElement.blur();
            // Возвращаем фокус на элемент, который вызвал модальное окно (обычно кнопка "Сообщить об опасности")
            const reportBtn = document.querySelector('.report-btn');
            if (reportBtn) {
                setTimeout(() => {
                    reportBtn.focus();
                }, 0);
            }
        });
        
        // Обработчик события после полного скрытия модального окна
        reportModal.addEventListener('hidden.bs.modal', () => {
            stopCamera();
            stopGpsTracking();
        });
    }
});

// Функция добавления маркеров на карту
async function addMarkersToMap() {
    try {
        // Очищаем существующие маркеры
        clearMarkers();
        
        // Если нет данных об объектах, выходим
        if (!explosiveObjects || !explosiveObjects.length) {
            console.warn('Нет данных о вибухонебезпечних об\'єктах для отображения на карте');
            return;
        }
        
        // Создаем массив для хранения маркеров, которые будут кластеризованы
        const markersForCluster = [];
        
        // Добавляем маркеры на карту
        explosiveObjects.forEach(obj => {
            // Определяем иконку маркера в зависимости от статуса
            let markerIcon;
            
            if (obj.status === 'mined' || obj.status === 'dangerous') {
                // Используем красный флаг для опасных объектов
                markerIcon = {
                    url: "/static/images/flag_red.png",
                    scaledSize: new google.maps.Size(48, 48),
                    anchor: new google.maps.Point(6, 48) // Anchor point at the bottom of the flag pole
                };
            } else if (obj.status === 'demined') {
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" };
            } else if (obj.status === 'unconfirmed') {
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" };
            } else if (obj.status === 'secret') {
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png" };
            } else if (obj.status === 'archived') {
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" };
            }
            
            let marker;
            
            // Проверяем доступность AdvancedMarkerElement
            if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                // Создаем элемент для контента маркера
                const markerContent = document.createElement('div');
                
                if (obj.status === 'mined' || obj.status === 'dangerous') {
                    // Для опасных объектов используем изображение флага
                    const img = document.createElement('img');
                    img.src = "/static/images/flag_red.png";
                    img.style.width = '48px';
                    img.style.height = '48px';
                    // Позиционируем флаг так, чтобы его основание находилось в точке координат
                    markerContent.style.position = 'relative';
                    markerContent.style.transform = 'translate(-6px, -48px)';
                    markerContent.appendChild(img);
                } else {
                    // Для других статусов создаем цветной круг
                    markerContent.style.width = '20px';
                    markerContent.style.height = '20px';
                    markerContent.style.borderRadius = '50%';
                    markerContent.style.border = '2px solid white';
                    
                    // Определяем цвет кружка в зависимости от статуса
                    if (obj.status === 'demined') {
                        markerContent.style.backgroundColor = '#4CAF50'; // зеленый
                    } else if (obj.status === 'unconfirmed') {
                        markerContent.style.backgroundColor = '#FFC107'; // желтый
                    } else if (obj.status === 'secret') {
                        markerContent.style.backgroundColor = '#9C27B0'; // фиолетовый
                    } else if (obj.status === 'archived') {
                        markerContent.style.backgroundColor = '#607D8B'; // серый/синий
                    }
                }
                
                // Создаем AdvancedMarkerElement
                marker = new google.maps.marker.AdvancedMarkerElement({
                    position: { lat: obj.latitude, lng: obj.longitude },
                    map: map,
                    title: obj.title || `Объект #${obj.id}`,
                    content: markerContent
                });
            } else {
                // Запасной вариант с обычным маркером
                marker = new google.maps.Marker({
                    position: { lat: obj.latitude, lng: obj.longitude },
                    map: map,
                    title: obj.title || `Объект #${obj.id}`,
                    icon: markerIcon
                });
                
                // Добавляем маркер в массив для кластеризации
                markersForCluster.push(marker);
            }
            
            // Проверяем, принадлежит ли объект текущему пользователю
            const isMyObject = currentUser && obj.reported_by === currentUser.id;
            
            // Проверяем наличие фото и формируем HTML для его отображения
            let photoHtml = '';
            if (obj.photo_url) {
                photoHtml = `
                    <div style="margin-bottom: 10px; text-align: center;">
                        <img src="${obj.photo_url}" alt="Фото об'єкта" style="max-width: 100%; max-height: 200px; border-radius: 4px; cursor: pointer;" 
                            class="object-photo" data-photo-url="${obj.photo_url}" 
                            onclick="showFullSizePhoto('${obj.photo_url}', '${obj.title}')"
                            onerror="this.onerror=null; this.src='/static/images/no-image.svg'; this.alt='Фото недоступно';">
                        <div class="small text-muted">Натисніть на фото для збільшення</div>
                    </div>`;
                console.log("Объект с фото:", obj.id, obj.photo_url);
            } else {
                console.log("Объект без фото:", obj.id);
            }
            
            // Создаем инфо-окно с учетом возможности редактирования
            let content = `
                <div style="padding: 10px;">
                    <h5 style="margin-top: 0;">${obj.title}</h5>
                    ${photoHtml}
                    <p style="margin-bottom: 5px;"><strong>Статус:</strong> ${getStatusText(obj.status)}</p>
                    <p style="margin-bottom: 5px;"><strong>Пріоритет:</strong> ${getPriorityText(obj.priority)}</p>
                    <p style="margin-bottom: 5px;"><strong>Регіон:</strong> ${obj.region_name}</p>
                    <p style="margin-bottom: 5px;"><strong>Дата виявлення:</strong> ${new Date(obj.reported_at).toLocaleDateString('uk-UA')}</p>
                    <p>${obj.description ? (obj.description.length > 100 ? obj.description.substring(0, 100) + '...' : obj.description) : 'Опис відсутній'}</p>
                    <div class="mt-2">
                        <button onclick="viewObjectDetails(${obj.id})" class="btn btn-sm btn-primary">Детальніше</button>
            `;
            
            // Если объект принадлежит текущему пользователю, добавляем кнопку редактирования
            if (isMyObject) {
                content += `
                        <button class="btn btn-sm btn-warning edit-object-btn ms-2" data-object-id="${obj.id}">Редагувати</button>
                `;
            }
            
            content += `
                    </div>
                </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({ content });
            
            // Добавляем обработчик клика на маркер
            if (marker.addEventListener) {
                // Для AdvancedMarkerElement используем addEventListener
                marker.addEventListener('click', () => {
                    infoWindow.open(map, marker);
                    
                    // Добавляем обработчик события для кнопки редактирования внутри infoWindow
                    setTimeout(() => {
                        const editBtn = document.querySelector(`.edit-object-btn[data-object-id="${obj.id}"]`);
                        if (editBtn) {
                            editBtn.addEventListener('click', () => {
                                editObject(obj.id);
                            });
                        }
                    }, 100);
                });
            } else {
                // Для обычного Marker используем addListener
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                    
                    // Добавляем обработчик события для кнопки редактирования внутри infoWindow
                    setTimeout(() => {
                        const editBtn = document.querySelector(`.edit-object-btn[data-object-id="${obj.id}"]`);
                        if (editBtn) {
                            editBtn.addEventListener('click', () => {
                                editObject(obj.id);
                            });
                        }
                    }, 100);
                });
            }
            
            // Добавляем маркер в массив
            markers.push(marker);
        });
        
        // Создаем кластеризатор, если есть маркеры для кластеризации (только для обычных маркеров)
        if (markersForCluster.length > 0) {
            // Настройка рендеринга кластеров
            const renderer = {
                render: ({ count, position }) => {
                    // Создаем элемент для кластера
                    const clusterElement = document.createElement('div');
                    clusterElement.className = 'cluster-marker';
                    clusterElement.style.position = 'relative';
                    
                    // Определяем размер кластера в зависимости от количества маркеров
                    let size = 48; // Минимальный размер
                    if (count > 10) size = 64;
                    if (count > 50) size = 80;
                    if (count > 100) size = 96;
                    
                    // Создаем изображение флага
                    const flagImg = document.createElement('img');
                    flagImg.src = "/static/images/flag_red.png";
                    flagImg.style.width = `${size}px`;
                    flagImg.style.height = `${size}px`;
                    clusterElement.appendChild(flagImg);
                    
                    // Добавляем стили для корректного позиционирования кластера
                    clusterElement.style.transform = `translate(-6px, -${size}px)`;
                    
                    // Создаем контейнер для числа
                    const countElement = document.createElement('div');
                    countElement.style.position = 'absolute';
                    countElement.style.top = '50%';
                    countElement.style.left = '50%';
                    countElement.style.transform = 'translate(-50%, -80%)';
                    countElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    countElement.style.borderRadius = '50%';
                    countElement.style.width = `${Math.round(size * 0.6)}px`;
                    countElement.style.height = `${Math.round(size * 0.6)}px`;
                    countElement.style.display = 'flex';
                    countElement.style.alignItems = 'center';
                    countElement.style.justifyContent = 'center';
                    countElement.style.color = 'white';
                    countElement.style.fontWeight = 'bold';
                    countElement.style.fontSize = `${Math.round(size / 3)}px`;
                    countElement.textContent = count;
                    clusterElement.appendChild(countElement);
                    
                    // Создаем маркер для кластера
                    return new google.maps.marker.AdvancedMarkerElement({
                        position,
                        content: clusterElement
                    });
                }
            };
            
            // Если старый кластеризатор существует, очищаем его
            if (markerCluster) {
                markerCluster.clearMarkers();
            }
            
            // Создаем новый кластеризатор
            markerCluster = new markerClusterer.MarkerClusterer({
                map,
                markers: markersForCluster,
                renderer
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке объектов:', error);
    }
}

// Очистка маркеров на карте
function clearMarkers() {
    try {
        // Если есть кластеризатор маркеров, очищаем его
        if (markerCluster) {
            markerCluster.clearMarkers();
            markerCluster = null;
        }
        
        // Очищаем отдельные маркеры
        if (!markers || !markers.length) return;
        
        markers.forEach(marker => {
            try {
                if (marker instanceof google.maps.Marker) {
                    marker.setMap(null);
                } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
                    marker.map = null;
                } else {
                    // Общий случай для обратной совместимости
                    if (marker.setMap) {
                        marker.setMap(null);
                    } else if ('map' in marker) {
                        marker.map = null;
                    }
                }
            } catch (e) {
                console.warn('Ошибка при удалении маркера:', e);
            }
        });
        markers = [];
    } catch (error) {
        console.error('Ошибка при очистке маркеров:', error);
        markers = [];
    }
}

// Вспомогательные функции для отображения текста
function getStatusText(status) {
    switch (status) {
        case 'mined':
            return 'Замінована';
        case 'dangerous':
            return 'Небезпечно';
        case 'unconfirmed':
            return 'Непідтверджена';
        case 'demined':
            return 'Розмінована';
        case 'archived':
            return 'Архів';
        case 'secret':
            return 'Секретна';
        default:
            return 'Невідомо';
    }
}

function getPriorityText(priority) {
    switch (priority) {
        case 'high':
            return 'Високий';
        case 'medium':
            return 'Середній';
        case 'low':
            return 'Низький';
        default:
            return 'Невідомо';
    }
}

// Функция для редактирования объекта
function editObject(objectId) {
    // Находим объект по ID
    const obj = explosiveObjects.find(o => o.id === objectId);
    if (!obj) {
        console.error(`Объект с ID ${objectId} не найден`);
        return;
    }
    
    // Проверяем, принадлежит ли объект текущему пользователю
    if (!currentUser || obj.reported_by !== currentUser.id) {
        alert('Вы можете редактировать только свои метки!');
        return;
    }
    
    // Создаем модальное окно для редактирования
    const modalHtml = `
        <div class="modal fade" id="editObjectModal" tabindex="-1" aria-labelledby="editObjectModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editObjectModalLabel">Редагування об'єкта</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editObjectForm">
                            <input type="hidden" id="edit_object_id" value="${obj.id}">
                            <div class="mb-3">
                                <label for="edit_title" class="form-label">Назва</label>
                                <input type="text" class="form-control" id="edit_title" value="${obj.title}" required>
                            </div>
                            <div class="mb-3">
                                <label for="edit_description" class="form-label">Опис</label>
                                <textarea class="form-control" id="edit_description" rows="3">${obj.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="edit_status" class="form-label">Статус</label>
                                <select class="form-select" id="edit_status" disabled>
                                    <option value="unconfirmed" ${obj.status === 'unconfirmed' ? 'selected' : ''}>Непідтверджена</option>
                                    <option value="mined" ${obj.status === 'mined' ? 'selected' : ''}>Замінована</option>
                                    <option value="demined" ${obj.status === 'demined' ? 'selected' : ''}>Розмінована</option>
                                    <option value="archived" ${obj.status === 'archived' ? 'selected' : ''}>Архів</option>
                                </select>
                                <small class="form-text text-muted">Статус может изменить только модератор или администратор</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Скасувати</button>
                        <button type="button" class="btn btn-primary" id="saveObjectEdit">Зберегти</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Показываем модальное окно
    const editModal = new bootstrap.Modal(document.getElementById('editObjectModal'));
    editModal.show();
    
    // Добавляем обработчик для кнопки сохранения
    document.getElementById('saveObjectEdit').addEventListener('click', async () => {
        // Получаем данные из формы
        const editedObj = {
            id: parseInt(document.getElementById('edit_object_id').value),
            title: document.getElementById('edit_title').value,
            description: document.getElementById('edit_description').value
        };
        
        // Проверяем обязательные поля
        if (!editedObj.title) {
            alert('Заполните обязательные поля');
            return;
        }
        
        try {
            // Отправляем запрос на обновление объекта
            const response = await fetch(`/api/explosive-objects/${editedObj.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editedObj.title,
                    description: editedObj.description
                })
            });
            
            if (response.ok) {
                // Закрываем модальное окно
                editModal.hide();
                
                // Удаляем модальное окно из DOM после закрытия
                document.getElementById('editObjectModal').addEventListener('hidden.bs.modal', function () {
                    this.remove();
                });
                
                // Перезагружаем объекты
                await loadExplosiveObjects();
                
                alert('Объект успешно обновлен');
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Произошла ошибка при обновлении объекта');
            }
        } catch (error) {
            console.error('Ошибка при обновлении объекта:', error);
            alert('Ошибка при обновлении объекта: ' + error.message);
        }
    });
    
    // Удаляем модальное окно из DOM после закрытия
    document.getElementById('editObjectModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Функция для отображения фото в полном размере
function showFullSizePhoto(photoUrl, title) {
    // Создаем модальное окно для просмотра фото в полном размере
    const modalHtml = `
        <div class="modal fade" id="fullSizePhotoModal" tabindex="-1" aria-labelledby="fullSizePhotoModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="fullSizePhotoModalLabel">${title || 'Фото об\'єкта'}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${photoUrl}" alt="Фото об'єкта" style="max-width: 100%; max-height: 80vh;" id="fullSizeImage">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Показываем модальное окно
    const photoModal = new bootstrap.Modal(document.getElementById('fullSizePhotoModal'));
    photoModal.show();
    
    // Удаляем модальное окно из DOM после закрытия
    document.getElementById('fullSizePhotoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    
    // Добавляем обработчик ошибки для изображения
    document.getElementById('fullSizeImage').addEventListener('error', function() {
        this.src = '/static/images/no-image.png';
        this.alt = 'Фото недоступно';
    });
}

// Добавляем функцию глобально, чтобы она была доступна из HTML-кода модального окна
window.showFullSizePhoto = showFullSizePhoto;
window.viewObjectDetails = viewObjectDetails;

// Функция для просмотра деталей объекта
function viewObjectDetails(objectId) {
    // Находим объект по ID
    const obj = explosiveObjects.find(o => o.id === objectId);
    if (!obj) {
        console.error(`Объект с ID ${objectId} не найден`);
        return;
    }
    
    // Создаем модальное окно с деталями
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'objectDetailsModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'objectDetailsModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    // Подготовка HTML для фото
    const photoHtml = obj.photo_url ? 
        `<div class="mb-3 text-center">
            <img src="${obj.photo_url}" alt="Фото об'єкта" class="img-fluid rounded" 
                style="max-height: 300px; cursor: pointer;" 
                onclick="showFullSizePhoto('${obj.photo_url}', '${obj.title}')"
                onerror="this.onerror=null; this.src='/static/images/no-image.svg'; this.alt='Фото недоступно';">
            <div class="small text-muted">Натисніть на фото для збільшення</div>
        </div>` : 
        `<div class="mb-3 text-center bg-light p-5 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-image text-muted" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <p class="text-muted mt-2">Фото відсутнє</p>
        </div>`;
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="objectDetailsModalLabel">${obj.title || `Об'єкт #${obj.id}`}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            ${photoHtml}
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <h6>Опис:</h6>
                                <p>${obj.description || 'Опис відсутній'}</p>
                            </div>
                            <div class="mb-3">
                                <h6>Статус:</h6>
                                <span class="badge ${getStatusBadgeClass(obj.status)}">${getStatusText(obj.status)}</span>
                            </div>
                            <div class="mb-3">
                                <h6>Пріоритет:</h6>
                                <span class="badge ${getPriorityBadgeClass(obj.priority)}">${getPriorityText(obj.priority)}</span>
                            </div>
                            <div class="mb-3">
                                <h6>Координати:</h6>
                                <p>${obj.latitude.toFixed(6)}, ${obj.longitude.toFixed(6)}</p>
                            </div>
                            <div class="mb-3">
                                <h6>Регіон:</h6>
                                <p>${obj.region_name || 'Не вказано'}</p>
                            </div>
                            <div class="mb-3">
                                <h6>Додано:</h6>
                                <p>${formatDate(obj.reported_at)}</p>
                            </div>
                            ${obj.reported_by_username ? 
                                `<div class="mb-3">
                                    <h6>Повідомив:</h6>
                                    <p>${obj.reported_by_username}</p>
                                </div>` : ''
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрити</button>
                    ${currentUser && obj.reported_by === currentUser.id ? 
                        `<button type="button" class="btn btn-warning" onclick="editObject(${obj.id})">Редагувати</button>` : ''
                    }
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.appendChild(modal);
    
    // Инициализируем и показываем модальное окно
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Удаляем модальное окно из DOM после закрытия
    modal.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modal);
    });
}

// Получение класса бейджа статуса
function getStatusBadgeClass(status) {
    switch (status) {
        case 'mined': return 'bg-danger';
        case 'unconfirmed': return 'bg-warning text-dark';
        case 'demined': return 'bg-success';
        case 'archived': return 'bg-secondary';
        case 'secret': return 'bg-purple';
        case 'dangerous': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Получение класса бейджа приоритета
function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning text-dark';
        case 'low': return 'bg-info';
        default: return 'bg-secondary';
    }
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA');
}