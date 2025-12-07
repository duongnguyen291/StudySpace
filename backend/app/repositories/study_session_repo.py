"""
Study Session Repository
Data access layer for Study Session operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from app.models.study_session import StudySession
from app.repositories.base import BaseRepository


class StudySessionRepository(BaseRepository[StudySession]):
    """Repository for StudySession model"""
    
    def __init__(self, db: Session):
        super().__init__(StudySession, db)
    
    def get_by_user(
        self, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[StudySession]:
        """Get all study sessions for a user"""
        return (
            self.db.query(StudySession)
            .filter(StudySession.user_id == user_id)
            .order_by(StudySession.start_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_date_range(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date
    ) -> List[StudySession]:
        """Get study sessions within a date range"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        return (
            self.db.query(StudySession)
            .filter(
                and_(
                    StudySession.user_id == user_id,
                    StudySession.start_time >= start_datetime,
                    StudySession.start_time <= end_datetime
                )
            )
            .order_by(StudySession.start_time.asc())
            .all()
        )
    
    def get_by_week(
        self,
        user_id: UUID,
        week_start: date
    ) -> List[StudySession]:
        """Get study sessions for a specific week"""
        week_end = week_start + timedelta(days=6)
        return self.get_by_date_range(user_id, week_start, week_end)
    
    def get_current_week(
        self,
        user_id: UUID
    ) -> List[StudySession]:
        """Get study sessions for current week"""
        today = date.today()
        # Get Monday of current week
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        return self.get_by_week(user_id, week_start)
    
    def get_total_minutes(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Get total study minutes for a user (optionally filtered by date range)"""
        query = (
            self.db.query(func.sum(StudySession.duration_minutes))
            .filter(
                and_(
                    StudySession.user_id == user_id,
                    StudySession.completed == True,
                    StudySession.duration_minutes.isnot(None)
                )
            )
        )
        
        if start_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            query = query.filter(StudySession.start_time >= start_datetime)
        
        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(StudySession.start_time <= end_datetime)
        
        result = query.scalar()
        return int(result) if result else 0
    
    def get_session_count(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        session_type: Optional[str] = None
    ) -> int:
        """Get total session count for a user"""
        query = (
            self.db.query(func.count(StudySession.id))
            .filter(
                and_(
                    StudySession.user_id == user_id,
                    StudySession.completed == True
                )
            )
        )
        
        if start_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            query = query.filter(StudySession.start_time >= start_datetime)
        
        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(StudySession.start_time <= end_datetime)
        
        if session_type:
            query = query.filter(StudySession.session_type == session_type)
        
        result = query.scalar()
        return int(result) if result else 0
    
    def get_daily_stats(
        self,
        user_id: UUID,
        start_date: date,
        end_date: date
    ) -> List[dict]:
        """Get daily statistics grouped by date"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        results = (
            self.db.query(
                func.date(StudySession.start_time).label('date'),
                func.sum(StudySession.duration_minutes).label('total_minutes'),
                func.count(StudySession.id).label('session_count')
            )
            .filter(
                and_(
                    StudySession.user_id == user_id,
                    StudySession.completed == True,
                    StudySession.start_time >= start_datetime,
                    StudySession.start_time <= end_datetime
                )
            )
            .group_by(func.date(StudySession.start_time))
            .order_by(func.date(StudySession.start_time).asc())
            .all()
        )
        
        return [
            {
                'date': row.date,
                'total_minutes': int(row.total_minutes) if row.total_minutes else 0,
                'session_count': int(row.session_count) if row.session_count else 0
            }
            for row in results
        ]
    
    def get_session_type_stats(
        self,
        user_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[dict]:
        """Get statistics grouped by session type"""
        query = (
            self.db.query(
                StudySession.session_type,
                func.sum(StudySession.duration_minutes).label('total_minutes'),
                func.count(StudySession.id).label('session_count')
            )
            .filter(
                and_(
                    StudySession.user_id == user_id,
                    StudySession.completed == True,
                    StudySession.duration_minutes.isnot(None)
                )
            )
            .group_by(StudySession.session_type)
        )
        
        if start_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            query = query.filter(StudySession.start_time >= start_datetime)
        
        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(StudySession.start_time <= end_datetime)
        
        results = query.all()
        
        return [
            {
                'session_type': row.session_type,
                'total_minutes': int(row.total_minutes) if row.total_minutes else 0,
                'session_count': int(row.session_count) if row.session_count else 0
            }
            for row in results
        ]

