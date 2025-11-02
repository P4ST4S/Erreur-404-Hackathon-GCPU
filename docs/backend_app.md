## Overview

The backend is a FastAPI-based API providing:
- user authentication and management
- file upload and storage (local or Google Cloud Storage)
- scheduled tasks (cleanup, file expiration)
- services for interaction with Vertex AI

Location: `backend/app`.

## Minimal Contract

- Inputs: HTTP requests (JSON, multipart files)
- Outputs: JSON responses, HTTP statuses, stored files
- Errors: 4xx for client errors, 5xx for server errors

Common edge cases: corrupted files, excessive size, GCS errors, unavailable database.

## Local Installation

1. Create and activate a Python virtual environment (recommended)

```bash
python -m venv .venv
source .venv/bin/activate

    Install dependencies

pip install -r backend/requirements.txt

    Copy .env.example to .env and adjust required variables (see next section).

    Run the API in development mode

# from the repository root
uvicorn backend.app.main:app --reload --port 8000

Environment Variables (excerpt from backend/app/core/config.py)

Settings are loaded from .env (via Pydantic Settings). Main variables include:

    DATABASE_URL (expected as database_url in settings)

    SECRET_KEY: JWT secret key (must be changed in production)

    ALGORITHM: JWT algorithm (default HS256)

    ACCESS_TOKEN_EXPIRE_MINUTES: token lifetime

    APP_NAME, APP_VERSION, DEBUG

    GCP / Storage:

        GCS_BUCKET_NAME (default hackathon-gcpu-files)

        GCS_PROJECT_ID (optional)

        GOOGLE_APPLICATION_CREDENTIALS (path to JSON file, optional)

        GCP_LOCATION (default europe-west1)

    Local storage:

        USE_LOCAL_STORAGE (bool, True for development)

        LOCAL_STORAGE_PATH (default uploads)

        FILE_EXPIRATION_DAYS (days before cleanup)

    Logging: LOG_LEVEL, LOG_JSON_FORMAT, USE_STRUCTURED_LOGGING

Note: the exact parameter names are defined in backend/app/core/config.py (e.g. database_url, secret_key, gcs_bucket_name, ...).
Important Structure (backend/app)

    main.py: ASGI entry point

    dependencies.py: shared FastAPI dependencies

    core/config.py: Pydantic configuration

    persistence/: database connection and models

    routers/: endpoints (e.g. auth.py, upload.py)

    schemas/: Pydantic schemas for requests/responses

    services/: business logic (auth, upload, cleanup, vertex_service)

    utils/: utilities (logger, helpers)

Check these files to understand the request flow: router → services → persistence.
Key Endpoints (overview)

    POST /auth/token: obtain a JWT token

    /upload routes: file upload and management

For the full route list, start the API and open the interactive documentation:

http://localhost:8000/docs

Dependencies (requirements)

Here is the content of backend/requirements.txt used by the project:

# FastAPI and ASGI server
fastapi==0.118.0
uvicorn[standard]==0.37.0

# Data validation
pydantic==2.11.9
pydantic-settings==2.11.0
email-validator==2.1.0

# Environment variables management
python-dotenv==1.1.1

# Database
sqlalchemy==2.0.25
psycopg[binary]==3.2.3
alembic==1.13.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.3
python-multipart==0.0.6

# File handling and CSV processing
pandas==2.2.0
aiofiles==23.2.1
python-magic==0.4.27

# Google Cloud Storage
google-cloud-storage==2.14.0

# Scheduled tasks
apscheduler==3.10.4

# Vertex AI
vertexai==1.71.1

# Utils
structlog==25.5.0

Deployment

    Dockerfiles are located at the root (Dockerfile.backend, Dockerfile.frontend), and infrastructure files are in infra/ (cloudbuild.yml, cloudrun-service.yml).

    In production, disable USE_LOCAL_STORAGE and configure GOOGLE_APPLICATION_CREDENTIALS/IAM for access to the GCS bucket.

Security & Best Practices

    Never commit secret keys or GOOGLE_APPLICATION_CREDENTIALS to the repository.

    Use managed secrets (Cloud Run Secrets / Secret Manager) in production.

    Check maximum file sizes and validate MIME types on the server side (via python-magic).

Scheduled Tasks

    A cleanup service (using apscheduler) deletes non-anonymized files after FILE_EXPIRATION_DAYS.

Contributing

    Refer to docs/pr_guide.md for PR and commit conventions.

    For any API change, add/update tests and the interactive documentation.

Final Notes

This document is intentionally concise.
For more details, explore the modules listed above and check docs/gcs_setup.md for GCS configuration.