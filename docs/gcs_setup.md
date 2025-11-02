# Google Cloud Storage Configuration

## Local development setup

### 1. Create a GCS bucket

```bash
# Login to GCP
gcloud auth login

# Set the project
gcloud config set project YOUR_PROJECT_ID

# Create the bucket
gsutil mb -l europe-west1 gs://omop-anonymizer-uploads

# Set CORS rules if needed
gsutil cors set cors.json gs://omop-anonymizer-uploads
```

### 2. Credentials configuration

#### Option A — Use Application Default Credentials (recommended for dev)
```bash
gcloud auth application-default login
```

#### Option B — Use a service account key
1. Create a service account in the GCP Console
2. Download the JSON key
3. Set the environment variable in `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 3. Environment variables

Copy `.env.example` to `.env` and update the values:

```bash
GCS_BUCKET_NAME=omop-anonymizer-uploads
GCS_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=  # Leave empty to use application default credentials
```

## Deploying on Cloud Run

On Cloud Run, authentication is handled automatically by the service's associated service account.

1. Grant the `Storage Object Admin` role to the Cloud Run service account
2. Configure the environment variables in Cloud Run:
   - `GCS_BUCKET_NAME`: the bucket name
   - `GCS_PROJECT_ID`: the GCP project ID
   - Do not set `GOOGLE_APPLICATION_CREDENTIALS` (use the platform-provided credentials)

## Files structure in GCS

```
gs://omop-anonymizer-uploads/
└── datasets/
    ├── 1/
    │   ├── 1_abc123def456.csv
    │   └── 1_789ghi012jkl.csv
    ├── 2/
    │   └── 2_xyz789uvw012.csv
    └── ...
```

Each dataset has its own folder containing the CSV files.
