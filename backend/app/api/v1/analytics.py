from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.services.analytics_service import (
    get_study_minutes_last_7_days,
    get_goal_completion_last_7_days,
    get_dashboard_summary,
    get_long_term_progress
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/study-time")
def study_time(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return get_study_minutes_last_7_days(db, user_id)


@router.get("/goals")
def goals(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return get_goal_completion_last_7_days(db, user_id)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return get_dashboard_summary(db, user_id)


@router.get("/progress")
def progress(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return get_long_term_progress(db, user_id)

