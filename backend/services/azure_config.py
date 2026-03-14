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
            "tenant_name": config.tenant_name,
            "is_default": config.is_default,
            "is_active": config.is_active,
            "created_at": config.created_at.isoformat() if config.created_at else None,
            "updated_at": config.updated_at.isoformat() if config.updated_at else None
        }

    def get_all_configs(self) -> list:
        configs = self.db.query(AzureConfig).filter(AzureConfig.is_active).all()
        return [
            {
                "id": c.id,
                "tenant_id": decrypt_value(c.tenant_id_encrypted),
                "client_id": decrypt_value(c.client_id_encrypted),
                "tenant_name": c.tenant_name or f"Tenant {c.id}",
                "is_default": c.is_default,
                "is_active": c.is_active,
            }
            for c in configs
        ]

    def save_config(self, tenant_id: str, client_id: str, client_secret: str, tenant_name: str = None, is_default: bool = False) -> dict:
        existing = self.db.query(AzureConfig).filter(AzureConfig.is_active).first()
        
        if existing:
            existing.tenant_id_encrypted = encrypt_value(tenant_id)
            existing.client_id_encrypted = encrypt_value(client_id)
            existing.client_secret_hash = hash_password(client_secret)
            if tenant_name is not None:
                existing.tenant_name = tenant_name
            if is_default:
                self.db.query(AzureConfig).filter(AzureConfig.id != existing.id).update({"is_default": False})
        else:
            new_config = AzureConfig(
                tenant_id_encrypted=encrypt_value(tenant_id),
                client_id_encrypted=encrypt_value(client_id),
                client_secret_hash=hash_password(client_secret),
                tenant_name=tenant_name,
                is_default=is_default,
                is_active=True
            )
            self.db.add(new_config)
        
        self.db.commit()
        return {"status": "success", "message": "Configuration saved securely"}

    def set_default(self, config_id: int) -> dict:
        self.db.query(AzureConfig).update({"is_default": False})
        config = self.db.query(AzureConfig).filter(AzureConfig.id == config_id).first()
        if config:
            config.is_default = True
            self.db.commit()
            return {"status": "success", "message": "Default tenant set"}
        return {"status": "error", "message": "Configuration not found"}

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

    def delete_config(self, config_id: int = None) -> dict:
        if config_id:
            config = self.db.query(AzureConfig).filter(AzureConfig.id == config_id).first()
        else:
            config = self.db.query(AzureConfig).filter(AzureConfig.is_active).first()
        
        if config:
            config.is_active = False
            self.db.commit()
            return {"status": "success", "message": "Configuration deleted"}
        return {"status": "error", "message": "No configuration to delete"}
