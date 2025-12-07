"""
Study Session Model
"""
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base


class StudySession(Base):
    """
    Study Session model - tracks study sessions (pomodoro, free_study, quiz)
    """
    __tablename__ = "study_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_type = Column(String(20), nullable=False)  # 'pomodoro', 'free_study', 'quiz'
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    # TODO: Re-enable ForeignKey when daily_goals table is implemented
    # goal_id = Column(UUID(as_uuid=True), ForeignKey("daily_goals.id", ondelete="SET NULL"), nullable=True)
    goal_id = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="study_sessions")

