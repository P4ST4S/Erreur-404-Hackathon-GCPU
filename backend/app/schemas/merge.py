"""
Pydantic schemas for file upload and dataset management
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class MergeRequest(BaseModel):
    dataset_id: int = Field(..., description="ID of the dataset to merge")
    merges: dict[str, list[str]] = Field(..., description="Mapping of final column names to list of original column names to merge")


class MergeResponse(BaseModel):
    status: str = Field(default="success", description="Status of the merge operation")
    message: str = Field(default="Files merged successfully", description="Status message")
    merged_file_id: Optional[int] = Field(None, description="ID of the merged file")


