"""
Category Model
Database model for categories used to organize, tasks, quizzes, and flashcard decks
"""
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

class Category(Base):
    """
    Category model for organizing content
    Used by: tasks, quiz_sets, flashcard_decks
    """
    __tablename__ = "categories"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Category Information
    name = Column(String(100), nullable=False)
    color = Column(String(7), default="#3B82F6", nullable=False)  # Hex color code
    icon = Column(String(50), default="folder", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="categories")
    tasks = relationship("Task", back_populates="category", cascade="all, delete-orphan")
    # quiz_sets = relationship("QuizSet", back_populates="category")  # Uncomment when QuizSet model is created
    # flashcard_decks = relationship("FlashcardDeck", back_populates="category")  # Uncomment when FlashcardDeck model is created
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', user_id={self.user_id})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "name": self.name,
            "color": self.color,
            "icon": self.icon,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
