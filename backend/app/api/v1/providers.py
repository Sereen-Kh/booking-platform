from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import logging
from ...database import get_db
from ...models.provider import ProviderProfile as ProviderProfileModel
from ...models.user import User, UserRole
from ...schemas.provider import (
    ProviderProfile,
    ProviderProfileCreate,
    ProviderProfileUpdate,
)
from ..deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/profile", response_model=ProviderProfile, status_code=status.HTTP_201_CREATED)
async def create_provider_profile(
    profile_data: ProviderProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create provider profile during onboarding.
    This is mandatory for providers to list services.
    """
    # Verify user is a provider
    if current_user.role != UserRole.PROVIDER:
        logger.warning(
            f"Non-provider user {current_user.email} attempted to create provider profile")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can create a provider profile",
        )

    # Check if profile already exists
    result = await db.execute(
        select(ProviderProfileModel).where(
            ProviderProfileModel.user_id == current_user.id)
    )
    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        logger.warning(
            f"Provider {current_user.email} attempted to create duplicate profile")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider profile already exists. Use PUT to update.",
        )

    # Create new provider profile
    provider_profile = ProviderProfileModel(
        user_id=current_user.id,
        business_name=profile_data.business_name,
        bio=profile_data.bio,
        location=profile_data.location,
    )

    db.add(provider_profile)

    # Update user's basic profile fields and mark profile as complete
    current_user.full_name = profile_data.business_name
    current_user.bio = profile_data.bio
    current_user.address = profile_data.location
    current_user.is_profile_complete = True
    current_user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(provider_profile)

    logger.info(
        f"Provider profile created successfully for user {current_user.email}")
    return provider_profile


@router.put("/profile", response_model=ProviderProfile)
async def update_provider_profile(
    profile_data: ProviderProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update provider profile"""
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can update provider profile",
        )

    result = await db.execute(
        select(ProviderProfileModel).where(
            ProviderProfileModel.user_id == current_user.id)
    )
    provider_profile = result.scalar_one_or_none()

    if not provider_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found. Please create one first.",
        )

    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider_profile, field, value)

    provider_profile.updated_at = datetime.utcnow()

    # Sync with user profile
    if "business_name" in update_data:
        current_user.full_name = update_data["business_name"]
    if "bio" in update_data:
        current_user.bio = update_data["bio"]
    if "location" in update_data:
        current_user.address = update_data["location"]

    await db.commit()
    await db.refresh(provider_profile)

    logger.info(f"Provider profile updated for user {current_user.email}")
    return provider_profile


@router.get("/profile/me", response_model=ProviderProfile)
async def get_my_provider_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's provider profile"""
    if current_user.role != UserRole.PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access provider profiles",
        )

    result = await db.execute(
        select(ProviderProfileModel).where(
            ProviderProfileModel.user_id == current_user.id)
    )
    provider_profile = result.scalar_one_or_none()

    if not provider_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Please complete your provider profile before listing services",
        )

    return provider_profile


@router.get("/", response_model=List[dict])  # Simplified response model
async def list_providers(
    location: Optional[str] = None,
    service_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(ProviderProfile).join(
        User).where(User.role == UserRole.PROVIDER)
    if location:
        query = query.where(ProviderProfile.location.ilike(f"%{location}%"))

    # Real logic would join with services to filter by service_id

    result = await db.execute(query)
    return [
        {
            "id": p.id,
            "business_name": p.business_name,
            "bio": p.bio,
            "location": p.location,
            "user_id": p.user_id
        } for p in result.scalars().all()
    ]


@router.get("/{provider_id}")
async def get_provider(provider_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProviderProfile).where(ProviderProfile.id == provider_id))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.get("/by-user/{user_id}")
async def get_provider_by_user_id(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProviderProfile).where(ProviderProfile.user_id == user_id).join(User))
    profile = result.scalar_one_or_none()

    # If no profile exists, return a basic one from User info
    if not profile:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "user_id": user.id,
            "business_name": user.full_name,
            "bio": "Expert Service Provider",
            "location": "Global"
        }
    return profile
