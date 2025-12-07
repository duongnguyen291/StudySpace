"""
Pomodoro Service
Business logic để log Pomodoro sessions vào StudySession
và cung cấp thống kê đơn giản cho feature Pomodoro.
"""
from datetime import datetime, date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.study_session_repo import StudySessionRepository
from app.schemas.pomodoro import PomodoroSessionCreate, PomodoroStats
from app.models.study_session import StudySession


class PomodoroService:
    """Service cho Pomodoro feature."""

    def __init__(self, db: Session):
        self.db = db
        self.study_session_repo = StudySessionRepository(db)

    def log_completed_session(
        self, user_id: UUID, payload: PomodoroSessionCreate
    ) -> StudySession:
        """
        Lưu một phiên Pomodoro đã hoàn thành vào bảng study_sessions.

        - Luôn lưu với session_type='pomodoro' để Progress Tracker
          gom thống kê đúng theo backlog.
        - Chỉ nên được gọi cho phiên 'work' ở phía frontend.
        """
        data = {
            "user_id": user_id,
            "session_type": "pomodoro",
            "start_time": payload.started_at,
            "end_time": payload.completed_at,
            "duration_minutes": payload.duration_minutes,
            "notes": payload.notes,
            "completed": True,
        }

        session = self.study_session_repo.create(data)
        return session

    def get_today_stats(self, user_id: UUID) -> PomodoroStats:
        """
        Trả về thống kê Pomodoro cho ngày hôm nay (theo server time).
        Sử dụng cùng nguồn dữ liệu với Progress Tracker.
        """
        today = date.today()
        start_datetime = datetime.combine(today, datetime.min.time())
        end_datetime = datetime.combine(today, datetime.max.time())

        # Tổng phút & số session pomodoro đã hoàn thành trong ngày
        total_minutes = self.study_session_repo.get_total_minutes(
            user_id=user_id,
            start_date=today,
            end_date=today,
        )
        total_sessions = self.study_session_repo.get_session_count(
            user_id=user_id,
            start_date=today,
            end_date=today,
            session_type="pomodoro",
        )

        return PomodoroStats(
            date=start_datetime,
            total_sessions=total_sessions,
            completed_sessions=total_sessions,
            total_minutes=total_minutes,
        )


