"""
Tests for the merge endpoint
"""
import os
import json
import pandas as pd
import pytest
from io import BytesIO
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.persistence.models import User, Dataset, DatasetStatus, UploadedFile
from app.schemas.merge import MergeRequest


class TestMergeEndpoint:
    """
    Test suite for the merge endpoint
    """

    def create_csv_file(self, temp_storage: str, dataset_id: int, filename: str, data: dict) -> str:
        """
        Helper to create a CSV file in temp storage

        Args:
            temp_storage: Path to temporary storage
            dataset_id: Dataset ID
            filename: Name of the file
            data: Dictionary with column names as keys and lists of values

        Returns:
            Relative storage path
        """
        dataset_dir = os.path.join(temp_storage, "datasets", str(dataset_id))
        os.makedirs(dataset_dir, exist_ok=True)

        file_path = os.path.join(dataset_dir, filename)
        df = pd.DataFrame(data)
        df.to_csv(file_path, index=False)

        return f"datasets/{dataset_id}/{filename}"

    def create_uploaded_file_record(
        self,
        db: Session,
        dataset_id: int,
        filename: str,
        file_path: str,
        data: dict
    ) -> UploadedFile:
        """
        Helper to create an UploadedFile database record

        Args:
            db: Database session
            dataset_id: Dataset ID
            filename: Original filename
            file_path: Storage path
            data: DataFrame data for metadata

        Returns:
            Created UploadedFile record
        """
        df = pd.DataFrame(data)
        columns_info = {col: str(df[col].dtype) for col in df.columns}

        uploaded_file = UploadedFile(
            dataset_id=dataset_id,
            filename=filename,
            file_path=file_path,
            file_size=1024,  # Dummy size
            content_type="text/csv",
            row_count=len(df),
            column_count=len(df.columns),
            columns_info=json.dumps(columns_info),
            is_anonymized=False,
            expires_at=None
        )
        db.add(uploaded_file)
        db.commit()
        db.refresh(uploaded_file)
        return uploaded_file
    def test_merge_with_no_conflicts(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging files with identical columns (no conflicts)
        """
        data1 = {
            "user_id": [1, 2, 3],
            "name": ["Alice", "Bob", "Charlie"],
            "age": [25, 30, 35]
        }
        data2 = {
            "user_id": [4, 5, 6],
            "name": ["David", "Eve", "Frank"],
            "age": [40, 45, 50]
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}  # No renaming needed
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["merged_file_id"] is not None
        assert "6" in data["message"]  # Should have 6 total rows
        merged_file = db.query(UploadedFile).filter(
            UploadedFile.id == data["merged_file_id"]
        ).first()
        assert merged_file is not None
        assert merged_file.row_count == 6
        assert merged_file.column_count == 3
        db.refresh(test_dataset)
        assert test_dataset.status == DatasetStatus.RESOLVED

    def test_merge_with_column_conflicts(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging files with conflicting column names
        """
        data1 = {
            "id": [1, 2, 3],
            "full_name": ["Alice", "Bob", "Charlie"],
            "years": [25, 30, 35]
        }
        data2 = {
            "user_id": [4, 5, 6],
            "name": ["David", "Eve", "Frank"],
            "age": [40, 45, 50]
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {
                "user_id": ["id", "user_id"],  # Merge id and user_id into user_id
                "name": ["full_name", "name"],  # Merge full_name and name into name
                "age": ["years", "age"]  # Merge years and age into age
            }
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["merged_file_id"] is not None
        merged_file = db.query(UploadedFile).filter(
            UploadedFile.id == data["merged_file_id"]
        ).first()
        assert merged_file.row_count == 6
        assert merged_file.column_count == 3

    def test_merge_with_partial_column_mapping(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging with some columns not present in all files (should fill with NaN)
        """
        data1 = {
            "col_a": [1, 2, 3],
            "col_b": ["x", "y", "z"],
            "col_c": [10, 20, 30]
        }
        data2 = {
            "col_a": [4, 5, 6],
            "col_b": ["p", "q", "r"],
            "col_d": [100, 200, 300]
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}  # No renaming
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        merged_file = db.query(UploadedFile).filter(
            UploadedFile.id == data["merged_file_id"]
        ).first()
        assert merged_file.row_count == 6
        assert merged_file.column_count == 4  # col_a, col_b, col_c, col_d

    def test_merge_with_nonexistent_columns_in_mapping(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test robustness when merge mapping references columns that don't exist
        Should not fail, just ignore non-existent columns
        """
        data1 = {
            "id": [1, 2, 3],
            "name": ["Alice", "Bob", "Charlie"]
        }
        data2 = {
            "id": [4, 5, 6],
            "name": ["David", "Eve", "Frank"]
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {
                "user_id": ["id", "user_id", "ID"],  # user_id and ID don't exist
                "full_name": ["name", "Name", "full_name"],  # Name and full_name don't exist
                "email": ["email", "Email"]  # Both don't exist
            }
        }

        response = client.post("/api/v1/merge", json=merge_request)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_merge_with_type_conflicts(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging files with different data types for same column
        Should attempt conversion
        """
        data1 = {
            "id": [1, 2, 3],
            "age": [25, 30, 35]  # integers
        }
        data2 = {
            "id": [4, 5, 6],
            "age": ["40", "45", "50"]  # strings representing numbers
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_merge_nonexistent_dataset(
        self,
        client: TestClient
    ):
        """
        Test merging with a dataset ID that doesn't exist
        """
        merge_request = {
            "dataset_id": 99999,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 404
        assert "Dataset not found" in response.json()["detail"]

    def test_merge_wrong_dataset_status(
        self,
        client: TestClient,
        db: Session,
        test_user: User,
        temp_storage: str
    ):
        """
        Test merging with dataset in wrong status (not PENDING_RESOLUTION or RESOLVED)
        """
        dataset = Dataset(
            name="Uploading Dataset",
            owner_id=test_user.id,
            status=DatasetStatus.UPLOADING
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        data = {"id": [1, 2, 3]}
        path = self.create_csv_file(temp_storage, dataset.id, "file.csv", data)
        self.create_uploaded_file_record(db, dataset.id, "file.csv", path, data)

        merge_request = {
            "dataset_id": dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 400
        assert "PENDING_RESOLUTION or RESOLVED" in response.json()["detail"]

    def test_merge_dataset_with_no_files(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset
    ):
        """
        Test merging a dataset that has no files
        """
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 404
        assert "no files" in response.json()["detail"].lower()

    def test_merge_resolved_dataset(
        self,
        client: TestClient,
        db: Session,
        test_user: User,
        temp_storage: str
    ):
        """
        Test merging a dataset that is already RESOLVED (should be allowed)
        """
        dataset = Dataset(
            name="Resolved Dataset",
            owner_id=test_user.id,
            status=DatasetStatus.RESOLVED
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        data1 = {"id": [1, 2], "value": [10, 20]}
        data2 = {"id": [3, 4], "value": [30, 40]}

        path1 = self.create_csv_file(temp_storage, dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, dataset.id, "file2.csv", data2)

        self.create_uploaded_file_record(db, dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, dataset.id, "file2.csv", path2, data2)

        merge_request = {
            "dataset_id": dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_merge_single_file(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging a dataset with only one file (edge case)
        """
        data = {
            "id": [1, 2, 3],
            "name": ["Alice", "Bob", "Charlie"]
        }

        path = self.create_csv_file(temp_storage, test_dataset.id, "file.csv", data)
        self.create_uploaded_file_record(db, test_dataset.id, "file.csv", path, data)

        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "success"
        merged_file = db.query(UploadedFile).filter(
            UploadedFile.id == result["merged_file_id"]
        ).first()
        assert merged_file.row_count == 3

    def test_merge_with_complex_mapping(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test merging with complex column mapping across multiple files
        """
        data1 = {
            "ID": [1, 2],
            "FirstName": ["Alice", "Bob"],
            "EMail": ["alice@test.com", "bob@test.com"]
        }
        data2 = {
            "user_id": [3, 4],
            "first_name": ["Charlie", "David"],
            "email": ["charlie@test.com", "david@test.com"]
        }
        data3 = {
            "id": [5, 6],
            "name": ["Eve", "Frank"],
            "email_address": ["eve@test.com", "frank@test.com"]
        }
        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)
        path3 = self.create_csv_file(temp_storage, test_dataset.id, "file3.csv", data3)
        self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)
        self.create_uploaded_file_record(db, test_dataset.id, "file3.csv", path3, data3)
        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {
                "user_id": ["ID", "user_id", "id"],
                "name": ["FirstName", "first_name", "name"],
                "email": ["EMail", "email", "email_address"]
            }
        }

        response = client.post("/api/v1/merge", json=merge_request)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        merged_file = db.query(UploadedFile).filter(
            UploadedFile.id == data["merged_file_id"]
        ).first()
        assert merged_file.row_count == 6
        assert merged_file.column_count == 3
        full_path = os.path.join(temp_storage, merged_file.file_path)
        merged_df = pd.read_csv(full_path)

        assert list(merged_df.columns) == ["user_id", "name", "email"]
        assert len(merged_df) == 6
        assert merged_df["user_id"].tolist() == [1, 2, 3, 4, 5, 6]

    def test_merge_creates_new_file_record(
        self,
        client: TestClient,
        db: Session,
        test_dataset: Dataset,
        temp_storage: str
    ):
        """
        Test that merge creates a new UploadedFile record and doesn't delete original files
        """
        data1 = {"id": [1, 2]}
        data2 = {"id": [3, 4]}

        path1 = self.create_csv_file(temp_storage, test_dataset.id, "file1.csv", data1)
        path2 = self.create_csv_file(temp_storage, test_dataset.id, "file2.csv", data2)

        file1 = self.create_uploaded_file_record(db, test_dataset.id, "file1.csv", path1, data1)
        file2 = self.create_uploaded_file_record(db, test_dataset.id, "file2.csv", path2, data2)

        initial_file_count = db.query(UploadedFile).filter(
            UploadedFile.dataset_id == test_dataset.id
        ).count()
        assert initial_file_count == 2

        merge_request = {
            "dataset_id": test_dataset.id,
            "merges": {}
        }

        response = client.post("/api/v1/merge", json=merge_request)
        assert response.status_code == 200
        final_file_count = db.query(UploadedFile).filter(
            UploadedFile.dataset_id == test_dataset.id
        ).count()
        assert final_file_count == 3
        assert db.query(UploadedFile).filter(UploadedFile.id == file1.id).first() is not None
        assert db.query(UploadedFile).filter(UploadedFile.id == file2.id).first() is not None
