from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, extract, text
from datetime import date, timedelta

from app.models.study_session import StudySession
from app.models.daily_goals import DailyGoal


def _daily_minutes_map(db: Session, user_id: str, start: date, end: date):
    # Using DATE() function instead of cast for better performance
    day_col = func.date(StudySession.start_time).label("day")
    rows = (
        db.query(
            day_col,
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label("minutes")
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= start,
            StudySession.start_time <= end,
        )
        .group_by(day_col)
        .all()
    )
    return {r.day: int(r.minutes) for r in rows}
def get_study_minutes_last_7_days(db: Session, user_id: str):
    today = date.today()
    week_ago = today - timedelta(days=6)
    day_col = func.date(StudySession.start_time).label("day")

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

    today_goal_row = (
        db.query(DailyGoal.target_minutes, DailyGoal.actual_minutes)
        .filter(
            DailyGoal.user_id == user_id,
            DailyGoal.goal_date == today
        )
        .first()
    )

    if today_goal_row:
        target = today_goal_row[0] or 0
        actual = today_goal_row[1] or 0
    else:
        target = 0
        actual = 0
    today_percentage = (actual / target) * 100 if target > 0 else 0

    return {
        "weekly_minutes": int(total_week_minutes),
        "today_target_minutes": target,
        "today_actual_minutes": actual,
        "today_completion_percent": round(today_percentage, 2),
    }


def get_insights(db: Session, user_id: str):
    """
    Return additional insights for analytics page without needing client-side computation.
    Metrics: average minutes/day (last 7), best day (last 30), current streak, avg session length, best hour.
    """
    today = date.today()
    seven_days_ago = today - timedelta(days=6)
    thirty_days_ago = today - timedelta(days=29)

    # Get all data in one query to avoid N+1
    day_col = func.date(StudySession.start_time).label("day")
    all_sessions = (
        db.query(
            day_col,
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label("minutes")
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= thirty_days_ago,
            StudySession.start_time <= today + timedelta(days=1),
        )
        .group_by(day_col)
        .all()
    )
    
    # Build maps from single query
    last30_map = {r.day: int(r.minutes) for r in all_sessions}
    last7_map = {r.day: int(r.minutes) for r in all_sessions if r.day >= seven_days_ago}

    # Avg minutes/day (7d)
    avg_7d = 0
    if last7_map:
        vals = list(last7_map.values())
        avg_7d = round(sum(vals) / max(1, len(vals)), 1)

    # Best day in last 30 days
    best_day_date = None
    best_day_minutes = 0
    for d, m in last30_map.items():
        if m > best_day_minutes:
            best_day_minutes = m
            best_day_date = d

    # Current streak (consecutive days with >0 minutes, counting back from today)
    streak = 0
    for i in range(0, 30):
        d = today - timedelta(days=i)
        minutes = last30_map.get(d, 0)
        if minutes > 0:
            streak += 1
        else:
            break

    # Average session length (last 7 days)
    sessions_7d = (
        db.query(StudySession.duration_minutes)
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= seven_days_ago,
            StudySession.start_time <= today + timedelta(days=1),
        )
        .all()
    )
    avg_session_length = 0
    if sessions_7d:
        avg_session_length = round(
            sum(s[0] for s in sessions_7d if s[0]) / len(sessions_7d), 1
        )

    # Best hour today (hour with most study time)
    sessions_today = (
        db.query(
            extract('hour', StudySession.start_time).label('hour'),
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label('minutes')
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= today,
            StudySession.start_time < today + timedelta(days=1),
        )
        .group_by(extract('hour', StudySession.start_time))
        .all()
    )
    best_hour = None
    best_hour_minutes = 0
    for h, m in sessions_today:
        if m and m > best_hour_minutes:
            best_hour_minutes = m
            best_hour = int(h) if h is not None else None

    return {
        "avg_minutes_per_day_7d": avg_7d,
        "best_day": {
            "date": best_day_date.isoformat() if best_day_date else None,
            "minutes": best_day_minutes,
        },
        "current_streak_days": streak,
        "avg_session_length_minutes": avg_session_length,
        "best_hour_today": best_hour,
        "best_hour_minutes_today": best_hour_minutes,
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
