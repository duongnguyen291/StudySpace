"""
Default Data Service
Creates default data for new users (categories, settings, etc.)
"""
from sqlalchemy.orm import Session
from uuid import UUID

from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate


# Default categories for new users
DEFAULT_CATEGORIES = [
    {"name": "Work", "color": "#3B82F6"},
    {"name": "Study", "color": "#8B5CF6"},
    {"name": "Personal", "color": "#10B981"},
    {"name": "Health", "color": "#EF4444"},
    {"name": "Finance", "color": "#F59E0B"},
]


class DefaultDataService:
    """Service to create default data for new users"""
    
    def __init__(self, db: Session):
        self.db = db
        self.category_repo = CategoryRepository(db)
    
    def create_default_categories(self, user_id: UUID) -> int:
        """
        Create default categories for a new user
        Returns the number of categories created
        """
        created_count = 0
        for cat_data in DEFAULT_CATEGORIES:
            try:
                self.category_repo.create(
                    user_id=user_id,
                    category_data=CategoryCreate(**cat_data)
                )
                created_count += 1
            except Exception:
                # Continue even if one category fails
                pass
        return created_count
    
    def setup_new_user(self, user_id: UUID) -> dict:
        """
        Setup all default data for a new user
        Can be extended to add more default data in the future
        """
        result = {
            "categories_created": self.create_default_categories(user_id),
        }
        return result

