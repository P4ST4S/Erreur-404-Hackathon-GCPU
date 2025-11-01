"""
Global dependencies for FastAPI

This module contains reusable dependencies that can be injected into route handlers.
Dependencies can be used for authentication, authorization, database sessions, etc.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.services.auth import AuthService
from app.persistence.database import get_db
from app.persistence.models import User, UserRole

# Security scheme for JWT bearer token
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token
    
    This dependency extracts the JWT token from the Authorization header,
    validates it, and returns the corresponding user from the database.
    
    Usage:
        ```python
        @router.get("/profile")
        async def get_profile(current_user: User = Depends(get_current_user)):
            return {"email": current_user.email}
        ```
    
    Args:
        credentials: HTTP Authorization credentials (Bearer token)
        db: Database session
        
    Returns:
        Authenticated User object
        
    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Decode and validate token
    payload = AuthService.decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user email from token
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = AuthService.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to verify the current user is an admin
    
    This dependency requires a valid authenticated user and checks
    if they have the ADMIN role.
    
    Usage:
        ```python
        @router.delete("/admin/users/{user_id}")
        async def delete_user(
            user_id: int,
            admin: User = Depends(get_current_admin)
        ):
            # Only admins can access this endpoint
            ...
        ```
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object (guaranteed to be an admin)
        
    Raises:
        HTTPException 403: If user is not an admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin role required."
        )
    return current_user


async def get_current_auditor(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to verify the current user is an auditor or admin
    
    This dependency requires a valid authenticated user and checks
    if they have the AUDITOR or ADMIN role.
    
    Usage:
        ```python
        @router.get("/audit/logs")
        async def get_logs(auditor: User = Depends(get_current_auditor)):
            # Only auditors and admins can access this
            ...
        ```
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object (guaranteed to be an auditor or admin)
        
    Raises:
        HTTPException 403: If user is not an auditor or admin
    """
    if current_user.role not in [UserRole.AUDITOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Auditor or Admin role required."
        )
    return current_user
