import httpx
import asyncio
from services.graph_client import get_graph_headers


async def get_user_mfa(client: httpx.AsyncClient, headers: dict, user: dict) -> dict:
    user_id = user.get("id")
    
    try:
        auth_response = await client.get(
            f"https://graph.microsoft.com/v1.0/users/{user_id}/authentication/methods",
            headers=headers,
            timeout=10.0
        )
        
        mfa_enabled = False
        auth_methods = []
        
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            methods = auth_data.get("value", [])
            if methods:
                mfa_enabled = True
                auth_methods = [m.get("@odata.type", "").split(".")[-1] for m in methods]
        
        return {
            "user_id": user_id,
            "user_principal_name": user.get("userPrincipalName"),
            "display_name": user.get("displayName"),
            "mfa_enabled": mfa_enabled,
            "auth_methods": auth_methods
        }
    except Exception:
        return {
            "user_id": user_id,
            "user_principal_name": user.get("userPrincipalName"),
            "display_name": user.get("displayName"),
            "mfa_enabled": False,
            "auth_methods": []
        }


async def get_mfa_status():
    headers = get_graph_headers()
    async with httpx.AsyncClient() as client:
        users_response = await client.get(
            "https://graph.microsoft.com/v1.0/users?$select=id,displayName,userPrincipalName&$top=999",
            headers=headers
        )
        
        if users_response.status_code != 200:
            return {"error": "Failed to fetch users", "details": users_response.text}
        
        users_data = users_response.json()
        users = users_data.get("value", [])
        
        semaphore = asyncio.Semaphore(10)
        
        async def limited_get_mfa(user):
            async with semaphore:
                return await get_user_mfa(client, headers, user)
        
        results = await asyncio.gather(*[limited_get_mfa(user) for user in users])
        
        mfa_users = [r for r in results if r["mfa_enabled"]]
        no_mfa_users = [r for r in results if not r["mfa_enabled"]]
        
        total_users = len(mfa_users) + len(no_mfa_users)
        mfa_percentage = (len(mfa_users) / total_users * 100) if total_users > 0 else 0
        
        return {
            "total_users": total_users,
            "mfa_enabled_count": len(mfa_users),
            "mfa_disabled_count": len(no_mfa_users),
            "mfa_percentage": round(mfa_percentage, 2),
            "users_with_mfa": mfa_users,
            "users_without_mfa": no_mfa_users
        }
