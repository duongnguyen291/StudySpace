"""
Tests for QuizAttempt Model
"""
import pytest
import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.quiz_attempt import QuizAttempt
from app.models.user import User


class TestQuizAttempt:
    """Test cases for QuizAttempt model"""

    def test_create_quiz_attempt(self, db_session: Session, test_user: User):
        """Test creating a quiz attempt instance"""
        quiz_set_id = uuid.uuid4()
        completed_at = datetime.utcnow()
        answers = {"q1": "answer1", "q2": "answer2"}
        
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("85.50"),
            total_questions=10,
            correct_answers=8,
            time_spent_seconds=600,
            completed_at=completed_at,
            answers=answers
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.id is not None
        assert quiz_attempt.user_id == test_user.id
        assert quiz_attempt.quiz_set_id == quiz_set_id
        assert quiz_attempt.score == Decimal("85.50")
        assert quiz_attempt.total_questions == 10
        assert quiz_attempt.correct_answers == 8
        assert quiz_attempt.time_spent_seconds == 600
        assert quiz_attempt.completed_at == completed_at
        assert quiz_attempt.answers == answers

    def test_quiz_attempt_default_values(self, db_session: Session, test_user: User):
        """Test that quiz attempt has default values"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("100.00"),
            total_questions=5,
            correct_answers=5
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.time_spent_seconds is None
        assert quiz_attempt.answers is None
        assert quiz_attempt.completed_at is not None
        assert isinstance(quiz_attempt.completed_at, datetime)

    def test_quiz_attempt_timestamps(self, db_session: Session, test_user: User):
        """Test that completed_at is set automatically"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("75.00"),
            total_questions=10,
            correct_answers=7
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert isinstance(quiz_attempt.completed_at, datetime)

    def test_quiz_attempt_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that quiz attempt id is a UUID"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("80.00"),
            total_questions=10,
            correct_answers=8
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert isinstance(quiz_attempt.id, uuid.UUID)
        assert isinstance(quiz_attempt.user_id, uuid.UUID)
        assert isinstance(quiz_attempt.quiz_set_id, uuid.UUID)

    def test_quiz_attempt_update(self, db_session: Session, test_user: User):
        """Test updating a quiz attempt"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("70.00"),
            total_questions=10,
            correct_answers=7,
            time_spent_seconds=500
        )
        db_session.add(quiz_attempt)
        db_session.commit()

        # Update fields
        quiz_attempt.score = Decimal("90.00")
        quiz_attempt.correct_answers = 9
        quiz_attempt.time_spent_seconds = 550
        quiz_attempt.answers = {"q1": "updated_answer"}
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.score == Decimal("90.00")
        assert quiz_attempt.correct_answers == 9
        assert quiz_attempt.time_spent_seconds == 550
        assert quiz_attempt.answers == {"q1": "updated_answer"}

    def test_quiz_attempt_delete(self, db_session: Session, test_user: User):
        """Test deleting a quiz attempt"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("80.00"),
            total_questions=10,
            correct_answers=8
        )
        db_session.add(quiz_attempt)
        db_session.commit()

        quiz_attempt_id = quiz_attempt.id
        db_session.delete(quiz_attempt)
        db_session.commit()

        deleted_quiz_attempt = db_session.get(QuizAttempt, quiz_attempt_id)
        assert deleted_quiz_attempt is None

    def test_quiz_attempt_user_relationship(self, db_session: Session, test_user: User):
        """Test the relationship between quiz attempt and user"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("85.00"),
            total_questions=10,
            correct_answers=8
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.user is not None
        assert quiz_attempt.user.id == test_user.id
        assert quiz_attempt.user.email == "test@example.com"

    def test_quiz_attempt_cascade_delete(self, db_session: Session, test_user: User):
        """Test that quiz attempts are deleted when user is deleted"""
        quiz_set_id = uuid.uuid4()
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("80.00"),
            total_questions=10,
            correct_answers=8
        )
        db_session.add(quiz_attempt)
        db_session.commit()

        quiz_attempt_id = quiz_attempt.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_quiz_attempt = db_session.get(QuizAttempt, quiz_attempt_id)
        assert deleted_quiz_attempt is None

    def test_quiz_attempt_score_calculation(self, db_session: Session, test_user: User):
        """Test different score values"""
        quiz_set_id = uuid.uuid4()
        
        # Test perfect score
        quiz_attempt1 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("100.00"),
            total_questions=10,
            correct_answers=10
        )
        db_session.add(quiz_attempt1)
        db_session.commit()
        db_session.refresh(quiz_attempt1)

        assert quiz_attempt1.score == Decimal("100.00")
        assert quiz_attempt1.correct_answers == quiz_attempt1.total_questions

        # Test partial score
        quiz_attempt2 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("50.00"),
            total_questions=10,
            correct_answers=5
        )
        db_session.add(quiz_attempt2)
        db_session.commit()
        db_session.refresh(quiz_attempt2)

        assert quiz_attempt2.score == Decimal("50.00")
        assert quiz_attempt2.correct_answers == 5

        # Test zero score
        quiz_attempt3 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("0.00"),
            total_questions=10,
            correct_answers=0
        )
        db_session.add(quiz_attempt3)
        db_session.commit()
        db_session.refresh(quiz_attempt3)

        assert quiz_attempt3.score == Decimal("0.00")
        assert quiz_attempt3.correct_answers == 0

    def test_quiz_attempt_answers_jsonb(self, db_session: Session, test_user: User):
        """Test answers JSONB field with various data structures"""
        quiz_set_id = uuid.uuid4()
        
        # Test simple dictionary
        answers1 = {"question1": "answer1", "question2": "answer2"}
        quiz_attempt1 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("80.00"),
            total_questions=2,
            correct_answers=2,
            answers=answers1
        )
        db_session.add(quiz_attempt1)
        db_session.commit()
        db_session.refresh(quiz_attempt1)

        assert quiz_attempt1.answers == answers1

        # Test nested dictionary
        answers2 = {
            "question1": {"answer": "A", "time": 30},
            "question2": {"answer": "B", "time": 25}
        }
        quiz_attempt2 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("90.00"),
            total_questions=2,
            correct_answers=2,
            answers=answers2
        )
        db_session.add(quiz_attempt2)
        db_session.commit()
        db_session.refresh(quiz_attempt2)

        assert quiz_attempt2.answers == answers2
        assert quiz_attempt2.answers["question1"]["answer"] == "A"

    def test_quiz_attempt_time_spent(self, db_session: Session, test_user: User):
        """Test time_spent_seconds field"""
        quiz_set_id = uuid.uuid4()
        
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("75.00"),
            total_questions=10,
            correct_answers=7,
            time_spent_seconds=300
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.time_spent_seconds == 300

        # Update time
        quiz_attempt.time_spent_seconds = 450
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.time_spent_seconds == 450

    def test_quiz_attempt_multiple_attempts_same_quiz(self, db_session: Session, test_user: User):
        """Test multiple attempts for the same quiz set"""
        quiz_set_id = uuid.uuid4()
        
        attempt1 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("60.00"),
            total_questions=10,
            correct_answers=6
        )
        attempt2 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("80.00"),
            total_questions=10,
            correct_answers=8
        )
        attempt3 = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("100.00"),
            total_questions=10,
            correct_answers=10
        )
        db_session.add_all([attempt1, attempt2, attempt3])
        db_session.commit()

        assert attempt1.quiz_set_id == quiz_set_id
        assert attempt2.quiz_set_id == quiz_set_id
        assert attempt3.quiz_set_id == quiz_set_id
        assert attempt1.score < attempt2.score < attempt3.score

    def test_quiz_attempt_completed_at_index(self, db_session: Session, test_user: User):
        """Test that completed_at can be set explicitly"""
        quiz_set_id = uuid.uuid4()
        custom_time = datetime(2024, 1, 1, 12, 0, 0)
        
        quiz_attempt = QuizAttempt(
            user_id=test_user.id,
            quiz_set_id=quiz_set_id,
            score=Decimal("85.00"),
            total_questions=10,
            correct_answers=8,
            completed_at=custom_time
        )
        db_session.add(quiz_attempt)
        db_session.commit()
        db_session.refresh(quiz_attempt)

        assert quiz_attempt.completed_at == custom_time

