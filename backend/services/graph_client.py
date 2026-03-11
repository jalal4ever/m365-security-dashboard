from msal import ConfidentialClientApplication
from app.config import settings

app = ConfidentialClientApplication(
    client_id=settings.azure_client_id,
    client_credential=settings.azure_client_secret,
    authority=f"https://login.microsoftonline.com/{settings.azure_tenant_id}"
)

scopes = ["https://graph.microsoft.com/.default"]


def get_access_token():
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
