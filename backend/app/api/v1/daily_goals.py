from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.daily_goals import (
    DailyGoalCreate,
    DailyGoalUpdateProgress,
    DailyGoalResponse
)
from app.services.daily_goals_service import DailyGoalService

router = APIRouter(prefix="/daily-goals", tags=["Daily Goals"])

@router.get("/today", response_model=DailyGoalResponse | None)
def get_today_goal(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return DailyGoalService.get_today(db, user.id)

@router.post("/today", response_model=DailyGoalResponse)
def create_or_update_goal(
    payload: DailyGoalCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return DailyGoalService.create_or_update(
        db, user.id, payload.target_minutes, payload.target_quiz_count
    )

@router.post("/progress", response_model=DailyGoalResponse)
def update_progress(
    payload: DailyGoalUpdateProgress,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return DailyGoalService.update_progress(
        db, user.id, payload.minutes, payload.quizzes
    )
