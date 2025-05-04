import requests
from bs4 import BeautifulSoup

# URL для авторизации
base_url = "http://127.0.0.1:8000"
login_url = f"{base_url}/login"  # Используем форму входа вместо API токена

# Создаем сессию, чтобы сохранять куки между запросами
session = requests.Session()

# Данные для входа (имитация формы)
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("Попытка входа через форму входа...")
# При входе через форму, браузер выполняет POST на /login
response = session.post(login_url, data=login_data, allow_redirects=False)

print(f"Статус код: {response.status_code}")
print(f"Заголовки ответа: {dict(response.headers)}")

# Проверяем перенаправление
if 300 <= response.status_code < 400:
    redirect_url = response.headers.get('Location')
    print(f"\nПолучено перенаправление на: {redirect_url}")
    
    # Следуем за перенаправлением
    print("\nСледуем за перенаправлением...")
    redirect_response = session.get(base_url + redirect_url, allow_redirects=False)
    print(f"Статус код перенаправления: {redirect_response.status_code}")
else:
    print(f"Ответ сервера: {response.text[:300]}...")

# Проверяем куки
print("\nУстановленные куки:")
for cookie in session.cookies:
    print(f"{cookie.name}: {cookie.value}")

# Пробуем получить доступ к админ-панели
print("\nПопытка доступа к админ-панели с сохраненными куками...")
admin_url = f"{base_url}/admin/panel"
admin_response = session.get(admin_url)

print(f"Статус код: {admin_response.status_code}")
if admin_response.status_code == 200:
    print("Успешный доступ к админ-панели!")
    soup = BeautifulSoup(admin_response.text, 'html.parser')
    title = soup.title.string if soup.title else "Заголовок не найден"
    print(f"Заголовок страницы: {title}")
else:
    print(f"Ошибка доступа: {admin_response.text[:100]}...")

# Проверяем механизм OAuth2 на стороне браузера
print("\nПроверяем обработку токена в формате Bearer...")
# Получаем токен через API
token_response = requests.post(f"{base_url}/token", data=login_data)
if token_response.status_code == 200:
    token_data = token_response.json()
    token = token_data['access_token']
    print(f"Получен токен: {token[:20]}...")
    
    # Пробуем доступ с токеном в заголовке Authorization
    headers = {
        "Authorization": f"Bearer {token}"
    }
    auth_response = requests.get(admin_url, headers=headers)
    
    print(f"Статус код с Authorization Bearer: {auth_response.status_code}")
    if auth_response.status_code == 200:
        print("Успешный доступ с Bearer токеном!")
    else:
        print(f"Ошибка доступа с Bearer токеном: {auth_response.text[:100]}...")
else:
    print(f"Не удалось получить токен: {token_response.status_code}") 