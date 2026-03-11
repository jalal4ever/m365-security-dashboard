from fastapi import APIRouter
from services.admin_roles import get_admin_roles

router = APIRouter()


@router.get("/admins")
async def admins():
    return await get_admin_roles()
