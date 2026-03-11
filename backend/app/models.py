from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base


class SecurityScore(Base):
    __tablename__ = "security_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    score = Column(Float)
    max_score = Column(Float)
    percentage = Column(Float)
    captured_at = Column(DateTime, default=datetime.utcnow)


class AdminRole(Base):
    __tablename__ = "admin_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_principal_name = Column(String)
    display_name = Column(String)
    role_name = Column(String)
    is_privileged = Column(String)
    captured_at = Column(DateTime, default=datetime.utcnow)


class License(Base):
    __tablename__ = "licenses"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True)
    sku_id = Column(String)
    sku_part_number = Column(String)
    consumed_units = Column(Integer)
    total_licenses = Column(Integer)
    available_licenses = Column(Integer)
    captured_at = Column(DateTime, default=datetime.utcnow)


class UserMfa(Base):
    __tablename__ = "user_mfa"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_principal_name = Column(String)
    display_name = Column(String)
    mfa_enabled = Column(String)
    auth_methods = Column(String)
    captured_at = Column(DateTime, default=datetime.utcnow)
