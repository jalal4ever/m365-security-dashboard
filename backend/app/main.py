import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import security, admins, licenses, mfa, azure, github
from app.database import engine
from app import models
from services.logging_service import setup_exception_handlers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/app.log", mode="a")
    ]
)
logger = logging.getLogger(__name__)

os.makedirs("logs", exist_ok=True)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="M365 Security Dashboard API",
    description="API pour la supervision de la sécurité Microsoft 365",
    version="1.0.0"
)

setup_exception_handlers(app)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(security.router, prefix="/api", tags=["security"])
app.include_router(admins.router, prefix="/api", tags=["admins"])
app.include_router(licenses.router, prefix="/api", tags=["licenses"])
app.include_router(mfa.router, prefix="/api", tags=["mfa"])
app.include_router(azure.router, tags=["Azure Configuration"])
app.include_router(github.router, tags=["GitHub Integration"])


@app.get("/api/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}
