from fastapi import APIRouter
from services.intune_compliance import get_device_compliance
from services.intune_os_versions import get_os_version_stats

router = APIRouter(prefix="/api", tags=["Intune"])


@router.get("/intune/compliance")
async def read_device_compliance():
    return await get_device_compliance()


@router.get("/intune/os-versions")
async def read_os_versions():
    return await get_os_version_stats()
