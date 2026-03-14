from fastapi import APIRouter, Query
from services.security_score import get_secure_score
from services.risky_users import get_risky_users

router = APIRouter()


@router.get("/security/score")
async def security_score():
    return await get_secure_score()


@router.get("/security/risky-users")
async def risky_users(config_id: int | None = Query(None, description="Azure config ID")):
    return await get_risky_users(config_id)
