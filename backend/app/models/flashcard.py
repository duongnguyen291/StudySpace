"""
Flashcard Model
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Flashcard(Base):
    """
    Flashcard model - individual flashcard in a deck
    """
    __tablename__ = "flashcards"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    deck_id = Column(UUID(as_uuid=True), ForeignKey("flashcard_decks.id", ondelete="CASCADE"), nullable=False)
    
    # Flashcard Content
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    deck = relationship("FlashcardDeck", back_populates="flashcards")
    progress = relationship("FlashcardProgress", back_populates="flashcard", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Flashcard(id={self.id}, deck_id={self.deck_id}, question='{self.question[:50]}...')>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "deck_id": str(self.deck_id),
            "question": self.question,
            "answer": self.answer,
            "hint": self.hint,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

