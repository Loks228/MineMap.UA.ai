// Глобальные переменные
let map;
let markers = [];
let markerCluster = null;
let explosiveObjects = [];
let users = [];
let regions = [];
let googleMapsLoaded = true;

// Инициализация карты Google Maps
async function initMap() {
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
            streetViewControl: false,
            fullscreenControl: false
        });
        
        console.log('Карта инициализирована успешно');
        
        // Загружаем данные о взрывоопасных объектах
        await loadExplosiveObjects();
        
        // Обработчики событий для фильтров
        document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
        document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
        
        // Загружаем регионы
        await loadRegions();
        
        // Добавляем обработчики для модальных окон
        setupModalListeners();

        // Настройка обработчика клика по карте
        setupMapClickListener();
    } catch (error) {
        console.error('Ошибка при инициализации карты:', error);
        const mapElement = document.getElementById("map");
        if (mapElement) {
            mapElement.innerHTML = '<div class="alert alert-danger">Ошибка при инициализации карты: ' + error.message + '</div>';
            mapElement.style.height = 'auto';
        }
    }
}

// Функция загрузки регионов
async function loadRegions() {
    try {
        // Instead of loading from API, use hardcoded list of all Ukrainian regions
        regions = [
            { id: 1, name: 'Київ', code: 'kyiv', center_lat: 50.450001, center_lng: 30.523333, zoom_level: 10 },
            { id: 2, name: 'Харків', code: 'kharkiv', center_lat: 49.992599, center_lng: 36.231078, zoom_level: 10 },
            { id: 3, name: 'Львів', code: 'lviv', center_lat: 49.839683, center_lng: 24.029717, zoom_level: 10 },
            { id: 4, name: 'Одеса', code: 'odesa', center_lat: 46.482526, center_lng: 30.723310, zoom_level: 10 },
            { id: 5, name: 'Дніпро', code: 'dnipro', center_lat: 48.464700, center_lng: 35.046200, zoom_level: 10 },
            { id: 6, name: 'Запоріжжя', code: 'zaporizhia', center_lat: 47.838800, center_lng: 35.139600, zoom_level: 10 },
            { id: 7, name: 'Вінниця', code: 'vinnytsia', center_lat: 49.232800, center_lng: 28.480970, zoom_level: 10 },
            { id: 8, name: 'Черкаси', code: 'cherkasy', center_lat: 49.444430, center_lng: 32.059770, zoom_level: 10 },
            { id: 9, name: 'Полтава', code: 'poltava', center_lat: 49.588270, center_lng: 34.551420, zoom_level: 10 },
            { id: 10, name: 'Чернігів', code: 'chernihiv', center_lat: 51.498200, center_lng: 31.289350, zoom_level: 10 },
            { id: 11, name: 'Суми', code: 'sumy', center_lat: 50.907700, center_lng: 34.798100, zoom_level: 10 },
            { id: 12, name: 'Житомир', code: 'zhytomyr', center_lat: 50.254650, center_lng: 28.658670, zoom_level: 10 },
            { id: 13, name: 'Ужгород', code: 'uzhhorod', center_lat: 48.620800, center_lng: 22.287880, zoom_level: 10 },
            { id: 14, name: 'Чернівці', code: 'chernivtsi', center_lat: 48.291490, center_lng: 25.935840, zoom_level: 10 },
            { id: 15, name: 'Тернопіль', code: 'ternopil', center_lat: 49.553520, center_lng: 25.594767, zoom_level: 10 },
            { id: 16, name: 'Хмельницький', code: 'khmelnytskyi', center_lat: 49.421630, center_lng: 26.996530, zoom_level: 10 },
            { id: 17, name: 'Івано-Франківськ', code: 'ivano-frankisk', center_lat: 48.922630, center_lng: 24.711110, zoom_level: 10 },
            { id: 18, name: 'Луцьк', code: 'lutsk', center_lat: 50.747230, center_lng: 25.325380, zoom_level: 10 },
            { id: 19, name: 'Рівне', code: 'rivne', center_lat: 50.619900, center_lng: 26.251600, zoom_level: 10 },
            { id: 20, name: 'Миколаїв', code: 'mykolaiv', center_lat: 46.975870, center_lng: 31.994580, zoom_level: 10 },
            { id: 21, name: 'Херсон', code: 'kherson', center_lat: 46.635420, center_lng: 32.616870, zoom_level: 10 },
            { id: 22, name: 'Кропивницький', code: 'kirovohrad', center_lat: 48.507933, center_lng: 32.262317, zoom_level: 10 },
            { id: 23, name: 'Сєвєродонецьк', code: 'severodonetsk', center_lat: 48.948230, center_lng: 38.486050, zoom_level: 10 },
            { id: 24, name: 'Донецьк', code: 'donetsk', center_lat: 48.015880, center_lng: 37.802850, zoom_level: 10 },
            { id: 25, name: 'Луганськ', code: 'luhansk', center_lat: 48.574041, center_lng: 39.307815, zoom_level: 10 },
            { id: 26, name: 'Сімферополь', code: 'simferopol', center_lat: 44.952117, center_lng: 34.102417, zoom_level: 10 }
        ];
        console.log('Loaded regions:', regions.length);
        
        // Initialize the map utilities with our regions data
        if (typeof initMapUtilities === 'function') {
            initMapUtilities(regions);
        }
        
        // Fill region filter dropdown in admin controls
        const filterRegionSelect = document.getElementById('filterRegion');
        if (filterRegionSelect) {
            // Keep the "All regions" option
            const allOption = filterRegionSelect.querySelector('option[value="all"]');
            filterRegionSelect.innerHTML = '';
            filterRegionSelect.appendChild(allOption);
            
            // Add all regions
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                filterRegionSelect.appendChild(option);
            });
        }
        
        // Fill region filter for the map
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter) {
            // Keep the "All regions" option
            const allOption = regionFilter.querySelector('option[value="all"]');
            regionFilter.innerHTML = '';
            regionFilter.appendChild(allOption);
            
            // Add all regions
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionFilter.appendChild(option);
            });
            
            // Add event listener for filtering
            regionFilter.addEventListener('change', filterMarkersByRegion);
        }
        
        // Fill export region dropdown
        const exportRegionSelect = document.getElementById('exportRegion');
        if (exportRegionSelect) {
            // Keep the "All regions" option
            const allOption = exportRegionSelect.querySelector('option[value="all"]');
            exportRegionSelect.innerHTML = '';
            exportRegionSelect.appendChild(allOption);
            
            // Add all regions
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                exportRegionSelect.appendChild(option);
            });
        }
        
        // Fill region select in form
        const regionSelect = document.getElementById('region');
        if (regionSelect) {
            regionSelect.innerHTML = '';
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionSelect.appendChild(option);
            });
        }
        
        // Set up auto region detection for coordinates
        if (typeof setupAutoRegionDetection === 'function') {
            setupAutoRegionDetection('latitude', 'longitude', 'region');
        }
    } catch (error) {
        console.error('Error loading regions:', error);
    }
}

// Функция для загрузки данных о взрывоопасных объектах
async function loadExplosiveObjects() {
    try {
        console.log('Загрузка данных о взрывоопасных объектах...');
        const response = await fetch('/api/explosive-objects', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            // Добавляем кэш-бастинг, чтобы избежать кэширования
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Не удалось загрузить данные (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        explosiveObjects = Array.isArray(data) ? data : [];
        
        console.log(`Загружено ${explosiveObjects.length} взрывоопасных объектов`);
        
        // Добавляем маркеры на карту только если Google Maps API загружен и карта инициализирована
        if (googleMapsLoaded && map) {
            addMarkersToMap();
        }
        
        // Обновляем список последних объектов
        updateRecentObjects();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Можно добавить уведомление пользователя об ошибке
    }
}

// Функция для обновления выпадающих списков объектов
function updateObjectsDropdowns() {
    // Заполняем выпадающий список объектов для изменения статуса
    const objectIdSelect = document.getElementById('objectId');
    if (objectIdSelect) {
        // Очищаем текущие опции
        objectIdSelect.innerHTML = '';
        
        // Сортируем объекты по названию
        const sortedObjects = [...explosiveObjects].sort((a, b) => {
            const titleA = a.title || `Об'єкт #${a.id}`;
            const titleB = b.title || `Об'єкт #${b.id}`;
            return titleA.localeCompare(titleB);
        });
        
        // Добавляем опции объектов
        sortedObjects.forEach(obj => {
            const option = document.createElement('option');
            option.value = obj.id;
            option.textContent = obj.title || `Об'єкт #${obj.id}`;
            objectIdSelect.appendChild(option);
        });
    }
    
    // Заполняем выпадающий список объектов для удаления
    const deleteObjectIdSelect = document.getElementById('deleteObjectId');
    if (deleteObjectIdSelect) {
        // Очищаем текущие опции
        deleteObjectIdSelect.innerHTML = '';
        
        // Сортируем объекты по названию
        const sortedObjects = [...explosiveObjects].sort((a, b) => {
            const titleA = a.title || `Об'єкт #${a.id}`;
            const titleB = b.title || `Об'єкт #${b.id}`;
            return titleA.localeCompare(titleB);
        });
        
        // Добавляем опции объектов
        sortedObjects.forEach(obj => {
            const option = document.createElement('option');
            option.value = obj.id;
            option.textContent = obj.title || `Об'єкт #${obj.id}`;
            deleteObjectIdSelect.appendChild(option);
        });
    }
}

// Обновление списка последних объектов
function updateRecentObjects() {
    const recentObjectsContainer = document.getElementById('recentObjects');
    if (!recentObjectsContainer) return;
    
    // Сортируем объекты по дате добавления (от новых к старым)
    const sortedObjects = [...explosiveObjects].sort((a, b) => {
        return new Date(b.reported_at) - new Date(a.reported_at);
    });
    
    // Берем только последние 5 объектов
    const recentObjects = sortedObjects.slice(0, 5);
    
    recentObjectsContainer.innerHTML = '';
    
    if (recentObjects.length === 0) {
        recentObjectsContainer.innerHTML = '<div class="text-center text-muted">Нет доступных объектов</div>';
        return;
    }
    
    recentObjects.forEach(obj => {
        const objItem = document.createElement('div');
        objItem.className = 'object-item';
        objItem.innerHTML = `
            <strong>${obj.title || `Об'єкт #${obj.id}`}</strong>
            <div class="object-info">
                <span class="badge ${getPriorityBadgeClass(obj.priority)}">${getPriorityText(obj.priority)}</span>
                <span class="text-muted small">${formatDate(obj.reported_at)}</span>
            </div>
        `;
        
        // Добавляем обработчик клика для центрирования карты на объекте
        objItem.addEventListener('click', () => {
            map.setCenter({ lat: obj.latitude, lng: obj.longitude });
            map.setZoom(15);
        });
        
        recentObjectsContainer.appendChild(objItem);
    });
    
    // Обновляем выпадающие списки объектов
    updateObjectsDropdowns();
}

// Получение класса бейджа приоритета
function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'secret': return 'bg-purple';
        case 'high': return 'high';
        case 'medium': return 'medium';
        case 'low': return 'low';
        default: return 'medium';
    }
}

// Применение фильтров
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus').value;
    const regionFilter = document.getElementById('filterRegion').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    
    // Очищаем текущие маркеры
    clearMarkers();
    
    // Фильтруем объекты
    const filteredObjects = explosiveObjects.filter(obj => {
        // Проверка статуса
        if (statusFilter !== 'all' && obj.status !== statusFilter) return false;
        
        // Проверка региона
        if (regionFilter !== 'all' && obj.region_id.toString() !== regionFilter) return false;
        
        // Проверка приоритета
        if (priorityFilter !== 'all' && obj.priority !== priorityFilter) return false;
        
        return true;
    });
    
    // Создаем временный массив для хранения отфильтрованных данных
    const tempExplosiveObjects = explosiveObjects;
    explosiveObjects = filteredObjects;
    
    // Добавляем отфильтрованные маркеры
    addMarkersToMap();
    
    // Восстанавливаем оригинальный массив объектов
    explosiveObjects = tempExplosiveObjects;
}

// Сброс фильтров
function resetFilters() {
    // Сбрасываем значения фильтров
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterRegion').value = 'all';
    document.getElementById('filterPriority').value = 'all';
    
    // Очищаем текущие маркеры
    clearMarkers();
    
    // Добавляем все маркеры
    addMarkersToMap();
}

// Функция добавления маркеров на карту
async function addMarkersToMap() {
    try {
        // Если карта не инициализирована или нет Google Maps API, выходим
        if (!map || typeof google === 'undefined' || !google.maps) {
            console.warn('Карта не инициализирована или Google Maps API не загружен');
            return;
        }
        
        // Очистка существующих маркеров
        clearMarkers();
        
        // Если нет данных об объектах, выходим
        if (!explosiveObjects || !explosiveObjects.length) {
            console.warn('Нет данных о вибухонебезпечных объектах для отображения на карте');
            return;
        }
        
        // Создаем массив для хранения маркеров, которые будут кластеризованы
        const markersForCluster = [];
        
        explosiveObjects.forEach(obj => {
            try {
                // Проверяем наличие координат
                if (!obj.latitude || !obj.longitude) {
                    console.warn(`Объект ID ${obj.id} не имеет корректных координат`);
                    return;
                }
                
                const position = { lat: obj.latitude, lng: obj.longitude };
                
                // Определение цвета маркера в зависимости от статуса
                let markerIcon = null;
                
                if (obj.status === 'demined') {
                    markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" };
                } else if (obj.status === 'unconfirmed') {
                    markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" };
                } else if (obj.status === 'secret') {
                    markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png" };
                } else if (obj.status === 'mined') {
                    markerIcon = { 
                        url: "/static/images/flag_red.png", 
                        scaledSize: new google.maps.Size(48, 48),
                        anchor: new google.maps.Point(6, 48) // Anchor point at the bottom of the flag pole
                    };
                } else if (obj.status === 'archived') {
                    markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" };
                }
                
                // Создание маркера с использованием AdvancedMarkerElement вместо устаревшего Marker
                let marker;
                
                // Проверяем доступность AdvancedMarkerElement (для обратной совместимости)
                if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                    // Создаем элемент для контента маркера
                    const markerContent = document.createElement('div');
                    
                    if (obj.status === 'mined') {
                        // Для флага используем img элемент
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
                        
                        // Определяем цвет по статусу
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
                        position: position,
                        map: map,
                        title: obj.title || `Об'єкт #${obj.id}`,
                        content: markerContent
                    });
                } else {
                    // Запасной вариант с обычным маркером для обратной совместимости
                    marker = new google.maps.Marker({
                        position: position,
                        map: map,
                        title: obj.title || `Об'єкт #${obj.id}`,
                        icon: markerIcon
                    });
                    
                    // Добавляем маркер в массив для кластеризации
                    markersForCluster.push(marker);
                }
                
                // Информационное окно
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="max-width: 300px;">
                            <h5>${obj.title || `Об'єкт #${obj.id}`}</h5>
                            ${obj.photo_url || obj.image_url ? 
                                `<div style="margin-bottom: 10px; text-align: center;">
                                    <img src="${obj.photo_url || obj.image_url}" alt="Фото об'єкта" style="max-width: 100%; max-height: 200px; border-radius: 4px;">
                                </div>` : ''}
                            <p>${obj.description || 'Опис відсутній'}</p>
                            <p><strong>Статус:</strong> ${getStatusText(obj.status)}</p>
                            <p><strong>Пріоритет:</strong> ${getPriorityText(obj.priority)}</p>
                            <p><strong>Регіон:</strong> ${obj.region_name || 'Не вказано'}</p>
                            <p><strong>Додано:</strong> ${formatDate(obj.reported_at)}</p>
                            ${obj.reported_by_username ? `<p><strong>Повідомив:</strong> ${obj.reported_by_username}</p>` : ''}
                            <div style="margin-top: 10px; display: flex; gap: 5px;">
                                <button onclick="viewObjectDetails(${obj.id})" class="btn btn-sm btn-primary">Детальніше</button>
                                <button onclick="editObject(${obj.id})" class="btn btn-sm btn-warning">Редагувати</button>
                                <button onclick="quickDeleteObject(${obj.id})" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    `
                });
                
                // Открытие информационного окна при клике на маркер
                if (marker.addEventListener) {
                    marker.addEventListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                } else {
                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                }
                
                markers.push(marker);
            } catch (error) {
                console.error(`Ошибка при добавлении маркера для объекта ID ${obj.id}:`, error);
            }
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
        console.error('Ошибка при добавлении маркеров на карту:', error);
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
        
        if (!markers || !markers.length) return;
        
        markers.forEach(marker => {
            try {
                if (marker instanceof google.maps.Marker) {
                    marker.setMap(null);
                } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
                    marker.map = null;
                } else if (marker && typeof marker.setMap === 'function') {
                    marker.setMap(null);
                } else if (marker && 'map' in marker) {
                    marker.map = null;
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
    const statusMap = {
        'mined': 'Замінована',
        'unconfirmed': 'Непідтверджена',
        'demined': 'Розмінована',
        'archived': 'Архів',
        'secret': 'Секретна'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'secret': 'Секретно',
        'high': 'Високий',
        'medium': 'Середній',
        'low': 'Низький'
    };
    return priorityMap[priority] || priority;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA');
}

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
                            ${obj.photo_url || obj.image_url ? 
                                `<div class="mb-3 text-center">
                                    <img src="${obj.photo_url || obj.image_url}" alt="Фото об'єкта" class="img-fluid rounded" style="max-height: 300px;">
                                </div>` : 
                                `<div class="mb-3 text-center bg-light p-5 rounded">
                                    <i class="bi bi-image text-muted" style="font-size: 5rem;"></i>
                                    <p class="text-muted">Фото відсутнє</p>
                                </div>`
                            }
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
                    <button type="button" class="btn btn-warning" onclick="editObject(${obj.id})">Редагувати</button>
                    <button type="button" class="btn btn-danger" onclick="quickDeleteObject(${obj.id})"><i class="bi bi-trash"></i> Видалити</button>
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

// Функция для редактирования объекта
function editObject(objectId) {
    // Находим объект по ID
    const obj = explosiveObjects.find(o => o.id === objectId);
    if (!obj) {
        console.error(`Объект с ID ${objectId} не найден`);
        return;
    }
    
    // Закрываем модальное окно с деталями, если оно открыто
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('objectDetailsModal'));
    if (detailsModal) {
        detailsModal.hide();
    }
    
    // Заполняем форму в модальном окне редактирования
    document.getElementById('title').value = obj.title || '';
    document.getElementById('description').value = obj.description || '';
    document.getElementById('latitude').value = obj.latitude;
    document.getElementById('longitude').value = obj.longitude;
    document.getElementById('status').value = obj.status;
    document.getElementById('priority').value = obj.priority;
    document.getElementById('region').value = obj.region_id;
    
    // Показываем модальное окно редактирования
    const addObjectModal = new bootstrap.Modal(document.getElementById('addObjectModal'));
    addObjectModal.show();
    
    // Меняем текст заголовка модального окна и кнопки сохранения
    document.getElementById('addObjectModalLabel').textContent = 'Редагувати об\'єкт';
    document.getElementById('saveObject').textContent = 'Зберегти зміни';
    
    // Устанавливаем атрибут data-id для кнопки сохранения
    document.getElementById('saveObject').setAttribute('data-id', obj.id);
}

// Получение класса бейджа статуса
function getStatusBadgeClass(status) {
    switch (status) {
        case 'mined': return 'bg-danger';
        case 'unconfirmed': return 'bg-warning text-dark';
        case 'demined': return 'bg-success';
        case 'archived': return 'bg-secondary';
        case 'secret': return 'bg-purple';
        default: return 'bg-secondary';
    }
}

// Функция сохранения/обновления объекта
async function saveObject() {
    try {
        // Получаем данные из формы
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        const status = document.getElementById('status').value;
        const priority = document.getElementById('priority').value;
        const regionId = parseInt(document.getElementById('region').value);
        
        // Получаем опциональные поля (если они есть в форме)
        const isCluster = document.getElementById('isCluster') ? 
            document.getElementById('isCluster').checked : false;
        
        // Валидация данных
        if (!title || isNaN(latitude) || isNaN(longitude) || !status || !priority || isNaN(regionId)) {
            alert('Будь ласка, заповніть всі обов\'язкові поля.');
            return;
        }
        
        // Формируем данные для отправки
        const objectData = {
            title,
            description,
            latitude,
            longitude,
            status,
            priority,
            region_id: regionId
        };
        
        // Определяем, создаем новый объект или обновляем существующий
        const objectId = this.getAttribute('data-id');
        let url = '/api/explosive-objects';
        let method = 'POST';
        
        if (objectId) {
            // Если есть ID, то обновляем существующий объект
            url = `/api/explosive-objects/${objectId}`;
            method = 'PATCH';  // Используем PATCH вместо PUT
        }
        
        console.log(`Sending ${method} request to ${url} with data:`, objectData);
        
        // Отправляем запрос на сервер
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objectData)
        });
        
        // Обрабатываем ответ
        if (!response.ok) {
            let errorMessage = `Помилка сервера: ${response.status} ${response.statusText}`;
            
            try {
                // Пытаемся получить текст ошибки
                const responseText = await response.text();
                
                // Проверяем, является ли ответ валидным JSON
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (jsonError) {
                    // Если не можем разобрать как JSON, используем текст как есть
                    if (responseText && responseText.length < 100) {
                        errorMessage = responseText;
                    }
                }
            } catch (textError) {
                console.error('Не удалось получить текст ошибки:', textError);
            }
            
            throw new Error(errorMessage);
        }
        
        // Получаем данные из ответа
        const savedObject = await response.json();
        console.log('Объект успешно сохранен:', savedObject);
        
        // Очищаем форму
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        
        // Перемещаем фокус перед закрытием модального окна
        document.activeElement.blur();
        document.body.focus();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('addObjectModal'));
        modal.hide();
        
        // Обновляем данные на карте
        loadExplosiveObjects();
        
        // Выводим сообщение об успехе
        showAlert('success', objectId ? 'Об\'єкт успішно оновлено' : 'Новий об\'єкт успішно додано');
    } catch (error) {
        console.error('Ошибка при сохранении объекта:', error);
        showAlert('danger', `Помилка: ${error.message}`);
    }
}

// Функция удаления объекта
async function deleteObjectConfirm() {
    try {
        // Проверяем подтверждение
        if (!document.getElementById('confirmDelete').checked) {
            alert('Для видалення об\'єкта необхідно підтвердити дію.');
            return;
        }
        
        // Получаем ID объекта
        const objectId = document.getElementById('deleteObjectId').value;
        if (!objectId) {
            alert('Виберіть об\'єкт для видалення.');
            return;
        }
        
        console.log(`Deleting object with ID: ${objectId}`);
        
        // Отправляем запрос на удаление
        const response = await fetch(`/api/explosive-objects/${objectId}`, {
            method: 'DELETE'
        });
        
        // Обрабатываем ответ
        if (!response.ok) {
            let errorMessage = `Помилка сервера: ${response.status} ${response.statusText}`;
            
            try {
                // Пытаемся получить текст ошибки
                const responseText = await response.text();
                
                // Проверяем, является ли ответ валидным JSON
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (jsonError) {
                    // Если не можем разобрать как JSON, используем текст как есть
                    if (responseText && responseText.length < 100) {
                        errorMessage = responseText;
                    }
                }
            } catch (textError) {
                console.error('Не удалось получить текст ошибки:', textError);
            }
            
            throw new Error(errorMessage);
        }
        
        // Получаем результат операции
        const result = await response.json();
        console.log('Объект успешно удален:', result);
        
        // Перемещаем фокус перед закрытием модального окна
        document.activeElement.blur();
        document.body.focus();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteObjectModal'));
        modal.hide();
        
        // Обновляем данные на карте
        loadExplosiveObjects();
        
        // Выводим сообщение об успехе
        showAlert('success', 'Об\'єкт успішно видалено');
    } catch (error) {
        console.error('Ошибка при удалении объекта:', error);
        showAlert('danger', `Помилка: ${error.message}`);
    }
}

// Функция экспорта данных
function exportData() {
    try {
        // Получаем параметры экспорта
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const includeObjects = document.getElementById('includeObjects').checked;
        const includeRegions = document.getElementById('includeRegions').checked;
        const regionId = document.getElementById('exportRegion').value;
        
        // Параметры запроса
        const params = new URLSearchParams();
        params.append('format', format);
        params.append('include_objects', includeObjects);
        params.append('include_regions', includeRegions);
        
        if (regionId !== 'all') {
            params.append('region_id', regionId);
        }
        
        // Формируем URL для экспорта
        const exportUrl = `/api/export-data?${params.toString()}`;
        
        // Открываем URL в новом окне для скачивания
        window.open(exportUrl, '_blank');
        
        // Перемещаем фокус перед закрытием модального окна
        document.activeElement.blur();
        document.body.focus();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('exportDataModal'));
        modal.hide();
    } catch (error) {
        console.error('Ошибка при экспорте данных:', error);
        showAlert('danger', `Помилка: ${error.message}`);
    }
}

// Функция для отображения уведомлений
function showAlert(type, message) {
    // Создаем элемент уведомления
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Добавляем уведомление на страницу
    const container = document.querySelector('.admin-controls');
    container.prepend(alertElement);
    
    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
        bsAlert.close();
    }, 5000);
}

// Добавляем в код новую функцию для быстрого удаления объекта с подтверждением
function quickDeleteObject(objectId) {
    // Находим объект по ID
    const obj = explosiveObjects.find(o => o.id === objectId);
    if (!obj) {
        console.error(`Объект с ID ${objectId} не найден`);
        return;
    }
    
    // Создаем модальное окно с подтверждением
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'quickDeleteConfirmModal';
    confirmModal.setAttribute('tabindex', '-1');
    confirmModal.setAttribute('aria-labelledby', 'quickDeleteConfirmModalLabel');
    confirmModal.setAttribute('aria-hidden', 'true');
    
    confirmModal.innerHTML = `
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="quickDeleteConfirmModalLabel">Підтвердження видалення</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Ви впевнені, що хочете видалити об'єкт "${obj.title || `Об'єкт #${obj.id}`}"?</p>
                    <p class="text-danger"><i class="bi bi-exclamation-triangle"></i> Це неможливо скасувати!</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Скасувати</button>
                    <button type="button" class="btn btn-danger" id="confirmQuickDelete">Видалити</button>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.appendChild(confirmModal);
    
    // Инициализируем и показываем модальное окно
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
    
    // Добавляем обработчик для кнопки подтверждения удаления
    document.getElementById('confirmQuickDelete').addEventListener('click', async () => {
        try {
            console.log(`Quick deleting object with ID: ${objectId}`);
            
            // Отправляем запрос на удаление
            const response = await fetch(`/api/explosive-objects/${objectId}`, {
                method: 'DELETE'
            });
            
            // Обрабатываем ответ
            if (!response.ok) {
                let errorMessage = `Помилка сервера: ${response.status} ${response.statusText}`;
                
                try {
                    // Пытаемся получить текст ошибки
                    const responseText = await response.text();
                    
                    // Проверяем, является ли ответ валидным JSON
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.detail || errorData.message || errorMessage;
                    } catch (jsonError) {
                        // Если не можем разобрать как JSON, используем текст как есть
                        if (responseText && responseText.length < 100) {
                            errorMessage = responseText;
                        }
                    }
                } catch (textError) {
                    console.error('Не удалось получить текст ошибки:', textError);
                }
                
                throw new Error(errorMessage);
            }
            
            // Получаем результат операции
            const result = await response.json();
            console.log('Объект успешно удален:', result);
            
            // Перемещаем фокус перед закрытием модального окна
            document.activeElement.blur();
            document.body.focus();
            
            // Закрываем модальное окно
            modalInstance.hide();
            
            // Обновляем данные на карте
            loadExplosiveObjects();
            
            // Выводим сообщение об успехе
            showAlert('success', 'Об\'єкт успішно видалено');
        } catch (error) {
            console.error('Ошибка при удалении объекта:', error);
            showAlert('danger', `Помилка: ${error.message}`);
        }
    });
    
    // Удаляем модальное окно из DOM после закрытия
    confirmModal.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(confirmModal);
    });
}

// Добавляем глобальные функции, чтобы они были доступны для вызова из HTML
window.viewObjectDetails = viewObjectDetails;
window.editObject = editObject;
window.quickDeleteObject = quickDeleteObject;

// Функция для настройки обработчиков событий модальных окон
function setupModalListeners() {
    // Обработчик события перед открытием модального окна добавления/редактирования объекта
    const addObjectModal = document.getElementById('addObjectModal');
    if (addObjectModal) {
        addObjectModal.addEventListener('show.bs.modal', function () {
            // Обеспечиваем, что выпадающий список регионов заполнен
            const regionSelect = document.getElementById('region');
            if (regionSelect && regionSelect.options.length <= 1) {
                // Если регионы еще не загружены, загружаем их снова
                loadRegions();
            }
        });
    }
    
    // Обработчик события перед открытием модального окна изменения статуса
    const updateStatusModal = document.getElementById('updateStatusModal');
    if (updateStatusModal) {
        updateStatusModal.addEventListener('show.bs.modal', function () {
            // Обновляем список объектов
            updateObjectsDropdowns();
        });
    }
    
    // Обработчик события перед открытием модального окна удаления объекта
    const deleteObjectModal = document.getElementById('deleteObjectModal');
    if (deleteObjectModal) {
        deleteObjectModal.addEventListener('show.bs.modal', function () {
            // Обновляем список объектов
            updateObjectsDropdowns();
        });
    }
    
    // Обработчик события перед открытием модального окна экспорта данных
    const exportDataModal = document.getElementById('exportDataModal');
    if (exportDataModal) {
        exportDataModal.addEventListener('show.bs.modal', function () {
            // Обеспечиваем, что выпадающий список регионов заполнен
            const exportRegion = document.getElementById('exportRegion');
            if (exportRegion && exportRegion.options.length <= 1) {
                // Если регионы еще не загружены, загружаем их снова
                loadRegions();
            }
        });
    }
    
    // Обработчик для кнопки сохранения статуса
    document.getElementById('saveStatus')?.addEventListener('click', updateObjectStatus);
}

// Функция для обновления статуса объекта
async function updateObjectStatus() {
    try {
        // Получаем данные из формы
        const objectId = document.getElementById('objectId').value;
        const newStatus = document.getElementById('newStatus').value;
        const statusNote = document.getElementById('statusNote').value;
        
        // Проверка валидности данных
        if (!objectId || !newStatus) {
            alert('Пожалуйста, выберите объект и новый статус');
            return;
        }
        
        // Обновляем объект через API
        const response = await fetch(`/api/explosive-objects/${objectId}`, {
            method: 'PATCH',  // Используем метод PATCH для частичного обновления
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus,
                description: statusNote ? `${explosiveObjects.find(o => o.id == objectId).description} [Примечание: ${statusNote}]` : undefined
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка обновления статуса: ${response.status}`);
        }
        
        // Получаем обновленный объект
        const updatedObject = await response.json();
        
        // Обновляем список объектов и маркеры
        const index = explosiveObjects.findIndex(obj => obj.id == objectId);
        if (index !== -1) {
            explosiveObjects[index] = updatedObject;
            addMarkersToMap();
        }
        
        // Перемещаем фокус перед закрытием модального окна
        document.activeElement.blur();
        document.body.focus();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
        modal.hide();
        
        // Показываем сообщение об успехе
        alert(`Статус объекта успешно изменен на "${getStatusText(newStatus)}"`);
        
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        alert(`Ошибка при обновлении статуса: ${error.message}`);
    }
}

// Добавляем функцию в глобальный объект window
window.updateObjectStatus = updateObjectStatus;

// Function to filter markers by region
function filterMarkersByRegion() {
    const regionFilter = document.getElementById('regionFilter');
    if (!regionFilter) return;
    
    const selectedRegionId = regionFilter.value;
    
    // Show all markers if "All regions" is selected
    if (selectedRegionId === 'all') {
        markers.forEach(marker => {
            if (marker instanceof google.maps.Marker) {
                marker.setMap(map);
            } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
                marker.map = map;
            }
        });
    } else {
        // Filter markers by region ID
        markers.forEach((marker, index) => {
            const obj = explosiveObjects[index];
            if (!obj) return;
            
            const show = obj.region_id.toString() === selectedRegionId;
            
            if (marker instanceof google.maps.Marker) {
                marker.setMap(show ? map : null);
            } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
                marker.map = show ? map : null;
            }
        });
        
        // If a specific region is selected, center the map on it
        if (map) {
            const selectedRegion = regions.find(r => r.id.toString() === selectedRegionId);
            if (selectedRegion && selectedRegion.center_lat && selectedRegion.center_lng) {
                map.setCenter({ lat: selectedRegion.center_lat, lng: selectedRegion.center_lng });
                map.setZoom(selectedRegion.zoom_level || 10);
            }
        }
    }
}

// Модифицируем обработчик для клика по карте
function setupMapClickListener() {
    if (map) {
        // Добавляем обработчик для клика по карте
        map.addListener('click', (event) => {
            // Получаем координаты места клика
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            // Заполняем поля формы
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Автоматически определяем и устанавливаем регион
            if (typeof findRegionByCoordinates === 'function') {
                const region = findRegionByCoordinates(lat, lng);
                if (region) {
                    const regionSelect = document.getElementById('region');
                    if (regionSelect) {
                        regionSelect.value = region.id;
                    }
                }
            }
            
            // Сбрасываем ID, если был выбран объект для редактирования
            document.getElementById('saveObject').removeAttribute('data-id');
            
            // Сбрасываем заголовок и текст кнопки
            document.getElementById('addObjectModalLabel').textContent = 'Додати новий об\'єкт';
            document.getElementById('saveObject').textContent = 'Зберегти';
            
            // Открываем модальное окно
            const modal = new bootstrap.Modal(document.getElementById('addObjectModal'));
            modal.show();
        });
    }
}

// Заменяем наши функции использованием общих функций из map_utilities.js
function setupCoordinateListeners() {
    if (typeof setupAutoRegionDetection === 'function') {
        setupAutoRegionDetection('latitude', 'longitude', 'region');
    } else {
        console.warn('Функция настройки автоопределения региона недоступна');
    }
}

// Add toggle functionality for admin panel
document.addEventListener('DOMContentLoaded', () => {
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    const adminPanel = document.querySelector('.admin-controls');
    
    if (togglePanelBtn && adminPanel) {
        togglePanelBtn.addEventListener('click', () => {
            adminPanel.classList.toggle('collapsed');
            
            // Store the state in localStorage to persist across page reloads
            const isCollapsed = adminPanel.classList.contains('collapsed');
            localStorage.setItem('adminPanelCollapsed', isCollapsed);
        });
        
        // Check if there's a saved state in localStorage
        const savedState = localStorage.getItem('adminPanelCollapsed');
        if (savedState === 'true') {
            adminPanel.classList.add('collapsed');
        }
    }
    
    // Set up filter handlers
    setupFilterHandlers();
});