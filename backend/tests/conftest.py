"""
Pytest configuration and fixtures
"""
import os
import tempfile
import shutil
from typing import Generator
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["USE_LOCAL_STORAGE"] = "true"
os.environ["LOCAL_STORAGE_PATH"] = tempfile.gettempdir()

from app.main import app
from app.persistence.database import Base, get_db
from app.persistence.models import User, Dataset, DatasetStatus, UploadedFile, UserRole
from app.core.config import settings

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database dependency override
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def temp_storage() -> Generator[str, None, None]:
    """
    Create a temporary directory for file storage during tests
    """
    temp_dir = tempfile.mkdtemp()

    # Override the settings to use this temp directory
    original_path = settings.local_storage_path
    original_use_local = settings.use_local_storage
    settings.local_storage_path = temp_dir
    settings.use_local_storage = True

    yield temp_dir

    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)
    settings.local_storage_path = original_path
    settings.use_local_storage = original_use_local


@pytest.fixture
def test_user(db: Session) -> User:
    """
    Create a test user
    """
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password="$2b$12$test_hashed_password",  # Dummy hashed password for testing
        role=UserRole.USER
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_dataset(db: Session, test_user: User) -> Dataset:
    """
    Create a test dataset
    """
    dataset = Dataset(
        name="Test Dataset",
        owner_id=test_user.id,
        status=DatasetStatus.PENDING_RESOLUTION
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset
