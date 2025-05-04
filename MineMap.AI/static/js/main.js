// Функция для загрузки данных пользователя после авторизации
async function loadUserProfile() {
    try {
        const response = await fetch('/api/current-user');
        if (response.ok) {
            const userData = await response.json();
            console.log('Данные пользователя:', userData);
            
            // Ищем элементы отображения аватара в хедере (если они есть)
            const userAvatars = document.querySelectorAll('[data-user-avatar]');
            if (userAvatars.length > 0 && userData.avatar_url) {
                userAvatars.forEach(avatar => {
                    avatar.src = userData.avatar_url;
                    console.log('Установлен аватар:', userData.avatar_url);
                });
            }
            
            return userData;
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
    return null;
}

// Вызываем загрузку профиля при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    // ... другие инициализации
}); 