"""
Tasks API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreate, 
    TaskUpdate, 
    TaskResponse, 
    TaskListResponse,
    TaskFilter,
    BulkTaskIds,
    BulkActionResponse
)

router = APIRouter()

# ============================================
# DEPENDENCIES
# ============================================
def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    """Dependency to get TaskService instance"""
    return TaskService(db)

# ============================================
# ENDPOINTS
# ============================================

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task for the current user"
)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Create a new task"""
    return service.create_task(current_user.id, task_data)


@router.get(
    "",
    response_model=TaskListResponse,
    summary="Get all tasks",
    description="Get all tasks for the current user with filtering and pagination"
)
async def get_tasks(
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    priority: Optional[str] = Query(None, description="Filter by priority (low/medium/high)"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Get all tasks with filters"""
    filters = TaskFilter(
        category_id=category_id,
        priority=priority,
        completed=completed,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return service.get_tasks(current_user.id, filters)


@router.get(
    "/stats",
    summary="Get task statistics",
    description="Get task statistics for the current user"
)
async def get_task_stats(
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Get task statistics"""
    return service.get_task_stats(current_user.id)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID",
    description="Get a specific task by ID"
)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Get task by ID"""
    task = service.get_task(task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task",
    description="Update a task by ID"
)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Update task"""
    task = service.update_task(task_id, current_user.id, task_data)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.patch(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    summary="Toggle task completion",
    description="Toggle the completed status of a task"
)
async def toggle_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Toggle task completed status"""
    task = service.toggle_task(task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Delete a task by ID"
)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Delete task"""
    success = service.delete_task(task_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return None


# ============================================
# BULK OPERATIONS
# ============================================

@router.post(
    "/bulk/delete",
    response_model=BulkActionResponse,
    summary="Bulk delete tasks",
    description="Delete multiple tasks at once"
)
async def bulk_delete_tasks(
    data: BulkTaskIds,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Delete multiple tasks"""
    return service.bulk_delete(current_user.id, data.task_ids)


@router.post(
    "/bulk/complete",
    response_model=BulkActionResponse,
    summary="Bulk complete tasks",
    description="Mark multiple tasks as completed"
)
async def bulk_complete_tasks(
    data: BulkTaskIds,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Mark multiple tasks as completed"""
    return service.bulk_complete(current_user.id, data.task_ids, completed=True)


@router.post(
    "/bulk/uncomplete",
    response_model=BulkActionResponse,
    summary="Bulk uncomplete tasks",
    description="Mark multiple tasks as uncompleted"
)
async def bulk_uncomplete_tasks(
    data: BulkTaskIds,
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """Mark multiple tasks as uncompleted"""
    return service.bulk_complete(current_user.id, data.task_ids, completed=False)

