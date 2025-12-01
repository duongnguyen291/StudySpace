"""Repository for Notes feature"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.note import Note, NoteTag


class NoteRepository:
    """Data access for notes and note tags"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        user_id: UUID,
        title: str,
        content: str | None,
        category_id: UUID | None,
        is_pinned: bool,
        is_quick_note: bool,
        source_context: str | None,
        tags: list[str] | None,
    ) -> Note:
        note = Note(
            user_id=user_id,
            title=title,
            content=content,
            category_id=category_id,
            is_pinned=is_pinned,
            is_quick_note=is_quick_note,
            source_context=source_context,
        )
        self.db.add(note)
        self.db.flush()  # ensure note.id is available

        if tags:
            for name in tags:
                name = name.strip()
                if not name:
                    continue
                self.db.add(NoteTag(note_id=note.id, tag_name=name))

        self.db.commit()
        self.db.refresh(note)
        return note

    def get_by_id_for_user(self, note_id: UUID, user_id: UUID) -> Optional[Note]:
        return (
            self.db.query(Note)
            .filter(Note.id == note_id, Note.user_id == user_id)
            .first()
        )

    def get_all_for_user(self, user_id: UUID, is_quick_note: bool | None = None) -> List[Note]:
        query = self.db.query(Note).filter(Note.user_id == user_id)
        if is_quick_note is not None:
            query = query.filter(Note.is_quick_note == is_quick_note)
        return query.order_by(Note.created_at.desc()).all()

    def update(self, note: Note, data: dict, tags: list[str] | None = None) -> Note:
        for field, value in data.items():
            setattr(note, field, value)

        if tags is not None:
            # Clear old tags and re-create
            self.db.query(NoteTag).filter(NoteTag.note_id == note.id).delete()
            for name in tags:
                name = name.strip()
                if not name:
                    continue
                self.db.add(NoteTag(note_id=note.id, tag_name=name))

        self.db.commit()
        self.db.refresh(note)
        return note

    def delete(self, note: Note) -> None:
        self.db.delete(note)
        self.db.commit()

    def add_tag(self, note: Note, tag_name: str) -> Note:
        tag_name = tag_name.strip()
        if not tag_name:
            return note
        self.db.add(NoteTag(note_id=note.id, tag_name=tag_name))
        self.db.commit()
        self.db.refresh(note)
        return note
