from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from ...database import get_db
from ...models.service import Service, Category
from ...schemas.service import (
    Service as ServiceSchema,
    ServiceCreate,
    Category as CategorySchema,
)
from ...models.user import User
from .auth import get_current_user

router = APIRouter()


@router.get("/categories", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()


@router.get("/recommended", response_model=List[ServiceSchema])
async def get_recommended_services(
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Get recommended/popular services for the home page"""
    # For now, return random services. Later implement based on
    # popularity, ratings, etc.
    query = select(Service).options(selectinload(
        Service.provider)).order_by(func.random()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/", response_model=List[ServiceSchema])
async def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Service).options(selectinload(Service.provider))

    if category_id:
        query = query.where(Service.category_id == category_id)
    if provider_id:
        query = query.where(Service.provider_id == provider_id)
    if min_price:
        query = query.where(Service.price >= min_price)
    if max_price:
        query = query.where(Service.price <= max_price)
    if search:
        query = query.where(Service.name.ilike(f"%{search}%"))

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/provider/my-services", response_model=List[ServiceSchema])
async def get_provider_services(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get services for the current provider"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=403,
            detail="Only providers can access their services"
        )

    query = select(Service).where(Service.provider_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{service_id}", response_model=ServiceSchema)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Service)
        .where(Service.id == service_id)
        .options(selectinload(Service.provider))
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.get("/by-provider/{provider_id}", response_model=List[ServiceSchema])
async def get_services_by_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all services from a specific provider (publicly)"""
    query = select(Service).where(Service.provider_id ==
                                  provider_id).options(selectinload(Service.provider))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/provider/my-services", response_model=ServiceSchema)
async def create_provider_service(
    service_data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service for the current provider"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=403,
            detail="Only providers can create services"
        )

    db_service = Service(
        **service_data.model_dump(),
        provider_id=current_user.id
    )
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service


@router.put("/provider/my-services/{service_id}", response_model=ServiceSchema)
async def update_provider_service(
    service_id: int,
    service_data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing service for the current provider"""
    result = await db.execute(
        select(Service).where(Service.id == service_id,
                              Service.provider_id == current_user.id)
    )
    db_service = result.scalar_one_or_none()

    if not db_service:
        raise HTTPException(
            status_code=404, detail="Service not found or access denied")

    for key, value in service_data.model_dump().items():
        setattr(db_service, key, value)

    await db.commit()
    await db.refresh(db_service)
    return db_service


@router.delete("/provider/my-services/{service_id}")
async def delete_provider_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a service for the current provider"""
    result = await db.execute(
        select(Service).where(Service.id == service_id,
                              Service.provider_id == current_user.id)
    )
    db_service = result.scalar_one_or_none()

    if not db_service:
        raise HTTPException(
            status_code=404, detail="Service not found or access denied")

    await db.delete(db_service)
    await db.commit()
    return {"message": "Service deleted successfully"}
