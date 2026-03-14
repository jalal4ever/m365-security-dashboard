from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from services.azure_config import AzureConfigService
from services.encryption import test_azure_connection

router = APIRouter(prefix="/api/azure", tags=["Azure Configuration"])


class AzureConfigCreate(BaseModel):
    tenant_id: str
    client_id: str
    client_secret: str
    tenant_name: str | None = None
    is_default: bool = False


class AzureConfigResponse(BaseModel):
    tenant_id: str
    client_id: str
    tenant_name: str | None = None
    is_default: bool = False
    is_active: bool
    created_at: str | None
    updated_at: str | None


class AzureConfigTest(BaseModel):
    tenant_id: str
    client_id: str
    client_secret: str


@router.get("/config", response_model=AzureConfigResponse | None)
def get_config(db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    config = service.get_config()
    if not config:
        return None
    return AzureConfigResponse(**config)


@router.get("/configs")
def get_all_configs(db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    return service.get_all_configs()


@router.post("/config")
def save_config(config: AzureConfigCreate, db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    result = service.save_config(
        config.tenant_id, 
        config.client_id, 
        config.client_secret,
        config.tenant_name,
        config.is_default
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.post("/default/{config_id}")
def set_default(config_id: int, db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    result = service.set_default(config_id)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.post("/test")
def test_config(config: AzureConfigTest, db: Session = Depends(get_db)):
    success = test_azure_connection(config.tenant_id, config.client_id, config.client_secret)
    if success:
        return {"status": "success", "message": "Azure connection successful"}
    return {"status": "error", "message": "Azure connection failed - verify credentials and permissions"}


@router.delete("/config/{config_id}")
def delete_config(config_id: int, db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    result = service.delete_config(config_id)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.delete("/config")
def delete_config_default(db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    result = service.delete_config()
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.post("/test")
def test_config(config: AzureConfigCreate, db: Session = Depends(get_db)):
    success = test_azure_connection(config.tenant_id, config.client_id, config.client_secret)
    if success:
        return {"status": "success", "message": "Azure connection successful"}
    return {"status": "error", "message": "Azure connection failed - verify credentials and permissions"}


@router.delete("/config")
def delete_config(db: Session = Depends(get_db)):
    service = AzureConfigService(db)
    result = service.delete_config()
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result
