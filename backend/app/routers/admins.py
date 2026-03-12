from fastapi import APIRouter
from services.admin_roles import get_admin_roles

router = APIRouter()


@router.get("/admins")
async def admins():
    result = await get_admin_roles()
    if "global_admins" not in result and result.get("admins"):
        result["global_admins"] = len([admin for admin in result["admins"] if admin["role_name"] == "Global Administrator"])
    return result
