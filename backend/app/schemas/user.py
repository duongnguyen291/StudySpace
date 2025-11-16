"""
User Schemas
Pydantic models for user requests and responses
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"

