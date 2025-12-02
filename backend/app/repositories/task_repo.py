from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter

class TaskRepository:
    """Repository for Task data access"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user_id: UUID, task_data: TaskCreate) -> Task:
        """Create a new task"""
        task = Task(
            user_id=user_id,
            **task_data.model_dump()
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def get_by_id(self, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """Get task by ID (only if belongs to user)"""
        return self.db.query(Task).filter(
            and_(
                Task.id == task_id,
                Task.user_id == user_id
            )
        ).first()
    
    def get_all(
        self, 
        user_id: UUID, 
        filters: TaskFilter
    ) -> Tuple[List[Task], int]:
        """Get all tasks with filters and pagination"""
        query = self.db.query(Task).filter(Task.user_id == user_id)
        
        # Apply filters
        if filters.category_id:
            query = query.filter(Task.category_id == filters.category_id)
        
        if filters.priority:
            query = query.filter(Task.priority == filters.priority)
        
        if filters.completed is not None:
            query = query.filter(Task.completed == filters.completed)
        
        if filters.due_date_from:
            query = query.filter(Task.due_date >= filters.due_date_from)
        
        if filters.due_date_to:
            query = query.filter(Task.due_date <= filters.due_date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term)
                )
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Task, filters.sort_by, Task.created_at)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        tasks = query.all()
        return tasks, total
    
    def update(
        self, 
        task_id: UUID, 
        user_id: UUID, 
        task_data: TaskUpdate
    ) -> Optional[Task]:
        """Update task"""
        task = self.get_by_id(task_id, user_id)
        if not task:
            return None
        
        update_data = task_data.model_dump(exclude_unset=True)
        
        # Handle completed_at timestamp
        if 'completed' in update_data:
            if update_data['completed'] and not task.completed:
                update_data['completed_at'] = datetime.utcnow()
            elif not update_data['completed']:
                update_data['completed_at'] = None
        
        for key, value in update_data.items():
            setattr(task, key, value)
        
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def toggle_completed(self, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """Toggle task completed status"""
        task = self.get_by_id(task_id, user_id)
        if not task:
            return None
        
        task.completed = not task.completed
        task.completed_at = datetime.utcnow() if task.completed else None
        
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def delete(self, task_id: UUID, user_id: UUID) -> bool:
        """Delete task"""
        task = self.get_by_id(task_id, user_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        return True
    
    def get_stats(self, user_id: UUID) -> dict:
        """Get task statistics for user"""
        total = self.db.query(func.count(Task.id)).filter(
            Task.user_id == user_id
        ).scalar()
        
        completed = self.db.query(func.count(Task.id)).filter(
            and_(
                Task.user_id == user_id,
                Task.completed == True
            )
        ).scalar()
        
        pending = total - completed
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 2)
        }

    def bulk_delete(self, user_id: UUID, task_ids: List[UUID]) -> int:
        """Delete multiple tasks at once"""
        result = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                Task.id.in_(task_ids)
            )
        ).delete(synchronize_session=False)
        
        self.db.commit()
        return result

    def bulk_complete(self, user_id: UUID, task_ids: List[UUID], completed: bool = True) -> int:
        """Mark multiple tasks as completed/uncompleted"""
        update_data = {
            "completed": completed,
            "completed_at": datetime.utcnow() if completed else None
        }
        
        result = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                Task.id.in_(task_ids)
            )
        ).update(update_data, synchronize_session=False)
        
        self.db.commit()
        return result