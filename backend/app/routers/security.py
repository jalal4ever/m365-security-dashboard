from fastapi import APIRouter
from services.security_score import get_secure_score

router = APIRouter()


@router.get("/security/score")
async def security_score():
    return await get_secure_score()
