from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ...database import get_db
from ...models.provider import ProviderProfile
from ...models.user import User, UserRole

router = APIRouter()

@router.get("/", response_model=List[dict]) # Simplified response model
async def list_providers(
    location: Optional[str] = None,
    service_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(ProviderProfile).join(User).where(User.role == UserRole.PROVIDER)
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
