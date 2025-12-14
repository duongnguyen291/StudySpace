"""
Tests for Category Model
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.user import User


class TestCategory:
    """Test cases for Category model"""

    def test_create_category(self, db_session: Session, test_user: User):
        """Test creating a category instance"""
        category = Category(
            user_id=test_user.id,
            name="Study Materials",
            color="#3B82F6",
            icon="book"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.id is not None
        assert category.user_id == test_user.id
        assert category.name == "Study Materials"
        assert category.color == "#3B82F6"
        assert category.icon == "book"
        assert category.created_at is not None
        assert category.updated_at is not None

    def test_category_default_values(self, db_session: Session, test_user: User):
        """Test that category has default values for color and icon"""
        category = Category(
            user_id=test_user.id,
            name="Default Category"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.color == "#3B82F6"
        assert category.icon == "folder"

    def test_category_timestamps(self, db_session: Session, test_user: User):
        """Test that created_at and updated_at are set automatically"""
        category = Category(
            user_id=test_user.id,
            name="Timestamp Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert isinstance(category.created_at, datetime)
        assert isinstance(category.updated_at, datetime)
        assert category.created_at == category.updated_at

    def test_category_updated_at_changes(self, db_session: Session, test_user: User):
        """Test that updated_at changes when category is updated"""
        category = Category(
            user_id=test_user.id,
            name="Update Timestamp Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        original_updated_at = category.updated_at

        # Wait a bit and update
        import time
        time.sleep(0.1)
        category.name = "Updated Name"
        db_session.commit()
        db_session.refresh(category)

        assert category.updated_at > original_updated_at

    def test_category_to_dict(self, db_session: Session, test_user: User):
        """Test the to_dict method"""
        category = Category(
            user_id=test_user.id,
            name="Dict Test",
            color="#FF5733",
            icon="star"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        category_dict = category.to_dict()

        assert isinstance(category_dict, dict)
        assert category_dict["id"] == str(category.id)
        assert category_dict["user_id"] == str(category.user_id)
        assert category_dict["name"] == "Dict Test"
        assert category_dict["color"] == "#FF5733"
        assert category_dict["icon"] == "star"
        assert "created_at" in category_dict
        assert "updated_at" in category_dict

    def test_category_repr(self, db_session: Session, test_user: User):
        """Test the __repr__ method"""
        category = Category(
            user_id=test_user.id,
            name="Repr Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        repr_string = repr(category)
        assert "Category" in repr_string
        assert "Repr Test" in repr_string
        assert str(category.id) in repr_string
        assert str(category.user_id) in repr_string

    def test_category_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that category id is a UUID"""
        category = Category(
            user_id=test_user.id,
            name="UUID Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert isinstance(category.id, uuid.UUID)
        assert isinstance(category.user_id, uuid.UUID)

    def test_category_update(self, db_session: Session, test_user: User):
        """Test updating a category"""
        category = Category(
            user_id=test_user.id,
            name="Original Name",
            color="#3B82F6",
            icon="folder"
        )
        db_session.add(category)
        db_session.commit()

        # Update fields
        category.name = "Updated Name"
        category.color = "#FF5733"
        category.icon = "star"
        db_session.commit()
        db_session.refresh(category)

        assert category.name == "Updated Name"
        assert category.color == "#FF5733"
        assert category.icon == "star"

    def test_category_delete(self, db_session: Session, test_user: User):
        """Test deleting a category"""
        category = Category(
            user_id=test_user.id,
            name="To Be Deleted"
        )
        db_session.add(category)
        db_session.commit()

        category_id = category.id
        db_session.delete(category)
        db_session.commit()

        deleted_category = db_session.get(Category, category_id)
        assert deleted_category is None

    def test_category_user_relationship(self, db_session: Session, test_user: User):
        """Test the relationship between category and user"""
        category = Category(
            user_id=test_user.id,
            name="Relationship Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.user is not None
        assert category.user.id == test_user.id
        assert category.user.email == "test@example.com"

    def test_category_cascade_delete(self, db_session: Session, test_user: User):
        """Test that categories are deleted when user is deleted"""
        category = Category(
            user_id=test_user.id,
            name="Cascade Test"
        )
        db_session.add(category)
        db_session.commit()

        category_id = category.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_category = db_session.get(Category, category_id)
        assert deleted_category is None

