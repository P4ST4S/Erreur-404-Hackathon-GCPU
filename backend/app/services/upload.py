"""
Business logic for file upload and dataset management
"""

import os
import json
import uuid
import tempfile
import pandas as pd
import aiofiles
from typing import List, Dict, Tuple, Optional
from io import BytesIO
from datetime import datetime, timedelta, timezone
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.persistence.models import Dataset, UploadedFile, DatasetStatus, User
from app.schemas.upload import (
    ColumnConflict,
    ColumnInfo,
    ConflictDetectionResponse,
    ColumnResolution,
)
from app.core.config import settings


class UploadService:
    """
    Service for handling file uploads with GCS or local storage
    """
    SUPPORTED_FORMATS = [".csv"]
    MAX_FILE_SIZE = 100 * 1024 * 1024

    def __init__(self):
        """
        Initialize the upload service with GCS client or local storage
        """
        self.use_local = settings.use_local_storage

        if self.use_local:
            self.storage_path = settings.local_storage_path
            os.makedirs(self.storage_path, exist_ok=True)
            self.storage_client = None
            self.bucket = None
        else:
            try:
                from google.cloud import storage

                if settings.google_application_credentials:
                    self.storage_client = storage.Client.from_service_account_json(
                        settings.google_application_credentials
                    )
                else:
                    self.storage_client = storage.Client(
                        project=settings.gcs_project_id
                    )

                self.bucket_name = settings.gcs_bucket_name
                self.bucket = self.storage_client.bucket(self.bucket_name)
            except Exception as e:
                raise RuntimeError(
                    f"Failed to initialize GCS client. Use USE_LOCAL_STORAGE=true for local development. Error: {str(e)}"
                )

    @staticmethod
    def validate_filename(filename: str) -> None:
        """
        Validate uploaded filename

        Args:
            filename: Original filename

        Raises:
            HTTPException: If filename is invalid or unsupported format
        """
        if not filename:
            raise HTTPException(status_code=422, detail="Filename cannot be empty")
        _, ext = os.path.splitext(filename.lower())
        if ext not in UploadService.SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=422,
                detail=f"Unsupported file format. Supported formats: {', '.join(UploadService.SUPPORTED_FORMATS)}",
            )

    @staticmethod
    async def validate_file_size(file: UploadFile) -> int:
        """
        Validate and get file size

        Args:
            file: Uploaded file

        Returns:
            File size in bytes

        Raises:
            HTTPException: If file is too large
        """
        content = await file.read()
        size = len(content)

        if size > UploadService.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=422,
                detail=f"File too large. Maximum size: {UploadService.MAX_FILE_SIZE / (1024 * 1024)}MB",
            )
        await file.seek(0)

        return size

    async def save_file(
        self, file: UploadFile, dataset_id: int
    ) -> Tuple[str, str, int]:
        """
        Save uploaded file to GCS or local storage

        Args:
            file: Uploaded file
            dataset_id: ID of the dataset

        Returns:
            Tuple of (stored_filename, storage_path, file_size)
        """
        file_ext = os.path.splitext(file.filename)[1]
        stored_filename = f"{dataset_id}_{uuid.uuid4().hex}{file_ext}"
        content = await file.read()
        file_size = len(content)

        if self.use_local:
            dataset_dir = os.path.join(self.storage_path, "datasets", str(dataset_id))
            os.makedirs(dataset_dir, exist_ok=True)
            storage_path = os.path.join(dataset_dir, stored_filename)
            async with aiofiles.open(storage_path, "wb") as f:
                await f.write(content)
            storage_path = f"datasets/{dataset_id}/{stored_filename}"
        else:
            storage_path = f"datasets/{dataset_id}/{stored_filename}"
            blob = self.bucket.blob(storage_path)
            blob.upload_from_string(content, content_type="text/csv")

        return stored_filename, storage_path, file_size

    def analyze_csv(self, storage_path: str) -> Tuple[int, int, Dict]:
        """
        Analyze CSV file from storage to extract metadata

        Args:
            storage_path: Path to the CSV file in storage

        Returns:
            Tuple of (row_count, column_count, columns_info)
        """
        try:
            if self.use_local:
                full_path = os.path.join(self.storage_path, storage_path)
                df = pd.read_csv(full_path, low_memory=False)
            else:
                blob = self.bucket.blob(storage_path)
                content = blob.download_as_bytes()
                df = pd.read_csv(BytesIO(content), low_memory=False)

            row_count = len(df)
            column_count = len(df.columns)
            columns_info = {col: str(df[col].dtype) for col in df.columns}

            return row_count, column_count, columns_info
        except Exception as e:
            raise HTTPException(
                status_code=422, detail=f"Failed to parse CSV file: {str(e)}"
            )

    async def create_dataset(self, db: Session, name: str, user: User) -> Dataset:
        """
        Create a new dataset

        Args:
            db: Database session
            name: Dataset name
            user: Owner user

        Returns:
            Created dataset
        """
        dataset = Dataset(name=name, owner_id=user.id, status=DatasetStatus.UPLOADING)
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    async def upload_files(
        self, db: Session, dataset: Dataset, files: List[UploadFile]
    ) -> List[UploadedFile]:
        """
        Upload multiple files to a dataset

        Args:
            db: Database session
            dataset: Target dataset
            files: List of files to upload

        Returns:
            List of created UploadedFile records
        """
        uploaded_files = []

        for file in files:
            self.validate_filename(file.filename)
            file_size = await self.validate_file_size(file)
            stored_filename, gcs_path, _ = await self.save_file(file, dataset.id)
            row_count, column_count, columns_info = self.analyze_csv(gcs_path)
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.file_expiration_days
            )
            uploaded_file = UploadedFile(
                dataset_id=dataset.id,
                filename=file.filename,
                file_path=gcs_path,  # Store GCS path or local path
                file_size=file_size,
                content_type="text/csv",
                row_count=row_count,
                column_count=column_count,
                columns_info=json.dumps(columns_info),
                is_anonymized=False,  # Files are not anonymized yet
                expires_at=expires_at,  # Set expiration date
            )
            db.add(uploaded_file)
            uploaded_files.append(uploaded_file)
        dataset.status = DatasetStatus.UPLOADED
        db.commit()

        for f in uploaded_files:
            db.refresh(f)

        return uploaded_files

    def detect_conflicts(
        self, db: Session, dataset_id: int
    ) -> ConflictDetectionResponse:
        """
        Detect column conflicts across files in a dataset

        Args:
            db: Database session
            dataset_id: ID of the dataset

        Returns:
            Conflict detection results
        """
        files = (
            db.query(UploadedFile).filter(UploadedFile.dataset_id == dataset_id).all()
        )

        if not files:
            raise HTTPException(status_code=404, detail="Dataset has no files")
        all_columns: Dict[str, List[ColumnInfo]] = {}

        for file in files:
            columns_info = json.loads(file.columns_json)
            for col_name, col_type in columns_info.items():
                if col_name not in all_columns:
                    all_columns[col_name] = []

                all_columns[col_name].append(
                    ColumnInfo(
                        name=col_name,
                        dtype=col_type,
                        file_id=file.id,
                        file_name=file.filename,
                    )
                )
        conflicts: List[ColumnConflict] = []

        for col_name, col_infos in all_columns.items():
            if len(col_infos) < len(files):
                conflicts.append(
                    ColumnConflict(
                        column_name=col_name, variations=col_infos, is_missing=True
                    )
                )
            elif len(set(ci.dtype for ci in col_infos)) > 1:
                conflicts.append(
                    ColumnConflict(
                        column_name=col_name, variations=col_infos, is_duplicate=True
                    )
                )
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if conflicts:
            dataset.status = DatasetStatus.PENDING_RESOLUTION
        else:
            dataset.status = DatasetStatus.RESOLVED
        db.commit()

        return ConflictDetectionResponse(
            dataset_id=dataset_id,
            has_conflicts=len(conflicts) > 0,
            conflicts=conflicts,
            total_columns=len(all_columns),
            message=f"Found {len(conflicts)} conflicts"
            if conflicts
            else "No conflicts detected",
        )

    def resolve_conflicts(
        self, db: Session, dataset_id: int, resolutions: List[ColumnResolution]
    ) -> None:
        """
        Apply conflict resolutions to dataset

        Args:
            db: Database session
            dataset_id: ID of the dataset
            resolutions: List of column resolutions
        """
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        if dataset.status != DatasetStatus.PENDING_RESOLUTION:
            raise HTTPException(
                status_code=400, detail="Dataset is not in pending resolution state"
            )
        dataset.status = DatasetStatus.RESOLVED
        db.commit()
