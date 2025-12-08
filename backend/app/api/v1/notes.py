"""Notes API endpoints"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.security import get_current_user_id
from app.schemas.notes import (
    NoteCreate, NoteUpdate, NoteResponse, TagCreate,
    NoteCategoryCreate, NoteCategoryUpdate, NoteCategoryResponse,
)
from app.services.note_service import NoteService, NoteCategoryService


router = APIRouter()


# ============================================
# NOTE CATEGORY ENDPOINTS
# ============================================

@router.get("/categories", response_model=List[NoteCategoryResponse])
async def get_note_categories(
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Get all note categories for current user. Creates defaults if none exist."""
    current_user_id = UUID(current_user_id_str)
    service = NoteCategoryService(db)
    return service.get_categories(current_user_id)


@router.post("/categories", response_model=NoteCategoryResponse)
async def create_note_category(
    payload: NoteCategoryCreate,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Create a new note category."""
    current_user_id = UUID(current_user_id_str)
    service = NoteCategoryService(db)
    return service.create_category(current_user_id, payload)


@router.get("/categories/{category_id}", response_model=NoteCategoryResponse)
async def get_note_category(
    category_id: UUID,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Get a specific note category by ID."""
    current_user_id = UUID(current_user_id_str)
    service = NoteCategoryService(db)
    return service.get_category(current_user_id, category_id)


@router.put("/categories/{category_id}", response_model=NoteCategoryResponse)
async def update_note_category(
    category_id: UUID,
    payload: NoteCategoryUpdate,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Update a note category."""
    current_user_id = UUID(current_user_id_str)
    service = NoteCategoryService(db)
    return service.update_category(current_user_id, category_id, payload)


@router.delete("/categories/{category_id}")
async def delete_note_category(
    category_id: UUID,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Delete a note category."""
    current_user_id = UUID(current_user_id_str)
    service = NoteCategoryService(db)
    service.delete_category(current_user_id, category_id)
    return {"message": "Note category deleted"}


# ============================================
# NOTE ENDPOINTS
# ============================================

@router.post("/", response_model=NoteResponse)
async def create_note(
    payload: NoteCreate,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Create a new note (including quick notes)."""
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.create_note(current_user_id, payload)


@router.get("/", response_model=List[NoteResponse])
async def get_notes(
    is_quick_note: Optional[bool] = None,
    category_id: Optional[UUID] = None,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Get all notes for current user.

    Optional filters:
    - `is_quick_note`: Filter by quick note status
    - `category_id`: Filter by category
    """
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.get_notes(
        current_user_id, 
        is_quick_note=is_quick_note,
        category_id=category_id,
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Get a specific note by ID for current user."""
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.get_note(current_user_id, note_id)


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    payload: NoteUpdate,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Update an existing note."""
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.update_note(current_user_id, note_id, payload)


@router.delete("/{note_id}")
async def delete_note(
    note_id: UUID,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Delete a note."""
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    service.delete_note(current_user_id, note_id)
    return {"message": "Note deleted"}


@router.post("/{note_id}/tags", response_model=NoteResponse)
async def add_tag_to_note(
    note_id: UUID,
    payload: TagCreate,
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Add a tag to a note."""
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.add_tag(current_user_id, note_id, payload.tag_name)


