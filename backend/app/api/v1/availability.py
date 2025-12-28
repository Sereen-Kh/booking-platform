from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date
from typing import List
from ...database import get_db
from ...models.booking import Booking, BookingStatus
from ...models.provider import ProviderProfile

router = APIRouter()

@router.get("/{provider_id}")
async def get_availability(
    provider_id: int,
    start_date: date = Query(..., description="Date to check availability for (ISO-8601)"),
    db: AsyncSession = Depends(get_db)
):
    # This is a simplified version. In a real app, you'd calculate slots based on provider working hours.
    result = await db.execute(
        select(Booking).where(
            Booking.service_id.in_(
                select(ProviderProfile.id).where(ProviderProfile.user_id == provider_id)
            ),
            func.date(Booking.start_time) == start_date,
            Booking.status != BookingStatus.CANCELLED
        )
    )
    bookings = result.scalars().all()
    
    # Mocking available slots for demonstration (9 AM to 5 PM, 1-hour slots)
    # Real logic would use the provider's `availability` JSON column.
    return {
        "date": start_date,
        "provider_id": provider_id,
        "booked_slots": [b.start_time for b in bookings],
        "available_slots": [
            f"{start_date}T{hour:02d}:00:00Z" for hour in range(9, 17)
        ]
    }
