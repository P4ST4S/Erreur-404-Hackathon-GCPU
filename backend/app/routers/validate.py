"""
Router for dataset validation endpoints

Endpoints:
- GET /validate/{dataset_id} - Validate files in a dataset and detect column conflicts
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.upload import ConflictDetectionResponse
from app.services.validation import ValidationService
from app.dependencies import get_current_user
from app.persistence.database import get_db
from app.persistence.models import User, Dataset

router = APIRouter(
    prefix="/validate",
    tags=["validate"],
)
validation_service = ValidationService()

@router.get(
    "/{dataset_id}",
    response_model=ConflictDetectionResponse,
    status_code=status.HTTP_200_OK
)
async def validate_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate files in a dataset and detect column conflicts
    
    **Parameters:**
    - **dataset_id**: ID of the dataset to validate
    
    **Returns:**
    - List of column conflicts
    - Sample data for conflicting columns
    - Total number of columns
    - Status message
    
    **Status Codes:**
    - **200**: Validation completed successfully
    - **404**: Dataset not found
    - **403**: Forbidden (user not authorized)
    - **400**: Invalid dataset state or no files
    """
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )
    try:
        return await validation_service.detect_column_conflicts(db, dataset_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during validation: {str(e)}"
        )
