from sqlalchemy.orm import Session
from uuid import UUID

from app.repositories.achievement_repo import AchievementRepository, UserAchievementRepository


class AchievementsService:
    """
    Business logic for achievements module
    """

    def __init__(self, db: Session):
        self.db = db
        self.ach_repo = AchievementRepository(db)
        self.user_ach_repo = UserAchievementRepository(db)

    def get_user_achievements_overview(self, user_id: UUID):
        """
        Return all achievements + earned status
        """
        all_achievements = self.ach_repo.get_all()
        user_achievements = self.user_ach_repo.get_by_user(user_id)

        earned_ids = {ua.achievement_id for ua in user_achievements}

        return [
            {
                "id": ach.id,
                "code": ach.code,
                "name": ach.name,
                "description": ach.description,
                "url": ach.url,
                "active": ach.active,
                "earned": ach.id in earned_ids,
            }
            for ach in all_achievements
        ]
