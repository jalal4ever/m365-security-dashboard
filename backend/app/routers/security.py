from fastapi import APIRouter, Query
from services.security_score import get_secure_score

router = APIRouter()


@router.get("/security/score")
async def security_score(config_id: int | None = Query(None, description="Azure config ID")):
    return await get_secure_score(config_id)
