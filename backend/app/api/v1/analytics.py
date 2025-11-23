"""
Analytics API endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.api.deps import get_database, get_current_user
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    WeeklyProgressResponse,
    ProgressSummary,
    ProgressFilter
)

router = APIRouter()


@router.get("/dashboard", response_model=ProgressSummary)
async def get_dashboard_stats(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get dashboard statistics
    
    Returns overall progress summary including:
    - Total minutes, quizzes, sessions (all time)
    - Week statistics
    - Average daily metrics
    """
    from uuid import UUID
    service = AnalyticsService(db)
    
    summary = service.get_progress_summary(
        user_id=UUID(current_user_id),
        filter_week=False  # Get all-time summary for dashboard
    )
    
    return summary


@router.get("/progress", response_model=WeeklyProgressResponse)
async def get_progress(
    filter_week: bool = Query(
        default=True,
        description="Filter by current week. If False, returns all-time data."
    ),
    start_date: Optional[date] = Query(
        default=None,
        description="Start date for custom date range (YYYY-MM-DD)"
    ),
    end_date: Optional[date] = Query(
        default=None,
        description="End date for custom date range (YYYY-MM-DD)"
    ),
    session_type: Optional[str] = Query(
        default=None,
        description="Filter by session type: 'pomodoro', 'free_study', or 'quiz'"
    ),
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get learning progress with charts data
    
    Returns:
    - Progress summary (total minutes/quizzes/sessions)
    - Daily progress data for bar charts
    - Session type statistics for pie charts
    - Week range information
    
    Query Parameters:
    - filter_week: Filter by current week (default: True)
    - start_date: Custom start date (optional)
    - end_date: Custom end date (optional)
    - session_type: Filter by session type (optional)
    """
    from uuid import UUID
    service = AnalyticsService(db)
    
    # Create filter object
    progress_filter = ProgressFilter(
        filter_week=filter_week,
        start_date=start_date,
        end_date=end_date,
        session_type=session_type
    )
    
    # Get progress data
    progress_data = service.get_progress_with_filter(
        user_id=UUID(current_user_id),
        progress_filter=progress_filter
    )
    
    return progress_data


@router.get("/progress/summary", response_model=ProgressSummary)
async def get_progress_summary(
    filter_week: bool = Query(
        default=False,
        description="Filter by current week. If False, returns all-time summary."
    ),
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """
    Get progress summary only (without detailed charts data)
    
    Useful for quick overview without loading full chart data.
    """
    from uuid import UUID
    service = AnalyticsService(db)
    
    summary = service.get_progress_summary(
        user_id=UUID(current_user_id),
        filter_week=filter_week
    )
    
    return summary

