from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserProfileUpdate(BaseModel):
    """Profile update schema - users can only update their own profile fields"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None


class User(UserBase):
    id: int
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    is_profile_complete: bool = False
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
