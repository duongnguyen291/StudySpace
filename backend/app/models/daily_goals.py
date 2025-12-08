"""
Daily Goals Model
"""
from sqlalchemy import Column, String, Integer, Date, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class DailyGoal(Base):
    """Model for daily study goals"""
    __tablename__ = "daily_goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    goal_date = Column(Date, nullable=False, index=True)
    target_minutes = Column(Integer, nullable=False, default=0)
    actual_minutes = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Composite index for analytics queries
    __table_args__ = (
        Index('idx_daily_goals_user_date', 'user_id', 'goal_date'),
    )

    def __repr__(self):
        return f"<DailyGoal(id={self.id}, user_id={self.user_id}, goal_date={self.goal_date}, target={self.target_minutes})>"
