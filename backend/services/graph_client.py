from msal import ConfidentialClientApplication
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal
from app.models import AzureConfig
from services.encryption import decrypt_value

scopes = ["https://graph.microsoft.com/.default"]

_app_cache = {}


def _get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass


def _get_config_from_db():
    db = _get_db()
    try:
        config = db.query(AzureConfig).filter(
            AzureConfig.is_active == True,
            AzureConfig.is_default == True
        ).first()
        
        if not config:
            config = db.query(AzureConfig).filter(AzureConfig.is_active == True).first()
        
        if config:
            client_secret = ""
            if config.client_secret_encrypted:
                client_secret = decrypt_value(config.client_secret_encrypted)
            elif config.client_secret_hash:
                client_secret = ""
            
            return {
                "tenant_id": decrypt_value(config.tenant_id_encrypted),
                "client_id": decrypt_value(config.client_id_encrypted),
                "client_secret": client_secret
            }
        return None
    finally:
        db.close()


def _create_app(tenant_id: str, client_id: str, client_secret: str):
    try:
        return ConfidentialClientApplication(
            client_id=client_id,
            client_credential=client_secret,
            authority=f"https://login.microsoftonline.com/{tenant_id}"
        )
    except Exception:
        return None


def _get_app():
    config = _get_config_from_db()
    if not config:
        return None
    
    cache_key = config["tenant_id"]
    if cache_key not in _app_cache:
        _app_cache[cache_key] = _create_app(
            config["tenant_id"],
            config["client_id"],
            config["client_secret"]
        )
    
    return _app_cache.get(cache_key)


def is_configured() -> bool:
    return _get_app() is not None


def get_access_token():
    app = _get_app()
    if not app:
        raise Exception("Azure credentials not configured. Please configure via Settings page or .env file.")
    
    config = _get_config_from_db()
    if not config:
        raise Exception("No Azure configuration found.")
    
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
