from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from ...database import get_db
from ...models.favorite import Favorite
from ...models.service import Service
from ...models.user import User
from ...schemas.service import Service as ServiceSchema
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ServiceSchema])
async def list_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all favorites for the current user"""
    query = (
        select(Service)
        .join(Favorite, Favorite.service_id == Service.id)
        .where(Favorite.user_id == current_user.id)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{service_id}", status_code=201)
async def add_favorite(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a service to favorites"""
    # Check if service exists
    service_result = await db.execute(
        select(Service).where(Service.id == service_id)
    )
    if not service_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Service not found")

    # Check if already favorited
    existing = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.service_id == service_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in favorites")

    # Add to favorites
    favorite = Favorite(user_id=current_user.id, service_id=service_id)
    db.add(favorite)
    await db.commit()
    return {"message": "Added to favorites", "service_id": service_id}


@router.delete("/{service_id}")
async def remove_favorite(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a service from favorites"""
    result = await db.execute(
        delete(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.service_id == service_id
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")

    await db.commit()
    return {"message": "Removed from favorites", "service_id": service_id}


@router.get("/check/{service_id}")
async def check_favorite(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a service is in favorites"""
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.service_id == service_id
        )
    )
    is_favorite = result.scalar_one_or_none() is not None
    return {"is_favorite": is_favorite, "service_id": service_id}
