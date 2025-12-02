from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.achievements import AchievementResponse
from app.services.achivements_service import AchievementsService

router = APIRouter(prefix="/achievements", tags=["Achievements"])

@router.get("/me", response_model=List[AchievementResponse])
def get_my_achievements(
    get_current_user_id_only: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AchievementsService(db)
    return service.get_user_achievements_overview(current_user_id)
