from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import (
    get_study_minutes_last_7_days,
    get_goal_completion_last_7_days,
    get_dashboard_summary,
    get_long_term_progress
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/study-time")
def study_time(user_id: str, db: Session = Depends(get_db)):
    return get_study_minutes_last_7_days(db, user_id)


@router.get("/goals")
def goals(user_id: str, db: Session = Depends(get_db)):
    return get_goal_completion_last_7_days(db, user_id)


@router.get("/dashboard")
def dashboard(user_id: str, db: Session = Depends(get_db)):
    return get_dashboard_summary(db, user_id)


@router.get("/progress")
def progress(user_id: str, db: Session = Depends(get_db)):
    return get_long_term_progress(db, user_id)
