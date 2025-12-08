"""
Profile Schemas
Pydantic models for profile requests and responses
"""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class ProfileResponse(BaseModel):
    """Schema for profile response"""
    id: UUID
    email: str
    username: str
    avatar_url: Optional[str] = None
    total_study_hours: float = Field(default=0.0, description="Total study hours in hours")
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    """Schema for updating profile"""
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    avatar_url: Optional[str] = None

