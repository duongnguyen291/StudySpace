"""
Tests for Task Model
"""
import pytest
import uuid
from datetime import datetime, date
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.models.category import Category


class TestTask:
    """Test cases for Task model"""

    @pytest.fixture
    def test_category(self, db_session: Session, test_user: User):
        """Create a test category"""
        category = Category(
            user_id=test_user.id,
            name="Test Category"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)
        return category

    def test_create_task(self, db_session: Session, test_user: User, test_category: Category):
        """Test creating a task instance"""
        task = Task(
            user_id=test_user.id,
            category_id=test_category.id,
            title="Complete assignment",
            description="Finish the math homework",
            priority="high",
            completed=False,
            start_date=date(2024, 1, 1),
            due_date=date(2024, 1, 15)
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.id is not None
        assert task.user_id == test_user.id
        assert task.category_id == test_category.id
        assert task.title == "Complete assignment"
        assert task.description == "Finish the math homework"
        assert task.priority == "high"
        assert task.completed is False
        assert task.completed_at is None
        assert task.start_date == date(2024, 1, 1)
        assert task.due_date == date(2024, 1, 15)
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_create_task_without_category(self, db_session: Session, test_user: User):
        """Test creating a task without a category"""
        task = Task(
            user_id=test_user.id,
            title="Task Without Category",
            description="This task has no category"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.category_id is None
        assert task.title == "Task Without Category"

    def test_task_default_values(self, db_session: Session, test_user: User):
        """Test that task has default values"""
        task = Task(
            user_id=test_user.id,
            title="Default Task"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.priority == "medium"
        assert task.completed is False
        assert task.completed_at is None
        assert task.description is None
        assert task.start_date is None
        assert task.due_date is None

    def test_task_timestamps(self, db_session: Session, test_user: User):
        """Test that created_at and updated_at are set automatically"""
        task = Task(
            user_id=test_user.id,
            title="Timestamp Test"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert isinstance(task.created_at, datetime)
        assert isinstance(task.updated_at, datetime)
        assert task.created_at == task.updated_at

    def test_task_updated_at_changes(self, db_session: Session, test_user: User):
        """Test that updated_at changes when task is updated"""
        task = Task(
            user_id=test_user.id,
            title="Update Timestamp Test"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        original_updated_at = task.updated_at

        import time
        time.sleep(0.1)
        task.title = "Updated Title"
        db_session.commit()
        db_session.refresh(task)

        assert task.updated_at > original_updated_at

    def test_task_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that task id is a UUID"""
        task = Task(
            user_id=test_user.id,
            title="UUID Test"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert isinstance(task.id, uuid.UUID)
        assert isinstance(task.user_id, uuid.UUID)

    def test_task_update(self, db_session: Session, test_user: User):
        """Test updating a task"""
        task = Task(
            user_id=test_user.id,
            title="Original Title",
            description="Original Description",
            priority="low",
            completed=False
        )
        db_session.add(task)
        db_session.commit()

        # Update fields
        task.title = "Updated Title"
        task.description = "Updated Description"
        task.priority = "high"
        task.completed = True
        task.completed_at = datetime.utcnow()
        task.start_date = date(2024, 2, 1)
        task.due_date = date(2024, 2, 28)
        db_session.commit()
        db_session.refresh(task)

        assert task.title == "Updated Title"
        assert task.description == "Updated Description"
        assert task.priority == "high"
        assert task.completed is True
        assert task.completed_at is not None
        assert task.start_date == date(2024, 2, 1)
        assert task.due_date == date(2024, 2, 28)

    def test_task_delete(self, db_session: Session, test_user: User):
        """Test deleting a task"""
        task = Task(
            user_id=test_user.id,
            title="To Be Deleted"
        )
        db_session.add(task)
        db_session.commit()

        task_id = task.id
        db_session.delete(task)
        db_session.commit()

        deleted_task = db_session.get(Task, task_id)
        assert deleted_task is None

    def test_task_to_dict(self, db_session: Session, test_user: User, test_category: Category):
        """Test the to_dict method"""
        task = Task(
            user_id=test_user.id,
            category_id=test_category.id,
            title="Dict Test",
            description="Test description",
            priority="high",
            completed=True,
            start_date=date(2024, 1, 1),
            due_date=date(2024, 1, 15)
        )
        task.completed_at = datetime.utcnow()
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        task_dict = task.to_dict()

        assert isinstance(task_dict, dict)
        assert task_dict["id"] == str(task.id)
        assert task_dict["user_id"] == str(task.user_id)
        assert task_dict["category_id"] == str(test_category.id)
        assert task_dict["title"] == "Dict Test"
        assert task_dict["description"] == "Test description"
        assert task_dict["priority"] == "high"
        assert task_dict["completed"] is True
        assert "completed_at" in task_dict
        assert "start_date" in task_dict
        assert "due_date" in task_dict
        assert "created_at" in task_dict
        assert "updated_at" in task_dict

    def test_task_repr(self, db_session: Session, test_user: User):
        """Test the __repr__ method"""
        task = Task(
            user_id=test_user.id,
            title="Repr Test",
            completed=False
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        repr_string = repr(task)
        assert "Task" in repr_string
        assert "Repr Test" in repr_string
        assert str(task.id) in repr_string
        assert "False" in repr_string

    def test_task_user_relationship(self, db_session: Session, test_user: User):
        """Test the relationship between task and user"""
        task = Task(
            user_id=test_user.id,
            title="Relationship Test"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.user is not None
        assert task.user.id == test_user.id
        assert task.user.email == "test@example.com"

    def test_task_category_relationship(self, db_session: Session, test_user: User, test_category: Category):
        """Test the relationship between task and category"""
        task = Task(
            user_id=test_user.id,
            category_id=test_category.id,
            title="Category Relationship Test"
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.category is not None
        assert task.category.id == test_category.id
        assert task.category.name == "Test Category"

    def test_task_category_set_null_on_delete(self, db_session: Session, test_user: User, test_category: Category):
        """Test that category_id is set to NULL when category is deleted"""
        task = Task(
            user_id=test_user.id,
            category_id=test_category.id,
            title="Set Null Test"
        )
        db_session.add(task)
        db_session.commit()

        task_id = task.id
        db_session.delete(test_category)
        db_session.commit()
        
        # Query task again to verify category_id is set to NULL
        updated_task = db_session.get(Task, task_id)
        assert updated_task is not None
        assert updated_task.category_id is None

    def test_task_cascade_delete(self, db_session: Session, test_user: User):
        """Test that tasks are deleted when user is deleted"""
        task = Task(
            user_id=test_user.id,
            title="Cascade Test"
        )
        db_session.add(task)
        db_session.commit()

        task_id = task.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_task = db_session.get(Task, task_id)
        assert deleted_task is None

    def test_task_priorities(self, db_session: Session, test_user: User):
        """Test different priority values"""
        priorities = ["low", "medium", "high"]
        
        for priority in priorities:
            task = Task(
                user_id=test_user.id,
                title=f"{priority.capitalize()} Priority Task",
                priority=priority
            )
            db_session.add(task)
            db_session.commit()
            db_session.refresh(task)

            assert task.priority == priority
            db_session.delete(task)
            db_session.commit()

    def test_task_completion(self, db_session: Session, test_user: User):
        """Test task completion and completed_at timestamp"""
        task = Task(
            user_id=test_user.id,
            title="Completion Test",
            completed=False
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.completed is False
        assert task.completed_at is None

        # Mark as completed
        task.completed = True
        completed_time = datetime.utcnow()
        task.completed_at = completed_time
        db_session.commit()
        db_session.refresh(task)

        assert task.completed is True
        assert task.completed_at is not None
        assert isinstance(task.completed_at, datetime)

        # Mark as incomplete
        task.completed = False
        task.completed_at = None
        db_session.commit()
        db_session.refresh(task)

        assert task.completed is False
        assert task.completed_at is None

