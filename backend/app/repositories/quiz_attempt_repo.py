"""
Quiz Attempt Repository
Data access layer for Quiz Attempt operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from app.models.quiz_attempt import QuizAttempt
from app.repositories.base import BaseRepository


class QuizAttemptRepository(BaseRepository[QuizAttempt]):
    """Repository for QuizAttempt model"""
    
    def __init__(self, db: Session):
        super().__init__(QuizAttempt, db)
    
    def get_by_user(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuizAttempt]:
        """Get all quiz attempts for a user"""
        return (
            self.db.query(QuizAttempt)
            .filter(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.completed_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_date_range(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date
    ) -> List[QuizAttempt]:
        """Get quiz attempts within a date range"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        return (
            self.db.query(QuizAttempt)
            .filter(
                and_(
                    QuizAttempt.user_id == user_id,
                    QuizAttempt.completed_at >= start_datetime,
                    QuizAttempt.completed_at <= end_datetime
                )
            )
            .order_by(QuizAttempt.completed_at.asc())
            .all()
        )
    
    def get_by_week(
        self,
        user_id: UUID,
        week_start: date
    ) -> List[QuizAttempt]:
        """Get quiz attempts for a specific week"""
        week_end = week_start + timedelta(days=6)
        return self.get_by_date_range(user_id, week_start, week_end)
    
    def get_current_week(
        self,
        user_id: UUID
    ) -> List[QuizAttempt]:
        """Get quiz attempts for current week"""
        today = date.today()
        # Get Monday of current week
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        return self.get_by_week(user_id, week_start)
    
    def get_total_quizzes(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Get total quiz count for a user (optionally filtered by date range)"""
        query = (
            self.db.query(func.count(QuizAttempt.id))
            .filter(QuizAttempt.user_id == user_id)
        )
        
        if start_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            query = query.filter(QuizAttempt.completed_at >= start_datetime)
        
        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(QuizAttempt.completed_at <= end_datetime)
        
        result = query.scalar()
        return int(result) if result else 0
    
    def get_daily_quiz_stats(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date
    ) -> List[dict]:
        """Get daily quiz statistics grouped by date"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        results = (
            self.db.query(
                func.date(QuizAttempt.completed_at).label('date'),
                func.count(QuizAttempt.id).label('quiz_count')
            )
            .filter(
                and_(
                    QuizAttempt.user_id == user_id,
                    QuizAttempt.completed_at >= start_datetime,
                    QuizAttempt.completed_at <= end_datetime
                )
            )
            .group_by(func.date(QuizAttempt.completed_at))
            .order_by(func.date(QuizAttempt.completed_at).asc())
            .all()
        )
        
        return [
            {
                'date': row.date,
                'quiz_count': int(row.quiz_count) if row.quiz_count else 0
            }
            for row in results
        ]

