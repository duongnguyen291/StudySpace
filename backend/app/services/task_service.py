from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.repositories.task_repo import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskFilter, BulkActionResponse
from app.models.task import Task

class TaskService:
    """Service for Task business logic"""
    
    def __init__(self, db: Session):
        self.repo = TaskRepository(db)
    
    def create_task(self, user_id: UUID, task_data: TaskCreate) -> TaskResponse:
        """Create a new task"""
        task = self.repo.create(user_id, task_data)
        return TaskResponse.model_validate(task)
    
    def get_task(self, task_id: UUID, user_id: UUID) -> Optional[TaskResponse]:
        """Get task by ID"""
        task = self.repo.get_by_id(task_id, user_id)
        if not task:
            return None
        return TaskResponse.model_validate(task)
    
    def get_tasks(self, user_id: UUID, filters: TaskFilter) -> TaskListResponse:
        """Get all tasks with filters"""
        tasks, total = self.repo.get_all(user_id, filters)
        
        task_responses = [TaskResponse.model_validate(task) for task in tasks]
        
        total_pages = (total + filters.page_size - 1) // filters.page_size
        
        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            has_next=filters.page < total_pages,
            has_prev=filters.page > 1
        )
    
    def update_task(
        self, 
        task_id: UUID, 
        user_id: UUID, 
        task_data: TaskUpdate
    ) -> Optional[TaskResponse]:
        """Update task"""
        task = self.repo.update(task_id, user_id, task_data)
        if not task:
            return None
        return TaskResponse.model_validate(task)
    
    def toggle_task(self, task_id: UUID, user_id: UUID) -> Optional[TaskResponse]:
        """Toggle task completed status"""
        task = self.repo.toggle_completed(task_id, user_id)
        if not task:
            return None
        return TaskResponse.model_validate(task)
    
    def delete_task(self, task_id: UUID, user_id: UUID) -> bool:
        """Delete task"""
        return self.repo.delete(task_id, user_id)
    
    def get_task_stats(self, user_id: UUID) -> dict:
        """Get task statistics"""
        return self.repo.get_stats(user_id)
    
    def bulk_delete(self, user_id: UUID, task_ids: List[UUID]) -> BulkActionResponse:
        """Delete multiple tasks"""
        affected_count = self.repo.bulk_delete(user_id, task_ids)
        return BulkActionResponse(
            success=True,
            affected_count=affected_count,
            message=f"Successfully deleted {affected_count} task(s)"
        )
    
    def bulk_complete(self, user_id: UUID, task_ids: List[UUID], completed: bool = True) -> BulkActionResponse:
        """Mark multiple tasks as completed/uncompleted"""
        affected_count = self.repo.bulk_complete(user_id, task_ids, completed)
        status = "completed" if completed else "uncompleted"
        return BulkActionResponse(
            success=True,
            affected_count=affected_count,
            message=f"Successfully marked {affected_count} task(s) as {status}"
        )