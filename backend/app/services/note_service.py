"""Business logic for Notes feature"""
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.note_repo import NoteRepository
from app.schemas.notes import NoteCreate, NoteUpdate, NoteResponse
from app.models.note import Note


class NoteService:
    """Service layer for notes"""

    def __init__(self, db: Session) -> None:
        self.repo = NoteRepository(db)

    def _to_response(self, note: Note) -> NoteResponse:
        """Convert ORM Note to Pydantic NoteResponse with string tags."""
        return NoteResponse(
            id=note.id,
            user_id=note.user_id,
            category_id=note.category_id,
            title=note.title,
            content=note.content,
            is_pinned=note.is_pinned,
            is_quick_note=note.is_quick_note,
            source_context=note.source_context,
            theme=note.theme,
            created_at=note.created_at,
            updated_at=note.updated_at,
            tags=[t.tag_name for t in note.tags],
        )

    def create_note(self, user_id: UUID, data: NoteCreate) -> NoteResponse:
        title = (data.title or "").strip()
        content = (data.content or "").strip()

        if not title and content:
            # Auto-generate a short title from content if missing
            title = content[:50]

        note = self.repo.create(
            user_id=user_id,
            title=title or "Untitled",
            content=content or None,
            category_id=data.category_id,
            is_pinned=data.is_pinned,
            is_quick_note=data.is_quick_note,
            source_context=data.source_context,
            theme=data.theme or "standard",
            tags=data.tags or [],
        )
        return self._to_response(note)

    def get_notes(self, user_id: UUID, is_quick_note: bool | None = None) -> List[NoteResponse]:
        notes = self.repo.get_all_for_user(user_id, is_quick_note=is_quick_note)
        return [self._to_response(n) for n in notes]

    def get_note(self, user_id: UUID, note_id: UUID) -> NoteResponse:
        note = self.repo.get_by_id_for_user(note_id, user_id)
        if not note:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        return self._to_response(note)

    def update_note(self, user_id: UUID, note_id: UUID, data: NoteUpdate) -> NoteResponse:
        note = self.repo.get_by_id_for_user(note_id, user_id)
        if not note:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        payload = data.model_dump(exclude_unset=True)
        tags = payload.pop("tags", None)
        updated = self.repo.update(note, payload, tags=tags)
        return self._to_response(updated)

    def delete_note(self, user_id: UUID, note_id: UUID) -> None:
        note = self.repo.get_by_id_for_user(note_id, user_id)
        if not note:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        self.repo.delete(note)

    def add_tag(self, user_id: UUID, note_id: UUID, tag_name: str) -> NoteResponse:
        note = self.repo.get_by_id_for_user(note_id, user_id)
        if not note:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        updated = self.repo.add_tag(note, tag_name)
        return self._to_response(updated)
