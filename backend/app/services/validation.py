"""
Service for validating and analyzing CSV files in OMOP format
"""
import pandas as pd
from typing import List, Dict, Set
from sqlalchemy.orm import Session
from app.persistence.models import Dataset, UploadedFile, DatasetStatus
from app.schemas.upload import ConflictDetectionResponse, ColumnConflict, ColumnInfo
from fastapi import HTTPException

class ValidationService:
    def __init__(self):
        self.sample_size = 5  # Number of sample rows to return for each column
        
    async def detect_column_conflicts(self, db: Session, dataset_id: int) -> ConflictDetectionResponse:
        """
        Detect conflicts between columns in dataset files
        
        Args:
            db: Database session
            dataset_id: ID of the dataset to validate
            
        Returns:
            ConflictDetectionResponse with detected conflicts
        """
        # Get dataset and files
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        if not dataset.files:
            raise HTTPException(status_code=400, detail="Dataset has no files")
            
        # Track columns across all files
        all_columns: Set[str] = set()
        file_columns: Dict[int, Set[str]] = {}
        column_info: Dict[str, List[ColumnInfo]] = {}
        
        # Analyze each file
        for file in dataset.files:
            try:
                # Read CSV file with pandas
                df = pd.read_csv(file.file_path)
                
                # Store columns for this file
                file_columns[file.id] = set(df.columns)
                all_columns.update(df.columns)
                
                # Store column info and sample data
                for col in df.columns:
                    if col not in column_info:
                        column_info[col] = []
                        
                    info = ColumnInfo(
                        name=col,
                        dtype=str(df[col].dtype),
                        file_id=file.id,
                        file_name=file.filename
                    )
                    column_info[col].append(info)
                    
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error analyzing file {file.filename}: {str(e)}"
                )
                
        # Detect conflicts
        conflicts: List[ColumnConflict] = []
        
        for column in all_columns:
            # Check which files have this column
            present_in_files = [
                file_id for file_id, cols in file_columns.items()
                if column in cols
            ]
            
            # Column is missing in some files
            if len(present_in_files) != len(dataset.files):
                conflict = ColumnConflict(
                    column_name=column,
                    variations=column_info[column],
                    is_missing=True
                )
                conflicts.append(conflict)
                continue
                
            # Check for type conflicts
            column_types = {
                info.dtype for info in column_info[column]
            }
            
            if len(column_types) > 1:
                conflict = ColumnConflict(
                    column_name=column,
                    variations=column_info[column],
                    is_duplicate=True
                )
                conflicts.append(conflict)
                
        # Update dataset status
        has_conflicts = len(conflicts) > 0
        # Align status values with the DatasetStatus enum defined in persistence.models
        # When conflicts are found we move to pending resolution, otherwise mark as resolved
        new_status = DatasetStatus.PENDING_RESOLUTION if has_conflicts else DatasetStatus.RESOLVED

        dataset.status = new_status
        db.commit()

        return ConflictDetectionResponse(
            dataset_id=dataset_id,
            has_conflicts=has_conflicts,
            conflicts=conflicts,
            total_columns=len(all_columns),
            message="Validation complete. Conflicts detected." if has_conflicts else "Validation complete. No conflicts found."
        )

    async def get_column_samples(self, file_path: str, column_name: str) -> List[str]:
        """
        Get sample values from a column for user context
        
        Args:
            file_path: Path to the CSV file
            column_name: Name of the column to sample
            
        Returns:
            List of sample values (up to self.sample_size)
        """
        try:
            df = pd.read_csv(file_path)
            if column_name not in df.columns:
                return []
                
            # Get unique samples
            samples = df[column_name].drop_duplicates().head(self.sample_size)
            return samples.astype(str).tolist()
            
        except Exception:
            return []
