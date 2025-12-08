"""Business logic for Notes feature"""
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.note_repo import NoteRepository, NoteCategoryRepository
from app.schemas.notes import (
    NoteCreate, NoteUpdate, NoteResponse,
    NoteCategoryCreate, NoteCategoryUpdate, NoteCategoryResponse,
)
from app.models.note import Note, NoteCategory


class NoteCategoryService:
    """Service layer for note categories"""

    def __init__(self, db: Session) -> None:
        self.repo = NoteCategoryRepository(db)

    def _to_response(self, category: NoteCategory) -> NoteCategoryResponse:
        return NoteCategoryResponse(
            id=category.id,
            user_id=category.user_id,
            name=category.name,
            color=category.color,
            icon=category.icon,
            is_default=category.is_default,
            created_at=category.created_at,
            updated_at=category.updated_at,
        )

    def get_categories(self, user_id: UUID) -> List[NoteCategoryResponse]:
        """Get all note categories for user. Creates defaults if none exist."""
        if not self.repo.user_has_categories(user_id):
            self.repo.create_defaults_for_user(user_id)
        categories = self.repo.get_all_for_user(user_id)
        return [self._to_response(c) for c in categories]

    def get_category(self, user_id: UUID, category_id: UUID) -> NoteCategoryResponse:
        category = self.repo.get_by_id_for_user(category_id, user_id)
        if not category:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note category not found",
            )
        return self._to_response(category)

    def create_category(self, user_id: UUID, data: NoteCategoryCreate) -> NoteCategoryResponse:
        category = self.repo.create(
            user_id=user_id,
            name=data.name.strip(),
            color=data.color,
            icon=data.icon,
            is_default=False,
        )
        return self._to_response(category)

    def update_category(self, user_id: UUID, category_id: UUID, data: NoteCategoryUpdate) -> NoteCategoryResponse:
        category = self.repo.get_by_id_for_user(category_id, user_id)
        if not category:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note category not found",
            )
        payload = data.model_dump(exclude_unset=True)
        if "name" in payload:
            payload["name"] = payload["name"].strip()
        updated = self.repo.update(category, payload)
        return self._to_response(updated)

    def delete_category(self, user_id: UUID, category_id: UUID) -> None:
        category = self.repo.get_by_id_for_user(category_id, user_id)
        if not category:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note category not found",
            )
        self.repo.delete(category)


class NoteService:
    """Service layer for notes"""

    def __init__(self, db: Session) -> None:
        self.repo = NoteRepository(db)

    def _to_response(self, note: Note) -> NoteResponse:
        """Convert ORM Note to Pydantic NoteResponse with string tags."""
        category_response = None
        if note.category:
            category_response = NoteCategoryResponse(
                id=note.category.id,
                user_id=note.category.user_id,
                name=note.category.name,
                color=note.category.color,
                icon=note.category.icon,
                is_default=note.category.is_default,
                created_at=note.category.created_at,
                updated_at=note.category.updated_at,
            )
        
        return NoteResponse(
            id=note.id,
            user_id=note.user_id,
            category_id=note.category_id,
            category=category_response,
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

    def get_notes(
        self, 
        user_id: UUID, 
        is_quick_note: bool | None = None,
        category_id: UUID | None = None,
    ) -> List[NoteResponse]:
        notes = self.repo.get_all_for_user(
            user_id, 
            is_quick_note=is_quick_note,
            category_id=category_id,
        )
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
