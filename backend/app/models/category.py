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
    
