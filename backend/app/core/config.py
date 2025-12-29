from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Service Booking Platform"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/booking_db"
    DATABASE_SYNC_URL: str = ""
    ALLOWED_ORIGINS: list[str] = []

    # Security
    SECRET_KEY: str = "supersecretkey"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Stripe
    STRIPE_SECRET_KEY: str = ""  # Set via environment variable
    STRIPE_WEBHOOK_SECRET: str = ""  # Set via environment variable
    STRIPE_SUCCESS_URL: str = "http://localhost:5173/booking/success"
    STRIPE_CANCEL_URL: str = "http://localhost:5173/booking/cancel"


class Config:
    case_sensitive = True
    env_file = ".env"


settings = Settings()
