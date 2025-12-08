"""
Basic smoke tests for quiz history schemas.
These do not hit the database; they only validate schema construction.
"""
from uuid import uuid4
from datetime import datetime

from app.schemas.quiz import (
    QuizAttemptQuestionDetail,
    QuizAttemptHistoryItem,
    QuizAttemptDetailWithAnswers,
)


def test_history_item_constructs():
    item = QuizAttemptHistoryItem(
        id=uuid4(),
        user_id=uuid4(),
        quiz_set_id=uuid4(),
        quiz_set_title="Sample Quiz",
        score=80.0,
        total_questions=10,
        correct_answers=8,
        time_spent_seconds=120,
        completed_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
    )
    assert item.quiz_set_title == "Sample Quiz"
    assert item.correct_answers == 8


def test_detail_with_answers_holds_questions():
    detail = QuizAttemptDetailWithAnswers(
        id=uuid4(),
        user_id=uuid4(),
        quiz_set_id=uuid4(),
        quiz_set_title="Sample Quiz",
        score=90.0,
        total_questions=2,
        correct_answers=2,
        time_spent_seconds=90,
        completed_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        questions=[
          QuizAttemptQuestionDetail(
              question_id=uuid4(),
              question_text="Q1",
              correct_answer="A1",
              user_answer="A1",
              is_correct=True,
          ),
          QuizAttemptQuestionDetail(
              question_id=uuid4(),
              question_text="Q2",
              correct_answer="A2",
              user_answer="wrong",
              is_correct=False,
          ),
        ],
    )
    assert len(detail.questions) == 2
    assert detail.questions[0].is_correct is True
    assert detail.questions[1].user_answer == "wrong"

