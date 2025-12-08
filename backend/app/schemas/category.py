"""
Category Schemas
Pydantic schemas for category management
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


# ============================================
# BASE SCHEMAS
# ============================================
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    color: str = Field(default="#3B82F6", description="Hex color code")
    icon: str = Field(default="folder", description="Icon name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Color must be a valid hex color code (e.g., #3B82F6)')
        return v


# ============================================
# REQUEST SCHEMAS
# ============================================
class CategoryCreate(CategoryBase):
    """Schema for creating a new category"""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = None
    icon: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Name cannot be empty')
        return v.strip() if v else v

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v is not None and (not v.startswith('#') or len(v) != 7):
            raise ValueError('Color must be a valid hex color code (e.g., #3B82F6)')
        return v


# ============================================
# RESPONSE SCHEMAS
# ============================================
class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    """Schema for category list response"""
    categories: list[CategoryResponse]
    total: int

