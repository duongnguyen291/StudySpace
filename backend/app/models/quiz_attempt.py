"""
Quiz Attempt Model
"""
from sqlalchemy import Column, String, DateTime, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base


class QuizAttempt(Base):
    """
    Quiz Attempt model - tracks quiz attempts and results
    """
    __tablename__ = "quiz_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # TODO: Uncomment when QuizSet model is created
    # quiz_set_id = Column(UUID(as_uuid=True), ForeignKey("quiz_sets.id", ondelete="CASCADE"), nullable=False)
    quiz_set_id = Column(UUID(as_uuid=True), nullable=False)  # Temporary: no FK constraint until QuizSet model exists
    score = Column(Numeric(5, 2), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    time_spent_seconds = Column(Integer, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    answers = Column(JSONB, nullable=True)  # Store user's answers
    
    # Relationships
    user = relationship("User", backref="quiz_attempts")
    # quiz_set relationship will be added when QuizSet model is created
    # quiz_set = relationship("QuizSet", backref="quiz_attempts")

