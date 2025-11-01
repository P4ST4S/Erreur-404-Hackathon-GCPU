# Configuration Google Cloud Storage

## Setup pour le développement local

### 1. Créer un bucket GCS

```bash
# Se connecter à GCP
gcloud auth login

# Définir le projet
gcloud config set project YOUR_PROJECT_ID

# Créer le bucket
gsutil mb -l europe-west1 gs://omop-anonymizer-uploads

# Définir les permissions CORS (si nécessaire)
gsutil cors set cors.json gs://omop-anonymizer-uploads
```

### 2. Configuration des credentials

#### Option A : Utiliser les credentials par défaut (recommandé pour dev)
```bash
gcloud auth application-default login
```

#### Option B : Utiliser une clé de compte de service
1. Créer un compte de service dans GCP Console
2. Télécharger la clé JSON
3. Définir la variable d'environnement dans `.env` :
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 3. Variables d'environnement

Copier `.env.example` vers `.env` et modifier :

```bash
GCS_BUCKET_NAME=omop-anonymizer-uploads
GCS_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=  # Laisser vide pour utiliser les credentials par défaut
```

## Déploiement sur Cloud Run

Sur Cloud Run, l'authentification se fait automatiquement via le compte de service associé au service.

1. Assigner le rôle `Storage Object Admin` au compte de service Cloud Run
2. Configurer les variables d'environnement dans Cloud Run :
   - `GCS_BUCKET_NAME`: nom du bucket
   - `GCS_PROJECT_ID`: ID du projet GCP
   - Ne pas définir `GOOGLE_APPLICATION_CREDENTIALS`

## Structure des fichiers dans GCS

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

Chaque dataset a son propre dossier avec ses fichiers CSV.
