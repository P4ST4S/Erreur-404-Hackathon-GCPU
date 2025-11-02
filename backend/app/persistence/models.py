"""
SQLAlchemy database models
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean, Text
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


class DatasetStatus(enum.Enum):
    """
    Possible statuses for dataset processing
    """
    UPLOADING = "uploading"
    UPLOADED = "uploaded"
    CONFLICT_DETECTION = "conflict_detection"
    PENDING_RESOLUTION = "pending_resolution"
    RESOLVED = "resolved"
    ANONYMIZING = "anonymizing"
    COMPLETED = "completed"
    FAILED = "failed"


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
    datasets = relationship("Dataset", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name}, role={self.role.value})>"


class Dataset(Base):
    """
    Dataset model representing a collection of uploaded CSV files
    """
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    status = Column(Enum(DatasetStatus), default=DatasetStatus.UPLOADING, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_size = Column(Integer, default=0)  # Total size in bytes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner = relationship("User", back_populates="datasets")
    files = relationship("UploadedFile", back_populates="dataset", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Dataset(id={self.id}, name={self.name}, status={self.status.value})>"


class UploadedFile(Base):
    """
    Uploaded file model representing individual CSV files in a dataset
    """
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Path in GCS or local storage
    file_size = Column(Integer, nullable=False)  # Size in bytes
    content_type = Column(String, default="text/csv")
    row_count = Column(Integer)
    column_count = Column(Integer)
    columns_info = Column(Text)  # JSON string with column names and types
    is_anonymized = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime(timezone=True))  # Null if anonymized
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    dataset = relationship("Dataset", back_populates="files")
    
    def __repr__(self):
        return f"<UploadedFile(id={self.id}, filename={self.filename}, dataset_id={self.dataset_id})>"
