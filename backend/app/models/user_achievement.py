from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), 
                     ForeignKey("users.id", ondelete="CASCADE"), 
                     nullable=False)

    achievement_id = Column(UUID(as_uuid=True), 
                            ForeignKey("achievements.id", ondelete="CASCADE"), 
                            nullable=False)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
