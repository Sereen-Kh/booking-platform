from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import timedelta
from ...database import get_db
from ...models.booking import Booking, BookingStatus
from ...models.service import Service
from ...schemas.booking import Booking as BookingSchema, BookingCreate
from ...api.v1.auth import User # We'll need a way to get the current user

from ...api.deps import get_current_user
from ...models.user import User

router = APIRouter()

@router.post("/", response_model=BookingSchema, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Check if service exists
    result = await db.execute(select(Service).where(Service.id == booking_in.service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # 2. Calculate end time
    start_time = booking_in.start_time
    end_time = start_time + timedelta(minutes=service.duration_minutes)
    
    # 3. Check for conflicts
    conflict_query = select(Booking).where(
        Booking.service_id == booking_in.service_id,
        Booking.status == BookingStatus.CONFIRMED,
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    conflict_result = await db.execute(conflict_query)
    if conflict_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Booking conflict: slot already taken")
    
    # 4. Create booking
    db_booking = Booking(
        customer_id=current_user.id,
        service_id=booking_in.service_id,
        start_time=start_time,
        end_time=end_time,
        notes=booking_in.notes
    )
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

@router.get("/me", response_model=List[BookingSchema])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Booking).where(Booking.customer_id == current_user.id))
    return result.scalars().all()
