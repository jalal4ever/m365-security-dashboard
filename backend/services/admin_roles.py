import httpx
from services.graph_client import get_graph_headers, is_configured


PRIVILEGED_ROLES = [
    "Global Administrator",
    "Privileged Role Administrator",
    "Exchange Administrator",
    "SharePoint Administrator",
    "User Administrator",
    "Billing Administrator",
    "Helpdesk Administrator",
    "Security Administrator"
]


async def get_admin_roles():
    if not is_configured():
        return {
            "total_admins": 0,
            "privileged_admins": 0,
            "admins": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/directoryRoles",
            headers=headers
        )
        
        if response.status_code != 200:
            return {"error": "Failed to fetch directory roles", "details": response.text}
        
        data = response.json()
        admins = []
        
        for role in data.get("value", []):
            role_template_id = role.get("roleTemplateId")
            role_name = role.get("displayName")
            
            members_response = await client.get(
                f"https://graph.microsoft.com/v1.0/directoryRoles/{role['id']}/members",
                headers=headers
            )
            
            if members_response.status_code == 200:
                members_data = members_response.json()
                for member in members_data.get("value", []):
                    admins.append({
                        "user_id": member.get("id"),
                        "user_principal_name": member.get("userPrincipalName", ""),
                        "display_name": member.get("displayName", ""),
                        "role_name": role_name,
                        "is_privileged": role_name in PRIVILEGED_ROLES
                    })
        
    global_admins = len([a for a in admins if a["role_name"] == "Global Administrator"])
    return {
        "total_admins": len(admins),
        "privileged_admins": len([a for a in admins if a["is_privileged"]]),
        "global_admins": global_admins,
        "admins": admins
    }
