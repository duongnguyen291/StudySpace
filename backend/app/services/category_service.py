"""
Category Service
Business logic for category management
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from app.services.default_data_service import DefaultDataService


class CategoryService:
    """Service for Category business logic"""
    
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)
        self.db = db
    
    def create_category(self, user_id: UUID, category_data: CategoryCreate) -> CategoryResponse:
        """Create a new category"""
        category = self.repo.create(user_id, category_data)
        return CategoryResponse.model_validate(category)
    
    def get_category(self, category_id: UUID, user_id: UUID) -> Optional[CategoryResponse]:
        """Get category by ID"""
        category = self.repo.get_by_id(category_id, user_id)
        if not category:
            return None
        return CategoryResponse.model_validate(category)
    
    def get_categories(self, user_id: UUID) -> CategoryListResponse:
        """Get all categories for user (creates defaults if none exist)"""
        categories = self.repo.get_all(user_id)
        
        # Lazy init: Create default categories if user has none
        if not categories:
            default_service = DefaultDataService(self.db)
            default_service.create_default_categories(user_id)
            categories = self.repo.get_all(user_id)
        
        category_responses = [CategoryResponse.model_validate(cat) for cat in categories]
        
        return CategoryListResponse(
            categories=category_responses,
            total=len(category_responses)
        )
    
    def update_category(
        self, 
        category_id: UUID, 
        user_id: UUID, 
        category_data: CategoryUpdate
    ) -> Optional[CategoryResponse]:
        """Update category"""
        category = self.repo.update(category_id, user_id, category_data)
        if not category:
            return None
        return CategoryResponse.model_validate(category)
    
    def delete_category(self, category_id: UUID, user_id: UUID) -> bool:
        """Delete category"""
        return self.repo.delete(category_id, user_id)

