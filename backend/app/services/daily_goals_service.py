from datetime import date
from sqlalchemy.orm import Session
from app.models.daily_goals import DailyGoal


class DailyGoalService:

    @staticmethod
    def get_today(db: Session, user_id: str):
        return (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date == date.today()
            )
            .first()
        )

    @staticmethod
    def set_today_goal(db: Session, user_id: str, target_minutes: int, target_quiz: int):
        goal = DailyGoalService.get_today(db, user_id)

        if goal:
            goal.target_minutes = target_minutes
            goal.target_quiz_count = target_quiz
        else:
            goal = DailyGoal(
                user_id=user_id,
                goal_date=date.today(),
                target_minutes=target_minutes,
                target_quiz_count=target_quiz,
            )
            db.add(goal)

        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def get_today_or_empty(db: Session, user_id: str):
        """API muốn lấy mục tiêu hôm nay mà không cập nhật gì"""
        return DailyGoalService.get_today(db, user_id)
