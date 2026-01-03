from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta, datetime
from jose import JWTError, jwt
from pydantic import BaseModel
import re
import logging
import httpx
from ...database import get_db
from ...models.user import User
from ...schemas.user import Token, UserCreate, User as UserSchema, UserProfileUpdate
from ...core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from ...core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email and password.

    - **email**: Valid email address
    - **password**: Minimum 8 characters, at least one uppercase, one lowercase, and one number
    - **full_name**: User's full name
    - **role**: User role (customer, provider, or admin) - defaults to customer
    """
    # Validate password strength
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    if not re.search(r"[A-Z]", user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter",
        )

    if not re.search(r"[a-z]", user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter",
        )

    if not re.search(r"\d", user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number",
        )

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    if user:
        logger.warning(
            f"Registration attempt with existing email: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in the system",
        )

    # Validate full_name
    if user_in.full_name and len(user_in.full_name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name must be at least 2 characters long",
        )

    # Create new user
    try:
        db_user = User(
            email=user_in.email.lower().strip(),  # Normalize email
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip() if user_in.full_name else None,
            role=user_in.role,
            is_active=True,
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        logger.info(
            f"New user registered: {db_user.email} with role {db_user.role}")
        return db_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during user registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating your account",
        )


@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    OAuth2 compatible token login endpoint.

    - **username**: User's email address (OAuth2 spec uses 'username' field)
    - **password**: User's password

    Returns an access token that should be included in subsequent requests.
    """
    # Normalize email
    email = form_data.username.lower().strip()

    # Fetch user
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    # Validate credentials
    if not user:
        logger.warning(f"Login attempt with non-existent email: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for user: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is active
    if not user.is_active:
        logger.warning(f"Login attempt with inactive account: {email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    # Create access token
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires,
    )

    logger.info(f"Successful login for user: {email} with role {user.role}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current logged in user information"""
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile information"""
    logger.info(f"Profile update request for user {current_user.email}")

    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    # Update timestamp
    current_user.updated_at = datetime.utcnow()

    # Check if provider profile is complete
    if current_user.role == "PROVIDER":
        required_fields = ["full_name", "phone", "address", "bio"]
        current_user.is_profile_complete = all(
            getattr(current_user, field) for field in required_fields
        )

    await db.commit()
    await db.refresh(current_user)

    logger.info(f"Profile updated successfully for user {current_user.email}")
    return current_user


@router.get("/me/profile", response_model=UserSchema)
async def get_current_user_complete_profile(
    current_user: User = Depends(get_current_user),
):
    """Get current user's complete profile including role-specific data"""
    return current_user


class GoogleTokenRequest(BaseModel):
    token: str


class GoogleTokenInfo(BaseModel):
    email: str
    name: str
    picture: str | None = None


async def verify_google_token(token: str) -> GoogleTokenInfo:
    """Verify Google OAuth token and return user info"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            return GoogleTokenInfo(
                email=data.get("email"),
                name=data.get("name"),
                picture=data.get("picture"),
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )


@router.post("/google", response_model=Token)
async def google_login(
    request: GoogleTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login with Google OAuth token"""
    user_info = await verify_google_token(request.token)

    result = await db.execute(select(User).where(User.email == user_info.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=user_info.email,
            full_name=user_info.name or user_info.email,
            hashed_password=get_password_hash(
                f"google_oauth_{user_info.email}"
            ),
            role="CUSTOMER",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}
