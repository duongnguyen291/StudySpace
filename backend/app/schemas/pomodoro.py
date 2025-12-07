"""
Pomodoro Schemas
Pydantic models for Pomodoro API
"""
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

from pydantic import BaseModel, Field


PomodoroPhase = Literal["work", "short_break", "long_break"]


class PomodoroSessionCreate(BaseModel):
    """Payload để log một phiên Pomodoro đã hoàn thành."""

    session_type: PomodoroPhase = Field(
        ..., description="Loại phiên trong UI: work | short_break | long_break"
    )
    duration_minutes: int = Field(..., ge=1, description="Thời lượng phiên (phút)")
    started_at: datetime = Field(..., description="Thời điểm bắt đầu phiên")
    completed_at: datetime = Field(..., description="Thời điểm kết thúc phiên")
    notes: Optional[str] = Field(
        default=None, description="Ghi chú ngắn cho phiên (tùy chọn)"
    )


class PomodoroSession(BaseModel):
    """Thông tin một phiên Pomodoro đã được lưu."""

    id: UUID
    user_id: UUID
    session_type: PomodoroPhase
    duration_minutes: int
    started_at: datetime
    completed_at: Optional[datetime]
    is_completed: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class PomodoroStats(BaseModel):
    """Thống kê Pomodoro cho một ngày."""

    date: datetime
    total_sessions: int = 0
    completed_sessions: int = 0
    total_minutes: int = 0


