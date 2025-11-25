from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement


class AchievementRepository:
    """Repository: CRUD cho bảng achievements."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Achievement]:
        return (
            self.db.query(Achievement)
            .filter(Achievement.active == True)
            .all()
        )

    def get_by_code(self, code: str) -> Optional[Achievement]:
        return (
            self.db.query(Achievement)
            .filter(Achievement.code == code, Achievement.active == True)
            .first()
        )

    def get_by_id(self, achievement_id: UUID) -> Optional[Achievement]:
        return (
            self.db.query(Achievement)
            .filter(Achievement.id == achievement_id)
            .first()
        )


class UserAchievementRepository:
    """Repository: mapping user <-> achievements."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID) -> List[UserAchievement]:
        return (
            self.db.query(UserAchievement)
            .filter(UserAchievement.user_id == user_id)
            .all()
        )

    def exists(self, user_id: UUID, achievement_id: UUID) -> bool:
        return (
            self.db.query(UserAchievement)
            .filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
            .first()
            is not None
        )

    def create(self, user_id: UUID, achievement_id: UUID) -> UserAchievement:
        record = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
