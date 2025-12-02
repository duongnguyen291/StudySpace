"""
Pomodoro Timer API endpoints
"""
from uuid import UUID as _UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database, get_current_user
from app.schemas.pomodoro import (
    PomodoroSession,
    PomodoroSessionCreate,
    PomodoroStats,
)
from app.services.pomodoro_service import PomodoroService

router = APIRouter()


@router.post("/sessions", response_model=PomodoroSession)
async def create_pomodoro_session(
    payload: PomodoroSessionCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> PomodoroSession:
    """
    Log một phiên Pomodoro đã hoàn thành.

    Ghi dữ liệu vào bảng `study_sessions` (session_type='pomodoro') để
    Progress Tracker có thể thống kê theo tuần/ngày. Frontend chịu trách
    nhiệm tính thời gian và chỉ gọi endpoint khi phiên kết thúc.
    """
    service = PomodoroService(db)
    study_session = service.log_completed_session(
        user_id=_UUID(current_user_id),
        payload=payload,
    )

    return PomodoroSession(
        id=study_session.id,
        user_id=study_session.user_id,
        session_type=payload.session_type,
        duration_minutes=study_session.duration_minutes or 0,
        started_at=study_session.start_time,
        completed_at=study_session.end_time,
        is_completed=study_session.completed,
        notes=study_session.notes,
    )


@router.get("/stats/today", response_model=PomodoroStats)
async def get_today_stats(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
) -> PomodoroStats:
    """
    Lấy thống kê Pomodoro cho ngày hôm nay của user hiện tại.

    Dữ liệu lấy từ `study_sessions` với session_type='pomodoro' nên
    khớp hoàn toàn với thống kê trong Progress Tracker.
    """
    service = PomodoroService(db)
    return service.get_today_stats(user_id=_UUID(current_user_id))

