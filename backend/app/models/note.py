"""Note, NoteCategory, and NoteTag models"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class NoteCategory(Base):
    """Note categories table model (separate from task categories)"""

    __tablename__ = "note_categories"



class Note(Base):
    """Notes table model"""

    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("note_categories.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    # Quick note flag + optional context (e.g. from Pomodoro, Quiz, etc.)
    is_quick_note = Column(Boolean, default=False, nullable=False)
    source_context = Column(Text, nullable=True)
    theme = Column(String(50), default="standard", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("NoteCategory", back_populates="notes")
    tags = relationship("NoteTag", back_populates="note", cascade="all, delete-orphan")


class NoteTag(Base):
    """Tags for notes"""

    __tablename__ = "note_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    tag_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    note = relationship("Note", back_populates="tags")
