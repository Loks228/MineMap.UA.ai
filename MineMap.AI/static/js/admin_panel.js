// Глобальные переменные
let map;
let markers = [];
let explosiveObjects = [];
let users = [];
let regions = [];
let googleMapsLoaded = true;

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
        
        // Получаем Map ID из глобальной переменной
        const mapId = window.gmapId || '';
        
        // Создаем карту с Map ID, если он доступен
        const mapOptions = {
            zoom: 6,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false
        };
        
        // Добавляем Map ID если он доступен
        if (mapId && mapId !== 'YOUR_MAP_ID_HERE') {
            mapOptions.mapId = mapId;
        }
        
        // Создаем карту
        map = new google.maps.Map(mapElement, mapOptions);
        
        console.log('Карта инициализирована успешно');
        
        // Если данные уже загружены, добавляем маркеры
        if (explosiveObjects && explosiveObjects.length > 0) {
            addMarkersToMap();
        }
    } catch (error) {
        console.error('Ошибка при инициализации карты:', error);
        const mapElement = document.getElementById("map");
        if (mapElement) {
            mapElement.innerHTML = '<div class="alert alert-danger">Ошибка при инициализации карты: ' + error.message + '</div>';
            mapElement.style.height = 'auto';
        }
    }
}

// Функция для загрузки данных о вибухонебезпечных объектах
async function loadExplosiveObjects() {
    try {
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
            throw new Error(`Не вдалося завантажити дані (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        explosiveObjects = Array.isArray(data) ? data : [];
        
        updateDashboardStats();
        updateObjectsTable();
        
        // Добавляем маркеры на карту только если Google Maps API загружен и карта инициализирована
        if (googleMapsLoaded && map) {
            addMarkersToMap();
        }
        
        // Обновляем данные о последних сообщениях
        updateRecentReports();
        
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        showAlert('danger', `Помилка завантаження даних про вибухонебезпечні об'єкти: ${error.message}`);
        
        // Установка значений по умолчанию
        explosiveObjects = [];
        updateDashboardStats();
    }
}

// Функция для загрузки данных о пользователях
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Не вдалося завантажити дані користувачів (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        users = Array.isArray(data) ? data : [];
        updateUsersTable();
        
    } catch (error) {
        console.error('Помилка завантаження даних користувачів:', error);
        showAlert('danger', `Помилка завантаження даних користувачів: ${error.message}`);
        
        // Установка значений по умолчанию
        users = [];
        updateUsersTable();
    }
}

// Функция для загрузки данных о регионах
async function loadRegions() {
    try {
        console.log('Загрузка списка регионов.... / Единственые регионы которые есть только те которые ты захаркодил');
        
        // Хардкодим список регионов вместо загрузки с сервера
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
        
        updateRegionsTable();
        populateRegionSelect();
        
        // Populate the news region filter dropdown
        populateNewsRegionFilter();
        
    } catch (error) {
        console.error('Помилка завантаження даних регіонів:', error);
        showAlert('danger', `Помилка завантаження даних регіонів: ${error.message}`);
        
        // Установка значений по умолчанию
        regions = [];
        updateRegionsTable();
        populateRegionSelect();
    }
}

// Добавление маркеров на карту
function addMarkersToMap() {
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
    
    // Получаем выбранный фильтр региона
    const regionFilter = document.getElementById('regionFilter');
    const selectedRegionId = regionFilter ? regionFilter.value : 'all';
    
    // Проходим по всем объектам
    explosiveObjects.forEach(obj => {
        // Проверяем, соответствует ли объект фильтру по региону
        if (selectedRegionId !== 'all' && obj.region_id.toString() !== selectedRegionId) {
            return; // Пропускаем объекты, не соответствующие выбранному региону
        }
        
        // Определяем цвет маркера в зависимости от статуса
        let markerColor;
        switch(obj.status) {
            case 'mined': markerColor = '#ef4444'; break; // Красный
            case 'unconfirmed': markerColor = '#f59e0b'; break; // Желтый
            case 'demined': markerColor = '#10b981'; break; // Зеленый
            case 'archived': markerColor = '#6b7280'; break; // Серый
            case 'secret': markerColor = '#8b5cf6'; break; // Фиолетовый
            default: markerColor = '#6b7280'; // Серый по умолчанию
        }
        
        // Создаем маркер в зависимости от доступности AdvancedMarkerElement
        if (window.gmapId && window.gmapId !== 'YOUR_MAP_ID_HERE' && google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            // Создаем элемент содержимого маркера
            const markerContent = document.createElement('div');
            markerContent.className = 'marker-pin';
            markerContent.style.width = '20px';
            markerContent.style.height = '20px';
            markerContent.style.borderRadius = '50%';
            markerContent.style.backgroundColor = markerColor;
            markerContent.style.border = '2px solid white';
            markerContent.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
            
            // Создаем Advanced маркер
            const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat: obj.latitude, lng: obj.longitude },
                map: map,
                content: markerContent,
                title: obj.title || 'Объект'
            });
            
            // Добавляем обработчик события клика
            advancedMarker.addEventListener('gmp-click', () => {
                // Открываем инфо-окно или выполняем другие действия по клику
                console.log('Клик по маркеру:', obj);
                viewObject(obj.id);
            });
            
            // Добавляем маркер в массив
            markers.push(advancedMarker);
        } else {
            // Создаем стандартный маркер для обратной совместимости
            const stdMarker = new google.maps.Marker({
                position: { lat: obj.latitude, lng: obj.longitude },
                map: map,
                title: obj.title || 'Объект',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: markerColor,
                    fillOpacity: 0.9,
                    strokeWeight: 1,
                    strokeColor: '#ffffff',
                    scale: 10
                }
            });
            
            // Добавляем обработчик события клика
            stdMarker.addListener('click', () => {
                console.log('Клик по маркеру:', obj);
                viewObject(obj.id);
            });
            
            // Добавляем маркер в массив
            markers.push(stdMarker);
        }
    });
}

// Очистка маркеров на карте
function clearMarkers() {
    try {
        if (!markers || !markers.length) return;
        
        markers.forEach(marker => {
            try {
                // Универсальный способ удаления маркера
                if (marker instanceof google.maps.Marker) {
                    marker.setMap(null);
                } else if (marker && marker.map !== undefined) {
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

// Обновление статистики на дашборде
function updateDashboardStats() {
    try {
        // Проверяем наличие данных
        if (!explosiveObjects) {
            console.warn('Нет данных для обновления статистики');
            return;
        }
        
        const totalObjects = explosiveObjects.length;
        const minedObjects = explosiveObjects.filter(obj => obj.status === 'mined').length;
        const unconfirmedObjects = explosiveObjects.filter(obj => obj.status === 'unconfirmed').length;
        const deminedObjects = explosiveObjects.filter(obj => obj.status === 'demined').length;
        
        // Проверяем наличие элементов на странице
        const totalEl = document.getElementById('totalObjects');
        const minedEl = document.getElementById('minedObjects');
        const unconfirmedEl = document.getElementById('unconfirmedObjects');
        const deminedEl = document.getElementById('deminedObjects');
        
        if (totalEl) totalEl.textContent = totalObjects;
        if (minedEl) minedEl.textContent = minedObjects;
        if (unconfirmedEl) unconfirmedEl.textContent = unconfirmedObjects;
        if (deminedEl) deminedEl.textContent = deminedObjects;
    } catch (error) {
        console.error('Ошибка при обновлении статистики:', error);
    }
}

// Обновление таблицы объектов
function updateObjectsTable() {
    const tableBody = document.getElementById('explosiveObjectsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Если нет данных, показываем сообщение
    if (!explosiveObjects || explosiveObjects.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">Нет данных о вибухонебезпечних объектах</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    explosiveObjects.forEach(obj => {
        const row = document.createElement('tr');
        
        const statusClass = getStatusBadgeClass(obj.status);
        const priorityClass = getPriorityBadgeClass(obj.priority);
        
        row.innerHTML = `
            <td>${obj.id || '-'}</td>
            <td>${obj.title || 'Без названия'}</td>
            <td><span class="status-badge ${statusClass}">${getStatusText(obj.status)}</span></td>
            <td><span class="priority-badge ${priorityClass}">${getPriorityText(obj.priority)}</span></td>
            <td>${obj.region_name || 'Не указано'}</td>
            <td>${obj.reported_by_username || 'Не указано'}</td>
            <td>${formatDate(obj.reported_at) || '-'}</td>
            <td>
                <button class="btn btn-sm btn-info view-object" data-id="${obj.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-object" data-id="${obj.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-object" data-id="${obj.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Добавление обработчиков событий для кнопок
    document.querySelectorAll('.view-object').forEach(btn => {
        btn.addEventListener('click', () => viewObject(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-object').forEach(btn => {
        btn.addEventListener('click', () => editObject(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-object').forEach(btn => {
        btn.addEventListener('click', () => deleteObject(btn.dataset.id));
    });
}

// Обновление таблицы пользователей
function updateUsersTable() {
    const tableBody = document.getElementById('usersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Если нет данных, показываем сообщение
    if (!users || users.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">Нет данных о пользователях</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id || '-'}</td>
            <td>${user.username || 'Не указано'}</td>
            <td>${user.email || 'Не указано'}</td>
            <td>${user.full_name || 'Не указано'}</td>
            <td>${getUserRoleText(user.role)}</td>
            <td>
                <button class="btn btn-sm btn-info view-user" data-id="${user.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-user" data-id="${user.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Добавление обработчиков событий
    document.querySelectorAll('.view-user').forEach(btn => {
        btn.addEventListener('click', () => viewUser(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// Обновление таблицы регионов
function updateRegionsTable() {
    const tableBody = document.getElementById('regionsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Если нет данных, показываем сообщение
    if (!regions || regions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">Нет данных о регионах</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    regions.forEach(region => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${region.id || '-'}</td>
            <td>${region.name || 'Без названия'}</td>
            <td>${region.code || 'Нет кода'}</td>
            <td>${(region.center_lat || 0).toFixed(6)}, ${(region.center_lng || 0).toFixed(6)}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-region" data-id="${region.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-region" data-id="${region.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Добавление обработчиков событий
    document.querySelectorAll('.edit-region').forEach(btn => {
        btn.addEventListener('click', () => editRegion(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-region').forEach(btn => {
        btn.addEventListener('click', () => deleteRegion(btn.dataset.id));
    });
}

// Заполнение выпадающего списка регионов
function populateRegionSelect() {
    const regionSelect = document.getElementById('region');
    if (!regionSelect) return;
    
    regionSelect.innerHTML = '';
    
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
    
    // Заполняем фильтр регионов
    const regionFilter = document.getElementById('regionFilter');
    if (regionFilter) {
        // Сохраняем "Все регионы" опцию
        const allOption = regionFilter.querySelector('option[value="all"]');
        regionFilter.innerHTML = '';
        regionFilter.appendChild(allOption);
        
        // Добавляем все регионы
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.textContent = region.name;
            regionFilter.appendChild(option);
        });
        
        // Добавляем обработчик события изменения фильтра
        regionFilter.addEventListener('change', () => {
            addMarkersToMap(); // Перерисовываем маркеры с применением фильтра
            
            // Если выбран конкретный регион, центрируем карту на нем
            if (regionFilter.value !== 'all' && map) {
                const selectedRegion = regions.find(r => r.id.toString() === regionFilter.value);
                if (selectedRegion && selectedRegion.center_lat && selectedRegion.center_lng) {
                    map.setCenter({ lat: selectedRegion.center_lat, lng: selectedRegion.center_lng });
                    map.setZoom(selectedRegion.zoom_level || 10);
                }
            }
        });
    }
}

// Получение текста роли пользователя
function getUserRoleText(role) {
    const roleMap = {
        'admin': 'Адміністратор',
        'moderator': 'Модератор',
        'sapper': 'Сапер',
        'citizen': 'Громадянин'
    };
    return roleMap[role] || role;
}

// Вспомогательные функции для форматирования
function getStatusBadgeClass(status) {
    switch(status) {
        case 'mined': return 'badge-red';
        case 'unconfirmed': return 'badge-yellow';
        case 'demined': return 'badge-green';
        case 'archived': return 'badge-gray';
        case 'secret': return 'badge-purple';
        default: return 'badge-gray';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'mined': return 'Замінована';
        case 'unconfirmed': return 'Непідтверджена';
        case 'demined': return 'Розмінована';
        case 'archived': return 'Архів';
        case 'secret': return 'Секретна';
        default: return 'Невідомо';
    }
}

function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning text-dark';
        case 'low': return 'bg-info text-dark';
        default: return 'bg-secondary';
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case 'high': return 'Високий';
        case 'medium': return 'Середній';
        case 'low': return 'Низький';
        default: return 'Невідомо';
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString || 'Дата невідома';
    }
}

// Показ уведомления
function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.role = 'alert';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.querySelector('.main-content').prepend(alertContainer);
    
    // Авто-закрытие через 5 секунд
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertContainer);
        bsAlert.close();
    }, 5000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Отключаем автоматическую инициализацию табов Bootstrap, заменяя их на наш обработчик
        // Удаляем атрибут data-bs-toggle="tab" чтобы Bootstrap не инициализировал свои обработчики
        document.querySelectorAll('.sidebar-menu a[data-bs-toggle="tab"]').forEach(tab => {
            // Сохраняем href перед удалением атрибута
            const href = tab.getAttribute('href');
            tab.setAttribute('data-target', href);
            tab.removeAttribute('data-bs-toggle');
        });

        // Обновление UI даже если API карт не загрузились
        const mapElement = document.getElementById("map");
        if (mapElement && (!googleMapsLoaded && (typeof google === 'undefined' || !google.maps))) {
            mapElement.innerHTML = '<div class="alert alert-warning">Ожидание загрузки Google Maps...</div>';
            mapElement.style.height = 'auto';
        }
        
        // Загрузка данных
        loadExplosiveObjects();
        loadRegions();
        
        // Обработчики для форм - используем опциональную цепочку
        const saveObjectBtn = document.getElementById('saveObject');
        if (saveObjectBtn) saveObjectBtn.addEventListener('click', saveObject);
        
        const saveUserBtn = document.getElementById('saveUser');
        if (saveUserBtn) saveUserBtn.addEventListener('click', saveUser);
        
        const saveRegionBtn = document.getElementById('saveRegion');
        if (saveRegionBtn) saveRegionBtn.addEventListener('click', saveRegion);
        
        // Инициализация всех табов Bootstrap
        const tabElems = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElems.forEach(el => new bootstrap.Tab(el));
        
        // Обработчики для вкладок меню
        document.querySelectorAll('.sidebar-menu a[data-target]').forEach(tab => {
            tab.addEventListener('click', function (e) {
                // Предотвращаем обработку по умолчанию и остановку распространения события
                e.preventDefault();
                e.stopPropagation();
                
                const tabTarget = this.getAttribute('data-target');
                
                // Используем ручное переключение таба вместо Bootstrap API
                // 1. Скрываем все вкладки
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // 2. Отображаем целевую вкладку
                const targetPane = document.querySelector(tabTarget);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
                
                // 3. Обновление активного класса в меню
                document.querySelectorAll('.sidebar-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Обновляем URL хэш без перезагрузки страницы
                history.pushState(null, null, tabTarget);
                
                // Загружаем данные при переключении на вкладку
                if (tabTarget === '#users') {
                    console.log('Загрузка списка пользователей...');
                    loadUsers();
                } else if (tabTarget === '#explosive-objects') {
                    console.log('Загрузка списка объектов...');
                    loadExplosiveObjects();
                } else if (tabTarget === '#regions') {
                    console.log('Загрузка списка регионов...');
                    loadRegions();
                } else if (tabTarget === '#profile') {
                    console.log('Загрузка профиля...');
                    loadUserData(); // Эта функция определена в profile.js
                }
            });
        });
        
        // Проверка и активация начальной вкладки по хэшу в URL
        function activateTabFromHash() {
            const hash = window.location.hash;
            if (hash) {
                const tabLink = document.querySelector(`.sidebar-menu a[data-target="${hash}"]`);
                if (tabLink) {
                    // Активируем вкладку
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });
                    
                    const targetPane = document.querySelector(hash);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                    
                    // Обновляем активный класс в меню
                    document.querySelectorAll('.sidebar-menu a').forEach(link => {
                        link.classList.remove('active');
                    });
                    tabLink.classList.add('active');
                    
                    // Загружаем данные для соответствующей вкладки
                    if (hash === '#users') {
                        loadUsers();
                    } else if (hash === '#explosive-objects') {
                        loadExplosiveObjects();
                    } else if (hash === '#regions') {
                        loadRegions();
                    } else if (hash === '#profile') {
                        loadUserData(); // Эта функция определена в profile.js
                    }
                }
            } else {
                // Активируем первую вкладку если нет хэша
                const firstTab = document.querySelector('.sidebar-menu a[data-target]');
                if (firstTab) {
                    const firstTabTarget = firstTab.getAttribute('data-target');
                    
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });
                    
                    const targetPane = document.querySelector(firstTabTarget);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                    
                    document.querySelectorAll('.sidebar-menu a').forEach(link => {
                        link.classList.remove('active');
                    });
                    firstTab.classList.add('active');
                    
                    // Загружаем начальные данные
                    if (firstTabTarget === '#users') {
                        loadUsers();
                    }
                }
            }
        }
        
        // Вызываем функцию для активации начальной вкладки
        activateTabFromHash();
        
        // Добавляем обработчик изменения хэша в URL
        window.addEventListener('hashchange', activateTabFromHash);
        
        // Добавляем обработчики для кнопок в модальных окнах профиля
        const saveAvatarBtn = document.getElementById('saveAvatar');
        if (saveAvatarBtn) saveAvatarBtn.addEventListener('click', saveAvatar);
        
        const saveProfileBtn = document.getElementById('saveProfile');
        if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileChanges);
        
        const savePasswordBtn = document.getElementById('savePassword');
        if (savePasswordBtn) savePasswordBtn.addEventListener('click', changePassword);
        
        // Событие открытия модального окна редактирования профиля
        const editProfileModal = document.getElementById('editProfileModal');
        if (editProfileModal) {
            editProfileModal.addEventListener('show.bs.modal', function () {
                // Заполняем поля формы текущими данными профиля
                const username = document.getElementById('profileUsername').textContent;
                const email = document.getElementById('profileEmail').textContent;
                const fullName = document.getElementById('profileFullName').textContent;
                
                document.getElementById('editUsername').value = username;
                document.getElementById('editEmail').value = email;
                document.getElementById('editFullName').value = fullName;
            });
        }
        
        // Обрабатываем внутренние вкладки профиля, чтобы предотвратить конфликты с Bootstrap Tabs
        document.querySelectorAll('#profileInnerTabs button[data-bs-toggle="tab"]').forEach(button => {
            // Удаляем атрибут data-bs-toggle, чтобы Bootstrap не обрабатывал эти вкладки автоматически
            button.removeAttribute('data-bs-toggle');
            // Получаем target для вкладки
            const target = button.getAttribute('data-bs-target');
            button.setAttribute('data-profile-target', target);
            
            // Добавляем обработчик события
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Получаем целевую вкладку
                const targetPane = document.querySelector(this.getAttribute('data-profile-target'));
                
                // Убираем активное состояние со всех вкладок
                document.querySelectorAll('#profileInnerTabs button').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('#profileTabsContent .tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // Активируем выбранную вкладку
                this.classList.add('active');
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
            });
        });
        
        // Добавляем обработчики событий для фильтрации новостей
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', applyNewsFilters);
        }
        
        const resetFiltersBtn = document.getElementById('resetFilters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetNewsFilters);
        }
        
        // Добавляем обработчик изменения для фильтра регионов в новостях
        const newsRegionFilter = document.getElementById('newsRegionFilter');
        if (newsRegionFilter) {
            newsRegionFilter.addEventListener('change', updateRecentReports);
        }
        
        // Остальные инициализации...
    } catch (error) {
        console.error('Ошибка при инициализации страницы:', error);
    }
});

// Сохранение нового объекта
function saveObject() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const regionId = parseInt(document.getElementById('region').value);
    
    // Валидация формы
    if (!title || isNaN(latitude) || isNaN(longitude) || !status || !priority || isNaN(regionId)) {
        showAlert('danger', 'Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }
    
    const objectData = {
        title,
        description,
        latitude,
        longitude,
        status,
        priority,
        region_id: regionId
    };
    
    // Отправка данных на сервер
    fetch('/api/explosive-objects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objectData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Помилка при збереженні об\'єкта');
        }
        return response.json();
    })
    .then(data => {
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('addObjectModal'));
        modal.hide();
        
        // Обновление данных
        loadExplosiveObjects();
        
        showAlert('success', 'Новий об\'єкт успішно додано');
    })
    .catch(error => {
        console.error('Помилка:', error);
        showAlert('danger', error.message);
    });
}

// Сохранение нового пользователя
function saveUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Валидация формы
    if (!username || !email || !fullName || !password || !role) {
        showAlert('danger', 'Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }
    
    const userData = {
        username,
        email,
        full_name: fullName,
        password,
        role
    };
    
    // Отправка данных на сервер
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Помилка при збереженні користувача');
        }
        return response.json();
    })
    .then(data => {
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        
        // Обновление данных
        loadUsers();
        
        showAlert('success', 'Новий користувач успішно додано');
    })
    .catch(error => {
        console.error('Помилка:', error);
        showAlert('danger', error.message);
    });
}

// Заглушки для функций, которые будут реализованы позже
function viewObject(id) {
    console.log('Просмотр объекта:', id);
    // Здесь будет код для просмотра объекта
}

function editObject(id) {
    console.log('Редактирование объекта:', id);
    // Здесь будет код для редактирования объекта
}

function deleteObject(id) {
    if (confirm('Ви впевнені, що хочете видалити цей об\'єкт?')) {
        console.log('Удаление объекта:', id);
        // Здесь будет код для удаления объекта
    }
}

function viewUser(id) {
    console.log('Просмотр пользователя:', id);
    // Здесь будет код для просмотра пользователя
}

function editUser(id) {
    console.log('Редактирование пользователя:', id);
    // Здесь будет код для редактирования пользователя
}

function deleteUser(id) {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
        console.log('Удаление пользователя:', id);
        // Здесь будет код для удаления пользователя
    }
}

function editRegion(id) {
    // Заменяем на сообщение о разработке
    showAlert('info', '<i class="bi bi-tools"></i> Функція редагування регіону в розробці!');
}

function deleteRegion(id) {
    // Заменяем на сообщение о разработке
    showAlert('info', '<i class="bi bi-tools"></i> Функція видалення регіону в розробці!');
}

// Обновление данных о последних сообщениях
function updateRecentReports() {
    try {
        const recentReportsElement = document.getElementById('recentReports');
        if (!recentReportsElement) return;
        
        // Сортируем объекты по дате добавления (от новых к старым)
        const sortedObjects = [...explosiveObjects].sort((a, b) => {
            return new Date(b.reported_at) - new Date(a.reported_at);
        });
        
        // Get filter values
        const newsRegionFilter = document.getElementById('newsRegionFilter');
        const selectedRegionId = newsRegionFilter ? newsRegionFilter.value : 'all';
        
        const filterStatus = document.getElementById('filterStatus');
        const selectedStatus = filterStatus ? filterStatus.value : 'all';
        
        const filterPriority = document.getElementById('filterPriority');
        const selectedPriority = filterPriority ? filterPriority.value : 'all';
        
        // Filter objects based on all criteria
        let filteredObjects = sortedObjects;
        
        // Filter by region if a specific region is selected
        if (selectedRegionId !== 'all') {
            filteredObjects = filteredObjects.filter(obj => obj.region_id.toString() === selectedRegionId);
        }
        
        // Filter by status if a specific status is selected
        if (selectedStatus !== 'all') {
            filteredObjects = filteredObjects.filter(obj => obj.status === selectedStatus);
        }
        
        // Filter by priority if a specific priority is selected
        if (selectedPriority !== 'all') {
            filteredObjects = filteredObjects.filter(obj => obj.priority === selectedPriority);
        }
        
        // Берем только последние 5 объектов
        const recentObjects = filteredObjects.slice(0, 5);
        
        recentReportsElement.innerHTML = '';
        
        if (recentObjects.length === 0) {
            recentReportsElement.innerHTML = '<li class="list-group-item">Немає даних про нові об\'єкти</li>';
            return;
        }
        
        recentObjects.forEach(obj => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            
            const statusBadge = getStatusBadgeClass(obj.status);
            const priorityBadge = getPriorityBadgeClass(obj.priority);
            
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${obj.title || `Об'єкт #${obj.id}`}</h6>
                        <small class="text-muted">${formatDate(obj.reported_at)}</small>
                        <span class="badge ${priorityBadge} ms-2">${getPriorityText(obj.priority)}</span>
                    </div>
                    <span class="status-badge ${statusBadge}">${getStatusText(obj.status)}</span>
                </div>
            `;
            
            recentReportsElement.appendChild(li);
        });
    } catch (error) {
        console.error('Ошибка при обновлении последних сообщений:', error);
    }
}

// Добавляем функцию для обработки нажатия на кнопку применения фильтров
function applyNewsFilters() {
    updateRecentReports();
}

// Добавляем функцию для сброса фильтров новостей
function resetNewsFilters() {
    const newsRegionFilter = document.getElementById('newsRegionFilter');
    if (newsRegionFilter) newsRegionFilter.value = 'all';
    
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) filterStatus.value = 'all';
    
    const filterPriority = document.getElementById('filterPriority');
    if (filterPriority) filterPriority.value = 'all';
    
    updateRecentReports();
}

// Populate the news region filter dropdown
function populateNewsRegionFilter() {
    const newsRegionFilter = document.getElementById('newsRegionFilter');
    if (!newsRegionFilter) return;
    
    // Clear existing options
    newsRegionFilter.innerHTML = '';
    
    // Add "All regions" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Всі регіони';
    newsRegionFilter.appendChild(allOption);
    
    // Add all regions
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        newsRegionFilter.appendChild(option);
    });
    
    // Add event listener to filter news by region
    newsRegionFilter.addEventListener('change', updateRecentReports);
}

// Функция для загрузки данных профиля пользователя
async function loadProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Не вдалося завантажити дані профілю (${response.status}): ${errorText}`);
        }
        
        const userData = await response.json();
        updateProfileUI(userData);
        
    } catch (error) {
        console.error('Помилка завантаження даних профілю:', error);
        showAlert('danger', `Помилка завантаження даних профілю: ${error.message}`);
    }
}

// Функция для обновления UI профиля пользователя
function updateProfileUI(userData) {
    // Если есть элементы профиля на странице, обновляем их
    const usernameTxt = document.getElementById('profileUsername');
    const emailTxt = document.getElementById('profileEmail');
    const fullNameTxt = document.getElementById('profileFullName');
    const roleTxt = document.getElementById('profileRole');
    const avatarImg = document.getElementById('profileAvatar');
    const createdAtTxt = document.getElementById('profileCreatedAt');
    
    if (usernameTxt) usernameTxt.textContent = userData.username || '';
    if (emailTxt) emailTxt.textContent = userData.email || '';
    if (fullNameTxt) fullNameTxt.textContent = userData.full_name || '';
    if (roleTxt) roleTxt.textContent = getUserRoleText(userData.role) || '';
    
    if (avatarImg && userData.avatar_url) {
        avatarImg.src = userData.avatar_url;
    } else if (avatarImg) {
        avatarImg.src = '/static/images/default_avatar.png';
    }
    
    if (createdAtTxt) createdAtTxt.textContent = formatDate(userData.created_at) || 'Не вказано';
}

// Функция для сохранения аватара
async function saveAvatar() {
    try {
        const fileInput = document.getElementById('avatarFile');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showAlert('warning', 'Будь ласка, виберіть файл для завантаження');
            return;
        }
        
        const file = fileInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
            showAlert('warning', 'Розмір файлу не повинен перевищувати 2MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch('/api/user/avatar', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка завантаження аватара (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadAvatarModal'));
        modal.hide();
        
        // Обновление изображения аватара
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg && data.avatar_url) {
            avatarImg.src = data.avatar_url + '?t=' + new Date().getTime(); // Добавляем timestamp для обхода кэширования
        }
        
        showAlert('success', 'Аватар успішно завантажено');
    } catch (error) {
        console.error('Помилка при завантаженні аватара:', error);
        showAlert('danger', `Помилка при завантаженні аватара: ${error.message}`);
    }
}

// Функция для сохранения изменений профиля
async function saveProfileChanges() {
    try {
        const username = document.getElementById('editUsername').value;
        const email = document.getElementById('editEmail').value;
        const fullName = document.getElementById('editFullName').value;
        
        // Валидация формы
        if (!username || !email || !fullName) {
            showAlert('warning', 'Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }
        
        const userData = {
            username,
            email,
            full_name: fullName
        };
        
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка при зміні профілю (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();
        
        // Обновление данных профиля на странице
        updateProfileUI(data);
        
        showAlert('success', 'Профіль успішно оновлено');
    } catch (error) {
        console.error('Помилка при оновленні профілю:', error);
        showAlert('danger', `Помилка при оновленні профілю: ${error.message}`);
    }
}

// Функция для смены пароля
async function changePassword() {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Валидация формы
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('warning', 'Будь ласка, заповніть всі поля');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showAlert('warning', 'Новий пароль та підтвердження не співпадають');
            return;
        }
        
        const passwordData = {
            current_password: currentPassword,
            new_password: newPassword
        };
        
        const response = await fetch('/api/user/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка при зміні пароля (${response.status}): ${errorText}`);
        }
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
        modal.hide();
        
        // Очистка полей формы
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showAlert('success', 'Пароль успішно змінено');
    } catch (error) {
        console.error('Помилка при зміні пароля:', error);
        showAlert('danger', `Помилка при зміні пароля: ${error.message}`);
    }
}

// Функция для сохранения нового региона
async function saveRegion() {
    // Заменяем на сообщение о разработке
    showAlert('info', '<i class="bi bi-tools"></i> Функція додавання регіону в розробці!');
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('addRegionModal'));
    if (modal) {
        modal.hide();
    }
} 