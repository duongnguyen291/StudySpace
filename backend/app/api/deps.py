"""
API Dependencies
Common dependencies for API endpoints
"""
from fastapi import Depends

from app.core.database import get_db
from app.core.security import get_current_user_id

# Alias for convenience
get_database = get_db
get_current_user = get_current_user_id

