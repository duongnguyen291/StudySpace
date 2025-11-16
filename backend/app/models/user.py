"""
User Model
Placeholder - to be implemented
"""
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.core.database import Base


class User(Base):
    """
    User model
    TODO: Implement full user model based on database schema
    """
    __tablename__ = "users"
    
    # Placeholder fields - update based on database schema
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # TODO: Add all fields from database schema
    # password_hash, avatar_url, updated_at, last_login, is_active, preferences

