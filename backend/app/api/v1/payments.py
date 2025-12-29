import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from ...database import get_db
from ...core.config import settings
from ...models.service import Service
from ...models.booking import Booking, BookingStatus
from ...models.user import User
from .auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class CheckoutRequest(BaseModel):
    service_id: int
    start_time: str  # ISO format datetime


@router.post("/create-checkout")
async def create_checkout_session(
    request: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe checkout session for a paid service"""
    # Get the service
    result = await db.execute(
        select(Service).where(Service.id == request.service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # If free, create booking directly
    if service.price == 0:
        booking = Booking(
            customer_id=current_user.id,
            service_id=service.id,
            start_time=datetime.fromisoformat(request.start_time),
            end_time=datetime.fromisoformat(request.start_time) + timedelta(minutes=service.duration_minutes),
            status=BookingStatus.CONFIRMED,
            notes="Free service booking"
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return {
            "type": "free",
            "booking_id": booking.id,
            "message": "Free service booked successfully"
        }

    # For paid services, create Stripe checkout
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Stripe not configured. Please set STRIPE_SECRET_KEY."
        )

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': service.name,
                        'description': service.description or f"Booking for {service.name}",
                    },
                    'unit_amount': int(service.price * 100),  # Stripe uses cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{settings.STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}&service_id={service.id}",
            cancel_url=settings.STRIPE_CANCEL_URL,
            metadata={
                'user_id': str(current_user.id),
                'service_id': str(service.id),
                'start_time': request.start_time,
            }
        )
        return {
            "type": "paid",
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Stripe webhooks for payment confirmation"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not settings.STRIPE_WEBHOOK_SECRET:
        # For development, skip signature verification
        event = stripe.Event.construct_from(
            stripe.util.convert_to_dict(await request.json()),
            settings.STRIPE_SECRET_KEY
        )
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})

        user_id = int(metadata.get('user_id'))
        service_id = int(metadata.get('service_id'))
        start_time = datetime.fromisoformat(metadata.get('start_time'))

        # Get service for duration
        result = await db.execute(
            select(Service).where(Service.id == service_id)
        )
        service = result.scalar_one_or_none()

        if service:
            booking = Booking(
                customer_id=user_id,
                service_id=service_id,
                start_time=start_time,
                end_time=start_time + timedelta(minutes=service.duration_minutes),
                status=BookingStatus.CONFIRMED,
                notes=f"Stripe payment: {session.get('id')}"
            )
            db.add(booking)
            await db.commit()

    return {"status": "success"}
