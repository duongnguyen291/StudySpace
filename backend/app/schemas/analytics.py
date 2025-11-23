"""
Analytics Schemas
Pydantic models for analytics and progress tracking
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional, Dict, Any


class DailyProgress(BaseModel):
    """Daily progress data for charts"""
    date: date
    total_minutes: int = Field(default=0, ge=0)
    total_quizzes: int = Field(default=0, ge=0)
    completed_sessions: int = Field(default=0, ge=0)
    
    class Config:
        from_attributes = True


class SessionTypeStats(BaseModel):
    """Statistics by session type for pie chart"""
    session_type: str
    total_minutes: int = Field(default=0, ge=0)
    session_count: int = Field(default=0, ge=0)
    percentage: float = Field(default=0.0, ge=0.0, le=100.0)


class ProgressSummary(BaseModel):
    """Overall progress summary"""
    total_minutes: int = Field(default=0, ge=0)
    total_quizzes: int = Field(default=0, ge=0)
    total_sessions: int = Field(default=0, ge=0)
    week_minutes: int = Field(default=0, ge=0)
    week_quizzes: int = Field(default=0, ge=0)
    week_sessions: int = Field(default=0, ge=0)
    average_daily_minutes: float = Field(default=0.0, ge=0.0)
    average_daily_quizzes: float = Field(default=0.0, ge=0.0)


class WeeklyProgressResponse(BaseModel):
    """Weekly progress response with charts data"""
    summary: ProgressSummary
    daily_progress: List[DailyProgress] = Field(default_factory=list)
    session_type_stats: List[SessionTypeStats] = Field(default_factory=list)
    week_start: date
    week_end: date


class ProgressFilter(BaseModel):
    """Filter parameters for progress queries"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    filter_week: bool = Field(default=False, description="Filter by current week")
    session_type: Optional[str] = None  # 'pomodoro', 'free_study', 'quiz'

