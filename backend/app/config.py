from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./m365_dashboard.db"
    azure_client_id: str = ""
    azure_client_secret: str = ""
    azure_tenant_id: str = ""
    secret_key: str = "dev-secret-key-change-in-production"
    github_token: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
