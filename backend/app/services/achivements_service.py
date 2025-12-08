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
    def process_event(self, user_id: UUID, event: str, value: int):
        """
        Hàm các service khác phải gọi mỗi khi user thực hiện hành động:
        - Quiz completed → event="quiz_completed", value=total_quizzes
        - Study → event="study_minutes", value=total_minutes
        - Pomodoro → event="pomodoro_done", value=total_pomodoros
        - Flashcards → event="flashcard_reviewed", value=total_reviews
        """

        achievements = self.ach_repo.get_all()
        user_achievements = self.user_ach_repo.get_by_user(user_id)
        earned_ids = {ua.achievement_id for ua in user_achievements}

        unlock_list = []

        for ach in achievements:
            if ach.id in earned_ids:
                continue 

            code = ach.code

            # ================================
            # QUIZ LOGIC
            # ================================
            if event == "quiz_completed":
                if code == "first_quiz":
                    unlock_list.append(ach)
                if code.startswith("quiz_"):
                    target = int(code.split("_")[1])
                    if value >= target:
                        unlock_list.append(ach)
                if code == "perfect_score" and value == 100:
                    unlock_list.append(ach)

            # ================================
            # STUDY LOGIC (minutes)
            # ================================
            if event == "study_minutes":
                if code.startswith("study_"):
                    target = int(code.split("_")[1])
                    if value >= target:
                        unlock_list.append(ach)

            # ================================
            # POMODORO LOGIC
            # ================================
            if event == "pomodoro_done":
                if code.startswith("pomodoro_"):
                    target = int(code.split("_")[1])
                    if value >= target:
                        unlock_list.append(ach)

            # ================================
            # FLASHCARDS LOGIC
            # ================================
            if event == "flashcard_reviewed":
                if code.startswith("flash_"):
                    target = int(code.split("_")[1])
                    if value >= target:
                        unlock_list.append(ach)

        # Lưu achievements vào DB
        for ach in unlock_list:
            self.user_ach_repo.add_achievement(user_id, ach.id)

        # Trả về list achievements mới unlock để FE có thể popup
        return unlock_list
