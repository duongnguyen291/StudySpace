"""
Tests for UserAchievement Model
"""
import pytest
import uuid
from sqlalchemy.orm import Session

from app.models.user_achievement import UserAchievement
from app.models.user import User
from app.models.achievement import Achievement


class TestUserAchievement:
    """Test cases for UserAchievement model"""

    @pytest.fixture
    def test_achievement(self, db_session: Session):
        """Create a test achievement"""
        achievement = Achievement(
            code="test_achievement",
            name="Test Achievement",
            description="A test achievement",
            active=True
        )
        db_session.add(achievement)
        db_session.commit()
        db_session.refresh(achievement)
        return achievement

    def test_create_user_achievement(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test creating a user achievement instance"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()
        db_session.refresh(user_achievement)

        assert user_achievement.id is not None
        assert user_achievement.user_id == test_user.id
        assert user_achievement.achievement_id == test_achievement.id

    def test_user_achievement_id_is_uuid(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test that user achievement id is a UUID"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()
        db_session.refresh(user_achievement)

        assert isinstance(user_achievement.id, uuid.UUID)
        assert isinstance(user_achievement.user_id, uuid.UUID)
        assert isinstance(user_achievement.achievement_id, uuid.UUID)

    def test_user_achievement_user_relationship(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test the relationship between user achievement and user"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()
        db_session.refresh(user_achievement)

        assert user_achievement.user is not None
        assert user_achievement.user.id == test_user.id
        assert user_achievement.user.email == "test@example.com"

    def test_user_achievement_achievement_relationship(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test the relationship between user achievement and achievement"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()
        db_session.refresh(user_achievement)

        assert user_achievement.achievement is not None
        assert user_achievement.achievement.id == test_achievement.id
        assert user_achievement.achievement.code == "test_achievement"
        assert user_achievement.achievement.name == "Test Achievement"

    def test_user_achievement_cascade_delete_user(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test that user achievements are deleted when user is deleted"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()

        user_achievement_id = user_achievement.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_user_achievement = db_session.get(UserAchievement, user_achievement_id)
        assert deleted_user_achievement is None

    def test_user_achievement_cascade_delete_achievement(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test that user achievements are deleted when achievement is deleted"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()

        user_achievement_id = user_achievement.id
        db_session.delete(test_achievement)
        db_session.commit()

        deleted_user_achievement = db_session.get(UserAchievement, user_achievement_id)
        assert deleted_user_achievement is None

    def test_multiple_achievements_per_user(self, db_session: Session, test_user: User):
        """Test that a user can have multiple achievements"""
        achievement1 = Achievement(
            code="achievement1",
            name="Achievement 1",
            active=True
        )
        achievement2 = Achievement(
            code="achievement2",
            name="Achievement 2",
            active=True
        )
        achievement3 = Achievement(
            code="achievement3",
            name="Achievement 3",
            active=True
        )
        db_session.add_all([achievement1, achievement2, achievement3])
        db_session.commit()

        user_achievement1 = UserAchievement(
            user_id=test_user.id,
            achievement_id=achievement1.id
        )
        user_achievement2 = UserAchievement(
            user_id=test_user.id,
            achievement_id=achievement2.id
        )
        user_achievement3 = UserAchievement(
            user_id=test_user.id,
            achievement_id=achievement3.id
        )
        db_session.add_all([user_achievement1, user_achievement2, user_achievement3])
        db_session.commit()
        db_session.refresh(test_user)

        assert len(test_user.achievements) == 3
        achievement_ids = [ua.achievement_id for ua in test_user.achievements]
        assert achievement1.id in achievement_ids
        assert achievement2.id in achievement_ids
        assert achievement3.id in achievement_ids

    def test_user_achievement_delete(self, db_session: Session, test_user: User, test_achievement: Achievement):
        """Test deleting a user achievement"""
        user_achievement = UserAchievement(
            user_id=test_user.id,
            achievement_id=test_achievement.id
        )
        db_session.add(user_achievement)
        db_session.commit()

        user_achievement_id = user_achievement.id
        db_session.delete(user_achievement)
        db_session.commit()

        deleted_user_achievement = db_session.get(UserAchievement, user_achievement_id)
        assert deleted_user_achievement is None

    def test_same_achievement_multiple_users(self, db_session: Session, test_achievement: Achievement):
        """Test that the same achievement can be assigned to multiple users"""
        user1 = User(
            email="user1@example.com",
            password_hash="hash1",
            username="user1"
        )
        user2 = User(
            email="user2@example.com",
            password_hash="hash2",
            username="user2"
        )
        db_session.add_all([user1, user2])
        db_session.commit()

        user_achievement1 = UserAchievement(
            user_id=user1.id,
            achievement_id=test_achievement.id
        )
        user_achievement2 = UserAchievement(
            user_id=user2.id,
            achievement_id=test_achievement.id
        )
        db_session.add_all([user_achievement1, user_achievement2])
        db_session.commit()

        assert user_achievement1.user_id == user1.id
        assert user_achievement2.user_id == user2.id
        assert user_achievement1.achievement_id == test_achievement.id
        assert user_achievement2.achievement_id == test_achievement.id

