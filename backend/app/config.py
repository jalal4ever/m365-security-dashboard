from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    azure_client_id: str
    azure_client_secret: str
    azure_tenant_id: str
    secret_key: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
