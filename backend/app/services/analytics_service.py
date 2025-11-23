"""
Analytics Service
Business logic for analytics and progress tracking
"""
from sqlalchemy.orm import Session
from typing import Optional, Tuple
from uuid import UUID
from datetime import date, timedelta

from app.repositories.study_session_repo import StudySessionRepository
from app.repositories.quiz_attempt_repo import QuizAttemptRepository
from app.schemas.analytics import (
    ProgressSummary,
    WeeklyProgressResponse,
    DailyProgress,
    SessionTypeStats,
    ProgressFilter
)


class AnalyticsService:
    """Service for analytics and progress tracking business logic"""
    
    def __init__(self, db: Session):
        self.study_session_repo = StudySessionRepository(db)
        self.quiz_attempt_repo = QuizAttemptRepository(db)
    
    def _get_week_range(self, filter_week: bool = False) -> Tuple[date, date]:
        """Get start and end date for current week or all time"""
        if filter_week:
            today = date.today()
            # Get Monday of current week
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
            week_end = week_start + timedelta(days=6)
            return week_start, week_end
        else:
            # Return a wide range for all time (can be adjusted)
            return date(2020, 1, 1), date.today()
    
    def get_progress_summary(
        self,
        user_id: UUID,
        filter_week: bool = False
    ) -> ProgressSummary:
        """Get overall progress summary"""
        week_start, week_end = self._get_week_range(filter_week)
        
        # Total statistics (all time)
        total_minutes = self.study_session_repo.get_total_minutes(user_id)
        total_sessions = self.study_session_repo.get_session_count(user_id)
        total_quizzes = self.quiz_attempt_repo.get_total_quizzes(user_id)
        
        # Week statistics
        week_minutes = self.study_session_repo.get_total_minutes(
            user_id, 
            start_date=week_start, 
            end_date=week_end
        )
        week_sessions = self.study_session_repo.get_session_count(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        week_quizzes = self.quiz_attempt_repo.get_total_quizzes(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        
        # Calculate averages (for the week)
        days_in_week = 7
        average_daily_minutes = week_minutes / days_in_week if days_in_week > 0 else 0.0
        average_daily_quizzes = week_quizzes / days_in_week if days_in_week > 0 else 0.0
        
        return ProgressSummary(
            total_minutes=total_minutes,
            total_quizzes=total_quizzes,
            total_sessions=total_sessions,
            week_minutes=week_minutes,
            week_quizzes=week_quizzes,
            week_sessions=week_sessions,
            average_daily_minutes=round(average_daily_minutes, 2),
            average_daily_quizzes=round(average_daily_quizzes, 2)
        )
    
    def get_weekly_progress(
        self,
        user_id: UUID,
        filter_week: bool = True
    ) -> WeeklyProgressResponse:
        """Get weekly progress with charts data"""
        week_start, week_end = self._get_week_range(filter_week)
        
        # Get summary
        summary = self.get_progress_summary(user_id, filter_week=filter_week)
        
        # Get daily progress for the week
        daily_session_stats = self.study_session_repo.get_daily_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        daily_quiz_stats = self.quiz_attempt_repo.get_daily_quiz_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        
        # Combine daily stats
        daily_stats_dict = {}
        for stat in daily_session_stats:
            date_key = stat['date']
            daily_stats_dict[date_key] = {
                'date': date_key,
                'total_minutes': stat['total_minutes'],
                'completed_sessions': stat['session_count'],
                'total_quizzes': 0
            }
        
        for stat in daily_quiz_stats:
            date_key = stat['date']
            if date_key in daily_stats_dict:
                daily_stats_dict[date_key]['total_quizzes'] = stat['quiz_count']
            else:
                daily_stats_dict[date_key] = {
                    'date': date_key,
                    'total_minutes': 0,
                    'completed_sessions': 0,
                    'total_quizzes': stat['quiz_count']
                }
        
        # Fill in missing days with zeros
        daily_progress = []
        current_date = week_start
        while current_date <= week_end:
            if current_date in daily_stats_dict:
                daily_progress.append(DailyProgress(**daily_stats_dict[current_date]))
            else:
                daily_progress.append(DailyProgress(
                    date=current_date,
                    total_minutes=0,
                    total_quizzes=0,
                    completed_sessions=0
                ))
            current_date += timedelta(days=1)
        
        # Get session type statistics for pie chart
        session_type_data = self.study_session_repo.get_session_type_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        
        # Calculate percentages
        total_minutes_for_percentage = sum(
            stat['total_minutes'] for stat in session_type_data
        )
        
        session_type_stats = []
        for stat in session_type_data:
            percentage = 0.0
            if total_minutes_for_percentage > 0:
                percentage = (stat['total_minutes'] / total_minutes_for_percentage) * 100
            
            session_type_stats.append(SessionTypeStats(
                session_type=stat['session_type'],
                total_minutes=stat['total_minutes'],
                session_count=stat['session_count'],
                percentage=round(percentage, 2)
            ))
        
        return WeeklyProgressResponse(
            summary=summary,
            daily_progress=daily_progress,
            session_type_stats=session_type_stats,
            week_start=week_start,
            week_end=week_end
        )
    
    def get_progress_with_filter(
        self,
        user_id: UUID,
        progress_filter: ProgressFilter
    ) -> WeeklyProgressResponse:
        """Get progress with custom filters"""
        # Determine date range
        if progress_filter.filter_week:
            week_start, week_end = self._get_week_range(filter_week=True)
        elif progress_filter.start_date and progress_filter.end_date:
            week_start = progress_filter.start_date
            week_end = progress_filter.end_date
        else:
            # Default to current week
            week_start, week_end = self._get_week_range(filter_week=True)
        
        # Get summary (respecting filter_week flag)
        summary = self.get_progress_summary(
            user_id, 
            filter_week=progress_filter.filter_week
        )
        
        # Get daily progress
        daily_session_stats = self.study_session_repo.get_daily_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        daily_quiz_stats = self.quiz_attempt_repo.get_daily_quiz_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        
        # Combine daily stats (same logic as get_weekly_progress)
        daily_stats_dict = {}
        for stat in daily_session_stats:
            date_key = stat['date']
            daily_stats_dict[date_key] = {
                'date': date_key,
                'total_minutes': stat['total_minutes'],
                'completed_sessions': stat['session_count'],
                'total_quizzes': 0
            }
        
        for stat in daily_quiz_stats:
            date_key = stat['date']
            if date_key in daily_stats_dict:
                daily_stats_dict[date_key]['total_quizzes'] = stat['quiz_count']
            else:
                daily_stats_dict[date_key] = {
                    'date': date_key,
                    'total_minutes': 0,
                    'completed_sessions': 0,
                    'total_quizzes': stat['quiz_count']
                }
        
        # Fill in missing days
        daily_progress = []
        current_date = week_start
        while current_date <= week_end:
            if current_date in daily_stats_dict:
                daily_progress.append(DailyProgress(**daily_stats_dict[current_date]))
            else:
                daily_progress.append(DailyProgress(
                    date=current_date,
                    total_minutes=0,
                    total_quizzes=0,
                    completed_sessions=0
                ))
            current_date += timedelta(days=1)
        
        # Get session type statistics
        session_type_data = self.study_session_repo.get_session_type_stats(
            user_id,
            start_date=week_start,
            end_date=week_end
        )
        
        # Filter by session type if specified
        if progress_filter.session_type:
            session_type_data = [
                stat for stat in session_type_data 
                if stat['session_type'] == progress_filter.session_type
            ]
        
        # Calculate percentages
        total_minutes_for_percentage = sum(
            stat['total_minutes'] for stat in session_type_data
        )
        
        session_type_stats = []
        for stat in session_type_data:
            percentage = 0.0
            if total_minutes_for_percentage > 0:
                percentage = (stat['total_minutes'] / total_minutes_for_percentage) * 100
            
            session_type_stats.append(SessionTypeStats(
                session_type=stat['session_type'],
                total_minutes=stat['total_minutes'],
                session_count=stat['session_count'],
                percentage=round(percentage, 2)
            ))
        
        return WeeklyProgressResponse(
            summary=summary,
            daily_progress=daily_progress,
            session_type_stats=session_type_stats,
            week_start=week_start,
            week_end=week_end
        )

