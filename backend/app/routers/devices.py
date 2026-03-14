from fastapi import APIRouter, Query
from services.device_compliance import get_device_compliance
from services.devices import get_devices
from services.compliance import get_compliance

router = APIRouter()


@router.get("/devices")
async def devices(config_id: int | None = Query(None, description="Azure config ID")):
    return await get_device_compliance(config_id)


@router.get("/devices-os")
async def devices_os():
    return await get_devices()


@router.get("/devices-compliance")
async def devices_compliance():
    return await get_compliance()
