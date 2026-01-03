import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)

    # Profile fields
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    address = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    # Profile completion tracking
    is_profile_complete = Column(Boolean, default=False)

    # Status and timestamps
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
