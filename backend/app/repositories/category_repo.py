"""
Category Repository
Data access layer for categories
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, List
from uuid import UUID

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository:
    """Repository for Category data access"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user_id: UUID, category_data: CategoryCreate) -> Category:
        """Create a new category"""
        category = Category(
            user_id=user_id,
            **category_data.model_dump()
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category
    
    def get_by_id(self, category_id: UUID, user_id: UUID) -> Optional[Category]:
        """Get category by ID (only if belongs to user)"""
        return self.db.query(Category).filter(
            and_(
                Category.id == category_id,
                Category.user_id == user_id
            )
        ).first()
    
    def get_all(self, user_id: UUID) -> List[Category]:
        """Get all categories for user"""
        return self.db.query(Category).filter(
            Category.user_id == user_id
        ).order_by(Category.name.asc()).all()
    
    def update(
        self, 
        category_id: UUID, 
        user_id: UUID, 
        category_data: CategoryUpdate
    ) -> Optional[Category]:
        """Update category"""
        category = self.get_by_id(category_id, user_id)
        if not category:
            return None
        
        update_data = category_data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(category, key, value)
        
        self.db.commit()
        self.db.refresh(category)
        return category
    
    def delete(self, category_id: UUID, user_id: UUID) -> bool:
        """Delete category"""
        category = self.get_by_id(category_id, user_id)
        if not category:
            return False
        
        self.db.delete(category)
        self.db.commit()
        return True
    
    def get_count(self, user_id: UUID) -> int:
        """Get total count of categories for user"""
        return self.db.query(func.count(Category.id)).filter(
            Category.user_id == user_id
        ).scalar()

