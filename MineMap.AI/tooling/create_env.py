with open('.env', 'w', encoding='utf-8') as f:
    f.write('DATABASE_PATH=minemap.db\n')
    f.write('SECRET_KEY=your_secret_key_for_jwt_secure_tokens\n')
    f.write('GOOGLE_MAPS_API_KEY=AIzaSyBREFHq6WqLP3aBhtNCYrm1zuEF-EONz9w\n')

print("Файл .env создан успешно!") 