from msal import ConfidentialClientApplication
from app.config import settings

app = None

if settings.azure_client_id and settings.azure_client_secret and settings.azure_tenant_id:
    try:
        app = ConfidentialClientApplication(
            client_id=settings.azure_client_id,
            client_credential=settings.azure_client_secret,
            authority=f"https://login.microsoftonline.com/{settings.azure_tenant_id}"
        )
    except Exception:
        app = None

scopes = ["https://graph.microsoft.com/.default"]


def is_configured() -> bool:
    return app is not None


def get_access_token():
    if not app:
        raise Exception("Azure credentials not configured. Please configure via Settings page or .env file.")
    
    result = app.acquire_token_for_client(scopes=scopes)
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Failed to acquire token: {result.get('error_description', result.get('error'))}")


def get_graph_headers():
    return {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json"
    }
