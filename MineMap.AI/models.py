from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# User models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str

# Region models
class RegionBase(BaseModel):
    name: str
    code: str
    center_lat: float
    center_lng: float
    zoom_level: int = 10

class RegionCreate(RegionBase):
    pass

class RegionResponse(RegionBase):
    id: int

# Explosive object models
class ExplosiveObjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    status: str
    priority: str
    region_id: int

class ExplosiveObjectCreate(ExplosiveObjectBase):
    pass

class ExplosiveObjectResponse(ExplosiveObjectBase):
    id: int
    region_name: str
    reported_by: int
    reported_by_username: str
    reported_at: datetime
    updated_at: datetime
