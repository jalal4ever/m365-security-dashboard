from fastapi import APIRouter, Query
from services.security_score import get_secure_score
from services.risky_users import get_risky_users
from services.defender_security import get_user_security_alerts

router = APIRouter()


@router.get("/security/score")
async def security_score():
    return await get_secure_score()


@router.get("/security/risky-users")
async def risky_users():
    return await get_risky_users()


@router.get("/security/user-alerts")
async def user_security_alerts():
    return await get_user_security_alerts()
