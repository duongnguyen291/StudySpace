from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user_id_only
from app.schemas.daily_goals import (
    DailyGoalResponse,
    DailyGoalUpdateRequest,
    UpdateGoalModel,
)
from app.services.daily_goals_service import DailyGoalService

router = APIRouter(prefix="/daily-goals", tags=["Daily Goals"])

# ===============================
# GET TODAY GOAL
# ===============================
@router.get("/today", response_model=DailyGoalResponse)
def get_today_goal(
    user_id: str = Depends(get_current_user_id_only),
    db: Session = Depends(get_db),
):
    """Lấy goal của hôm nay"""
    goal = DailyGoalService.get_today(db, user_id)
    return goal


# ===============================
# SET / UPDATE TODAY GOAL
# ===============================
@router.post("/today", response_model=DailyGoalResponse)
def set_daily_goal(
    payload: DailyGoalUpdateRequest,
    user_id: str = Depends(get_current_user_id_only),
    db: Session = Depends(get_db),
):
    """Set daily goal cho hôm nay (phút học + số quiz)"""
    goal = DailyGoalService.create_or_update(
        db=db,
        user_id=user_id,
        target_minutes=payload.target_minutes,
        target_quiz_count=payload.target_quiz_count
    )
    return goal


@router.post("/update", response_model=DailyGoalResponse)
def update_goal(
    data: UpdateGoalModel,
    user_id: str = Depends(get_current_user_id_only),
    db: Session = Depends(get_db),
):
    """Cập nhật goal cho một ngày cụ thể"""
    result = DailyGoalService.create_or_update(
        db=db,
        user_id=user_id,
        target_minutes=data.target_minutes,
        target_quiz_count=data.target_quiz_count,
        goal_date=data.goal_date  # optional, default hôm nay
    )
    return result