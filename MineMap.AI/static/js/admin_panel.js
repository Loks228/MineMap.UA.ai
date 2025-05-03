// Глобальные переменные
let map;
let markers = [];
let explosiveObjects = [];
let users = [];
let regions = [];
let googleMapsLoaded = false;

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
        const response = await fetch('/api/regions', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Не вдалося завантажити дані регіонів (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        regions = Array.isArray(data) ? data : [];
        
        updateRegionsTable();
        populateRegionSelect();
        
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
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" };
            } else if (obj.status === 'archived') {
                markerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" };
            }
            
            // Создание маркера
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: obj.title || `Об'єкт #${obj.id}`,
                icon: markerIcon
            });
            
            // Информационное окно
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div>
                        <h5>${obj.title || `Об'єкт #${obj.id}`}</h5>
                        <p>${obj.description || 'Опис відсутній'}</p>
                        <p><strong>Статус:</strong> ${getStatusText(obj.status)}</p>
                        <p><strong>Пріоритет:</strong> ${getPriorityText(obj.priority)}</p>
                        <p><strong>Регіон:</strong> ${obj.region_name || 'Не вказано'}</p>
                        <p><strong>Додано:</strong> ${formatDate(obj.reported_at)}</p>
                    </div>
                `
            });
            
            // Открытие информационного окна при клике на маркер
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
            
            markers.push(marker);
        } catch (error) {
            console.error(`Ошибка при добавлении маркера для объекта ID ${obj.id}:`, error);
        }
    });
}

// Очистка маркеров на карте
function clearMarkers() {
    try {
        if (!markers || !markers.length) return;
        
        markers.forEach(marker => {
            try {
                if (marker && typeof marker.setMap === 'function') {
                    marker.setMap(null);
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
        'high': 'Високий',
        'medium': 'Середній',
        'low': 'Низький'
    };
    return priorityMap[priority] || priority;
}

function getStatusBadgeClass(status) {
    const classMap = {
        'mined': 'badge-red',
        'unconfirmed': 'badge-yellow',
        'demined': 'badge-green',
        'archived': 'badge-gray',
        'secret': 'badge-purple'
    };
    return classMap[status] || 'badge-gray';
}

function getPriorityBadgeClass(priority) {
    const classMap = {
        'high': 'bg-danger',
        'medium': 'bg-warning text-dark',
        'low': 'bg-info text-dark'
    };
    return classMap[priority] || 'bg-secondary';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA');
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
        // Обновление UI даже если API карт не загрузились
        const mapElement = document.getElementById("map");
        if (mapElement && (!googleMapsLoaded && (typeof google === 'undefined' || !google.maps))) {
            mapElement.innerHTML = '<div class="alert alert-warning">Ожидание загрузки Google Maps...</div>';
            mapElement.style.height = 'auto';
        }
        
        // Загрузка данных
        loadExplosiveObjects();
        loadUsers();
        loadRegions();
        
        // Обработчики для форм - используем опциональную цепочку
        const saveObjectBtn = document.getElementById('saveObject');
        if (saveObjectBtn) saveObjectBtn.addEventListener('click', saveObject);
        
        const saveUserBtn = document.getElementById('saveUser');
        if (saveUserBtn) saveUserBtn.addEventListener('click', saveUser);
        
        // Обработчики для вкладок
        document.querySelectorAll('.sidebar-menu a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('click', function (e) {
                e.preventDefault();
                const tabTarget = this.getAttribute('href');
                const tabTrigger = new bootstrap.Tab(this);
                tabTrigger.show();
                
                // Обновление активного класса
                document.querySelectorAll('.sidebar-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
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
    console.log('Редактирование региона:', id);
    // Здесь будет код для редактирования региона
}

function deleteRegion(id) {
    if (confirm('Ви впевнені, що хочете видалити цей регіон?')) {
        console.log('Удаление региона:', id);
        // Здесь будет код для удаления региона
    }
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
        
        // Берем только последние 5 объектов
        const recentObjects = sortedObjects.slice(0, 5);
        
        recentReportsElement.innerHTML = '';
        
        if (recentObjects.length === 0) {
            recentReportsElement.innerHTML = '<li class="list-group-item">Немає даних про нові об\'єкти</li>';
            return;
        }
        
        recentObjects.forEach(obj => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            
            const statusBadge = getStatusBadgeClass(obj.status);
            
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${obj.title || `Об'єкт #${obj.id}`}</h6>
                        <small class="text-muted">${formatDate(obj.reported_at)}</small>
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