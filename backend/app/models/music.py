"""
Music Playlist Model
"""
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.core.database import Base


class MusicPlaylist(Base):
    """
    Music Playlist model - matches database schema
    """
    __tablename__ = "music_playlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    playlist_type = Column(String(50), nullable=True)  # 'lofi', 'piano', 'rain', 'nature', 'ambient'
    audio_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)