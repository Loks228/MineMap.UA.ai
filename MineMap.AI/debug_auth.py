import requests
import json

# URL для авторизации
base_url = "http://127.0.0.1:8000"
login_url = f"{base_url}/token"

# Данные для входа
login_data = {
    "username": "admin",  # Попробуем новый аккаунт admin
    "password": "admin123"
}

# Попытка входа
print("Попытка входа для получения токена...")
response = requests.post(login_url, data=login_data)

if response.status_code == 200:
    # Успешный вход
    token_data = response.json()
    print(f"Успешный вход! Получен токен: {token_data['access_token'][:20]}...")
    
    # Попытка доступа к админ-панели с полученным токеном
    admin_url = f"{base_url}/admin/panel"
    headers = {
        "Authorization": f"Bearer {token_data['access_token']}"
    }
    
    print("\nПопытка доступа к админ-панели...")
    admin_response = requests.get(admin_url, headers=headers)
    
    print(f"Статус код: {admin_response.status_code}")
    if admin_response.status_code == 200:
        print("Успешный доступ к админ-панели!")
    else:
        print(f"Ошибка доступа: {admin_response.text[:100]}...")
else:
    # Ошибка входа
    print(f"Ошибка входа: {response.status_code}")
    print(f"Детали: {response.text}")
    
    # Попробуем второй аккаунт
    print("\nПопытка входа с другим аккаунтом (LordLoks/1234)...")
    login_data = {
        "username": "LordLoks",
        "password": "1234"
    }
    
    response = requests.post(login_url, data=login_data)
    if response.status_code == 200:
        token_data = response.json()
        print(f"Успешный вход! Получен токен: {token_data['access_token'][:20]}...")
        
        # Попытка доступа к админ-панели
        admin_url = f"{base_url}/admin/panel"
        headers = {
            "Authorization": f"Bearer {token_data['access_token']}"
        }
        
        print("\nПопытка доступа к админ-панели...")
        admin_response = requests.get(admin_url, headers=headers)
        
        print(f"Статус код: {admin_response.status_code}")
        if admin_response.status_code == 200:
            print("Успешный доступ к админ-панели!")
        else:
            print(f"Ошибка доступа: {admin_response.text[:100]}...")
    else:
        print(f"Ошибка входа со вторым аккаунтом: {response.status_code}")
        print(f"Детали: {response.text}") 