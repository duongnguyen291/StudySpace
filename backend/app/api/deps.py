"""
API Dependencies
Common dependencies for API endpoints
"""
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Generator

from app.core.database import get_db
from app.core.security import get_current_user_id


def get_database() -> Generator[Session, None, None]:
    """Database dependency"""
    return get_db()


def get_current_user() -> str:
    """Current user dependency"""
    return Depends(get_current_user_id)

