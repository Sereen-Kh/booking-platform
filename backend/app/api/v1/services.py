from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from ...database import get_db
from ...models.service import Service, Category
from ...schemas.service import Service as ServiceSchema, ServiceCreate, Category as CategorySchema

router = APIRouter()

@router.get("/", response_model=List[ServiceSchema])
async def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Service)
    
    if category_id:
        query = query.where(Service.category_id == category_id)
    if min_price:
        query = query.where(Service.price >= min_price)
    if max_price:
        query = query.where(Service.price <= max_price)
    if search:
        query = query.where(Service.name.ilike(f"%{search}%"))
        
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{service_id}", response_model=ServiceSchema)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.get("/categories", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()
