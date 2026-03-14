import httpx
from typing import AsyncGenerator
from services.graph_client import get_graph_headers


MFA_FILTER_DOMAIN = "entis.onmicrosoft.com"
SERVICE_ACCOUNT_PREFIXES = ("svc_", "svc-", "svc.")
EXCLUDE_KEYWORDS = ("#ext#", "contact")


def _should_skip_user(upn: str, user_type: str) -> bool:
    if not upn:
        return True

    upn = upn.lower()
    user_type = (user_type or "").lower()

    if user_type != "member":
        return True

    if not upn.endswith(f"@{MFA_FILTER_DOMAIN}"):
        return True

    if any(upn.startswith(prefix) for prefix in SERVICE_ACCOUNT_PREFIXES):
        return True

    if any(keyword in upn for keyword in EXCLUDE_KEYWORDS):
        return True

    return False


async def _fetch_registration_report() -> AsyncGenerator[dict, None]:
    headers = get_graph_headers()
    async with httpx.AsyncClient() as client:
        url = "https://graph.microsoft.com/v1.0/reports/authenticationMethods/userRegistrationDetails"
        while url:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                raise RuntimeError(f"Failed to fetch MFA report ({response.status_code}) {response.text}")

            data = response.json()
            for entry in data.get("value", []):
                yield entry

            url = data.get("@odata.nextLink")


async def get_mfa_status():
    entries = []
    try:
        async for user in _fetch_registration_report():
            entries.append(user)
    except RuntimeError as exc:
        return {"error": str(exc)}

    filtered = [u for u in entries if not _should_skip_user(u.get("userPrincipalName", ""), u.get("userType"))]
    total = len(filtered)

    capable = sum(1 for u in filtered if u.get("isMfaCapable"))
    registered = sum(1 for u in filtered if u.get("isMfaRegistered"))

    def _sample(key: str, count: int = 5):
        values = [u for u in filtered if u.get(key)]
        return [
            {
                "userPrincipalName": u.get("userPrincipalName"),
                "displayName": u.get("userDisplayName"),
                key: u.get(key),
                "methodsRegistered": u.get("methodsRegistered", [])
            }
            for u in values[:count]
        ]

    def _sample_missing(key: str, count: int = 5):
        values = [u for u in filtered if not u.get(key)]
        return [
            {
                "userPrincipalName": u.get("userPrincipalName"),
                "displayName": u.get("userDisplayName"),
                "missing": key
            }
            for u in values[:count]
        ]

    return {
        "total_users": total,
        "mfa_capable": capable,
        "mfa_registered": registered,
        "capable_percentage": round((capable / total * 100) if total else 0, 1),
        "registered_percentage": round((registered / total * 100) if total else 0, 1),
        "capable_sample": _sample("isMfaCapable"),
        "registered_sample": _sample("isMfaRegistered"),
        "not_capable_sample": _sample_missing("isMfaCapable"),
        "signins_mfa": None,
        "signins_sample": []
    }
