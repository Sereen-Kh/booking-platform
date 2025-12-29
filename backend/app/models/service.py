from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base
from .booking import Booking
from .review import Review

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    
    services = relationship("Service", back_populates="category")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    provider_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String, nullable=True)

    category = relationship("Category", back_populates="services")
    provider = relationship("User")
    bookings = relationship("Booking", back_populates="service")
    reviews = relationship("Review", back_populates="service")
