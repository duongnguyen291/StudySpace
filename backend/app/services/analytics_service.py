from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta

from app.models.study_session import StudySession
from app.models.daily_goals import DailyGoal
def get_study_minutes_last_7_days(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)
    day_col = cast(StudySession.start_time, Date).label("day")

    rows = (
        db.query(
            day_col,
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label("minutes")
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= week_ago,
            StudySession.start_time < today + timedelta(days=1),
        )
        .group_by(day_col)
        .order_by(day_col)
        .all()
    )

    row_map = {r.day: int(r.minutes) for r in rows}
    dates = [week_ago + timedelta(days=i) for i in range(7)]

    return {
        "labels": [d.strftime("%d/%m") for d in dates],
        "values": [row_map.get(d, 0) for d in dates],
    }

def get_goal_completion_last_7_days(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)

    rows = (
        db.query(
            DailyGoal.goal_date,
            DailyGoal.target_minutes,
            DailyGoal.actual_minutes
        )
        .filter(
            DailyGoal.user_id == user_id,
            DailyGoal.goal_date >= week_ago,
            DailyGoal.goal_date <= today
        )
        .order_by(DailyGoal.goal_date.asc())
        .all()
    )

    row_map = {
        r.goal_date: (r.target_minutes or 0, r.actual_minutes or 0)
        for r in rows
    }

    dates = [week_ago + timedelta(days=i) for i in range(7)]
    labels = [d.strftime("%d/%m") for d in dates]
    values = []
    for d in dates:
        target, actual = row_map.get(d, (0, 0))
        if target > 0:
            values.append(round((actual / target) * 100, 2))
        else:
            values.append(0)

    return {"labels": labels, "values": values}

def get_dashboard_summary(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)

    total_week_minutes = (
        db.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= week_ago,
            StudySession.start_time < today + timedelta(days=1),
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

    target = today_goal.target_minutes or 0
    actual = today_goal.actual_minutes or 0
    today_percentage = (actual / target) * 100 if target > 0 else 0

    return {
        "weekly_minutes": int(total_week_minutes),
        "today_target_minutes": target,
        "today_actual_minutes": actual,
        "today_completion_percent": round(today_percentage, 2),
    }

def get_long_term_progress(db: Session, user_id: str):
    today = date.today()
    start = today - timedelta(days=29)

    rows = (
        db.query(
            DailyGoal.goal_date,
            DailyGoal.actual_minutes
        )
        .filter(
            DailyGoal.user_id == user_id,
            DailyGoal.goal_date >= start,
            DailyGoal.goal_date <= today
        )
        .order_by(DailyGoal.goal_date.asc())
        .all()
    )

    row_map = {r.goal_date: (r.actual_minutes or 0) for r in rows}
    dates = [start + timedelta(days=i) for i in range(30)]

    labels = [d.strftime("%d/%m") for d in dates]
    values = [row_map.get(d, 0) for d in dates]

    return {"labels": labels, "values": values}
