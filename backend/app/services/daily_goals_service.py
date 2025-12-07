from sqlalchemy.orm import Session
from datetime import date

from app.models.daily_goals import DailyGoal


class DailyGoalService:

    @staticmethod
    def get_today(db: Session, user_id: str):
        today = date.today()
        goal = (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date == today
            )
            .first()
        )
        return goal

    @staticmethod
    def create_or_update(
        db: Session,
        user_id: str,
        target_minutes: int,
        target_quiz: int
    ):
        today = date.today()

        goal = (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date == today
            )
            .first()
        )

        if goal:
            # Update existing
            goal.target_minutes = target_minutes
            goal.target_quiz_count = target_quiz
        else:
            # Create new
            goal = DailyGoal(
                user_id=user_id,
                goal_date=today,
                target_minutes=target_minutes,
                target_quiz_count=target_quiz,
                actual_minutes=0,
                actual_quiz_count=0,
                completed=False
            )
            db.add(goal)

        db.commit()
        db.refresh(goal)
        return goal
