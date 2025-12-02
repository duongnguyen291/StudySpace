"""Pydantic schemas for Notes feature"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    """Payload for adding a tag to a note"""

    tag_name: str = Field(..., max_length=50)
