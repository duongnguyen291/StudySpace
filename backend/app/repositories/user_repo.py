"""
User Repository
Data access layer for User operations
"""
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model"""
    
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def create_user(self, email: str, username: str, password_hash: str) -> User:
        """Create a new user"""
        user = User(
            email=email,
            username=username,
            password_hash=password_hash,
            is_active=True,
            preferences={}
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_last_login(self, user_id: UUID) -> Optional[User]:
        """Update user's last login timestamp"""
        user = self.get(user_id)
        if user:
            from datetime import datetime
            user.last_login = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
        return user

