import logging
import json
import traceback
from datetime import datetime
from typing import Optional, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/app.log", mode="a")
    ]
)
logger = logging.getLogger("m365-dashboard")


class LogService:
    def __init__(self):
        self.logger = logger

    def _serialize(self, data: Any) -> Any:
        if isinstance(data, dict):
            return {k: self._serialize(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._serialize(item) for item in data]
        elif hasattr(data, "__dict__"):
            return str(data)
        return data

    def info(self, message: str, **kwargs):
        self.logger.info(message, extra=self._serialize(kwargs))

    def warning(self, message: str, **kwargs):
        self.logger.warning(message, extra=self._serialize(kwargs))

    def error(self, message: str, error: Optional[Exception] = None, **kwargs):
        extra = self._serialize(kwargs)
        if error:
            extra["error_type"] = type(error).__name__
            extra["error_message"] = str(error)
            extra["traceback"] = traceback.format_exc()
        self.logger.error(message, extra=extra)

    def debug(self, message: str, **kwargs):
        self.logger.debug(message, extra=self._serialize(kwargs))

    def log_request(self, request: Request, user_id: Optional[str] = None):
        self.info(
            f"Request: {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            user_id=user_id,
            client_ip=request.client.host if request.client else None
        )

    def log_response(self, request: Request, status_code: int, duration_ms: float):
        self.info(
            f"Response: {status_code} for {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            status_code=status_code,
            duration_ms=duration_ms
        )

    def log_api_error(self, request: Request, error: Exception, status_code: int):
        self.error(
            f"API Error: {status_code}",
            error=error,
            path=request.url.path,
            method=request.method,
            status_code=status_code
        )

    def log_security_event(self, event: str, details: dict):
        self.warning(
            f"Security Event: {event}",
            event=event,
            **details
        )


log_service = LogService()


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    log_service.log_api_error(request, exc, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    log_service.log_api_error(request, exc, status.HTTP_422_UNPROCESSABLE_ENTITY)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "details": exc.errors(),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    log_service.log_api_error(request, exc, status.HTTP_500_INTERNAL_SERVER_ERROR)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def setup_exception_handlers(app):
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
