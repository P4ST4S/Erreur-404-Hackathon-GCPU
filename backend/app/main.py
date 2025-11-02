"""
FastAPI main application

This is the main entry point for the FastAPI application.
It sets up the FastAPI instance, middleware, background tasks, and includes all routers.
"""

import sys
from pathlib import Path
APP_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = APP_ROOT.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.persistence.database import engine, Base
from app.routers import auth, upload, validate, merge
from app.services.cleanup import run_cleanup_task
scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events

    This function handles application startup (database initialization, scheduler start)
    and shutdown (scheduler cleanup) events.
    """
    Base.metadata.create_all(bind=engine)
    scheduler.add_job(
        func=run_cleanup_task,
        trigger=IntervalTrigger(hours=1),
        id="cleanup_expired_files",
        name="Cleanup expired files every hour",
        replace_existing=True,
    )
    scheduler.start()

    yield
    scheduler.shutdown()
app = FastAPI(
    title=settings.app_name,
    description="API for OMOP medical data anonymization",
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(validate.router, prefix="/api/v1")
app.include_router(merge.router, prefix="/api/v1")

