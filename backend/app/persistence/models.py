"""
SQLAlchemy database models
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.persistence.database import Base
import enum


class UserRole(enum.Enum):
    """
    Possible roles for users at application level
    """
    USER = "user"
    ADMIN = "admin"
    AUDITOR = "auditor"


class User(Base):
    """
    User model for authentication and authorization
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name}, role={self.role.value})>"
