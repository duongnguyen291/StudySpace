"""
Music Playlist Schemas
Request/Response models
"""
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class MusicPlaylistBase(BaseModel):
    """Base schema for music playlist"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    playlist_type: Optional[str] = Field(None, max_length=50)  # 'lofi', 'piano', 'rain', 'nature', 'ambient'
    audio_url: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, ge=0)


class MusicPlaylistCreate(MusicPlaylistBase):
    """Schema for creating a playlist"""
    pass


class MusicPlaylistUpdate(BaseModel):
    """Schema for updating a playlist"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    playlist_type: Optional[str] = Field(None, max_length=50)
    audio_url: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class MusicPlaylistResponse(MusicPlaylistBase):
    """Schema for playlist response"""
    id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True