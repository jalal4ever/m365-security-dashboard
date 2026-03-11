from fastapi import APIRouter
from services.licenses import get_licenses

router = APIRouter()


@router.get("/licenses")
async def licenses():
    return await get_licenses()
