from sqlalchemy.orm import Session
from datetime import date
from app.models.daily_goals import DailyGoal

class DailyGoalService:
    @staticmethod
    def get_today_goal(db: Session, user_id: str):
        return (
            db.query(DailyGoal)
            .filter(DailyGoal.user_id == user_id, DailyGoal.goal_date == date.today())
            .first()
        )

    @staticmethod
    def create_or_update_today_goal(db: Session, user_id: str, target_minutes: int, target_quiz_count: int):
        goal = DailyGoalService.get_today_goal(db, user_id)

        if not goal:
            goal = DailyGoal(
                user_id=user_id,
                goal_date=date.today(),
                target_minutes=target_minutes,
                target_quiz_count=target_quiz_count,
            )
            db.add(goal)
        else:
            goal.target_minutes = target_minutes
            goal.target_quiz_count = target_quiz_count

        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def update_progress(db: Session, user_id: str, minutes: int = 0, quizzes: int = 0):
        goal = DailyGoalService.get_today_goal(db, user_id)
        if not goal:
            return None

        goal.actual_minutes += minutes
        goal.actual_quiz_count += quizzes

        if goal.actual_minutes >= goal.target_minutes and goal.actual_quiz_count >= goal.target_quiz_count:
            goal.completed = True

        db.commit()
        db.refresh(goal)
        return goal
