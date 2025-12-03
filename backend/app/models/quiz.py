"""
Quiz Models
Database models for quiz sets, questions, and attempts
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class QuizSet(Base):
    """Quiz Set model - collection of quiz questions"""
    __tablename__ = "quiz_sets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    questions = relationship("QuizQuestion", back_populates="quiz_set", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz_set", cascade="all, delete-orphan")


class QuizQuestion(Base):
    """Quiz Question model"""
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_set_id = Column(UUID(as_uuid=True), ForeignKey("quiz_sets.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), default="multiple_choice")  # multiple_choice, true_false, short_answer
    options = Column(JSON, nullable=True)  # List of options for multiple choice
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    quiz_set = relationship("QuizSet", back_populates="questions")


class QuizAttempt(Base):
    """Quiz Attempt model - tracks user quiz sessions"""
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quiz_set_id = Column(UUID(as_uuid=True), ForeignKey("quiz_sets.id"), nullable=False)
    score = Column(Float, nullable=True)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, nullable=True)
    answers = Column(JSON, nullable=True)  # User's answers: {question_id: user_answer}
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    quiz_set = relationship("QuizSet", back_populates="attempts")
