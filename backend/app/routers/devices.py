from fastapi import APIRouter, Query
from services.device_compliance import get_device_compliance

router = APIRouter()


@router.get("/devices")
async def devices(config_id: int | None = Query(None, description="Azure config ID")):
    return await get_device_compliance(config_id)
