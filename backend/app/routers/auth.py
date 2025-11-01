"""
Authentication router

Endpoints:
- POST /auth/register - Register a new user
- POST /auth/login - Login with email and password
- GET /auth/me - Get current user information
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth import UserRegister, UserLogin, LoginResponse, UserResponse
from app.services.auth import AuthService
from app.dependencies import get_current_user
from app.persistence.database import get_db
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)


@router.post(
    "/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account

    - **email**: Valid email address (must be unique)
    - **name**: User's full name
    - **password**: Password (minimum 8 characters)

    Returns access token and user information
    """
    # Check if user already exists
    existing_user = AuthService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    new_user = AuthService.create_user(
        db=db, email=user_data.email, name=user_data.name, password=user_data.password
    )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = AuthService.create_access_token(
        data={"sub": new_user.email, "user_id": new_user.id},
        expires_delta=access_token_expires,
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    - **email**: User's email address
    - **password**: User's password

    Returns access token and user information
    """
    # Authenticate user
    user = AuthService.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "user_id": user.id}, expires_delta=access_token_expires
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """
    Get current authenticated user information

    Requires:
        Valid JWT token in Authorization header

    Returns current user information
    """
    return UserResponse.model_validate(current_user)
