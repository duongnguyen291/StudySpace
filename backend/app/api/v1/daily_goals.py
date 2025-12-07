from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user_id_only
from app.schemas.daily_goals import (
    DailyGoalResponse,
    DailyGoalUpdateRequest,
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
    goal = DailyGoalService.get_today(db, user_id)

    if goal is None:
        # Trả về default goal để FE hiển thị
        return {
            "id": None,
            "user_id": user_id,
            "goal_date": None,
            "target_minutes": 0,
            "target_quiz_count": 0,
            "actual_minutes": 0,
            "actual_quiz_count": 0,
            "completed": False,
        }

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
    goal = DailyGoalService.create_or_update(
        db=db,
        user_id=user_id,
        target_minutes=payload.target_minutes,
        target_quiz=payload.target_quiz_count
    )
    return goal
