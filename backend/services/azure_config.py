from sqlalchemy.orm import Session
from app.models import AzureConfig
from services.encryption import (
    encrypt_value,
    decrypt_value,
    hash_password,
    test_azure_connection
)


class AzureConfigService:
    def __init__(self, db: Session):
        self.db = db

    def get_config(self) -> dict | None:
        config = self.db.query(AzureConfig).filter(AzureConfig.is_active).first()
        if not config:
            return None
        return {
            "tenant_id": decrypt_value(config.tenant_id_encrypted),
            "client_id": decrypt_value(config.client_id_encrypted),
            "is_active": config.is_active,
            "created_at": config.created_at.isoformat() if config.created_at else None,
            "updated_at": config.updated_at.isoformat() if config.updated_at else None
        }

    def save_config(self, tenant_id: str, client_id: str, client_secret: str) -> dict:
        existing = self.db.query(AzureConfig).filter(AzureConfig.is_active).first()
        
        if existing:
            existing.tenant_id_encrypted = encrypt_value(tenant_id)
            existing.client_id_encrypted = encrypt_value(client_id)
            existing.client_secret_hash = hash_password(client_secret)
        else:
            new_config = AzureConfig(
                tenant_id_encrypted=encrypt_value(tenant_id),
                client_id_encrypted=encrypt_value(client_id),
                client_secret_hash=hash_password(client_secret),
                is_active=True
            )
            self.db.add(new_config)
        
        self.db.commit()
        return {"status": "success", "message": "Configuration saved securely"}

    def test_connection(self) -> dict:
        config = self.get_config()
        if not config:
            return {"status": "error", "message": "No configuration found"}
        
        success = test_azure_connection(
            config["tenant_id"],
            config["client_id"],
            "" 
        )
        
        if success:
            return {"status": "success", "message": "Connection successful"}
        return {"status": "error", "message": "Connection failed - please verify credentials"}

    def delete_config(self) -> dict:
        config = self.db.query(AzureConfig).filter(AzureConfig.is_active).first()
        if config:
            config.is_active = False
            self.db.commit()
            return {"status": "success", "message": "Configuration deleted"}
        return {"status": "error", "message": "No configuration to delete"}
