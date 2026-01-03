from pydantic import BaseModel, Field, computed_field
from typing import Optional, List
from .user import User as UserSchema


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    service_count: Optional[int] = Field(default=0)

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    category_id: int
    image_url: Optional[str] = None
    location: Optional[str] = None


class ServiceCreate(ServiceBase):
    pass


class Service(ServiceBase):
    id: int
    provider_id: int
    provider: Optional[UserSchema] = None
    rating: Optional[float] = Field(default=0.0)
    review_count: Optional[int] = Field(default=0)

    class Config:
        from_attributes = True
