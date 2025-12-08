"""
Categories API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.category_service import CategoryService
from app.schemas.category import (
    CategoryCreate, 
    CategoryUpdate, 
    CategoryResponse, 
    CategoryListResponse
)

router = APIRouter()


# ============================================
# DEPENDENCIES
# ============================================
def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    """Dependency to get CategoryService instance"""
    return CategoryService(db)


# ============================================
# ENDPOINTS
# ============================================

@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
    description="Create a new category for the current user"
)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Create a new category"""
    return service.create_category(current_user.id, category_data)


@router.get(
    "",
    response_model=CategoryListResponse,
    summary="Get all categories",
    description="Get all categories for the current user"
)
async def get_categories(
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Get all categories"""
    return service.get_categories(current_user.id)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Get category by ID",
    description="Get a specific category by ID"
)
async def get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Get category by ID"""
    category = service.get_category(category_id, current_user.id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update category",
    description="Update a category by ID"
)
async def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Update category"""
    category = service.update_category(category_id, current_user.id, category_data)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete category",
    description="Delete a category by ID"
)
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Delete category"""
    success = service.delete_category(category_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return None

