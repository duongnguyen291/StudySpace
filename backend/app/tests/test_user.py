"""
Tests for User Model
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User


class TestUser:
    """Test cases for User model"""

    def test_create_user(self, db_session: Session):
        """Test creating a user instance"""
        user = User(
            email="user@example.com",
            password_hash="hashed_password_123",
            username="testuser",
            avatar_url="https://example.com/avatar.jpg",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.email == "user@example.com"
        assert user.password_hash == "hashed_password_123"
        assert user.username == "testuser"
        assert user.avatar_url == "https://example.com/avatar.jpg"
        assert user.is_active is True
        assert user.created_at is not None
        assert user.updated_at is not None
        assert user.preferences == {}

    def test_user_default_values(self, db_session: Session):
        """Test that user has default values"""
        user = User(
            email="default@example.com",
            password_hash="hashed_password",
            username="defaultuser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.is_active is True
        assert user.avatar_url is None
        assert user.last_login is None
        assert user.preferences == {}

    def test_user_email_unique(self, db_session: Session):
        """Test that user email must be unique"""
        user1 = User(
            email="unique@example.com",
            password_hash="hash1",
            username="user1"
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            email="unique@example.com",
            password_hash="hash2",
            username="user2"
        )
        db_session.add(user2)

        with pytest.raises(Exception):  # Should raise IntegrityError
            db_session.commit()

    def test_user_timestamps(self, db_session: Session):
        """Test that created_at and updated_at are set automatically"""
        user = User(
            email="timestamp@example.com",
            password_hash="hash",
            username="timestampuser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)
        assert user.created_at == user.updated_at

    def test_user_updated_at_changes(self, db_session: Session):
        """Test that updated_at changes when user is updated"""
        user = User(
            email="update@example.com",
            password_hash="hash",
            username="updateuser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        original_updated_at = user.updated_at

        import time
        time.sleep(0.1)
        user.username = "updated_username"
        db_session.commit()
        db_session.refresh(user)

        assert user.updated_at > original_updated_at

    def test_user_id_is_uuid(self, db_session: Session):
        """Test that user id is a UUID"""
        user = User(
            email="uuid@example.com",
            password_hash="hash",
            username="uuiduser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert isinstance(user.id, uuid.UUID)

    def test_user_update(self, db_session: Session):
        """Test updating a user"""
        user = User(
            email="original@example.com",
            password_hash="original_hash",
            username="original_user"
        )
        db_session.add(user)
        db_session.commit()

        # Update fields
        user.username = "updated_user"
        user.avatar_url = "https://example.com/new_avatar.jpg"
        user.is_active = False
        user.preferences = {"theme": "dark", "language": "en"}
        db_session.commit()
        db_session.refresh(user)

        assert user.username == "updated_user"
        assert user.avatar_url == "https://example.com/new_avatar.jpg"
        assert user.is_active is False
        assert user.preferences == {"theme": "dark", "language": "en"}

    def test_user_delete(self, db_session: Session):
        """Test deleting a user"""
        user = User(
            email="delete@example.com",
            password_hash="hash",
            username="deleteuser"
        )
        db_session.add(user)
        db_session.commit()

        user_id = user.id
        db_session.delete(user)
        db_session.commit()

        deleted_user = db_session.get(User, user_id)
        assert deleted_user is None

    def test_user_last_login(self, db_session: Session):
        """Test setting last_login timestamp"""
        user = User(
            email="login@example.com",
            password_hash="hash",
            username="loginuser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.last_login is None

        login_time = datetime.utcnow()
        user.last_login = login_time
        db_session.commit()
        db_session.refresh(user)

        assert user.last_login is not None
        assert isinstance(user.last_login, datetime)

    def test_user_preferences(self, db_session: Session):
        """Test user preferences JSONB field"""
        user = User(
            email="prefs@example.com",
            password_hash="hash",
            username="prefsuser",
            preferences={"theme": "dark", "notifications": True, "items": [1, 2, 3]}
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.preferences == {"theme": "dark", "notifications": True, "items": [1, 2, 3]}
        assert user.preferences["theme"] == "dark"
        assert user.preferences["notifications"] is True
        assert user.preferences["items"] == [1, 2, 3]

    def test_user_relationships(self, db_session: Session):
        """Test user relationships with other models"""
        user = User(
            email="relationships@example.com",
            password_hash="hash",
            username="reluser"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        # Check that relationships are accessible
        assert hasattr(user, 'settings')
        assert hasattr(user, 'achievements')
        assert hasattr(user, 'categories')
        assert hasattr(user, 'tasks')

