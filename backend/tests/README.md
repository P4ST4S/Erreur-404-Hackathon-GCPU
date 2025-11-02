# Backend Tests

This directory contains the test suite for the backend API.

## Running Tests

### Install Test Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
# From the backend directory
pytest

# With verbose output
pytest -v

# With coverage report
pytest --cov=app --cov-report=html
```

### Run Specific Test File

```bash
pytest tests/test_merge.py
```

### Run Specific Test Class or Function

```bash
# Run a specific test class
pytest tests/test_merge.py::TestMergeEndpoint

# Run a specific test function
pytest tests/test_merge.py::TestMergeEndpoint::test_merge_with_no_conflicts
```

## Test Structure

- `conftest.py` - Pytest configuration and shared fixtures
- `test_merge.py` - Tests for the merge endpoint

## Test Coverage

The merge endpoint tests cover:

### Happy Path Scenarios
- ✅ Merging files with no conflicts (identical columns)
- ✅ Merging files with column name conflicts
- ✅ Merging with partial column overlap (some columns missing in some files)
- ✅ Merging files with type conflicts (convertible types)
- ✅ Merging already resolved datasets
- ✅ Merging single file datasets

### Error Scenarios
- ✅ Non-existent dataset ID
- ✅ Dataset with wrong status (not PENDING_RESOLUTION or RESOLVED)
- ✅ Dataset with no files
- ✅ Invalid column names in merge mapping (robustness check)

### Complex Scenarios
- ✅ Complex column mapping across multiple files
- ✅ Verification that original files are preserved
- ✅ Verification that merged file is created correctly

## Fixtures

### Database Fixtures
- `db` - Fresh database session for each test
- `client` - FastAPI test client with database override
- `test_user` - Pre-created test user
- `test_dataset` - Pre-created test dataset

### Storage Fixtures
- `temp_storage` - Temporary directory for file storage during tests

## Notes

- Tests use SQLite in-memory database for speed and isolation
- Each test gets a fresh database to ensure test independence
- Temporary storage is cleaned up automatically after each test
- Tests use local file storage (not GCS) for simplicity
