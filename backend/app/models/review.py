from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    rating = Column(Float, nullable=False) # 1.0 to 5.0
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("User")
    service = relationship("Service", back_populates="reviews")
