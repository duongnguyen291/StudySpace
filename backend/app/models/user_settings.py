"""
User Settings Model
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base


class UserSettings(Base):
    """
    User Settings model
    """
    __tablename__ = "user_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme_mode = Column(String(10), default="light", nullable=False)
    pomodoro_work_duration = Column(Integer, default=25, nullable=False)
    pomodoro_break_duration = Column(Integer, default=5, nullable=False)
    pomodoro_long_break_duration = Column(Integer, default=15, nullable=False)
    default_music_playlist = Column(String(50), nullable=True)
    notification_enabled = Column(Boolean, default=True, nullable=False)
    language = Column(String(10), default="vi", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="settings")

