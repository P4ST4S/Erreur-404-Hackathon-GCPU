"""
Upload router for file and dataset management

Endpoints:
- POST /upload - Upload CSV files to create or add to a dataset
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.schemas.upload import (
    UploadResponse, 
    DatasetResponse,
    FileUploadResponse,
    DatasetCreateRequest
)
from app.services.upload import UploadService
from app.dependencies import get_current_user
from app.persistence.database import get_db
from app.persistence.models import User, Dataset, DatasetStatus

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)
upload_service = UploadService()


@router.post("", response_model=UploadResponse, status_code=status.HTTP_200_OK)
async def upload_files(
    dataset_name: str = Form(..., description="Name of the dataset"),
    files: List[UploadFile] = File(..., description="CSV files to upload"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload CSV files in OMOP format
    
    **Parameters:**
    - **dataset_name**: Name for the dataset (alphanumeric, spaces, hyphens, underscores only)
    - **files**: One or more CSV files to upload
    
    **Returns:**
    - Dataset information
    - List of uploaded files with metadata
    
    **Status Codes:**
    - **200**: Files uploaded successfully
    - **422**: Invalid dataset name or unsupported file format
    - **403**: Forbidden (user not authenticated)
    """
    try:
        validated_request = DatasetCreateRequest(name=dataset_name)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid dataset name: {str(e)}"
        )
    if not files:
        raise HTTPException(
            status_code=422,
            detail="No files provided"
        )
    existing_dataset = db.query(Dataset).filter(
        Dataset.name == validated_request.name,
        Dataset.owner_id == current_user.id
    ).first()
    
    if existing_dataset:
        dataset = existing_dataset
        if dataset.status not in [DatasetStatus.UPLOADING, DatasetStatus.UPLOADED]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot upload files to dataset in {dataset.status.value} state"
            )
    else:
        dataset = await upload_service.create_dataset(
            db=db,
            name=validated_request.name,
            user=current_user
        )
    try:
        uploaded_files = await upload_service.upload_files(
            db=db,
            dataset=dataset,
            files=files
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload files: {str(e)}"
        )
    db.refresh(dataset)
    
    dataset_response = DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        owner_id=dataset.owner_id,
        status=dataset.status.value,
        anonymization_standard=None,  # Not yet implemented
        file_count=len(dataset.files),
        created_at=dataset.created_at,
        updated_at=dataset.updated_at
    )
    
    file_responses = [
        FileUploadResponse(
            id=f.id,
            original_filename=f.filename,  # Use 'filename' from the model
            file_size=f.file_size,
            row_count=f.row_count,
            column_count=f.column_count,
            created_at=f.created_at
        )
        for f in uploaded_files
    ]
    
    return UploadResponse(
        dataset=dataset_response,
        uploaded_files=file_responses,
        message=f"Successfully uploaded {len(uploaded_files)} file(s) to dataset '{dataset.name}'"
    )
