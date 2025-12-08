"""Pydantic schemas for Notes feature"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ============================================
# NOTE CATEGORY SCHEMAS
# ============================================
class NoteCategoryBase(BaseModel):
    """Shared fields for note categories"""
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#3B82F6", max_length=7)
    icon: str = Field(default="folder", max_length=50)


class NoteCategoryCreate(NoteCategoryBase):
    """Payload for creating a note category"""
    pass


class NoteCategoryUpdate(BaseModel):
    """Payload for updating a note category"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, max_length=7)
    icon: Optional[str] = Field(None, max_length=50)


class NoteCategoryResponse(NoteCategoryBase):
    """Response model for note categories"""
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# NOTE SCHEMAS
# ============================================
class NoteBase(BaseModel):
    """Shared fields for notes"""

    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    category_id: Optional[UUID] = None
    is_pinned: bool = False
    is_quick_note: bool = False
    source_context: Optional[str] = None
    theme: str = Field(default="standard", max_length=50)
    tags: List[str] = []


class NoteCreate(NoteBase):
    """Payload for creating a note"""

    content: str


class NoteUpdate(BaseModel):
    """Payload for updating a note"""

    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    category_id: Optional[UUID] = None
    is_pinned: Optional[bool] = None
    is_quick_note: Optional[bool] = None
    source_context: Optional[str] = None
    theme: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None


class NoteResponse(NoteBase):
    """Response model for notes"""

    id: UUID
    user_id: UUID
    category: Optional[NoteCategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    """Payload for adding a tag to a note"""

    tag_name: str = Field(..., max_length=50)
