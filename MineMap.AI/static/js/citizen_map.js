// Глобальные переменные
// These variables are already defined in map.js, so we'll use them instead of redeclaring
// let map;
// let markers = [];
let markerCluster = null;
let explosiveObjects = [];
let users = [];
// regions is also defined in map.js
// let regions = [];
let googleMapsLoaded = true;
let gpsWatchId = null;
let cameraStream = null;
let photoCountdown = 0;
// locationStable is defined in danger_reporting.js
// let locationStable = false;

// Глобальная переменная для хранения информации о текущем пользователе
let currentUser = null;

// Инициализация карты Google Maps - we won't redefine this function as it's in map.js
// function initMap() {
// ... existing code ...
// }

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
            // Сервер уже отфильтровал секретные объекты, нет необходимости делать это на клиенте
            explosiveObjects = await response.json();
            console.log('Загружено объектов:', explosiveObjects.length);
            addMarkersToMap();
            renderObjects(); // Вызываем функцию для отображения списка объектов
            
            // Загружаем регионы после получения объектов
            loadRegions();
        } else {
            console.error('Ошибка при загрузке данных:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
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
            { id: 17, name: 'Івано-Франківськ', code: 'ivano-frankivsk', center_lat: 48.922630, center_lng: 24.711110, zoom_level: 10 },
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
        
        console.log('Завантажено регіонів:', regions.length);
        
        // Initialize the map utilities with our regions data
        if (typeof initMapUtilities === 'function') {
            initMapUtilities(regions);
        }
        
        // Заповнюємо випадаючий список фільтра регіонів
        const regionFilter = document.getElementById('filterRegion');
        if (regionFilter) {
            // Зберігаємо опцію "Всі регіони"
            const allOption = regionFilter.querySelector('option[value="all"]');
            regionFilter.innerHTML = '';
            regionFilter.appendChild(allOption);
            
            // Додаємо всі регіони
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionFilter.appendChild(option);
            });
        }
        
        // Fill region filter in right panel
        const mapRegionFilter = document.getElementById('regionFilter');
        if (mapRegionFilter) {
            // Keep "All regions" option
            const allOption = mapRegionFilter.querySelector('option[value="all"]');
            mapRegionFilter.innerHTML = '';
            mapRegionFilter.appendChild(allOption);
            
            // Add all regions
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                mapRegionFilter.appendChild(option);
            });
            
            // Add event listener for filtering
            mapRegionFilter.addEventListener('change', filterMapMarkersByRegion);
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
        
        // Set up auto-detection of regions
        if (typeof setupAutoRegionDetection === 'function') {
            setupAutoRegionDetection('latitude', 'longitude', 'region');
        }
        
        // Додаємо обробник події для фільтрації по регіону
        const filterButton = document.getElementById('applyFilter');
        if (filterButton) {
            filterButton.addEventListener('click', filterMarkersByRegion);
        } else {
            // Якщо немає кнопки фільтра, додаємо обробник безпосередньо до випадаючого списку
            if (regionFilter) {
                regionFilter.addEventListener('change', filterMarkersByRegion);
            }
        }
        
    } catch (error) {
        console.error('Помилка завантаження регіонів:', error);
    }
}

// Функция для отображения списка объектов
function renderObjects(objects) {
    const objectsList = document.getElementById('objectsList');
    if (!objectsList) return;
    
    // Очищаем текущий список
    objectsList.innerHTML = '';
    
    // Получаем выбранный фильтр статуса
    const statusFilter = document.getElementById('filterStatus').value;
    
    // Получаем выбранный фильтр региона
    const regionFilter = document.getElementById('filterRegion').value;
    
    // Получаем выбранный фильтр приоритета
    const priorityFilter = document.getElementById('filterPriority')?.value || 'all';
    
    // Создаем отфильтрованный список объектов
    let filteredObjects = objects || explosiveObjects;
    
    // Применяем фильтр по статусу
    if (statusFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.status === statusFilter);
    }
    
    // Применяем фильтр по региону
    if (regionFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.region_id.toString() === regionFilter);
    }
    
    // Применяем фильтр по приоритету
    if (priorityFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.priority === priorityFilter);
    }
    
    // Сортируем объекты по дате (самые новые вверху)
    filteredObjects.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));
    
    // Если список пуст, показываем сообщение
    if (filteredObjects.length === 0) {
        objectsList.innerHTML = '<div class="alert alert-info">Немає об\'єктів для відображення.</div>';
        return;
    }
    
    // Отображаем только первые 10 объектов для производительности
    const maxObjects = 10;
    const objectsToShow = filteredObjects.slice(0, maxObjects);
    
    // Добавляем каждый объект в список в формате как на изображении
    objectsToShow.forEach(obj => {
        const itemElement = document.createElement('div');
        itemElement.className = 'object-item';
        itemElement.dataset.objectId = obj.id;
        
        // Форматируем дату
        const reportedDate = new Date(obj.reported_at);
        const formattedDate = reportedDate.toLocaleDateString('uk-UA');
        
        // Определяем HTML класс для приоритета
        function getPriorityBadgeHTML(priority) {
            switch(priority) {
                case 'high': return '<span class="badge bg-danger">Високий</span>';
                case 'medium': return '<span class="badge" style="background-color: #fd7e14;">Середній</span>';
                case 'low': return '<span class="badge bg-success">Низький</span>';
                default: return '<span class="badge bg-secondary">Невідомо</span>';
            }
        }
        
        // Создаем сокращенное представление для заголовка
        const shortenedTitle = obj.title.length > 1 ? obj.title.substring(0, 1) : obj.title;
        
        // Создаем HTML для элемента списка
        itemElement.innerHTML = `
            <div>
                <strong>${shortenedTitle}</strong>
                ${getPriorityBadgeHTML(obj.priority)}
            </div>
            <div class="object-info">
                <span>${obj.region_name || "Регіон не вказаний"}</span>
            </div>
            <div class="small text-muted">${formattedDate}</div>
        `;
        
        // Добавляем обработчик клика для перехода к объекту
        itemElement.addEventListener('click', () => {
            // Переходим к объекту на карте
            map.setCenter({lat: obj.latitude, lng: obj.longitude});
            map.setZoom(15);
            
            // Находим маркер и открываем его инфо-окно
            const marker = markers.find(m => {
                try {
                    if (m.position) {
                        return m.position.lat() === obj.latitude && m.position.lng() === obj.longitude;
                    } else if (m.position_) {
                        return m.position_.lat === obj.latitude && m.position_.lng === obj.longitude;
                    }
                } catch (e) {
                    return false;
                }
                return false;
            });
            
            if (marker) {
                google.maps.event.trigger(marker, 'click');
            }
        });
        
        // Добавляем элемент в список
        objectsList.appendChild(itemElement);
    });
    
    // Если есть еще объекты, показываем сообщение
    if (filteredObjects.length > maxObjects) {
        const moreItems = document.createElement('div');
        moreItems.className = 'text-center mt-2';
        moreItems.innerHTML = `<small class="text-muted">+ ще ${filteredObjects.length - maxObjects} об'єктів</small>`;
        objectsList.appendChild(moreItems);
    }
}

// Initialize UI and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize filter status change handler
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            // We'll now use the apply filters button instead of auto-filtering
            // renderObjects();
        });
    }
    
    // Initialize toggle and restore buttons for object list panel
    const toggleListBtn = document.getElementById('toggleListBtn');
    const restoreListBtn = document.getElementById('restoreListBtn');
    const objectList = document.querySelector('.object-list');
    
    // Initially hide the restore button if the panel is not collapsed
    if (restoreListBtn) {
        const savedState = localStorage.getItem('objectListCollapsed');
        if (savedState !== 'true') {
            restoreListBtn.classList.add('d-none');
        }
    }
    
    if (toggleListBtn && objectList) {
        toggleListBtn.addEventListener('click', () => {
            objectList.classList.add('collapsed');
            if (restoreListBtn) {
                restoreListBtn.classList.remove('d-none');
            }
            
            // Store the state in localStorage
            localStorage.setItem('objectListCollapsed', 'true');
        });
    }
    
    if (restoreListBtn && objectList) {
        restoreListBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior
            objectList.classList.remove('collapsed');
            restoreListBtn.classList.add('d-none');
            
            // Store the state in localStorage
            localStorage.setItem('objectListCollapsed', 'false');
        });
    }
    
    // Check if there's a saved state in localStorage
    const savedState = localStorage.getItem('objectListCollapsed');
    if (savedState === 'true' && objectList && restoreListBtn) {
        objectList.classList.add('collapsed');
        restoreListBtn.classList.remove('d-none');
    }
    
    // Add event listeners for the filter buttons
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Initialize current user info
    getCurrentUser();
    
    // Load objects data
    loadExplosiveObjects();
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
            
            // Получаем HTML для отображения фото
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
        case 'high': return 'Високий';
        case 'medium': return 'Середній';
        case 'low': return 'Низький';
        default: return 'Невідомо';
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

// Функция для фильтрации маркеров по региону
function filterMarkersByRegion() {
    const regionFilter = document.getElementById('filterRegion');
    if (!regionFilter) return;
    
    const selectedRegionId = regionFilter.value;
    
    // Clear existing markers
    clearMarkers();
    
    // Get selected status and priority filters as well
    const statusFilter = document.getElementById('filterStatus');
    const selectedStatus = statusFilter ? statusFilter.value : 'all';
    
    // Filter objects by region, status and priority
    let filteredObjects = [...explosiveObjects];
    
    // Filter by region if specific region is selected
    if (selectedRegionId !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.region_id.toString() === selectedRegionId);
    }
    
    // Filter by status if specific status is selected
    if (selectedStatus !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.status === selectedStatus);
    }
    
    // Add filtered markers to the map
    filteredObjects.forEach(obj => {
        addMarker(obj);
    });
    
    // Update the objects list with filtered objects
    renderObjects(filteredObjects);
}

// Функция для фильтрации маркеров по региону на карте (правый фильтр)
function filterMapMarkersByRegion() {
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
    
    // Also update the left sidebar filter to match
    const sidebarFilter = document.getElementById('filterRegion');
    if (sidebarFilter && sidebarFilter.value !== selectedRegionId) {
        sidebarFilter.value = selectedRegionId;
        filterMarkersByRegion(); // Update the sidebar listing
    }
}

// Function to apply all filters
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus').value;
    const regionFilter = document.getElementById('filterRegion').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    
    // Clear existing markers
    clearMarkers();
    
    // Filter objects
    let filteredObjects = [...explosiveObjects];
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.status === statusFilter);
    }
    
    // Apply region filter
    if (regionFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.region_id.toString() === regionFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
        filteredObjects = filteredObjects.filter(obj => obj.priority === priorityFilter);
    }
    
    // Add filtered markers to map
    filteredObjects.forEach(obj => {
        addMarker(obj);
    });
    
    // Update the objects list with filtered objects
    renderObjects(filteredObjects);
}

// Function to reset all filters
function resetFilters() {
    // Reset filter dropdowns
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterRegion').value = 'all';
    
    const priorityFilter = document.getElementById('filterPriority');
    if (priorityFilter) {
        priorityFilter.value = 'all';
    }
    
    // Clear current markers
    clearMarkers();
    
    // Add all markers back to map
    addMarkersToMap();
    
    // Update the objects list
    renderObjects();
}

// Function to add a single marker to the map
function addMarker(obj) {
    // Determine marker icon based on status
    let markerIcon;
    
    if (obj.status === 'mined' || obj.status === 'dangerous') {
        // Use red flag for dangerous objects
        markerIcon = {
            url: "/static/images/flag_red.png",
            scaledSize: new google.maps.Size(48, 48),
            anchor: new google.maps.Point(6, 48)
        };
    } else if (obj.status === 'demined') {
        markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" };
    } else if (obj.status === 'unconfirmed') {
        markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" };
    } else if (obj.status === 'archived') {
        markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" };
    }
    
    let marker;
    
    // Check if AdvancedMarkerElement is available
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        // Create element for marker content
        const markerContent = document.createElement('div');
        
        if (obj.status === 'mined' || obj.status === 'dangerous') {
            // For dangerous objects, use flag image
            const img = document.createElement('img');
            img.src = "/static/images/flag_red.png";
            img.style.width = '48px';
            img.style.height = '48px';
            markerContent.style.position = 'relative';
            markerContent.style.transform = 'translate(-6px, -48px)';
            markerContent.appendChild(img);
        } else {
            // For other statuses, create colored circle
            markerContent.style.width = '20px';
            markerContent.style.height = '20px';
            markerContent.style.borderRadius = '50%';
            markerContent.style.border = '2px solid white';
            
            // Determine circle color based on status
            if (obj.status === 'demined') {
                markerContent.style.backgroundColor = '#4CAF50'; // green
            } else if (obj.status === 'unconfirmed') {
                markerContent.style.backgroundColor = '#FFC107'; // yellow
            } else if (obj.status === 'archived') {
                markerContent.style.backgroundColor = '#607D8B'; // gray/blue
            }
        }
        
        // Create AdvancedMarkerElement
        marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: obj.latitude, lng: obj.longitude },
            map: map,
            title: obj.title || `Объект #${obj.id}`,
            content: markerContent
        });
    } else {
        // Fallback to regular marker
        marker = new google.maps.Marker({
            position: { lat: obj.latitude, lng: obj.longitude },
            map: map,
            title: obj.title || `Объект #${obj.id}`,
            icon: markerIcon
        });
    }
    
    // Check if the object belongs to the current user
    const isMyObject = currentUser && obj.reported_by === currentUser.id;
    
    // Get HTML for displaying photo
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
    }
    
    // Create info window with edit option if it's the user's object
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
    
    // If the object belongs to the current user, add edit button
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
    
    // Add click handler to marker
    if (marker.addEventListener) {
        // For AdvancedMarkerElement use addEventListener
        marker.addEventListener('click', () => {
            infoWindow.open(map, marker);
            
            // Add event handler for edit button inside infoWindow
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
        // For regular Marker use addListener
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
            
            // Add event handler for edit button inside infoWindow
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
    
    // Add marker to array
    markers.push(marker);
    
    return marker;
}