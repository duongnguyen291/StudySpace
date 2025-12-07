"""
Quiz Models
Database models for quiz sets and questions
Note: QuizAttempt is defined in quiz_attempt.py to match main branch structure
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class QuizSet(Base):
    """Quiz Set model - collection of quiz questions"""
    __tablename__ = "quiz_sets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    questions = relationship("QuizQuestion", back_populates="quiz_set", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz_set", cascade="all, delete-orphan")
    user = relationship("User", backref="quiz_sets")
    category = relationship("Category", backref="quiz_sets")


class QuizQuestion(Base):
    """Quiz Question model"""
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_set_id = Column(UUID(as_uuid=True), ForeignKey("quiz_sets.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), default="multiple_choice", nullable=False)  # multiple_choice, true_false, short_answer
    options = Column(JSON, nullable=True)  # List of options for multiple choice
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    quiz_set = relationship("QuizSet", back_populates="questions")
