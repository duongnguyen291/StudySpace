"""
Tests for UserSettings Model
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings
from app.models.user import User


class TestUserSettings:
    """Test cases for UserSettings model"""

    def test_create_user_settings(self, db_session: Session, test_user: User):
        """Test creating a user settings instance"""
        settings = UserSettings(
            user_id=test_user.id,
            theme_mode="dark",
            pomodoro_work_duration=30,
            pomodoro_break_duration=10,
            pomodoro_long_break_duration=20,
            default_music_playlist="lofi",
            notification_enabled=True,
            language="en"
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert settings.id is not None
        assert settings.user_id == test_user.id
        assert settings.theme_mode == "dark"
        assert settings.pomodoro_work_duration == 30
        assert settings.pomodoro_break_duration == 10
        assert settings.pomodoro_long_break_duration == 20
        assert settings.default_music_playlist == "lofi"
        assert settings.notification_enabled is True
        assert settings.language == "en"
        assert settings.created_at is not None
        assert settings.updated_at is not None

    def test_user_settings_default_values(self, db_session: Session, test_user: User):
        """Test that user settings have default values"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert settings.theme_mode == "light"
        assert settings.pomodoro_work_duration == 25
        assert settings.pomodoro_break_duration == 5
        assert settings.pomodoro_long_break_duration == 15
        assert settings.notification_enabled is True
        assert settings.language == "vi"
        assert settings.default_music_playlist is None

    def test_user_settings_unique_user_id(self, db_session: Session, test_user: User):
        """Test that user_id must be unique (one settings per user)"""
        settings1 = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings1)
        db_session.commit()

        settings2 = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings2)

        with pytest.raises(Exception):  # Should raise IntegrityError
            db_session.commit()

    def test_user_settings_timestamps(self, db_session: Session, test_user: User):
        """Test that created_at and updated_at are set automatically"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert isinstance(settings.created_at, datetime)
        assert isinstance(settings.updated_at, datetime)
        assert settings.created_at == settings.updated_at

    def test_user_settings_updated_at_changes(self, db_session: Session, test_user: User):
        """Test that updated_at changes when settings are updated"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        original_updated_at = settings.updated_at

        import time
        time.sleep(0.1)
        settings.theme_mode = "dark"
        db_session.commit()
        db_session.refresh(settings)

        assert settings.updated_at > original_updated_at

    def test_user_settings_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that settings id is a UUID"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert isinstance(settings.id, uuid.UUID)
        assert isinstance(settings.user_id, uuid.UUID)

    def test_user_settings_update(self, db_session: Session, test_user: User):
        """Test updating user settings"""
        settings = UserSettings(
            user_id=test_user.id,
            theme_mode="light",
            pomodoro_work_duration=25
        )
        db_session.add(settings)
        db_session.commit()

        # Update fields
        settings.theme_mode = "dark"
        settings.pomodoro_work_duration = 45
        settings.pomodoro_break_duration = 15
        settings.pomodoro_long_break_duration = 30
        settings.default_music_playlist = "piano"
        settings.notification_enabled = False
        settings.language = "en"
        db_session.commit()
        db_session.refresh(settings)

        assert settings.theme_mode == "dark"
        assert settings.pomodoro_work_duration == 45
        assert settings.pomodoro_break_duration == 15
        assert settings.pomodoro_long_break_duration == 30
        assert settings.default_music_playlist == "piano"
        assert settings.notification_enabled is False
        assert settings.language == "en"

    def test_user_settings_delete(self, db_session: Session, test_user: User):
        """Test deleting user settings"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()

        settings_id = settings.id
        db_session.delete(settings)
        db_session.commit()

        deleted_settings = db_session.get(UserSettings, settings_id)
        assert deleted_settings is None

    def test_user_settings_user_relationship(self, db_session: Session, test_user: User):
        """Test the relationship between user settings and user"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert settings.user is not None
        assert settings.user.id == test_user.id
        assert settings.user.email == "test@example.com"

    def test_user_settings_cascade_delete(self, db_session: Session, test_user: User):
        """Test that settings are deleted when user is deleted"""
        settings = UserSettings(
            user_id=test_user.id
        )
        db_session.add(settings)
        db_session.commit()

        settings_id = settings.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_settings = db_session.get(UserSettings, settings_id)
        assert deleted_settings is None

    def test_user_settings_pomodoro_durations(self, db_session: Session, test_user: User):
        """Test different pomodoro duration values"""
        settings = UserSettings(
            user_id=test_user.id,
            pomodoro_work_duration=20,
            pomodoro_break_duration=5,
            pomodoro_long_break_duration=15
        )
        db_session.add(settings)
        db_session.commit()
        db_session.refresh(settings)

        assert settings.pomodoro_work_duration == 20
        assert settings.pomodoro_break_duration == 5
        assert settings.pomodoro_long_break_duration == 15

        # Update to different values
        settings.pomodoro_work_duration = 50
        settings.pomodoro_break_duration = 10
        settings.pomodoro_long_break_duration = 30
        db_session.commit()
        db_session.refresh(settings)

        assert settings.pomodoro_work_duration == 50
        assert settings.pomodoro_break_duration == 10
        assert settings.pomodoro_long_break_duration == 30

