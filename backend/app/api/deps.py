"""
API Dependencies
Common dependencies for API endpoints
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user_id

from app.models.user import User

get_database = get_db

def get_current_user_id_only(
    user_id: str = Depends(get_current_user_id)
):
    return user_id

async def get_current_user(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user object from JWT token.
    Returns the full User model, not just the ID.
    """
    user = db.query(User).filter(User.id == UUID(current_user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user