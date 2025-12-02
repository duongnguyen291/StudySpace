"""
Progress Tracker API endpoints
Tính năng theo dõi tiến độ học tập theo tuần/ngày
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.api.deps import get_database, get_current_user
from app.models.user import User
from app.services.progress_service import ProgressService
from app.schemas.progress import (
    WeeklyProgressResponse,
    ProgressSummary,
    ProgressFilter
)

router = APIRouter()


@router.get("/dashboard", response_model=ProgressSummary)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get dashboard statistics
    
    Returns overall progress summary including:
    - Total minutes, quizzes, sessions (all time)
    - Week statistics
    - Average daily metrics
    """
    service = ProgressService(db)
    
    summary = service.get_progress_summary(
        user_id=current_user.id,
        filter_week=False  # Get all-time summary for dashboard
    )
    
    return summary


@router.get("/", response_model=WeeklyProgressResponse)
async def get_progress(
    filter_week: bool = Query(
        default=True,
        description="Filter by week. If False, returns all-time data."
    ),
    week_offset: int = Query(
        default=0,
        description="Week offset: 0=current week, -1=previous week, 1=next week"
    ),
    start_date: Optional[date] = Query(
        default=None,
        description="Start date for custom date range (YYYY-MM-DD). Overrides week_offset if provided."
    ),
    end_date: Optional[date] = Query(
        default=None,
        description="End date for custom date range (YYYY-MM-DD)"
    ),
    session_type: Optional[str] = Query(
        default=None,
        description="Filter by session type: 'pomodoro', 'free_study', or 'quiz'"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get learning progress with charts data
    
    Progress Tracker endpoint - Hiển thị tiến độ học tập theo tuần/ngày
    
    Returns:
    - Progress summary (total minutes/quizzes/sessions)
    - Daily progress data for bar charts (biểu đồ cột)
    - Session type statistics for pie charts (biểu đồ tròn)
    - Week range information
    
    Query Parameters:
    - filter_week: Filter by week (default: True)
    - week_offset: 0=current week, -1=previous week (default: 0)
    - start_date: Custom start date (optional, overrides week_offset)
    - end_date: Custom end date (optional)
    - session_type: Filter by session type (optional)
    """
    service = ProgressService(db)
    
    # Create filter object
    progress_filter = ProgressFilter(
        filter_week=filter_week,
        week_offset=week_offset,
        start_date=start_date,
        end_date=end_date,
        session_type=session_type
    )
    
    # Get progress data
    progress_data = service.get_progress_with_filter(
        user_id=current_user.id,
        progress_filter=progress_filter
    )
    
    return progress_data


@router.get("/summary", response_model=ProgressSummary)
async def get_progress_summary(
    filter_week: bool = Query(
        default=False,
        description="Filter by current week. If False, returns all-time summary."
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get progress summary only (without detailed charts data)
    
    Useful for quick overview without loading full chart data.
    """
    service = ProgressService(db)
    
    summary = service.get_progress_summary(
        user_id=current_user.id,
        filter_week=filter_week
    )
    
    return summary

