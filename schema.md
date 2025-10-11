# Schéma d’architecture – MedicAnonym (UE)

```mermaid
flowchart LR
  subgraph Clients[Clients / Intégrations]
    A1[Web UI / SvelteKit]
    A2[ETL / Batch]
  end

  A1 -->|Upload fichiers| B1[Cloud Storage\nBucket RAW (EU)]
  A2 -->|Push via API| S1[Cloud Run\nAPI Ingestion]
  A2 -->|Upload| B1

  %% Déclencheur d'ingestion
  B1 -- Event Notification --> S1

  subgraph Sec[Perimètre Sécurité (VPC Service Controls + IAM + CMEK)]
    direction TB

    S1 -->|Classify & route| AG[Vertex AI\nAgent "MedicAnonym" (Gemini)]

    %% Décisions de l'agent
    AG -->|Texte/CSV/PDF OCR| DLP[Cloud DLP\nDe-identification]
    AG -->|Ressources FHIR| HC[Cloud Healthcare API\nFHIR de-id]

    %% Transformations
    DLP --> B2[Cloud Storage\nBucket CLEAN (EU)]
    HC --> B2

    %% Stockage analytique
    B2 --> BQ[BigQuery\nDonnées dé-identifiées]

    %% Traces et logs
    LOG[Cloud Logging\n+ Cloud Monitoring]:::obs

    S1 --> LOG
    AG --> LOG
    DLP --> LOG
    HC --> LOG

    %% Files et async
    AG -->|Tâches longues| PS[Pub/Sub\nTopics]
    PS --> WRK[Cloud Run Worker\n(Validation / OCR / QC)]
    WRK --> DLP

    %% Gestion secrets/clefs
    SM[Secret Manager]:::sec
    KMS[Cloud KMS (CMEK)]:::sec

    S1 --- SM
    DLP --- KMS
    HC --- KMS
    B1 --- KMS
    B2 --- KMS
    BQ --- KMS
  end

  %% Sorties / Consommation
  BQ --> A3[Dashboards / BI / Exports]
  B2 --> A4[Téléchargement fichiers dé-id]

  classDef sec fill:#f6f2,stroke:#777,stroke-width:1px
  classDef obs fill:#f6faff,stroke:#77a,stroke-width:1px
```

## Notes de lecture

* **Cloud Run API Ingestion** reçoit les événements d’upload et normalise les jobs.
* **Vertex AI Agent (Gemini)** sélectionne la voie de traitement (DLP ou FHIR de-id), propose/valide les templates DLP, puis orchestre l’exécution.
* **Cloud DLP** gère la dé-identification (masking, tokenisation, FPE) pour texte/CSV/PDF (après OCR si nécessaire).
* **Cloud Healthcare API** applique la dé-id native sur les ressources **FHIR**.
* **Sécurité** : périmètre **VPC Service Controls**, chiffrage **CMEK (Cloud KMS)**, secrets dans **Secret Manager**, IAM minimal.
* **Observabilité** : journaux + métriques dans **Cloud Logging/Monitoring**, alertes sur erreurs/latence/taux de résidu PHI.

## Flux (résumé)

1. Upload → Bucket **RAW** → Event → **Ingestion (Run)**.
2. **Agent Vertex AI** lit la consigne, choisit **DLP** ou **FHIR de-id**, et lance le traitement (directement ou via **Pub/Sub** + **Worker**).
3. Sortie → Bucket **CLEAN** (fichiers) et/ou **BigQuery** (analytics). Journaux centralisés.

## Variantes

* **Temps réel API** : appeler l’ingestion directement via HTTP (Cloud Run), utile pour faibles volumes.
* **Revue humaine** : ajouter **Workflows + AppSheet/Cloud Run UI** pour escalade des cas ambigus.
* **Edge/latence** : partitionner par région UE (europe-west1/west9) selon proximité et services disponibles.
