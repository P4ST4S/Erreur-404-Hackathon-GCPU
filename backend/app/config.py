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
    # Database
    database_url: str
    
    # JWT Authentication
    secret_key: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Application
    app_name: str = "Hackathon GCPU API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Google Cloud Storage
    gcs_bucket_name: str = "hackathon-gcpu-files"
    gcs_project_id: str | None = None
    google_application_credentials: str | None = None
    
    # File Storage
    use_local_storage: bool = True  # Set to False in production to use GCS
    local_storage_path: str = "uploads"
    file_expiration_days: int = 30  # Non-anonymized files expire after this many days
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
