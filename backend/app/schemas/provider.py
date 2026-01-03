from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProviderProfileBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=100)
    bio: str = Field(..., min_length=10, max_length=500)
    location: str = Field(..., min_length=3, max_length=200)


class ProviderProfileCreate(ProviderProfileBase):
    """Schema for creating a provider profile during onboarding"""
    pass


class ProviderProfileUpdate(BaseModel):
    """Schema for updating provider profile"""
    business_name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, min_length=10, max_length=500)
    location: Optional[str] = Field(None, min_length=3, max_length=200)
    availability: Optional[dict] = None


class ProviderProfile(ProviderProfileBase):
    """Schema for provider profile response"""
    id: int
    user_id: int
    availability: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
