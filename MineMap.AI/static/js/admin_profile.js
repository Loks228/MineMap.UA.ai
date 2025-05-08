// Admin Panel Profile Functionality

// Обработчики для форм профиля в админ-панели
document.addEventListener('DOMContentLoaded', function() {
    // Форма личных данных
    const personalDataForm = document.getElementById('admin-personalDataForm');
    if (personalDataForm) {
        personalDataForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateAdminPersonalData();
        });
    }
    
    // Форма смены пароля
    const changePasswordForm = document.getElementById('admin-changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changeAdminPassword();
        });
    }
    
    // Форма настроек уведомлений
    const notificationsForm = document.getElementById('admin-notificationsForm');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminNotificationSettings();
        });
    }
    
    // Верификация email
    const verifyEmailBtn = document.getElementById('admin-verifyEmailBtn');
    if (verifyEmailBtn) {
        verifyEmailBtn.addEventListener('click', verifyAdminEmail);
    }
    
    // Верификация телефона
    const verifyPhoneBtn = document.getElementById('admin-verifyPhoneBtn');
    if (verifyPhoneBtn) {
        verifyPhoneBtn.addEventListener('click', verifyAdminPhone);
    }
    
    // Инициализация проверки сложности пароля
    initAdminPasswordStrengthMeter();
});

// Функция инициализации проверки сложности пароля
function initAdminPasswordStrengthMeter() {
    const passwordInput = document.getElementById('admin-newPassword');
    const confirmInput = document.getElementById('admin-confirmPassword');
    const strengthBar = document.getElementById('admin-passwordStrength');
    const feedback = document.getElementById('admin-passwordFeedback');
    
    if (!passwordInput || !confirmInput || !strengthBar || !feedback) {
        console.log('Некоторые элементы для проверки пароля в админ-панели не найдены');
        return;
    }
    
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
        // Здесь можно добавить индикатор совпадения паролей, если нужно
        if (passwordInput.value !== confirmInput.value) {
            confirmInput.classList.add('is-invalid');
            confirmInput.classList.remove('is-valid');
        } else {
            confirmInput.classList.remove('is-invalid');
            confirmInput.classList.add('is-valid');
        }
    }
}

// Функция для обновления личных данных
async function updateAdminPersonalData() {
    try {
        const fullName = document.getElementById('admin-fullName').value;
        const email = document.getElementById('admin-email').value;
        const phone = document.getElementById('admin-phone').value;
        
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
        
        showAlert('success', 'Личные данные успешно обновлены');
        
    } catch (error) {
        console.error('Ошибка обновления личных данных:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для смены пароля
async function changeAdminPassword() {
    try {
        const currentPassword = document.getElementById('admin-currentPassword').value;
        const newPassword = document.getElementById('admin-newPassword').value;
        const confirmPassword = document.getElementById('admin-confirmPassword').value;
        
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
        document.getElementById('admin-currentPassword').value = '';
        document.getElementById('admin-newPassword').value = '';
        document.getElementById('admin-confirmPassword').value = '';
        
        showAlert('success', 'Пароль успешно изменен');
        
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Функция для сохранения настроек уведомлений
async function saveAdminNotificationSettings() {
    try {
        const settings = {
            email: {
                newObjects: document.getElementById('admin-emailNewObjects').checked,
                statusChanges: document.getElementById('admin-emailStatusChanges').checked,
                securityAlerts: document.getElementById('admin-emailSecurityAlerts').checked
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

// Функция для верификации email
async function verifyAdminEmail() {
    try {
        const email = document.getElementById('admin-email').value;
        
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
async function verifyAdminPhone() {
    try {
        const phone = document.getElementById('admin-phone').value;
        
        if (!phone) {
            showAlert('warning', 'Введите номер телефона');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        
        showAlert('success', 'На ваш телефон отправлен код подтверждения');
        
    } catch (error) {
        console.error('Ошибка верификации телефона:', error);
        showAlert('danger', `Ошибка: ${error.message}`);
    }
}

// Вспомогательная функция проверки email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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
    let container = document.querySelector('.main-content');
    
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