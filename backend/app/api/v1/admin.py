from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict
from ...database import get_db
from ...models.user import User, UserRole
from ...models.service import Service
from ...models.booking import Booking
from ...schemas.user import User as UserSchema
from ...api.v1.auth import get_current_user

router = APIRouter()

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Get system-wide statistics for the admin dashboard
    """
    # Count Users by Role
    total_customers = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.CUSTOMER))
    total_providers = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.PROVIDER))
    total_admins = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.ADMIN))
    
    # Count Services
    total_services = await db.scalar(select(func.count(Service.id)))
    
    # Count Bookings
    total_bookings = await db.scalar(select(func.count(Booking.id)))
    
    return {
        "customers": total_customers,
        "providers": total_providers,
        "admins": total_admins,
        "services": total_services,
        "bookings": total_bookings
    }

@router.get("/users", response_model=List[UserSchema])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: UserRole = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    List all users with optional role filtering
    """
    query = select(User)
    if role:
        query = query.where(User.role == role)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/users/{user_id}", response_model=UserSchema)
async def get_user_details(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Get detailed information about a specific user
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
