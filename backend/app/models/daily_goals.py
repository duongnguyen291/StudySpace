from sqlalchemy import Column, String, Date, Integer, Boolean, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)

    goal_date = Column(Date, nullable=False)
    target_minutes = Column(Integer, nullable=False, default=0)
    target_quiz_count = Column(Integer, nullable=False, default=0)

    actual_minutes = Column(Integer, nullable=False, default=0)
    actual_quiz_count = Column(Integer, nullable=False, default=0)

    completed = Column(Boolean, nullable=False, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
