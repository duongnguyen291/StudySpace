"""
Quiz Service
Business logic for quiz management and CSV import/export
Simple format: just question and answer
"""
import csv
import io
from datetime import datetime
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quiz import QuizSet, QuizQuestion
from app.models.quiz_attempt import QuizAttempt
from app.schemas.quiz import (
    QuizSetCreate, QuizSetUpdate,
    QuizQuestionCreate,
    QuizAttemptCreate, QuizAttemptSubmit,
    CSVImportError, CSVImportResult, CSVPreviewRow, CSVPreviewResponse,
    QuizQuestionForAttempt
)


class QuizService:
    """Service class for quiz operations"""

    # ============================================
    # Quiz Set Operations
    # ============================================

    @staticmethod
    def create_quiz_set(db: Session, user_id: UUID, data: QuizSetCreate) -> QuizSet:
        """Create a new quiz set with optional questions"""
        quiz_set = QuizSet(
            user_id=user_id,
            title=data.title,
            description=data.description,
            category_id=data.category_id,
            is_public=data.is_public
        )
        db.add(quiz_set)
        db.flush()

        if data.questions:
            for idx, q_data in enumerate(data.questions):
                question = QuizQuestion(
                    quiz_set_id=quiz_set.id,
                    question_text=q_data.question_text,
                    correct_answer=q_data.correct_answer,
                    order_index=idx
                )
                db.add(question)

        db.commit()
        db.refresh(quiz_set)
        return quiz_set

    @staticmethod
    def get_quiz_set(db: Session, quiz_set_id: UUID, user_id: Optional[UUID] = None) -> Optional[QuizSet]:
        """Get a quiz set by ID"""
        query = db.query(QuizSet).filter(QuizSet.id == quiz_set_id)
        if user_id:
            query = query.filter((QuizSet.user_id == user_id) | (QuizSet.is_public == True))
        return query.first()

    @staticmethod
    def get_user_quiz_sets(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[QuizSet]:
        """Get all quiz sets for a user"""
        return db.query(QuizSet).filter(
            QuizSet.user_id == user_id
        ).order_by(QuizSet.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update_quiz_set(db: Session, quiz_set_id: UUID, user_id: UUID, data: QuizSetUpdate) -> Optional[QuizSet]:
        """Update a quiz set"""
        quiz_set = db.query(QuizSet).filter(
            QuizSet.id == quiz_set_id,
            QuizSet.user_id == user_id
        ).first()

        if not quiz_set:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(quiz_set, field, value)

        db.commit()
        db.refresh(quiz_set)
        return quiz_set

    @staticmethod
    def delete_quiz_set(db: Session, quiz_set_id: UUID, user_id: UUID) -> bool:
        """Delete a quiz set"""
        quiz_set = db.query(QuizSet).filter(
            QuizSet.id == quiz_set_id,
            QuizSet.user_id == user_id
        ).first()

        if not quiz_set:
            return False

        db.delete(quiz_set)
        db.commit()
        return True

    @staticmethod
    def get_question_count(db: Session, quiz_set_id: UUID) -> int:
        """Get the number of questions in a quiz set"""
        return db.query(func.count(QuizQuestion.id)).filter(
            QuizQuestion.quiz_set_id == quiz_set_id
        ).scalar() or 0

    # ============================================
    # Quiz Question Operations
    # ============================================

    @staticmethod
    def add_question(db: Session, quiz_set_id: UUID, user_id: UUID, data: QuizQuestionCreate) -> Optional[QuizQuestion]:
        """Add a question to a quiz set"""
        quiz_set = db.query(QuizSet).filter(
            QuizSet.id == quiz_set_id,
            QuizSet.user_id == user_id
        ).first()

        if not quiz_set:
            return None

        max_order = db.query(func.max(QuizQuestion.order_index)).filter(
            QuizQuestion.quiz_set_id == quiz_set_id
        ).scalar() or -1

        question = QuizQuestion(
            quiz_set_id=quiz_set_id,
            question_text=data.question_text,
            correct_answer=data.correct_answer,
            order_index=max_order + 1
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def update_question(db: Session, question_id: UUID, user_id: UUID, data: QuizQuestionCreate) -> Optional[QuizQuestion]:
        """Update a quiz question"""
        question = db.query(QuizQuestion).join(QuizSet).filter(
            QuizQuestion.id == question_id,
            QuizSet.user_id == user_id
        ).first()

        if not question:
            return None

        question.question_text = data.question_text
        question.correct_answer = data.correct_answer
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question_id: UUID, user_id: UUID) -> bool:
        """Delete a quiz question"""
        question = db.query(QuizQuestion).join(QuizSet).filter(
            QuizQuestion.id == question_id,
            QuizSet.user_id == user_id
        ).first()

        if not question:
            return False

        db.delete(question)
        db.commit()
        return True

    # ============================================
    # CSV Import/Export - Simple format: question,answer
    # ============================================

    @staticmethod
    def parse_csv(content: str) -> Tuple[List[str], List[List[str]], List[CSVImportError]]:
        """Parse CSV content"""
        errors = []
        rows = []
        headers = []

        try:
            reader = csv.reader(io.StringIO(content))
            lines = list(reader)

            if not lines:
                errors.append(CSVImportError(line=0, message="Empty file"))
                return headers, rows, errors

            headers = [h.strip().lower() for h in lines[0]]

            if 'question' not in headers:
                errors.append(CSVImportError(line=1, message="Missing 'question' column"))
            if 'answer' not in headers:
                errors.append(CSVImportError(line=1, message="Missing 'answer' column"))

            for row in lines[1:]:
                if not row or (len(row) == 1 and not row[0].strip()):
                    continue
                rows.append([cell.strip() for cell in row])

        except Exception as e:
            errors.append(CSVImportError(line=0, message=f"Parse error: {str(e)}"))

        return headers, rows, errors

    @staticmethod
    def preview_csv(content: str, limit: int = 10) -> CSVPreviewResponse:
        """Preview CSV content with validation"""
        headers, rows, parse_errors = QuizService.parse_csv(content)

        if parse_errors:
            return CSVPreviewResponse(
                headers=headers or ['question', 'answer'],
                rows=[], total_rows=0, valid_rows=0, errors=parse_errors
            )

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')

        preview_rows = []
        valid_count = 0
        all_errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx is not None and q_idx < len(row) else ""
            answer = row[a_idx] if a_idx is not None and a_idx < len(row) else ""

            is_valid = bool(question and answer)
            error_msg = None if is_valid else "Missing question or answer"
            
            if not is_valid:
                all_errors.append(CSVImportError(line=line_num, message=error_msg))
            else:
                valid_count += 1

            if len(preview_rows) < limit:
                preview_rows.append(CSVPreviewRow(
                    line=line_num, question=question, answer=answer,
                    is_valid=is_valid, error=error_msg
                ))

        return CSVPreviewResponse(
            headers=headers, rows=preview_rows,
            total_rows=len(rows), valid_rows=valid_count, errors=all_errors
        )

    @staticmethod
    def import_csv(db: Session, user_id: UUID, content: str, title: str, description: Optional[str] = None) -> CSVImportResult:
        """Import quiz questions from CSV"""
        headers, rows, parse_errors = QuizService.parse_csv(content)

        if parse_errors:
            return CSVImportResult(success=False, errors=parse_errors)

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')

        if q_idx is None or a_idx is None:
            return CSVImportResult(success=False, errors=[CSVImportError(line=1, message="Missing columns")])

        quiz_set = QuizSet(user_id=user_id, title=title, description=description)
        db.add(quiz_set)
        db.flush()

        imported = 0
        errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx < len(row) else ""
            answer = row[a_idx] if a_idx < len(row) else ""

            if not question or not answer:
                errors.append(CSVImportError(line=line_num, message="Missing question or answer"))
                continue

            q = QuizQuestion(
                quiz_set_id=quiz_set.id,
                question_text=question,
                correct_answer=answer,
                order_index=imported
            )
            db.add(q)
            imported += 1

        if imported == 0:
            db.rollback()
            return CSVImportResult(success=False, errors=errors or [CSVImportError(line=0, message="No valid questions")])

        db.commit()
        db.refresh(quiz_set)
        return CSVImportResult(success=True, quiz_set_id=quiz_set.id, questions_imported=imported, errors=errors)

    @staticmethod
    def export_csv(db: Session, quiz_set_id: UUID, user_id: UUID) -> Optional[str]:
        """Export quiz questions to CSV"""
        quiz_set = db.query(QuizSet).filter(
            QuizSet.id == quiz_set_id,
            (QuizSet.user_id == user_id) | (QuizSet.is_public == True)
        ).first()

        if not quiz_set:
            return None

        questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_set_id == quiz_set_id
        ).order_by(QuizQuestion.order_index).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['question', 'answer'])

        for q in questions:
            writer.writerow([q.question_text, q.correct_answer])

        return output.getvalue()

    @staticmethod
    def get_csv_template() -> str:
        """Get CSV template"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['question', 'answer'])
        writer.writerow(['What is 2+2?', '4'])
        writer.writerow(['Capital of France?', 'Paris'])
        return output.getvalue()

    # ============================================
    # Quiz Attempt Operations
    # ============================================

    @staticmethod
    def start_attempt(db: Session, user_id: UUID, data: QuizAttemptCreate) -> Optional[Tuple[QuizAttempt, List[QuizQuestionForAttempt]]]:
        """Start a new quiz attempt"""
        quiz_set = db.query(QuizSet).filter(
            QuizSet.id == data.quiz_set_id,
            (QuizSet.user_id == user_id) | (QuizSet.is_public == True)
        ).first()

        if not quiz_set:
            return None

        questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_set_id == data.quiz_set_id
        ).order_by(QuizQuestion.order_index).all()

        if not questions:
            return None

        attempt = QuizAttempt(
            user_id=user_id,
            quiz_set_id=data.quiz_set_id,
            total_questions=len(questions)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        questions_for_attempt = [
            QuizQuestionForAttempt(
                id=q.id,
                question_text=q.question_text,
                question_type="short_answer",
                order_index=q.order_index
            )
            for q in questions
        ]

        return attempt, questions_for_attempt

    @staticmethod
    def submit_attempt(db: Session, attempt_id: UUID, user_id: UUID, data: QuizAttemptSubmit) -> Optional[QuizAttempt]:
        """Submit quiz answers and calculate score"""
        attempt = db.query(QuizAttempt).filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at == None
        ).first()

        if not attempt:
            return None

        questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_set_id == attempt.quiz_set_id
        ).all()

        question_map = {str(q.id): q for q in questions}

        correct_count = 0
        answers_dict = {}

        for answer in data.answers:
            q_id = str(answer.question_id)
            answers_dict[q_id] = answer.user_answer

            if q_id in question_map:
                q = question_map[q_id]
                if answer.user_answer.strip().lower() == q.correct_answer.strip().lower():
                    correct_count += 1

        attempt.answers = answers_dict
        attempt.correct_answers = correct_count
        attempt.score = (correct_count / attempt.total_questions * 100) if attempt.total_questions > 0 else 0
        attempt.time_spent_seconds = data.time_spent_seconds
        attempt.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def get_user_attempts(db: Session, user_id: UUID, quiz_set_id: Optional[UUID] = None, skip: int = 0, limit: int = 50) -> List[QuizAttempt]:
        """Get user's quiz attempts"""
        query = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id)
        if quiz_set_id:
            query = query.filter(QuizAttempt.quiz_set_id == quiz_set_id)
        return query.order_by(QuizAttempt.created_at.desc()).offset(skip).limit(limit).all()


quiz_service = QuizService()
