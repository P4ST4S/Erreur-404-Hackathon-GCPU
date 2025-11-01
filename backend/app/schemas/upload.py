"""
Pydantic schemas for file upload and dataset management
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re


class DatasetCreateRequest(BaseModel):
    """
    Request schema for creating a new dataset
    """
    name: str = Field(..., min_length=1, max_length=255, description="Name of the dataset")
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """
        Validate dataset name:
        - Only alphanumeric, spaces, hyphens, and underscores
        - No leading/trailing whitespace
        """
        v = v.strip()
        if not v:
            raise ValueError("Dataset name cannot be empty")
        
        # Check for valid characters
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError(
                "Dataset name can only contain letters, numbers, spaces, hyphens, and underscores"
            )
        
        return v


class FileUploadResponse(BaseModel):
    """
    Response schema for individual file upload
    """
    id: int
    original_filename: str
    file_size: int
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DatasetResponse(BaseModel):
    """
    Response schema for dataset information
    """
    id: int
    name: str
    owner_id: int
    status: str
    anonymization_standard: Optional[str] = None
    file_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """
    Response schema for upload operation
    """
    dataset: DatasetResponse
    uploaded_files: List[FileUploadResponse]
    message: str


class ColumnInfo(BaseModel):
    """
    Information about a column in a CSV file
    """
    name: str
    dtype: str
    file_id: int
    file_name: str


class ColumnConflict(BaseModel):
    """
    Represents a conflict between columns across files
    """
    column_name: str
    variations: List[ColumnInfo]
    is_duplicate: bool = False  # True if same name but different types
    is_missing: bool = False  # True if column exists in some files but not others


class ConflictDetectionResponse(BaseModel):
    """
    Response schema for conflict detection
    """
    dataset_id: int
    has_conflicts: bool
    conflicts: List[ColumnConflict]
    total_columns: int
    message: str


class ColumnResolution(BaseModel):
    """
    Resolution for a single column conflict
    """
    column_name: str
    action: str = Field(..., description="Action: 'merge', 'keep', 'remove', 'rename'")
    target_name: Optional[str] = None  # For rename or merge actions
    target_type: Optional[str] = None  # For merge actions with type conversion
    
    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        allowed_actions = ["merge", "keep", "remove", "rename"]
        if v not in allowed_actions:
            raise ValueError(f"Action must be one of: {', '.join(allowed_actions)}")
        return v


class ConflictResolutionRequest(BaseModel):
    """
    Request schema for submitting conflict resolutions
    """
    dataset_id: int
    resolutions: List[ColumnResolution]


class ConflictResolutionResponse(BaseModel):
    """
    Response schema for conflict resolution submission
    """
    dataset_id: int
    status: str
    message: str
    resolved_conflicts: int
