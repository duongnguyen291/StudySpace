"""
Flashcard Progress Model
Tracks user's progress on individual flashcards for spaced repetition
"""
from sqlalchemy import Column, ForeignKey, DateTime, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class FlashcardProgress(Base):
    """
    Flashcard Progress model - tracks user's review progress
    Used for spaced repetition algorithm
    """
    __tablename__ = "flashcard_progress"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    flashcard_id = Column(UUID(as_uuid=True), ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    
    # Progress Tracking
    confidence_level = Column(Integer, default=0, nullable=False)  # 0-5 scale (0=not reviewed, 5=mastered)
    last_reviewed = Column(DateTime, nullable=True)
    next_review = Column(DateTime, nullable=True)  # When to review next (spaced repetition)
    review_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Unique constraint: one progress record per user-flashcard pair
    __table_args__ = (UniqueConstraint('user_id', 'flashcard_id', name='_user_flashcard_uc'),)
    
    # Relationships
    user = relationship("User", back_populates="flashcard_progress")
    flashcard = relationship("Flashcard", back_populates="progress")
    
    def __repr__(self):
        return f"<FlashcardProgress(id={self.id}, user_id={self.user_id}, flashcard_id={self.flashcard_id}, confidence={self.confidence_level})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "flashcard_id": str(self.flashcard_id),
            "confidence_level": self.confidence_level,
            "last_reviewed": self.last_reviewed.isoformat() if self.last_reviewed else None,
            "next_review": self.next_review.isoformat() if self.next_review else None,
            "review_count": self.review_count,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

