"""
Application configuration with Pydantic Settings

This module handles all configuration settings for the application.
Settings are loaded from environment variables or .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from .env file

    All settings can be overridden by environment variables.
    """
    database_url: str
    secret_key: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    app_name: str = "Hackathon GCPU API"
    app_version: str = "1.0.0"
    debug: bool = False
    gcs_bucket_name: str = "hackathon-gcpu-files"
    gcs_project_id: str | None = None
    google_application_credentials: str | None = None
    gcp_location: str = "europe-west1"
    use_local_storage: bool = True  # Set to False in production to use GCS
    local_storage_path: str = "uploads"
    file_expiration_days: int = 30  # Non-anonymized files expire after this many days
    log_level: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    log_json_format: bool = False  # Set to True for JSON logs in production
    use_structured_logging: bool = False  # Set to True to use structlog if installed

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )
settings = Settings()
