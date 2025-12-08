"""
Profile Service
Business logic for profile operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status

from app.repositories.user_repo import UserRepository
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.models.user import User


class ProfileService:
    """Service for profile business logic"""
    
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db
    
    def get_profile(self, user_id: UUID) -> ProfileResponse:
        """Get user profile with total study hours"""
        user = self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Calculate total study hours from study_sessions
        total_study_hours = self._calculate_total_study_hours(user_id)
        
        # Create response with total_study_hours
        profile_data = ProfileResponse.model_validate(user)
        profile_data.total_study_hours = total_study_hours
        
        return profile_data
    
    def update_profile(self, user_id: UUID, profile_data: ProfileUpdate) -> ProfileResponse:
        """Update user profile"""
        user = self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check username uniqueness if updating
        if profile_data.username and profile_data.username != user.username:
            existing = self.repo.get_by_username(profile_data.username)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update fields
        update_data = profile_data.model_dump(exclude_unset=True)
        updated_user = self.repo.update(user, update_data)
        
        # Calculate total study hours
        total_study_hours = self._calculate_total_study_hours(user_id)
        
        # Create response
        response = ProfileResponse.model_validate(updated_user)
        response.total_study_hours = total_study_hours
        
        return response
    
    def _calculate_total_study_hours(self, user_id: UUID) -> float:
        """Calculate total study hours from study_sessions"""
        try:
            # Query study_sessions table directly using text() for raw SQL
            result = self.db.execute(
                text("""
                    SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes
                    FROM study_sessions
                    WHERE user_id = :user_id AND completed = TRUE
                """),
                {"user_id": str(user_id)}
            ).first()
            
            total_minutes = result[0] if result else 0
            # Convert minutes to hours
            total_hours = round(total_minutes / 60.0, 2)
            return total_hours
        except Exception as e:
            # If table doesn't exist or error, return 0
            return 0.0

