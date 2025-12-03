"""Notes API endpoints"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.security import get_current_user_id
from app.schemas.notes import NoteCreate, NoteUpdate, NoteResponse, TagCreate
from app.services.note_service import NoteService


router = APIRouter()


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
    current_user_id_str: str = Depends(get_current_user_id),
    db: Session = Depends(get_database),
):
    """Get all notes for current user.

    Optional filter by `is_quick_note` to support Quick Notes tab.
    """
    current_user_id = UUID(current_user_id_str)
    service = NoteService(db)
    return service.get_notes(current_user_id, is_quick_note=is_quick_note)


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


