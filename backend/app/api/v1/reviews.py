from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ...database import get_db
from ...models.review import Review
from ...schemas.user import User

router = APIRouter()

@router.get("/{service_id}", response_model=List[dict])
async def list_reviews(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.service_id == service_id))
    return [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "customer_id": r.customer_id
        } for r in result.scalars().all()
    ]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_review(
    service_id: int,
    rating: float,
    comment: str,
    db: AsyncSession = Depends(get_db)
):
    if not (1.0 <= rating <= 5.0):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    db_review = Review(
        service_id=service_id,
        customer_id=1, # Placeholder
        rating=rating,
        comment=comment
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review
