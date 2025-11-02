"""
Modern logging utility with structured logging support.

This module provides a centralized logging configuration following best practices:
- Structured JSON logging for production
- Human-readable console logging for development
- Context injection support
- Consistent formatting across the application
"""

import logging
import sys
from contextvars import ContextVar
from typing import Any, Dict, Optional

try:
    import structlog
    STRUCTLOG_AVAILABLE = True
except ImportError:
    STRUCTLOG_AVAILABLE = False

from app.core.config import settings


# Context variable for request-scoped data (e.g., request_id, user_id)
log_context: ContextVar[Dict[str, Any]] = ContextVar("log_context", default={})


def setup_logger(name: str) -> logging.Logger:
    """
    Set up and return a configured logger instance.

    Args:
        name: The name of the logger, typically __name__ of the calling module

    Returns:
        A configured logger instance

    Example:
        >>> from app.utils.logger import setup_logger
        >>> logger = setup_logger(__name__)
        >>> logger.info("Application started", extra={"version": "1.0.0"})
    """
    if STRUCTLOG_AVAILABLE and getattr(settings, 'USE_STRUCTURED_LOGGING', False):
        # Configure structlog if available and enabled
        _configure_structlog()
        return structlog.get_logger(name)
    else:
        # Fallback to standard logging
        return _configure_standard_logger(name)


def _configure_structlog() -> None:
    """Configure structlog for structured logging."""
    if structlog.is_configured():
        return

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if getattr(settings, 'LOG_JSON_FORMAT', False)
            else structlog.dev.ConsoleRenderer(colors=True)
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def _configure_standard_logger(name: str) -> logging.Logger:
    """
    Configure standard Python logger with best practices.

    Args:
        name: The name of the logger

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    # Set log level from settings or default to INFO
    log_level = getattr(settings, 'LOG_LEVEL', 'INFO').upper()
    logger.setLevel(getattr(logging, log_level))

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))

    # Create formatter
    formatter = _create_formatter()
    console_handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(console_handler)

    # Prevent propagation to root logger to avoid duplicate logs
    logger.propagate = False

    return logger


def _create_formatter() -> logging.Formatter:
    """
    Create a log formatter based on settings.

    Returns:
        Configured logging.Formatter instance
    """
    if getattr(settings, 'LOG_JSON_FORMAT', False):
        # JSON formatter for production
        return JsonFormatter()
    else:
        # Human-readable formatter for development
        log_format = (
            "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
        )
        date_format = "%Y-%m-%d %H:%M:%S"
        return logging.Formatter(log_format, datefmt=date_format)


class JsonFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging without external dependencies."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        import json
        from datetime import datetime

        log_data = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)

        # Add context variables
        context = log_context.get()
        if context:
            log_data["context"] = context

        return json.dumps(log_data)


def set_log_context(**kwargs: Any) -> None:
    """
    Set context variables that will be included in all subsequent logs.

    This is useful for adding request-scoped data like request_id, user_id, etc.

    Args:
        **kwargs: Key-value pairs to add to log context

    Example:
        >>> set_log_context(request_id="123", user_id="456")
        >>> logger.info("Processing request")  # Will include request_id and user_id
    """
    current_context = log_context.get().copy()
    current_context.update(kwargs)
    log_context.set(current_context)


def clear_log_context() -> None:
    """Clear all context variables."""
    log_context.set({})


def get_log_context() -> Dict[str, Any]:
    """
    Get current log context.

    Returns:
        Dictionary of current context variables
    """
    return log_context.get().copy()
