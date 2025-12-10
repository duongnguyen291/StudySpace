"""
Tests for Achievement Model
"""
import pytest
import uuid
from sqlalchemy.orm import Session

from app.models.achievement import Achievement


class TestAchievement:
    """Test cases for Achievement model"""

    def test_create_achievement(self, db_session: Session):
        """Test creating an achievement instance"""
        achievement = Achievement(
            code="first_task",
            name="First Task",
            description="Complete your first task",
            url="https://example.com/achievement.png",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()
        db_session.refresh(achievement)

        assert achievement.id is not None
        assert achievement.code == "first_task"
        assert achievement.name == "First Task"
        assert achievement.description == "Complete your first task"
        assert achievement.url == "https://example.com/achievement.png"
        assert achievement.active is True

    def test_achievement_code_unique(self, db_session: Session):
        """Test that achievement code must be unique"""
        achievement1 = Achievement(
            code="unique_code",
            name="Achievement 1",
            active=True
        )
        db_session.add(achievement1)
        db_session.commit()

        achievement2 = Achievement(
            code="unique_code",
            name="Achievement 2",
            active=True
        )
        db_session.add(achievement2)

        with pytest.raises(Exception):  # Should raise IntegrityError
            db_session.commit()

    def test_achievement_default_active(self, db_session: Session):
        """Test that active defaults to True"""
        achievement = Achievement(
            code="test_code",
            name="Test Achievement"
        )
        db_session.add(achievement)
        db_session.commit()
        db_session.refresh(achievement)

        assert achievement.active is True

    def test_achievement_optional_fields(self, db_session: Session):
        """Test that description and url are optional"""
        achievement = Achievement(
            code="minimal_achievement",
            name="Minimal Achievement",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()
        db_session.refresh(achievement)

        assert achievement.description is None
        assert achievement.url is None
        assert achievement.code == "minimal_achievement"
        assert achievement.name == "Minimal Achievement"

    def test_achievement_id_is_uuid(self, db_session: Session):
        """Test that achievement id is a UUID"""
        achievement = Achievement(
            code="uuid_test",
            name="UUID Test",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()
        db_session.refresh(achievement)

        assert isinstance(achievement.id, uuid.UUID)

    def test_achievement_update(self, db_session: Session):
        """Test updating an achievement"""
        achievement = Achievement(
            code="update_test",
            name="Original Name",
            description="Original Description",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()

        # Update fields
        achievement.name = "Updated Name"
        achievement.description = "Updated Description"
        achievement.active = False
        db_session.commit()
        db_session.refresh(achievement)

        assert achievement.name == "Updated Name"
        assert achievement.description == "Updated Description"
        assert achievement.active is False

    def test_achievement_delete(self, db_session: Session):
        """Test deleting an achievement"""
        achievement = Achievement(
            code="delete_test",
            name="To Be Deleted",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()

        achievement_id = achievement.id
        db_session.delete(achievement)
        db_session.commit()

        deleted_achievement = db_session.get(Achievement, achievement_id)
        assert deleted_achievement is None

