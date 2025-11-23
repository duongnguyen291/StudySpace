"""
User Service
Business logic for user operations
"""
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from datetime import timedelta

from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User


class UserService:
    """Service for user business logic"""
    
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
    
    def register_user(self, user_data: UserCreate) -> UserResponse:
        """Register a new user"""
        # Check if email already exists
        existing_user = self.repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_username = self.repo.get_by_username(user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Create user
        user = self.repo.create_user(
            email=user_data.email,
            username=user_data.username,
            password_hash=password_hash
        )
        
        return UserResponse.model_validate(user)
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.repo.get_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Update last login
        self.repo.update_last_login(user.id)
        
        return user
    
    def get_user_by_id(self, user_id: UUID) -> Optional[UserResponse]:
        """Get user by ID"""
        user = self.repo.get(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    def update_user(self, user_id: UUID, user_data: UserUpdate) -> UserResponse:
        """Update user information"""
        user = self.repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check username uniqueness if updating
        if user_data.username and user_data.username != user.username:
            existing = self.repo.get_by_username(user_data.username)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        updated_user = self.repo.update(user, update_data)
        
        return UserResponse.model_validate(updated_user)

