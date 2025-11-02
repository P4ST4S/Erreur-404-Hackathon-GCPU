"""
Upload router for file and dataset management

Endpoints:
- POST /upload - Upload CSV files to create or add to a dataset
"""
from typing import List
import pandas as pd
import json
import os
import uuid
from io import BytesIO
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body
from sqlalchemy.orm import Session

from app.schemas.merge import (
    MergeRequest,
    MergeResponse
)
from app.services.upload import UploadService
from app.dependencies import get_current_user
from app.persistence.database import get_db
from app.persistence.models import User, Dataset, DatasetStatus, UploadedFile
from app.core.config import settings

router = APIRouter(
    prefix="/merge",
    tags=["merge"],
)


@router.post("",
    response_model=MergeResponse,
    status_code=status.HTTP_200_OK,
    description="Merge multiple CSV files into a single dataset")
async def merge_files(
    body: MergeRequest = Body(...),
    db: Session = Depends(get_db)
) -> MergeResponse:
    """
    Merge multiple CSV files from a dataset into a single file.

    The merge process:
    1. Loads all CSV files from the dataset
    2. Renames columns according to the merge mapping
    3. Stacks rows vertically (concatenates DataFrames)
    4. Saves the merged result as a new file
    5. Updates dataset status to RESOLVED
    """
    # Initialize upload service fresh for each request to use current settings
    upload_service = UploadService()

    dataset_id = body.dataset_id

    # Get dataset
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Check dataset status - only allow merge if status is PENDING_RESOLUTION or RESOLVED
    if dataset.status not in [DatasetStatus.PENDING_RESOLUTION, DatasetStatus.RESOLVED]:
        raise HTTPException(
            status_code=400,
            detail=f"Dataset status must be PENDING_RESOLUTION or RESOLVED. Current status: {dataset.status.value}"
        )

    # Get all files in the dataset
    files = db.query(UploadedFile).filter(UploadedFile.dataset_id == dataset_id).all()
    if not files:
        raise HTTPException(status_code=404, detail="Dataset has no files to merge")

    # Load all CSV files into DataFrames
    dataframes = []

    for file in files:
        try:
            # Load CSV file using the same logic as UploadService
            if upload_service.use_local:
                # Read from local file
                full_path = os.path.join(upload_service.storage_path, file.file_path)
                df = pd.read_csv(full_path, low_memory=False)
            else:
                # Download file from GCS into memory
                blob = upload_service.bucket.blob(file.file_path)
                content = blob.download_as_bytes()
                df = pd.read_csv(BytesIO(content), low_memory=False)

            # Apply column renaming based on merge mapping
            # merges: {"final_col": ["col1", "col2", "col3"]}
            rename_map = {}
            for final_col, original_cols in body.merges.items():
                for orig_col in original_cols:
                    if orig_col in df.columns:
                        rename_map[orig_col] = final_col

            # Rename columns
            if rename_map:
                df = df.rename(columns=rename_map)

            dataframes.append(df)

        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to load or process file {file.filename}: {str(e)}"
            )

    # Check for type compatibility across dataframes
    try:
        # Get all unique columns across dataframes
        all_columns = set()
        for df in dataframes:
            all_columns.update(df.columns)

        # Check type compatibility for each column
        for col in all_columns:
            dtypes = []
            for df in dataframes:
                if col in df.columns:
                    dtypes.append(df[col].dtype)

            # If different types exist, try to convert
            if len(set(str(dt) for dt in dtypes)) > 1:
                # Try to find a common type
                for i, df in enumerate(dataframes):
                    if col in df.columns:
                        try:
                            # Try to convert to string first, then to float if possible
                            if df[col].dtype == 'object':
                                # Try numeric conversion
                                dataframes[i][col] = pd.to_numeric(df[col], errors='ignore')
                        except Exception:
                            # If conversion fails, keep as is
                            pass

        # Stack rows vertically (concatenate DataFrames)
        # ignore_index=True to reset index, sort=False to preserve column order
        merged_df = pd.concat(dataframes, ignore_index=True, sort=False)

    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to merge dataframes. Columns may have incompatible types that cannot be converted: {str(e)}"
        )

    # Save merged DataFrame as a new file
    try:
        # Generate unique filename for merged file
        merged_filename = f"merged_{dataset_id}_{uuid.uuid4().hex}.csv"

        # Convert DataFrame to CSV bytes
        csv_buffer = BytesIO()
        merged_df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        file_size = len(csv_content)

        # Save to storage
        if upload_service.use_local:
            # Save to local storage
            dataset_dir = os.path.join(upload_service.storage_path, "datasets", str(dataset_id))
            os.makedirs(dataset_dir, exist_ok=True)
            storage_path = os.path.join(dataset_dir, merged_filename)

            with open(storage_path, "wb") as f:
                f.write(csv_content)

            # Return relative path
            storage_path = f"datasets/{dataset_id}/{merged_filename}"
        else:
            # Upload to GCS
            storage_path = f"datasets/{dataset_id}/{merged_filename}"
            blob = upload_service.bucket.blob(storage_path)
            blob.upload_from_string(csv_content, content_type="text/csv")

        # Get merged file metadata
        row_count = len(merged_df)
        column_count = len(merged_df.columns)
        columns_info = {col: str(merged_df[col].dtype) for col in merged_df.columns}

        # Calculate expiration date
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.file_expiration_days)

        # Create database record for merged file
        merged_file = UploadedFile(
            dataset_id=dataset_id,
            filename=merged_filename,
            file_path=storage_path,
            file_size=file_size,
            content_type="text/csv",
            row_count=row_count,
            column_count=column_count,
            columns_info=json.dumps(columns_info),
            is_anonymized=False,
            expires_at=expires_at,
        )
        db.add(merged_file)

        # Update dataset status to RESOLVED
        dataset.status = DatasetStatus.RESOLVED
        db.commit()
        db.refresh(merged_file)

        return MergeResponse(
            status="success",
            message=f"Successfully merged {len(files)} files into one. Total rows: {row_count}, columns: {column_count}",
            merged_file_id=merged_file.id
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save merged file: {str(e)}"
        )
