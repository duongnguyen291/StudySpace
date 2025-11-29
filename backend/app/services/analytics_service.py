from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta

from app.models.study_session import StudySession
from app.models.daily_goals import DailyGoal
def get_study_minutes_last_7_days(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)

    rows = (
        db.query(
            cast(StudySession.start_time, Date).label("day"),
            func.sum(StudySession.duration_minutes).label("minutes")
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= week_ago
        )
        .group_by("day")
        .order_by("day")
        .all()
    )

    return {
        "labels": [r.day.strftime("%d/%m") for r in rows],
        "values": [r.minutes for r in rows],
    }

def get_goal_completion_last_7_days(db: Session, user_id: str):
    rows = (
        db.query(
            DailyGoal.goal_date,
            DailyGoal.target_minutes,
            DailyGoal.actual_minutes
        )
        .filter(DailyGoal.user_id == user_id)
        .order_by(DailyGoal.goal_date.desc())
        .limit(7)
        .all()
    )

    rows = rows[::-1]

    labels = [r.goal_date.strftime("%d/%m") for r in rows]
    values = [
        round((r.actual_minutes / r.target_minutes) * 100, 2)
        if r.target_minutes > 0 else 0
        for r in rows
    ]

    return {"labels": labels, "values": values}

def get_dashboard_summary(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)

    total_week_minutes = (
        db.query(func.sum(StudySession.duration_minutes))
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= week_ago
        )
        .scalar()
    ) or 0

    today_goal = (
        db.query(DailyGoal)
        .filter(
            DailyGoal.user_id == user_id,
            DailyGoal.goal_date == today
        )
        .first()
    )

    if today_goal and today_goal.target_minutes > 0:
        today_percentage = (today_goal.actual_minutes / today_goal.target_minutes) * 100
    else:
        today_percentage = 0

    return {
        "weekly_minutes": total_week_minutes,
        "today_target_minutes": today_goal.target_minutes if today_goal else 0,
        "today_actual_minutes": today_goal.actual_minutes if today_goal else 0,
        "today_completion_percent": round(today_percentage, 2),
    }

def get_long_term_progress(db: Session, user_id: str):
    rows = (
        db.query(
            DailyGoal.goal_date,
            DailyGoal.actual_minutes
        )
        .filter(DailyGoal.user_id == user_id)
        .order_by(DailyGoal.goal_date.desc())
        .limit(30)
        .all()
    )

    rows = rows[::-1]

    labels = [r.goal_date.strftime("%d/%m") for r in rows]
    values = [r.actual_minutes for r in rows]

    return {"labels": labels, "values": values}
