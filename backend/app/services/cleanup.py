"""
Cleanup service for expired files
"""

import os
import logging
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session

from app.persistence.models import UploadedFile, Dataset
from app.persistence.database import SessionLocal
from app.core.config import settings

logger = logging.getLogger(__name__)


class CleanupService:
    """
    Service for cleaning up expired non-anonymized files
    """

    def __init__(self):
        """Initialize cleanup service with GCS or local storage"""
        self.use_local = settings.use_local_storage

        if self.use_local:
            self.storage_path = settings.local_storage_path
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
                logger.error(f"Failed to initialize GCS client: {str(e)}")
                self.storage_client = None
                self.bucket = None

    def delete_file_from_storage(self, storage_path: str) -> bool:
        """
        Delete a file from storage (GCS or local)

        Args:
            storage_path: Path to the file in storage

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if self.use_local:
                # Delete local file
                full_path = os.path.join(self.storage_path, storage_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
                    logger.info(f"Deleted file from local storage: {storage_path}")
                return True
            else:
                # Delete from GCS
                if self.bucket:
                    blob = self.bucket.blob(storage_path)
                    blob.delete()
                    logger.info(f"Deleted file from GCS: {storage_path}")
                    return True
                else:
                    logger.error("GCS bucket not initialized")
                    return False
        except Exception as e:
            logger.error(f"Failed to delete file from storage {storage_path}: {str(e)}")
            return False

    def cleanup_expired_files(self, db: Session) -> dict:
        """
        Find and delete all expired non-anonymized files

        Args:
            db: Database session

        Returns:
            Dictionary with cleanup statistics
        """
        now = datetime.now(timezone.utc)

        # Find expired files
        expired_files = (
            db.query(UploadedFile)
            .filter(
                UploadedFile.is_anonymized == False,
                UploadedFile.expires_at.isnot(None),
                UploadedFile.expires_at <= now,
            )
            .all()
        )

        stats = {
            "total_expired": len(expired_files),
            "deleted_from_gcs": 0,
            "deleted_from_db": 0,
            "failed": 0,
            "timestamp": now.isoformat(),
        }

        logger.info(f"Found {len(expired_files)} expired files to delete")

        for file in expired_files:
            try:
                # Delete from storage
                if self.delete_file_from_storage(file.file_path):
                    stats["deleted_from_gcs"] += 1

                    # Delete from database
                    db.delete(file)
                    stats["deleted_from_db"] += 1

                    logger.info(
                        f"Deleted expired file: {file.original_filename} "
                        f"(ID: {file.id}, expired at: {file.expires_at})"
                    )
                else:
                    stats["failed"] += 1

            except Exception as e:
                stats["failed"] += 1
                logger.error(f"Error deleting file {file.id}: {str(e)}")

        # Commit all deletions
        try:
            db.commit()
            logger.info(f"Cleanup completed: {stats}")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to commit database changes: {str(e)}")
            stats["failed"] = stats["deleted_from_db"]
            stats["deleted_from_db"] = 0

        return stats

    def cleanup_empty_datasets(self, db: Session) -> int:
        """
        Delete datasets that have no files

        Args:
            db: Database session

        Returns:
            Number of deleted datasets
        """
        # Find datasets with no files
        datasets = db.query(Dataset).all()
        deleted_count = 0

        for dataset in datasets:
            if len(dataset.files) == 0:
                try:
                    db.delete(dataset)
                    deleted_count += 1
                    logger.info(
                        f"Deleted empty dataset: {dataset.name} (ID: {dataset.id})"
                    )
                except Exception as e:
                    logger.error(
                        f"Failed to delete empty dataset {dataset.id}: {str(e)}"
                    )

        try:
            db.commit()
            logger.info(f"Deleted {deleted_count} empty datasets")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to commit dataset deletions: {str(e)}")
            deleted_count = 0

        return deleted_count


def run_cleanup_task():
    """
    Scheduled task to cleanup expired files
    This function is called by the scheduler
    """
    logger.info("Starting scheduled cleanup task...")

    # Create database session
    db = SessionLocal()

    try:
        cleanup_service = CleanupService()

        # Cleanup expired files
        file_stats = cleanup_service.cleanup_expired_files(db)

        # Cleanup empty datasets
        empty_datasets = cleanup_service.cleanup_empty_datasets(db)

        logger.info(
            f"Cleanup task completed - Files: {file_stats['deleted_from_db']}/{file_stats['total_expired']}, "
            f"Empty datasets: {empty_datasets}"
        )

    except Exception as e:
        logger.error(f"Cleanup task failed: {str(e)}")
    finally:
        db.close()
