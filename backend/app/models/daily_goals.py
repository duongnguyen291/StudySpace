"""
Daily Goals Model
"""
from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class DailyGoal(Base):
    """Model for daily study goals"""
    __tablename__ = "daily_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_date = Column(Date, nullable=False, index=True)
    target_minutes = Column(Integer, nullable=False, default=0)
    actual_minutes = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="daily_goals")

    def __repr__(self):
        return f"<DailyGoal(id={self.id}, user_id={self.user_id}, goal_date={self.goal_date}, target={self.target_minutes})>"
