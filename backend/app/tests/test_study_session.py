"""
Tests for StudySession Model
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.study_session import StudySession
from app.models.user import User


class TestStudySession:
    """Test cases for StudySession model"""

    def test_create_study_session(self, db_session: Session, test_user: User):
        """Test creating a study session instance"""
        start_time = datetime.utcnow()
        end_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            end_time=end_time,
            duration_minutes=25,
            notes="Great study session",
            completed=True
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.id is not None
        assert session.user_id == test_user.id
        assert session.session_type == "pomodoro"
        assert session.start_time == start_time
        assert session.end_time == end_time
        assert session.duration_minutes == 25
        assert session.notes == "Great study session"
        assert session.completed is True
        assert session.created_at is not None

    def test_study_session_default_values(self, db_session: Session, test_user: User):
        """Test that study session has default values"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="free_study",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.completed is False
        assert session.end_time is None
        assert session.duration_minutes is None
        assert session.notes is None
        assert session.goal_id is None

    def test_study_session_timestamps(self, db_session: Session, test_user: User):
        """Test that created_at is set automatically"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert isinstance(session.created_at, datetime)

    def test_study_session_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that study session id is a UUID"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert isinstance(session.id, uuid.UUID)
        assert isinstance(session.user_id, uuid.UUID)

    def test_study_session_update(self, db_session: Session, test_user: User):
        """Test updating a study session"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            completed=False
        )
        db_session.add(session)
        db_session.commit()

        # Update fields
        end_time = datetime.utcnow()
        session.end_time = end_time
        session.duration_minutes = 30
        session.notes = "Updated notes"
        session.completed = True
        db_session.commit()
        db_session.refresh(session)

        assert session.end_time == end_time
        assert session.duration_minutes == 30
        assert session.notes == "Updated notes"
        assert session.completed is True

    def test_study_session_delete(self, db_session: Session, test_user: User):
        """Test deleting a study session"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()

        session_id = session.id
        db_session.delete(session)
        db_session.commit()

        deleted_session = db_session.get(StudySession, session_id)
        assert deleted_session is None

    def test_study_session_user_relationship(self, db_session: Session, test_user: User):
        """Test the relationship between study session and user"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.user is not None
        assert session.user.id == test_user.id
        assert session.user.email == "test@example.com"

    def test_study_session_cascade_delete(self, db_session: Session, test_user: User):
        """Test that study sessions are deleted when user is deleted"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time
        )
        db_session.add(session)
        db_session.commit()

        session_id = session.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_session = db_session.get(StudySession, session_id)
        assert deleted_session is None

    def test_study_session_types(self, db_session: Session, test_user: User):
        """Test different session types"""
        session_types = ["pomodoro", "free_study", "quiz"]
        start_time = datetime.utcnow()
        
        for session_type in session_types:
            session = StudySession(
                user_id=test_user.id,
                session_type=session_type,
                start_time=start_time
            )
            db_session.add(session)
            db_session.commit()
            db_session.refresh(session)

            assert session.session_type == session_type
            db_session.delete(session)
            db_session.commit()

    def test_study_session_duration_calculation(self, db_session: Session, test_user: User):
        """Test setting duration_minutes"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            duration_minutes=25
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.duration_minutes == 25

        # Update duration
        session.duration_minutes = 50
        db_session.commit()
        db_session.refresh(session)

        assert session.duration_minutes == 50

    def test_study_session_completion(self, db_session: Session, test_user: User):
        """Test study session completion"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            completed=False
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.completed is False

        # Mark as completed
        session.completed = True
        session.end_time = datetime.utcnow()
        db_session.commit()
        db_session.refresh(session)

        assert session.completed is True
        assert session.end_time is not None

    def test_study_session_with_goal_id(self, db_session: Session, test_user: User):
        """Test study session with goal_id"""
        start_time = datetime.utcnow()
        goal_id = uuid.uuid4()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            goal_id=goal_id
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.goal_id == goal_id

    def test_study_session_notes(self, db_session: Session, test_user: User):
        """Test study session notes field"""
        start_time = datetime.utcnow()
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            notes="This was a productive session"
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.notes == "This was a productive session"

        # Update notes
        session.notes = "Updated notes"
        db_session.commit()
        db_session.refresh(session)

        assert session.notes == "Updated notes"

    def test_study_session_start_end_times(self, db_session: Session, test_user: User):
        """Test study session start and end times"""
        start_time = datetime(2024, 1, 1, 10, 0, 0)
        end_time = datetime(2024, 1, 1, 10, 25, 0)
        
        session = StudySession(
            user_id=test_user.id,
            session_type="pomodoro",
            start_time=start_time,
            end_time=end_time
        )
        db_session.add(session)
        db_session.commit()
        db_session.refresh(session)

        assert session.start_time == start_time
        assert session.end_time == end_time

        # Update end time
        new_end_time = datetime(2024, 1, 1, 10, 30, 0)
        session.end_time = new_end_time
        db_session.commit()
        db_session.refresh(session)

        assert session.end_time == new_end_time

