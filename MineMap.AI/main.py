import os
from fastapi import FastAPI, Request, Depends, HTTPException, Form, status
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

# Load environment variables
load_dotenv()

# визначаємо корінь проєкту — тут лежить main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Initialize FastAPI
app = FastAPI(title="Система інформування про вибухонебезпечні предмети")



# Configure templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "your-secret-key"))

# Configure password security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    except jwt.PyJWTError:
        raise credentials_exception
    
    async with get_connection() as conn:
        cursor = await conn.execute(
            "SELECT id, username, email, full_name, role FROM users WHERE username = ?",
            (username,)
        )
        user = await cursor.fetchone()
    
    if user is None:
        raise credentials_exception
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"]
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
    
    response = RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

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

@app.get("/sapper_map", response_class=HTMLResponse)
async def sapper_map(request: Request, current_user: UserResponse = Depends(get_current_user)):
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
async def get_explosive_objects():
    async with get_connection() as conn:
        cursor = await conn.execute("""
            SELECT eo.*, r.name as region_name, u.username as reported_by_username
            FROM explosive_objects eo
            JOIN regions r ON eo.region_id = r.id
            JOIN users u ON eo.reported_by = u.id
            ORDER BY eo.reported_at DESC
        """)
        objects = await cursor.fetchall()
    
    return [
        ExplosiveObjectResponse(
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
            reported_at=obj["reported_at"],
            updated_at=obj["updated_at"]
        ) for obj in objects
    ]

@app.post("/api/explosive-objects", response_model=ExplosiveObjectResponse)
async def create_explosive_object(
    object_data: ExplosiveObjectCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with get_connection() as conn:
        # Check if region exists
        cursor = await conn.execute("SELECT id FROM regions WHERE id = ?", (object_data.region_id,))
        region = await cursor.fetchone()
        if not region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Region not found"
            )
        
        # Create new object
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
        
        return ExplosiveObjectResponse(
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
            reported_at=created_object["reported_at"],
            updated_at=created_object["updated_at"]
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

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
