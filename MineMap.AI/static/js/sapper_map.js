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
        
        // Заповнюємо випадаючий список регіонів в формі
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
        
        // Заповнюємо випадаючий список фільтра регіонів
        const regionFilter = document.getElementById('regionFilter');
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
            
            // Додаємо обробник події для фільтрації по регіону
            regionFilter.addEventListener('change', filterMarkersByRegion);
        }
    } catch (error) {
        console.error('Помилка завантаження регіонів:', error);
    }
}

// Функция для фильтрации маркеров по региону
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
    
    // Update the objects list with filtered objects
    const objectsList = document.getElementById('objectsList');
    if (objectsList) {
        // Clear the list
        objectsList.innerHTML = '';
        
        // Filter objects by region and status
        const statusFilter = document.getElementById('filterStatus');
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        
        let filteredObjects = [...explosiveObjects];
        
        // Filter by region if specific region is selected
        if (selectedRegionId !== 'all') {
            filteredObjects = filteredObjects.filter(obj => obj.region_id.toString() === selectedRegionId);
        }
        
        // Filter by status if specific status is selected
        if (selectedStatus !== 'all') {
            filteredObjects = filteredObjects.filter(obj => obj.status === selectedStatus);
        }
        
        // Render filtered objects
        if (filteredObjects.length === 0) {
            objectsList.innerHTML = '<div class="p-3 text-center text-muted">Немає об\'єктів для відображення</div>';
        } else {
            filteredObjects.forEach(obj => {
                const div = document.createElement('div');
                div.className = 'object-item';
                div.setAttribute('data-object-id', obj.id);
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="mb-1">${obj.title || 'Об\'єкт #' + obj.id}</h6>
                        <span class="badge ${getStatusBadgeClass(obj.status)}">${getStatusText(obj.status)}</span>
                    </div>
                    <div class="object-info">
                        <span class="text-muted small">${obj.region_name || 'Невідомий регіон'}</span>
                        <span class="badge ${getPriorityBadgeClass(obj.priority)}">${getPriorityText(obj.priority)}</span>
                    </div>
                `;
                
                // Add click event to highlight the object on map
                div.addEventListener('click', () => {
                    // Find the marker for this object
                    const markerIndex = explosiveObjects.findIndex(o => o.id === obj.id);
                    if (markerIndex !== -1 && markers[markerIndex]) {
                        // Center map on marker
                        map.setCenter({
                            lat: obj.latitude,
                            lng: obj.longitude
                        });
                        map.setZoom(15);
                        
                        // Trigger click on marker to show info window
                        google.maps.event.trigger(markers[markerIndex], 'click');
                    }
                });
                
                objectsList.appendChild(div);
            });
        }
    }
}

// Helper functions for badge classes
function getStatusBadgeClass(status) {
    switch (status) {
        case 'secret': return 'bg-purple';
        case 'mined': return 'bg-danger';
        case 'unconfirmed': return 'bg-warning';
        case 'archived': return 'bg-secondary';
        case 'demined': return 'bg-success';
        default: return 'bg-light';
    }
}

function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning';
        case 'low': return 'bg-success';
        default: return 'bg-light';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'secret': return 'Секретна';
        case 'mined': return 'Замінована';
        case 'unconfirmed': return 'Непідтверджена';
        case 'archived': return 'Архів';
        case 'demined': return 'Розмінована';
        default: return 'Невідомо';
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

// Загрузка данных при инициализации
async function initData() {
    try {
        await loadExplosiveObjects();
        await loadRegions();
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

// Модифікуємо функцію ініціалізації карти
// Deleted: let originalInitMap = initMap;
// Deleted: initMap = function() { ... }
// ... existing code around line 237 ...

// Ensure that after loadRegions and initMapUtilities, we call initMap then initData
// For example, after dynamically loading Google Maps, in initGoogleMaps (in HTML template) initMap() is called, then we need to call initData()
// Add at end of initGoogleMaps in template: initData();

// ... existing code rest remains unchanged ...

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
}); 