// Глобальные переменные
let currentUser = null;
let loginHistory = [];
let activityHistory = [];
let apiKeys = [];
let isTwoFactorEnabled = false;

// Функция для загрузки данных пользователя
async function loadUserData() {
    try {
        const response = await fetch('/api/current-user');
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        
        currentUser = await response.json();
        console.log('Данные пользователя загружены:', currentUser);
        
        // Заполняем форму профиля
        document.getElementById('fullName').value = currentUser.full_name || '';
        document.getElementById('username').value = currentUser.username || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        
        // Обновляем аватарку пользователя
        const avatarImg = document.getElementById('user-avatar');
        if (avatarImg) {
            // Добавляем уникальный параметр к URL чтобы избежать кеширования
            const timestamp = new Date().getTime();
            
            if (currentUser.avatar_url) {
                // Добавляем timestamp к URL чтобы избежать кеширования браузером
                const avatarUrl = currentUser.avatar_url.includes('?') 
                    ? `${currentUser.avatar_url}&t=${timestamp}` 
                    : `${currentUser.avatar_url}?t=${timestamp}`;
                    
                avatarImg.src = avatarUrl;
                console.log('Установлен аватар из базы данных:', avatarUrl);
            } else {
                avatarImg.src = `/static/images/default-avatar.png?t=${timestamp}`;
                console.log('Установлен дефолтный аватар');
            }
        }
        
        // Форматируем и логируем дату создания для отладки
        if (currentUser.created_at) {
            const createdDate = new Date(currentUser.created_at);
            if (!isNaN(createdDate.getTime())) {
                const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
                console.log('Created at:', formattedDate);
            } else {
                console.log('Created at (raw):', currentUser.created_at);
            }
        } else {
            console.log('Created at: null');
        }
        
        // Проверяем статус 2FA
        isTwoFactorEnabled = currentUser.two_factor_enabled || false;
        updateTwoFactorUI();
        
        // Загружаем историю входов
        loadLoginHistory();
        
        // Загружаем историю активности
        loadActivityHistory();
        
        // Загружаем API ключи
        loadApiKeys();
        
        return currentUser;
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        showAlert('danger', `Ошибка загрузки данных: ${error.message}`);
    }
}

// Функция обновления UI двухфакторной аутентификации
function updateTwoFactorUI() {
    document.getElementById('enable2FA').checked = isTwoFactorEnabled;
    document.getElementById('twoFactorSetup').style.display = isTwoFactorEnabled ? 'none' : 'none';
    document.getElementById('twoFactorActive').style.display = isTwoFactorEnabled ? 'block' : 'none';
}

// Функция для загрузки истории входов
async function loadLoginHistory() {
    try {
        // В реальном приложении здесь был бы запрос к API
        // Временно используем заглушку с данными
        loginHistory = [
            { date: '2023-05-15 14:30:45', ip: '192.168.1.1', location: 'Kyiv, Ukraine', device: 'Chrome on Windows' },
            { date: '2023-05-10 09:15:22', ip: '192.168.1.1', location: 'Kyiv, Ukraine', device: 'Firefox on Windows' },
            { date: '2023-05-05 18:45:33', ip: '192.168.1.2', location: 'Lviv, Ukraine', device: 'Safari on iPhone' }
        ];
        
        updateLoginHistoryUI();
        
    } catch (error) {
        console.error('Ошибка загрузки истории входов:', error);
    }
}

// Функция обновления UI истории входов
function updateLoginHistoryUI() {
    const container = document.getElementById('loginHistory');
    container.innerHTML = '';
    
    loginHistory.forEach(login => {
        const item = document.createElement('div');
        item.className = 'login-history-item';
        item.innerHTML = `
            <p><strong><i class="bi bi-calendar-check"></i> ${login.date}</strong></p>
            <p><i class="bi bi-geo-alt"></i> ${login.location} (${login.ip})</p>
            <p><i class="bi bi-laptop"></i> ${login.device}</p>
        `;
        container.appendChild(item);
    });
}

// Функция для загрузки истории активности
async function loadActivityHistory() {
    try {
        // В реальном приложении здесь был бы запрос к API
        // Временно используем заглушку с данными
        activityHistory = [
            { date: '2023-05-14 16:20:12', action: 'Добавление объекта', details: 'Добавлен новый объект #123' },
            { date: '2023-05-12 11:30:45', action: 'Изменение статуса', details: 'Изменен статус объекта #456 на "Разминирован"' },
            { date: '2023-05-09 09:15:33', action: 'Удаление объекта', details: 'Удален объект #789' },
            { date: '2023-05-05 14:25:10', action: 'Редактирование объекта', details: 'Изменены данные объекта #321' }
        ];
        
        updateActivityHistoryUI();
        
    } catch (error) {
        console.error('Ошибка загрузки истории активности:', error);
    }
}

// Функция обновления UI истории активности
function updateActivityHistoryUI() {
    const container = document.getElementById('activityHistory');
    container.innerHTML = '';
    
    activityHistory.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <p><strong>${activity.action}</strong></p>
            <p>${activity.details}</p>
            <p class="text-muted small">${activity.date}</p>
        `;
        container.appendChild(item);
    });
}

// Функция для загрузки API ключей
async function loadApiKeys() {
    try {
        // В реальном приложении здесь был бы запрос к API
        // Временно используем заглушку с данными
        apiKeys = [
            { id: 1, name: 'Мобильное приложение', key: 'api_key_12345abcde', created: '2023-04-10', expires: '2023-10-10', permissions: ['read'] },
            { id: 2, name: 'Веб-интеграция', key: 'api_key_67890fghij', created: '2023-03-15', expires: 'Без ограничений', permissions: ['read', 'write'] }
        ];
        
        updateApiKeysUI();
        
    } catch (error) {
        console.error('Ошибка загрузки API ключей:', error);
    }
}

// Функция обновления UI API ключей
function updateApiKeysUI() {
    const container = document.getElementById('apiKeys');
    container.innerHTML = '';
    
    if (apiKeys.length === 0) {
        container.innerHTML = '<div class="alert alert-light text-center">У вас пока нет API ключей</div>';
        return;
    }
    
    apiKeys.forEach(key => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${key.name}</h5>
                <button class="btn btn-sm btn-outline-danger delete-api-key" data-id="${key.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <strong>Ключ:</strong> 
                    <div class="api-key d-flex justify-content-between align-items-center">
                        <code>${key.key}</code>
                        <button class="btn btn-sm btn-outline-secondary copy-key" data-key="${key.key}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-2"><strong>Создан:</strong> ${key.created}</div>
                <div class="mb-2"><strong>Истекает:</strong> ${key.expires}</div>
                <div><strong>Права доступа:</strong> ${key.permissions.join(', ')}</div>
            </div>
        `;
        container.appendChild(card);
        
        // Добавляем обработчик для копирования ключа
        card.querySelector('.copy-key').addEventListener('click', function() {
            const apiKey = this.getAttribute('data-key');
            navigator.clipboard.writeText(apiKey).then(() => {
                showAlert('success', 'API ключ скопирован в буфер обмена');
            });
        });
        
        // Добавляем обработчик для удаления ключа
        card.querySelector('.delete-api-key').addEventListener('click', function() {
            const keyId = this.getAttribute('data-id');
            if (confirm('Вы уверены, что хотите удалить этот API ключ?')) {
                deleteApiKey(keyId);
            }
        });
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма личных данных
    document.getElementById('personalDataForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updatePersonalData();
    });
    
    // Форма смены пароля
    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
    
    // Форма настроек уведомлений
    document.getElementById('notificationsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNotificationSettings();
    });
    
    // Двухфакторная аутентификация
    document.getElementById('enable2FA').addEventListener('change', function() {
        if (this.checked) {
            setupTwoFactor();
        } else {
            disableTwoFactor();
        }
    });
    
    // Подтверждение двухфакторной аутентификации
    document.getElementById('verifyTwoFactorBtn').addEventListener('click', verifyTwoFactor);
    
    // Отключение двухфакторной аутентификации
    document.getElementById('disable2FABtn').addEventListener('click', disableTwoFactor);
    
    // Удаление аккаунта
    document.getElementById('confirmDeleteAccount').addEventListener('click', deleteAccount);
    
    // Создание API ключа
    document.getElementById('generateApiKeyBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('generateApiKeyModal'));
        modal.show();
    });
    
    // Подтверждение создания API ключа
    document.getElementById('confirmGenerateApiKey').addEventListener('click', generateApiKey);
    
    // Верификация email
    document.getElementById('verifyEmailBtn').addEventListener('click', verifyEmail);
    
    // Верификация телефона
    document.getElementById('verifyPhoneBtn').addEventListener('click', verifyPhone);
    
    // Начать чат поддержки
    document.getElementById('startChatBtn').addEventListener('click', startSupportChat);
}

// Функция для обновления личных данных
async function updatePersonalData() {
    try {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        // Создаем объект с данными профиля
        const profileData = {
            full_name: fullName,
            email: email,
            phone: phone
        };
        
        // Отправляем запрос на сервер
        const response = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Ошибка обновления данных');
        }
        
        // Обновляем данные пользователя
        const updatedUser = await response.json();
        currentUser = updatedUser;
        
        showAlert('success', 'Личные данные успешно обновлены');
        
    } catch (error) {
        console.error('Ошибка обновления личных данных:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для смены пароля
async function changePassword() {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Проверка совпадения паролей
        if (newPassword !== confirmPassword) {
            showAlert('danger', 'Новый пароль и подтверждение не совпадают');
            return;
        }
        
        // Проверка сложности пароля
        if (calculatePasswordStrength(newPassword) < 60) {
            showAlert('warning', 'Пароль слишком простой. Используйте комбинацию букв, цифр и спецсимволов');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        // Временно используем имитацию успешного запроса
        
        // Очищаем форму
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showAlert('success', 'Пароль успешно изменен');
        
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для сохранения настроек уведомлений
async function saveNotificationSettings() {
    try {
        const settings = {
            email: {
                newObjects: document.getElementById('emailNewObjects').checked,
                statusChanges: document.getElementById('emailStatusChanges').checked,
                securityAlerts: document.getElementById('emailSecurityAlerts').checked
            },
            push: {
                newObjects: document.getElementById('pushNewObjects').checked,
                statusChanges: document.getElementById('pushStatusChanges').checked,
                securityAlerts: document.getElementById('pushSecurityAlerts').checked
            }
        };
        
        // В реальном приложении здесь был бы запрос к API
        // Временно используем имитацию успешного запроса
        
        showAlert('success', 'Настройки уведомлений сохранены');
        
    } catch (error) {
        console.error('Ошибка сохранения настроек уведомлений:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция инициализации проверки сложности пароля
function initPasswordStrengthMeter() {
    const passwordInput = document.getElementById('newPassword');
    const confirmInput = document.getElementById('confirmPassword');
    const strengthBar = document.getElementById('passwordStrength');
    const feedback = document.getElementById('passwordFeedback');
    const confirmFeedback = document.getElementById('confirmFeedback');
    
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        
        // Обновляем индикатор сложности
        strengthBar.style.width = `${strength}%`;
        strengthBar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
        
        if (strength < 30) {
            strengthBar.classList.add('bg-danger');
            feedback.textContent = 'Слабый пароль - используйте больше символов';
        } else if (strength < 60) {
            strengthBar.classList.add('bg-warning');
            feedback.textContent = 'Средний пароль - добавьте цифры и спецсимволы';
        } else {
            strengthBar.classList.add('bg-success');
            feedback.textContent = 'Надежный пароль';
        }
        
        // Проверяем совпадение паролей
        if (confirmInput.value) {
            checkPasswordsMatch();
        }
    });
    
    confirmInput.addEventListener('input', checkPasswordsMatch);
    
    function checkPasswordsMatch() {
        if (passwordInput.value !== confirmInput.value) {
            confirmFeedback.textContent = 'Пароли не совпадают';
            confirmFeedback.classList.remove('text-success');
            confirmFeedback.classList.add('text-danger');
        } else {
            confirmFeedback.textContent = 'Пароли совпадают';
            confirmFeedback.classList.remove('text-danger');
            confirmFeedback.classList.add('text-success');
        }
    }
}

// Функция расчета сложности пароля
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Длина пароля
    if (password.length > 6) strength += 20;
    if (password.length > 10) strength += 10;
    
    // Сложность пароля
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    // Разнообразие символов
    const uniqueChars = new Set(password.split('')).size;
    strength += Math.min(uniqueChars * 2, 20);
    
    return Math.min(strength, 100);
}

// Функция для отображения уведомлений
function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Находим подходящий контейнер для вставки уведомления
    let container = document.querySelector('.container');
    if (!container) {
        // Если мы в админ-панели, используем main-content
        container = document.querySelector('.main-content');
    }
    
    if (container) {
        // Вставляем уведомление в начало контейнера
        container.insertBefore(alertContainer, container.firstChild);
        
        // Автоматически удаляем уведомление через 5 секунд
        setTimeout(() => {
            if (alertContainer.parentElement) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alertContainer);
                bsAlert.close();
            }
        }, 5000);
    } else {
        // Если не можем найти контейнер, выводим сообщение в консоль
        console.error('Не удалось найти контейнер для отображения уведомления:', message);
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем отладочную информацию в консоль
    console.log('Страница профиля загружена');
    
    // Проверяем наличие элементов на странице
    if (document.getElementById('profileAvatar')) {
        console.log('Найден элемент profileAvatar');
    } else {
        console.warn('Элемент profileAvatar не найден!');
    }
    
    // Проверяем кнопку сохранения аватара
    const saveAvatarBtn = document.getElementById('saveAvatar');
    if (saveAvatarBtn) {
        console.log('Найдена кнопка saveAvatar, добавляем обработчик');
        saveAvatarBtn.removeEventListener('click', saveAvatar); // На всякий случай убираем старый обработчик
        saveAvatarBtn.addEventListener('click', saveAvatar);
    } else {
        console.warn('Кнопка saveAvatar не найдена!');
    }
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем проверку сложности пароля
    initPasswordStrengthMeter();
    
    // Добавляем обработчики событий
    setupEventListeners();
});

// Функция для настройки двухфакторной аутентификации
async function setupTwoFactor() {
    try {
        // В реальном приложении здесь был бы запрос к API для получения QR-кода
        // Временно используем фейковые данные
        const secretKey = 'ABCDEFGHIJKLMNOP';
        const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/MineMap:user@example.com?secret=' + secretKey + '&issuer=MineMap';
        
        // Отображаем QR-код и секретный ключ
        document.getElementById('qrCodeImage').src = qrCodeUrl;
        document.getElementById('qrCodeImage').style.display = 'block';
        document.getElementById('secretKey').value = secretKey;
        
        // Показываем панель настройки
        document.getElementById('twoFactorSetup').style.display = 'block';
        document.getElementById('twoFactorActive').style.display = 'none';
        
    } catch (error) {
        console.error('Ошибка настройки двухфакторной аутентификации:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
        document.getElementById('enable2FA').checked = false;
    }
}

// Функция для проверки и активации двухфакторной аутентификации
async function verifyTwoFactor() {
    try {
        const code = document.getElementById('verificationCode').value;
        
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            showAlert('warning', 'Введите корректный 6-значный код');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API для проверки кода
        // Временно используем имитацию успешной проверки
        
        // Активируем 2FA
        isTwoFactorEnabled = true;
        updateTwoFactorUI();
        
        showAlert('success', 'Двухфакторная аутентификация успешно активирована');
        
    } catch (error) {
        console.error('Ошибка верификации двухфакторной аутентификации:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для отключения двухфакторной аутентификации
async function disableTwoFactor() {
    try {
        if (!confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию? Это снизит безопасность вашего аккаунта.')) {
            document.getElementById('enable2FA').checked = true;
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        
        // Деактивируем 2FA
        isTwoFactorEnabled = false;
        updateTwoFactorUI();
        
        showAlert('success', 'Двухфакторная аутентификация отключена');
        
    } catch (error) {
        console.error('Ошибка отключения двухфакторной аутентификации:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
        document.getElementById('enable2FA').checked = true;
    }
}

// Функция для удаления аккаунта
async function deleteAccount() {
    try {
        const password = document.getElementById('deleteConfirmPassword').value;
        const confirmed = document.getElementById('deleteConfirmCheck').checked;
        
        if (!password) {
            showAlert('warning', 'Введите пароль для подтверждения');
            return;
        }
        
        if (!confirmed) {
            showAlert('warning', 'Подтвердите, что вы понимаете последствия удаления аккаунта');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        // После успешного удаления перенаправляем на страницу входа
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
        modal.hide();
        
        // Показываем уведомление
        showAlert('success', 'Ваш аккаунт удален. Перенаправление на главную страницу...');
        
        // Перенаправляем на главную через 3 секунды
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка удаления аккаунта:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для создания API ключа
async function generateApiKey() {
    try {
        const name = document.getElementById('apiKeyName').value;
        const expiration = document.getElementById('apiKeyExpiration').value;
        const permissions = [];
        
        if (document.getElementById('permissionRead').checked) permissions.push('read');
        if (document.getElementById('permissionWrite').checked) permissions.push('write');
        if (document.getElementById('permissionDelete').checked) permissions.push('delete');
        
        if (!name) {
            showAlert('warning', 'Введите название для API ключа');
            return;
        }
        
        if (permissions.length === 0) {
            showAlert('warning', 'Выберите хотя бы одно разрешение');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        
        // Генерируем ключ
        const apiKey = 'api_key_' + Math.random().toString(36).substring(2, 15);
        const now = new Date();
        
        // Формируем дату истечения срока действия
        let expiresDate = 'Без ограничений';
        if (expiration !== '0') {
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + parseInt(expiration));
            expiresDate = expDate.toISOString().split('T')[0];
        }
        
        // Добавляем новый ключ
        apiKeys.push({
            id: apiKeys.length + 1,
            name: name,
            key: apiKey,
            created: now.toISOString().split('T')[0],
            expires: expiresDate,
            permissions: permissions
        });
        
        // Обновляем UI
        updateApiKeysUI();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('generateApiKeyModal'));
        modal.hide();
        
        // Очищаем форму
        document.getElementById('apiKeyName').value = '';
        document.getElementById('apiKeyExpiration').value = '30';
        document.getElementById('permissionRead').checked = true;
        document.getElementById('permissionWrite').checked = false;
        document.getElementById('permissionDelete').checked = false;
        
        showAlert('success', 'Новый API ключ успешно создан');
        
    } catch (error) {
        console.error('Ошибка создания API ключа:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для удаления API ключа
async function deleteApiKey(keyId) {
    try {
        // В реальном приложении здесь был бы запрос к API
        
        // Удаляем ключ из массива
        apiKeys = apiKeys.filter(key => key.id != keyId);
        
        // Обновляем UI
        updateApiKeysUI();
        
        showAlert('success', 'API ключ успешно удален');
        
    } catch (error) {
        console.error('Ошибка удаления API ключа:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для верификации email
async function verifyEmail() {
    try {
        const email = document.getElementById('email').value;
        
        if (!email || !isValidEmail(email)) {
            showAlert('warning', 'Введите корректный email адрес');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        
        showAlert('success', 'На ваш email отправлена ссылка для подтверждения');
        
    } catch (error) {
        console.error('Ошибка верификации email:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для верификации телефона
async function verifyPhone() {
    try {
        const phone = document.getElementById('phone').value;
        
        if (!phone || !isValidPhone(phone)) {
            showAlert('warning', 'Введите корректный номер телефона');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        
        showAlert('success', 'На ваш телефон отправлен код подтверждения');
        
    } catch (error) {
        console.error('Ошибка верификации телефона:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для начала чата поддержки
async function startSupportChat() {
    try {
        // В реальном приложении здесь был бы запрос к API для инициализации чата
        
        // Временно используем имитацию успешного запроса
        
        showAlert('success', 'Чат поддержки успешно инициализирован');
        
    } catch (error) {
        console.error('Ошибка инициализации чата поддержки:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
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
        
        // Показываем эффект загрузки на аватаре
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) {
            avatarImg.classList.add('uploading');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('Отправляем файл:', file.name, file.type, file.size);
        
        const response = await fetch('/api/user/avatar', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ответ от сервера:', errorText);
            throw new Error(`Помилка завантаження аватара (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadAvatarModal'));
        if (modal) {
            modal.hide();
        }
        
        // Обновление изображения аватара
        if (avatarImg && data.avatar_url) {
            avatarImg.classList.remove('uploading');
            // Добавляем timestamp для обхода кэширования
            avatarImg.src = data.avatar_url + '?t=' + new Date().getTime();
            
            // Также обновляем аватар в шапке, если он есть
            const headerAvatar = document.querySelector('.user-avatar');
            if (headerAvatar) {
                headerAvatar.src = data.avatar_url + '?t=' + new Date().getTime();
            }
            
            // Обновляем заголовки профиля, если они есть
            const profileFullNameHeader = document.getElementById('profileFullNameHeader');
            if (profileFullNameHeader) {
                profileFullNameHeader.textContent = currentUser.full_name || currentUser.username;
            }
        }
        
        // Очищаем значение input файла
        fileInput.value = '';
        
        showAlert('success', 'Аватар успішно завантажено');
    } catch (error) {
        console.error('Помилка при завантаженні аватара:', error);
        try {
            showAlert('danger', `Помилка при завантаженні аватара: ${error.message}`);
        } catch (alertError) {
            console.error('Ошибка при показе уведомления:', alertError);
        }
        
        // Убираем эффект загрузки в случае ошибки
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) {
            avatarImg.classList.remove('uploading');
        }
    }
}