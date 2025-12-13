from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_id_only
from app.services.analytics_service import (
    get_study_minutes_last_7_days,
    get_goal_completion_last_7_days,
    get_dashboard_summary,
    get_long_term_progress,
    get_insights,
    get_heatmap_data,
    get_productivity_trends,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/study-time")
def study_time(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    return get_study_minutes_last_7_days(db, user_id)


@router.get("/goals")
def goals(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    return get_goal_completion_last_7_days(db, user_id)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    return get_dashboard_summary(db, user_id)


@router.get("/progress")
def progress(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    return get_long_term_progress(db, user_id)


@router.get("/insights")
def insights(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    return get_insights(db, user_id)


@router.get("/heatmap")
def heatmap(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_only),
    days: int = 365
):
    """
    Get heatmap calendar data for the last N days (default 365).
    Returns list of {date: "YYYY-MM-DD", value: minutes}
    """
    return get_heatmap_data(db, user_id, days)


@router.get("/trends")
def trends(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id_only)):
    """
    Get productivity trends: weekly comparison, monthly comparison, and growth rate.
    """
    return get_productivity_trends(db, user_id)

