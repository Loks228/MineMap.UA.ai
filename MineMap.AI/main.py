import os
from fastapi import FastAPI, Request, Depends, HTTPException, Form, status, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from db import get_connection
from models import UserCreate, UserLogin, UserResponse, RegionResponse, ExplosiveObjectResponse, ExplosiveObjectCreate
from cookie_auth import OAuth2PasswordBearerWithCookie
import json
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# визначаємо корінь проєкту — тут лежить main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Custom JSONEncoder for datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return super().default(obj)

# Initialize FastAPI
app = FastAPI(title="Система інформування про вибухонебезпечні предмети")

# Override default JSON encoder
app.json_encoder = CustomJSONEncoder

# Configure templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "your-secret-key"))

# Configure password security
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception as e:
    # Обходное решение проблемы с bcrypt 4.x и passlib
    import bcrypt
    
    class BcryptWrapper:
        def verify(self, plain_password, hashed_password):
            try:
                # Если хеш в формате $2b$...
                return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            except ValueError:
                # Если возникает ошибка с форматом, возвращаем False
                return False
                
        def hash(self, password):
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    pwd_context = BcryptWrapper()

# Заменяем стандартную схему OAuth2 на нашу с поддержкой куки
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password and JWT functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError as e:
        print(f"JWT error: {str(e)}")
        raise credentials_exception
    
    async with get_connection() as conn:
        cursor = await conn.execute(
            "SELECT id, username, email, full_name, role, avatar_url, phone, created_at FROM users WHERE username = ?",
            (username,)
        )
        user = await cursor.fetchone()
    
    if user is None:
        raise credentials_exception
    
    # Безопасное извлечение опциональных полей
    avatar_url = None
    if "avatar_url" in user and user["avatar_url"]:
        avatar_url = user["avatar_url"]
        
    phone = None
    if "phone" in user and user["phone"]:
        phone = user["phone"]
    
    # Обработка даты создания аккаунта
    created_at = None
    if "created_at" in user and user["created_at"]:
        try:
            # Попытка преобразовать строку в datetime
            from datetime import datetime
            created_at = datetime.strptime(user["created_at"], "%Y-%m-%d %H:%M:%S")
            print(f"Дата создания аккаунта: {created_at}")
        except Exception as e:
            print(f"Ошибка преобразования даты: {str(e)}")
            # Просто оставляем значение как строку, если не удалось преобразовать
            created_at = user["created_at"]
    
    # Добавляем логирование для отладки
    print(f"Пользователь {username} загружен, avatar_url: {avatar_url}, created_at: {created_at}")
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        avatar_url=avatar_url,
        phone=phone,
        created_at=created_at
    )

# Main page
@app.get("/debug/static-images")
def debug_static_images():
    path = os.path.join(BASE_DIR, "static", "images")
    if not os.path.isdir(path):
        raise HTTPException(500, detail=f"Directory not found: {path}")
    return {"files": os.listdir(path)}
    

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Map page
@app.get("/map", response_class=HTMLResponse)
async def map_page(request: Request):
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key}
    )

# Mined territories map page
@app.get("/mined-territories", response_class=HTMLResponse)
async def mined_territories_page(request: Request):
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    # Передаємо current_user, якщо користувач авторизований
    current_user = None
    try:
        token = request.cookies.get("access_token")
        if token:
            current_user = await get_current_user(token)
    except Exception as e:
        # Якщо виникла помилка авторизації, просто продовжуємо без current_user
        pass
        
    return templates.TemplateResponse(
        "mined_territories.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "current_user": current_user}
    )

# Token endpoint for authentication
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    async with get_connection() as conn:
        cursor = await conn.execute(
            "SELECT id, username, password, email, full_name, role FROM users WHERE username = ?",
            (form_data.username,)
        )
        user = await cursor.fetchone()
    
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Login form handler
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        async with get_connection() as conn:
            cursor = await conn.execute(
                "SELECT id, username, password, role FROM users WHERE username = ?",
                (form_data.username,)
            )
            user = await cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}, expires_delta=access_token_expires
        )
        
        # Redirect based on user role
        redirect_url = "/map"
        if user["role"] == "citizen":
            redirect_url = "/map/citizen"
        elif user["role"] == "sapper":
            redirect_url = "/map/sapper"
        elif user["role"] in ["moderator", "admin"]:
            redirect_url = "/admin/panel"
        
        # Create response with cookie
        response = RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)
        # Set cookie with name access_token
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=1800,  # 30 minutes
            expires=1800,
            path="/"
        )
        
        return response
        
    except Exception as e:
        # Log the error for debugging
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

# Register user with role selection
@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    async with get_connection() as conn:
        # Check if user exists
        cursor = await conn.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (user.username, user.email)
        )
        existing_user = await cursor.fetchone()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        await conn.execute(
            """
            INSERT INTO users (username, email, password, full_name, role)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user.username, user.email, hashed_password, user.full_name, user.role)
        )
        await conn.commit()
        
        # Get created user
        cursor = await conn.execute(
            "SELECT id, username, email, full_name, role FROM users WHERE username = ?",
            (user.username,)
        )
        created_user = await cursor.fetchone()
        
        # Create token for immediate login
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": created_user["username"]}, expires_delta=access_token_expires
        )
        
        # Prepare response with token and redirect based on role
        response_data = {
            "id": created_user["id"],
            "username": created_user["username"],
            "email": created_user["email"],
            "full_name": created_user["full_name"],
            "role": created_user["role"],
            "access_token": access_token,
            "token_type": "bearer"
        }
        
        return response_data

# Role-specific map pages
@app.get("/citizen_map", response_class=HTMLResponse)
async def citizen_map(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "citizen_map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

@app.get("/map/citizen", response_class=HTMLResponse)
async def citizen_map_alternate(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "citizen_map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

@app.get("/sapper_map", response_class=HTMLResponse)
async def sapper_map(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "sapper":
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "sapper_map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

@app.get("/map/sapper", response_class=HTMLResponse)
async def sapper_map_alternate(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "sapper":
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "sapper_map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

@app.get("/admin/panel", response_class=HTMLResponse)
async def admin_panel(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "admin_panel.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

# Registration page with role selection
@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# Login page
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# Logout endpoint
@app.get("/logout", response_class=HTMLResponse)
async def logout(request: Request):
    response = RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie(key="access_token")
    return response

# Profile page
@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request, current_user: UserResponse = Depends(get_current_user)):
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Добавляем проверку на наличие аватара
    if not current_user.avatar_url:
        current_user.avatar_url = "/static/images/default-avatar.png"
        
        # Проверяем наличие файла дефолтного аватара
        avatar_path = os.path.join(BASE_DIR, "static", "images", "default-avatar.png")
        if not os.path.exists(avatar_path):
            # Создаем директорию, если её нет
            os.makedirs(os.path.dirname(avatar_path), exist_ok=True)
            
            # Создаем простой файл с цветом для дефолтного аватара
            with open(avatar_path, "wb") as f:
                # Создаем маленький PNG файл с серым цветом (64x64 пиксела)
                f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00@\x00\x00\x00@\x08\x02\x00\x00\x00%\x0b\xe6\x89\x00\x00\x00\x06PLTE\x8c\x8c\x8c\xff\xff\xff\xcd\x03\r\xa7\x00\x00\x00\x0eIDAT8\x8dc\x18\x05\xa3`\x14\x8c\x8a\x01\x00\x00\x00\xff\xff\x03\x00\x04\xc4\x01\x1f\xdf\xf5\xd4\xac\x00\x00\x00\x00IEND\xaeB`\x82')
    
    return templates.TemplateResponse(
        "profile.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

# API endpoints
@app.get("/api/regions", response_model=List[RegionResponse])
async def get_regions():
    async with get_connection() as conn:
        cursor = await conn.execute("SELECT * FROM regions ORDER BY name")
        regions = await cursor.fetchall()
    
    return [
        RegionResponse(
            id=region["id"],
            name=region["name"],
            code=region["code"],
            center_lat=region["center_lat"],
            center_lng=region["center_lng"],
            zoom_level=region["zoom_level"]
        ) for region in regions
    ]

@app.get("/api/explosive-objects", response_model=List[ExplosiveObjectResponse])
async def get_explosive_objects(current_user: Optional[UserResponse] = Depends(get_current_user)):
    async with get_connection() as conn:
        # Base SQL query
        base_query = """
            SELECT eo.*, r.name as region_name, u.username as reported_by_username
            FROM explosive_objects eo
            JOIN regions r ON eo.region_id = r.id
            JOIN users u ON eo.reported_by = u.id
        """
        
        # Apply role-based filtering
        where_clause = ""
        if current_user:
            if current_user.role == "citizen":
                # Citizens can only see active, unconfirmed, and cleared markers (not archived or secret)
                where_clause = " WHERE eo.status NOT IN ('archived', 'secret')"
            elif current_user.role == "sapper":
                # Sappers can see everything except archived
                where_clause = " WHERE eo.status != 'archived'"
            # Admins and moderators see everything (no filter)
        
        # Complete query
        query = base_query + where_clause + " ORDER BY eo.reported_at DESC"
        
        cursor = await conn.execute(query)
        objects = await cursor.fetchall()
    
    # Convert DB objects to API response
    result = []
    for obj in objects:
        # Get all standard fields
        response_obj = ExplosiveObjectResponse(
            id=obj["id"],
            title=obj["title"],
            description=obj["description"],
            latitude=obj["latitude"],
            longitude=obj["longitude"],
            status=obj["status"],
            priority=obj["priority"],
            region_id=obj["region_id"],
            region_name=obj["region_name"],
            reported_by=obj["reported_by"],
            reported_by_username=obj["reported_by_username"],
            photo_url=obj["photo_url"] if "photo_url" in obj else None,
            reported_at=obj["reported_at"],
            updated_at=obj["updated_at"]
        )
        
        # Add optional fields if they exist in the database
        if "area_size" in obj and obj["area_size"]:
            response_obj.area_size = obj["area_size"]
        
        if "danger_level" in obj and obj["danger_level"]:
            response_obj.danger_level = obj["danger_level"]
            
        if "is_cluster" in obj and obj["is_cluster"]:
            response_obj.is_cluster = obj["is_cluster"]
            
        result.append(response_obj)
    
    return result

@app.post("/api/explosive-objects", response_model=ExplosiveObjectResponse)
async def create_explosive_object(
    object_data: ExplosiveObjectCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        print(f"Received request to create explosive object: {object_data.dict()}")
        print(f"From user: {current_user.username} (ID: {current_user.id}, Role: {current_user.role})")
        
        async with get_connection() as conn:
            # Check if region exists
            cursor = await conn.execute("SELECT id FROM regions WHERE id = ?", (object_data.region_id,))
            region = await cursor.fetchone()
            if not region:
                print(f"Region not found: {object_data.region_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Region with ID {object_data.region_id} not found"
                )
            
            # Create new object
            print(f"Creating new explosive object in database")
            try:
                await conn.execute(
                    """
                    INSERT INTO explosive_objects 
                    (title, description, latitude, longitude, status, priority, region_id, reported_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (object_data.title, object_data.description, object_data.latitude, 
                    object_data.longitude, object_data.status, object_data.priority, 
                    object_data.region_id, current_user.id)
                )
                await conn.commit()
                
                # Get created object ID (last inserted row id)
                cursor = await conn.execute("SELECT last_insert_rowid()")
                object_id = await cursor.fetchone()
                object_id = object_id[0]
                print(f"Created object with ID: {object_id}")
                
                # Get created object
                cursor = await conn.execute(
                    """
                    SELECT eo.*, r.name as region_name, u.username as reported_by_username
                    FROM explosive_objects eo
                    JOIN regions r ON eo.region_id = r.id
                    JOIN users u ON eo.reported_by = u.id
                    WHERE eo.id = ?
                    """,
                    (object_id,)
                )
                created_object = await cursor.fetchone()
                
                if not created_object:
                    print(f"Error: Created object with ID {object_id} not found after creation")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Object was created but could not be retrieved"
                    )
                
                print(f"Successfully retrieved created object: {dict(created_object)}")
                
                # Create response object with all fields
                response_obj = ExplosiveObjectResponse(
                    id=created_object["id"],
                    title=created_object["title"],
                    description=created_object["description"],
                    latitude=created_object["latitude"],
                    longitude=created_object["longitude"],
                    status=created_object["status"],
                    priority=created_object["priority"],
                    region_id=created_object["region_id"],
                    region_name=created_object["region_name"],
                    reported_by=created_object["reported_by"],
                    reported_by_username=created_object["reported_by_username"],
                    photo_url=created_object["photo_url"] if "photo_url" in created_object else None,
                    reported_at=created_object["reported_at"],
                    updated_at=created_object["updated_at"]
                )
                
                # Add optional fields if they were created
                # No optional fields to add now
                
                print(f"Returning successful response: {response_obj.dict()}")
                return response_obj
                
            except Exception as db_error:
                print(f"Database error: {str(db_error)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error: {str(db_error)}"
                )
                
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in create_explosive_object: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

# Admin map page
@app.get("/map/admin", response_class=HTMLResponse)
async def admin_map(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    return templates.TemplateResponse(
        "admin_map.html", 
        {"request": request, "google_maps_api_key": google_maps_api_key, "user": current_user}
    )

# API endpoint для получения списка пользователей (только для админов и модераторов)
@app.get("/api/users", response_model=List[UserResponse])
async def get_users(current_user: UserResponse = Depends(get_current_user)):
    # Проверка прав доступа
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    async with get_connection() as conn:
        cursor = await conn.execute(
            "SELECT id, username, email, full_name, role FROM users"
        )
        users = await cursor.fetchall()
    
    return [
        UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"]
        ) for user in users
    ]

# API endpoint для получения информации о текущем пользователе
@app.get("/api/current-user", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    # Добавляем подробное логирование
    print(f"Запрос информации о пользователе: id={current_user.id}, username={current_user.username}")
    print(f"Текущий avatar_url: {current_user.avatar_url}")
    
    # Проверяем аватар пользователя на существование
    if current_user.avatar_url:
        # Проверяем существование файла на диске
        import os
        avatar_path = current_user.avatar_url.replace("/static/", "")
        full_avatar_path = os.path.join(BASE_DIR, "static", avatar_path.lstrip("/"))
        
        print(f"Проверка пути аватара: {full_avatar_path}")
        
        if not os.path.exists(full_avatar_path):
            print(f"Аватар не найден на диске: {full_avatar_path}")
            # Устанавливаем дефолтный аватар
            current_user.avatar_url = "/static/images/default-avatar.png"
            
            # Обновляем в базе данных
            async with get_connection() as conn:
                await conn.execute(
                    "UPDATE users SET avatar_url = ? WHERE id = ?",
                    (current_user.avatar_url, current_user.id)
                )
                await conn.commit()
                print(f"Обновлен аватар в БД: {current_user.avatar_url}")
    else:
        print("У пользователя нет аватара (avatar_url is None или пустая строка)")
    
    # Получаем свежие данные из базы для уверенности
    async with get_connection() as conn:
        cursor = await conn.execute(
            "SELECT id, username, email, full_name, role, avatar_url, phone, created_at FROM users WHERE id = ?",
            (current_user.id,)
        )
        user_data = await cursor.fetchone()
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Проверяем и конвертируем дату создания аккаунта
        created_at_str = user_data["created_at"] if "created_at" in user_data else None
        created_at = None
        if created_at_str:
            try:
                # Попытка преобразовать строку в datetime
                from datetime import datetime
                created_at = datetime.strptime(created_at_str, "%Y-%m-%d %H:%M:%S")
                print(f"Дата создания аккаунта найдена: {created_at}")
            except Exception as e:
                print(f"Ошибка преобразования даты: {str(e)}")
                # Просто используем строку как есть
                created_at = created_at_str
        
        # Создаем объект ответа
        response = UserResponse(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            avatar_url=user_data["avatar_url"],
            phone=user_data["phone"],
            created_at=created_at
        )
        
        print(f"Возвращаемый ответ: {response.dict()}")
        return response

# Обновление личных данных пользователя
@app.patch("/api/user/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        print(f"Получены данные для обновления профиля: {profile_data}")
        
        async with get_connection() as conn:
            # Подготовка данных для обновления
            update_fields = []
            update_values = []
            
            # Проверяем и добавляем поля, которые можно обновить
            if "full_name" in profile_data:
                update_fields.append("full_name = ?")
                update_values.append(profile_data["full_name"] or "")
            
            if "email" in profile_data:
                update_fields.append("email = ?")
                update_values.append(profile_data["email"] or "")
            
            if "phone" in profile_data:
                # Для phone разрешаем NULL
                if profile_data["phone"] is None or profile_data["phone"] == "":
                    update_fields.append("phone = NULL")
                else:
                    update_fields.append("phone = ?")
                    update_values.append(profile_data["phone"])
            
            if "avatar_url" in profile_data:
                # Для avatar_url разрешаем NULL, но только если явно передан NULL
                # Если поле просто отсутствует или пустое, не меняем его
                if profile_data["avatar_url"] is None:
                    update_fields.append("avatar_url = NULL")
                elif profile_data["avatar_url"] != "":
                    update_fields.append("avatar_url = ?")
                    update_values.append(profile_data["avatar_url"])
            
            # Если нет полей для обновления, возвращаем ошибку
            if not update_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            # Формируем и выполняем запрос на обновление
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            update_values.append(current_user.id)
            
            print(f"SQL запрос: {query}")
            print(f"Значения: {update_values}")
            
            await conn.execute(query, update_values)
            await conn.commit()
            
            # Получаем обновленные данные пользователя
            cursor = await conn.execute(
                "SELECT id, username, email, full_name, role, avatar_url, phone FROM users WHERE id = ?",
                (current_user.id,)
            )
            updated_user = await cursor.fetchone()
            
            # Подробное логирование
            print(f"Обновленные данные пользователя: {dict(updated_user)}")
            
            # Создаем объект ответа
            return UserResponse(
                id=updated_user["id"],
                username=updated_user["username"],
                email=updated_user["email"],
                full_name=updated_user["full_name"],
                role=updated_user["role"],
                avatar_url=updated_user["avatar_url"],  # Передаем напрямую, даже если NULL
                phone=updated_user["phone"]  # Передаем напрямую, даже если NULL
            )
    except Exception as e:
        print(f"Ошибка обновления профиля: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

# Смена пароля
@app.post("/api/user/change-password")
async def change_password(
    password_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    if not all(key in password_data for key in ["current_password", "new_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password and new password are required"
        )
    
    async with get_connection() as conn:
        # Получаем текущий хеш пароля пользователя
        cursor = await conn.execute(
            "SELECT password FROM users WHERE id = ?",
            (current_user.id,)
        )
        user_data = await cursor.fetchone()
        
        # Проверяем текущий пароль
        if not verify_password(password_data["current_password"], user_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Хешируем новый пароль
        hashed_password = get_password_hash(password_data["new_password"])
        
        # Обновляем пароль
        await conn.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (hashed_password, current_user.id)
        )
        await conn.commit()
        
        return {"message": "Password changed successfully"}

# Загрузка аватара
@app.post("/api/user/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        # Логирование для отладки
        print(f"Получен запрос на загрузку аватара от пользователя {current_user.username} (id: {current_user.id})")
        print(f"Файл: {file.filename}, тип: {file.content_type}, размер: {file.size}")
        
        # Проверяем тип файла
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Создаем директорию для хранения аватаров, если её нет
        import os
        avatars_dir = os.path.join(BASE_DIR, "static", "avatars")
        os.makedirs(avatars_dir, exist_ok=True)
        
        # Определяем расширение файла
        file_ext = os.path.splitext(file.filename)[1].lower()
        if not file_ext:
            # Если расширение не определено, пытаемся определить по типу MIME
            mime_to_ext = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif'
            }
            file_ext = mime_to_ext.get(file.content_type, '.jpg')  # По умолчанию .jpg
            
        if file_ext not in ['.jpg', '.jpeg', '.png', '.gif']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Use JPG, PNG or GIF"
            )
        
        # Используем постоянное имя файла для каждого пользователя
        # user_id_avatar.jpg вместо временной метки, чтобы не накапливать старые аватары
        filename = f"user_{current_user.id}_avatar{file_ext}"
        filepath = os.path.join(avatars_dir, filename)
        
        # Получаем текущий аватар пользователя для удаления старого файла
        async with get_connection() as conn:
            cursor = await conn.execute(
                "SELECT avatar_url FROM users WHERE id = ?",
                (current_user.id,)
            )
            user_data = await cursor.fetchone()
            
            # Если у пользователя уже есть аватар, проверяем есть ли файл на диске
            if user_data and user_data["avatar_url"]:
                old_avatar_path = user_data["avatar_url"].replace("/static/", "")
                old_avatar_full_path = os.path.join(BASE_DIR, "static", old_avatar_path.lstrip("/"))
                
                # Удаляем старый файл, если он существует и имя отличается от нового
                if os.path.exists(old_avatar_full_path) and os.path.basename(old_avatar_full_path) != filename:
                    try:
                        os.remove(old_avatar_full_path)
                        print(f"Старый аватар удален: {old_avatar_full_path}")
                    except Exception as e:
                        print(f"Ошибка при удалении старого аватара: {str(e)}")
        
        # Сохраняем файл
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
        
        print(f"Аватар сохранен: {filepath}")
        
        # Формируем URL изображения
        avatar_url = f"/static/avatars/{filename}"
        
        # Обновляем данные пользователя
        async with get_connection() as conn:
            await conn.execute(
                "UPDATE users SET avatar_url = ? WHERE id = ?",
                (avatar_url, current_user.id)
            )
            await conn.commit()
            print(f"Данные пользователя обновлены в БД, avatar_url: {avatar_url}")
        
        # Принудительно обновляем данные в кэше (если он есть)
        current_user.avatar_url = avatar_url
        
        return {"avatar_url": avatar_url, "success": True}
        
    except Exception as e:
        print(f"Ошибка загрузки аватара: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading avatar: {str(e)}"
            )

# API endpoint для обновления взрывоопасного объекта
@app.patch("/api/explosive-objects/{object_id}", response_model=ExplosiveObjectResponse)
async def update_explosive_object(
    object_id: int,
    object_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    async with get_connection() as conn:
        # Проверяем существование объекта и права доступа
        cursor = await conn.execute(
            "SELECT * FROM explosive_objects WHERE id = ?",
            (object_id,)
        )
        obj = await cursor.fetchone()
        
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Object not found"
            )
        
        # Проверяем, принадлежит ли объект текущему пользователю или является ли пользователь админом/модератором
        if obj["reported_by"] != current_user.id and current_user.role not in ["admin", "moderator"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own objects"
            )
        
        # Подготовка данных для обновления
        update_fields = []
        update_values = []
        
        # Проверяем и добавляем поля, которые можно обновить
        if "title" in object_data:
            update_fields.append("title = ?")
            update_values.append(object_data["title"])
        
        if "description" in object_data:
            update_fields.append("description = ?")
            update_values.append(object_data["description"])
        
        # Если пользователь - админ или модератор, разрешаем обновлять статус и приоритет
        if current_user.role in ["admin", "moderator"]:
            if "status" in object_data:
                update_fields.append("status = ?")
                update_values.append(object_data["status"])
            
            if "priority" in object_data:
                update_fields.append("priority = ?")
                update_values.append(object_data["priority"])
            
            # Добавляем возможность обновления региона
            if "region_id" in object_data:
                # Проверяем существование региона перед обновлением
                region_cursor = await conn.execute(
                    "SELECT id FROM regions WHERE id = ?", 
                    (object_data["region_id"],)
                )
                region = await region_cursor.fetchone()
                
                if region:
                    update_fields.append("region_id = ?")
                    update_values.append(object_data["region_id"])
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Region with ID {object_data['region_id']} not found"
                    )
        
        # Если нет полей для обновления, возвращаем ошибку
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Добавляем updated_at в запрос
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        # Формируем и выполняем запрос на обновление
        query = f"UPDATE explosive_objects SET {', '.join(update_fields)} WHERE id = ?"
        update_values.append(object_id)
        
        await conn.execute(query, update_values)
        await conn.commit()
        
        # Получаем обновленный объект
        cursor = await conn.execute(
            """
            SELECT eo.*, r.name as region_name, u.username as reported_by_username
            FROM explosive_objects eo
            JOIN regions r ON eo.region_id = r.id
            JOIN users u ON eo.reported_by = u.id
            WHERE eo.id = ?
            """,
            (object_id,)
        )
        updated_object = await cursor.fetchone()
        
        return ExplosiveObjectResponse(
            id=updated_object["id"],
            title=updated_object["title"],
            description=updated_object["description"],
            latitude=updated_object["latitude"],
            longitude=updated_object["longitude"],
            status=updated_object["status"],
            priority=updated_object["priority"],
            region_id=updated_object["region_id"],
            region_name=updated_object["region_name"],
            reported_by=updated_object["reported_by"],
            reported_by_username=updated_object["reported_by_username"],
            photo_url=updated_object["photo_url"] if "photo_url" in updated_object else None,
            reported_at=updated_object["reported_at"],
            updated_at=updated_object["updated_at"]
        )

@app.delete("/api/explosive-objects/{object_id}", response_model=dict)
async def delete_explosive_object(
    object_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with get_connection() as conn:
        # Проверяем существование объекта
        cursor = await conn.execute(
            "SELECT id, reported_by FROM explosive_objects WHERE id = ?",
            (object_id,)
        )
        obj = await cursor.fetchone()
        
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Object not found"
            )
        
        # Проверяем права доступа: удалять может только владелец объекта или админ/модератор
        if obj["reported_by"] != current_user.id and current_user.role not in ["admin", "moderator"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own objects"
            )
        
        # Удаляем объект из базы данных
        await conn.execute(
            "DELETE FROM explosive_objects WHERE id = ?",
            (object_id,)
        )
        await conn.commit()
        
        return {
            "success": True,
            "message": "Object deleted successfully",
            "object_id": object_id
        }

# API endpoint для получения сообщений об опасности с фотографиями
@app.post("/api/report-danger")
async def report_danger(
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        # Получаем JSON данные из запроса
        data = await request.json()
        
        # Проверяем наличие обязательных полей
        required_fields = ["title", "latitude", "longitude", "region_id", "photo_data"]
        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Извлекаем данные из запроса
        title = data["title"]
        description = data.get("description", "")
        latitude = data["latitude"]
        longitude = data["longitude"]
        status = data.get("status", "unconfirmed")  # По умолчанию - непроверено
        priority = data.get("priority", "medium")    # По умолчанию - средний
        region_id = data["region_id"]
        photo_data = data["photo_data"]
        
        # Проверяем формат данных фото (должны начинаться с "data:image/")
        if not photo_data.startswith("data:image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid photo data format"
            )
        
        # Создаем директорию для хранения фотографий, если её нет
        import os
        photos_dir = os.path.join(BASE_DIR, "static", "photos")
        os.makedirs(photos_dir, exist_ok=True)
        
        # Генерируем уникальное имя файла на основе времени и ID пользователя
        import time
        import base64
        
        photo_filename = f"{int(time.time())}_{current_user.id}.jpg"
        photo_path = os.path.join(photos_dir, photo_filename)
        
        # Сохраняем фото в файл
        try:
            # Удаляем заголовок base64 и декодируем
            photo_format, photo_data = photo_data.split(";base64,")
            photo_binary = base64.b64decode(photo_data)
            
            # Записываем в файл
            with open(photo_path, "wb") as f:
                f.write(photo_binary)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error saving photo: {str(e)}"
            )
        
        # Формируем URL изображения относительно сайта
        photo_url = f"/static/photos/{photo_filename}"
        
        # Сохраняем данные в базу
        async with get_connection() as conn:
            # Проверяем существование указанного региона
            cursor = await conn.execute("SELECT id FROM regions WHERE id = ?", (region_id,))
            region = await cursor.fetchone()
            if not region:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Region not found"
                )
            
            # Вставляем новый объект с фотографией
            await conn.execute(
                """
                INSERT INTO explosive_objects 
                (title, description, latitude, longitude, status, priority, region_id, reported_by, photo_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (title, description, latitude, longitude, status, priority, region_id, current_user.id, photo_url)
            )
            await conn.commit()
            
            # Получаем ID созданного объекта
            cursor = await conn.execute("SELECT last_insert_rowid()")
            object_id = await cursor.fetchone()
            object_id = object_id[0]
        
        # Возвращаем успешный ответ
        return {
            "success": True,
            "message": "Danger report created successfully",
            "object_id": object_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # Логируем ошибку и возвращаем общее сообщение
        print(f"Error processing danger report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing danger report"
        )

# Tasks page for sapper - display list of explosive objects
@app.get("/tasks", response_class=HTMLResponse)
async def tasks_page(request: Request, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "sapper":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    return templates.TemplateResponse(
        "tasks.html", {"request": request, "user": current_user}
    )

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
