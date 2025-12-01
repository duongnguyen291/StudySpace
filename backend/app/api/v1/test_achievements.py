from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.services.achivements_service import AchievementsService

router = APIRouter(prefix="/test-achievements", tags=["Test"])

@router.post("/trigger/{event}")
def test_trigger(
    event: str,
    value: int,
    user_id: UUID,
    db: Session = Depends(get_db)
):
    service = AchievementsService(db)
    unlocked = service.process_event(user_id, event, value)
    return {
        "event": event,
        "value": value,
        "unlocked": [a.code for a in unlocked]
    }
