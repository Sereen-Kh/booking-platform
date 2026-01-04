from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import timedelta
from ...database import get_db
from ...models.booking import Booking, BookingStatus
from ...models.service import Service
from ...schemas.booking import Booking as BookingSchema, BookingCreate
from ...api.v1.auth import User  # We'll need a way to get the current user

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
        raise HTTPException(
            status_code=409, detail="Booking conflict: slot already taken")

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

    # Eagerly load the service relationship to avoid lazy loading issues
    result = await db.execute(
        select(Booking)
        .where(Booking.id == db_booking.id)
        .options(selectinload(Booking.service))
    )
    booking_with_service = result.scalar_one()
    return booking_with_service


@router.get("/me", response_model=List[BookingSchema])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Booking)
        .where(Booking.customer_id == current_user.id)
        .options(selectinload(Booking.service))
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


@router.get("/managed", response_model=List[BookingSchema])
async def get_provider_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get bookings for services owned by the current provider.
    """
    if current_user.role != "provider":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Join Booking -> Service to filter by Service.provider_id
    query = (
        select(Booking)
        .join(Booking.service)
        .where(Service.provider_id == current_user.id)
        .options(selectinload(Booking.service))
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/all", response_model=List[BookingSchema])
async def get_all_bookings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    query = (
        select(Booking)
        .options(selectinload(Booking.service))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{booking_id}/status", response_model=BookingSchema)
async def update_booking_status(
    booking_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update booking status. Providers can confirm/complete bookings for their services.
    Customers can cancel their own pending bookings.
    Admins can update any booking status.
    """
    # Fetch booking with service info
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.service))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorization check
    is_customer = booking.customer_id == current_user.id
    is_provider = booking.service and booking.service.provider_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_customer or is_provider or is_admin):
        raise HTTPException(
            status_code=403, detail="Not authorized to update this booking")

    # Validate status transitions
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    status_lower = status.lower()

    if status_lower not in valid_statuses:
        raise HTTPException(
            status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    # Customers can only cancel their pending bookings
    if is_customer and not is_admin:
        if status_lower != "cancelled":
            raise HTTPException(
                status_code=403, detail="Customers can only cancel bookings")
        if booking.status != BookingStatus.PENDING:
            raise HTTPException(
                status_code=400, detail="Can only cancel pending bookings")

    # Update status
    booking.status = BookingStatus(status_lower)
    await db.commit()
    await db.refresh(booking)

    return booking


@router.get("/{booking_id}", response_model=BookingSchema)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific booking by ID.
    """
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.service))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorization check
    is_customer = booking.customer_id == current_user.id
    is_provider = booking.service and booking.service.provider_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_customer or is_provider or is_admin):
        raise HTTPException(
            status_code=403, detail="Not authorized to view this booking")

    return booking
