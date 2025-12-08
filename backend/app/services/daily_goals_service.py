from sqlalchemy.orm import Session
from datetime import date
from app.models.daily_goals import DailyGoal


class DailyGoalService:

    @staticmethod
    def get_goal_for_date(db: Session, user_id: str, target_date: date):
        """
        Lấy goal áp dụng cho target_date bằng cách:
        - Tìm rule gần nhất trong quá khứ (goal_date <= target_date)
        - Merge với actual mục tiêu của ngày target_date (nếu có)
        """
        # 1. Tìm rule: goal gần nhất trước hoặc bằng ngày cần lấy
        rule = (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date <= target_date
            )
            .order_by(DailyGoal.goal_date.desc())
            .first()
        )

        # 2. Lấy actual của ngày target_date nếu có
        actual = (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date == target_date
            )
            .first()
        )

        # Nếu không có rule → return default
        if not rule:
            return {
                "id": None,
                "user_id": user_id,
                "goal_date": target_date,
                "target_minutes": 0,
                "target_quiz_count": 0,
                "actual_minutes": actual.actual_minutes if actual else 0,
                "actual_quiz_count": actual.actual_quiz_count if actual else 0,
                "completed": actual.completed if actual else False,
            }

        # Merge rule + actual
        return {
            "id": rule.id,
            "user_id": rule.user_id,
            "goal_date": rule.goal_date,
            "target_minutes": rule.target_minutes,
            "target_quiz_count": rule.target_quiz_count,
            "actual_minutes": actual.actual_minutes if actual else 0,
            "actual_quiz_count": actual.actual_quiz_count if actual else 0,
            "completed": actual.completed if actual else False,
        }


    @staticmethod
    def get_today(db: Session, user_id: str):
        """Lấy goal của hôm nay"""
        today = date.today()
        return DailyGoalService.get_goal_for_date(db, user_id, today)


    @staticmethod
    def create_or_update(
        db: Session,
        user_id: str,
        target_minutes: int,
        target_quiz_count: int,
        goal_date: date = None
    ):
        """Tạo hoặc cập nhật goal cho một ngày"""
        # default → hôm nay
        if goal_date is None:
            goal_date = date.today()

        # Tìm goal của ngày này
        goal = (
            db.query(DailyGoal)
            .filter(
                DailyGoal.user_id == user_id,
                DailyGoal.goal_date == goal_date
            )
            .first()
        )

        # Nếu tồn tại → update
        if goal:
            goal.target_minutes = target_minutes
            goal.target_quiz_count = target_quiz_count
        else:
            # Tạo goal mới
            goal = DailyGoal(
                user_id=user_id,
                goal_date=goal_date,
                target_minutes=target_minutes,
                target_quiz_count=target_quiz_count,
                actual_minutes=0,
                actual_quiz_count=0,
                completed=False,
            )
            db.add(goal)

        db.commit()
        db.refresh(goal)
        return goal
