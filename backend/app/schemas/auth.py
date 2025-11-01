"""
Authentication schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.persistence.models import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    name: str


class UserRegister(UserBase):
    """Schema for user registration request"""
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters"
    )


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for decoded token data"""
    email: Optional[str] = None
    user_id: Optional[int] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    role: UserRole
    
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Schema for login/register response"""
    access_token: str
    token_type: str
    user: UserResponse
