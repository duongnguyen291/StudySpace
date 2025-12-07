"""Repository for Notes feature"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.note import Note, NoteTag, NoteCategory


# Default note categories for new users
DEFAULT_NOTE_CATEGORIES = [
    {"name": "Học tập", "color": "#8B5CF6", "icon": "book"},
    {"name": "Ý tưởng", "color": "#F59E0B", "icon": "lightbulb"},
    {"name": "Nghiên cứu", "color": "#3B82F6", "icon": "search"},
    {"name": "Công việc", "color": "#10B981", "icon": "briefcase"},
    {"name": "Cá nhân", "color": "#EC4899", "icon": "user"},
]


class NoteCategoryRepository:
    """Data access for note categories"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        user_id: UUID,
        name: str,
        color: str = "#3B82F6",
        icon: str = "folder",
        is_default: bool = False,
    ) -> NoteCategory:
        category = NoteCategory(
            user_id=user_id,
            name=name,
            color=color,
            icon=icon,
            is_default=is_default,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def get_by_id_for_user(self, category_id: UUID, user_id: UUID) -> Optional[NoteCategory]:
        return (
            self.db.query(NoteCategory)
            .filter(NoteCategory.id == category_id, NoteCategory.user_id == user_id)
            .first()
        )

    def get_all_for_user(self, user_id: UUID) -> List[NoteCategory]:
        return (
            self.db.query(NoteCategory)
            .filter(NoteCategory.user_id == user_id)
            .order_by(NoteCategory.is_default.desc(), NoteCategory.name)
            .all()
        )

    def update(self, category: NoteCategory, data: dict) -> NoteCategory:
        for field, value in data.items():
            if value is not None:
                setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: NoteCategory) -> None:
        self.db.delete(category)
        self.db.commit()

    def create_defaults_for_user(self, user_id: UUID) -> List[NoteCategory]:
        """Create default note categories for a new user"""
        categories = []
        for cat_data in DEFAULT_NOTE_CATEGORIES:
            category = NoteCategory(
                user_id=user_id,
                name=cat_data["name"],
                color=cat_data["color"],
                icon=cat_data["icon"],
                is_default=True,
            )
            self.db.add(category)
            categories.append(category)
        self.db.commit()
        for cat in categories:
            self.db.refresh(cat)
        return categories

    def user_has_categories(self, user_id: UUID) -> bool:
        """Check if user already has note categories"""
        return self.db.query(NoteCategory).filter(NoteCategory.user_id == user_id).first() is not None


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
        theme: str = "standard",
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
            theme=theme,
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
            .options(joinedload(Note.category))
            .filter(Note.id == note_id, Note.user_id == user_id)
            .first()
        )

    def get_all_for_user(
        self, 
        user_id: UUID, 
        is_quick_note: bool | None = None,
        category_id: UUID | None = None,
    ) -> List[Note]:
        query = (
            self.db.query(Note)
            .options(joinedload(Note.category))
            .filter(Note.user_id == user_id)
        )
        if is_quick_note is not None:
            query = query.filter(Note.is_quick_note == is_quick_note)
        if category_id is not None:
            query = query.filter(Note.category_id == category_id)
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
