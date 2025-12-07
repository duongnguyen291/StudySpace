from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, date
from uuid import UUID

# ============================================
# ENUMS
# ============================================
class TaskPriority(str):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# ============================================
# BASE SCHEMAS
# ============================================
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    category_id: Optional[UUID] = Field(None, description="Category ID")
    priority: str = Field(default="medium", description="Task priority: low, medium, high")
    start_date: Optional[date] = Field(None, description="Start date")
    due_date: Optional[date] = Field(None, description="Due date")

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        valid_priorities = ['low', 'medium', 'high']
        if v not in valid_priorities:
            raise ValueError(f'Priority must be one of: {", ".join(valid_priorities)}')
        return v

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

# ============================================
# REQUEST SCHEMAS
# ============================================
class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    pass

class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    priority: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None

    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        if v is not None:
            valid_priorities = ['low', 'medium', 'high']
            if v not in valid_priorities:
                raise ValueError(f'Priority must be one of: {", ".join(valid_priorities)}')
        return v

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v

# ============================================
# RESPONSE SCHEMAS
# ============================================
class TaskResponse(TaskBase):
    """Schema for task response"""
    id: UUID
    user_id: UUID
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    """Schema for paginated task list"""
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

# ============================================
# FILTER SCHEMAS
# ============================================
class TaskFilter(BaseModel):
    """Schema for filtering tasks"""
    category_id: Optional[UUID] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    search: Optional[str] = None  # Search in title and description
    
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="created_at", description="Field to sort by")
    sort_order: str = Field(default="desc", description="Sort order: asc or desc")

    @field_validator('sort_order')
    @classmethod
    def validate_sort_order(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('Sort order must be asc or desc')
        return v


# ============================================
# BULK OPERATION SCHEMAS
# ============================================
class BulkTaskIds(BaseModel):
    """Schema for bulk operations with task IDs"""
    task_ids: list[UUID] = Field(..., min_length=1, max_length=100, description="List of task IDs")


class BulkActionResponse(BaseModel):
    """Schema for bulk operation response"""
    success: bool
    affected_count: int
    message: str