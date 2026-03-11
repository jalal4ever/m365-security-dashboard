from fastapi import APIRouter
from services.mfa_audit import get_mfa_status

router = APIRouter()


@router.get("/mfa")
async def mfa():
    return await get_mfa_status()
