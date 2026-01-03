from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    business_name = Column(String)
    bio = Column(String)
    availability = Column(JSON)  # Store working hours, breaks, etc.
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    user = relationship("User")
