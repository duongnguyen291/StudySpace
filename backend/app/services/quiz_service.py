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
    QuizQuestionForAttempt,
    QuizAttemptQuestionDetail
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
                    options=q_data.options,
                    correct_answer_index=q_data.correct_answer_index,
                    explanation=q_data.explanation,
                    order_index=idx
                )
                db.add(question)

        db.commit()
        db.refresh(quiz_set)
        # Ensure the quiz_set is fully loaded with all relationships
        return quiz_set

    @staticmethod
    def get_quiz_set(db: Session, quiz_set_id: UUID, user_id: Optional[UUID] = None) -> Optional[QuizSet]:
        """Get a quiz set by ID with questions loaded"""
        from sqlalchemy.orm import joinedload
        query = db.query(QuizSet).options(joinedload(QuizSet.questions)).filter(QuizSet.id == quiz_set_id)
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
            options=data.options,
            correct_answer_index=data.correct_answer_index,
            explanation=data.explanation,
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
        question.options = data.options
        question.correct_answer_index = data.correct_answer_index
        if data.explanation is not None:
            question.explanation = data.explanation
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
        """Parse CSV content for multiple choice format"""
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

            required_cols = ['question', 'option1', 'option2', 'option3', 'option4', 'correct_index']
            for col in required_cols:
                if col not in headers:
                    errors.append(CSVImportError(line=1, message=f"Missing '{col}' column"))

            for row in lines[1:]:
                if not row or (len(row) == 1 and not row[0].strip()):
                    continue
                rows.append([cell.strip() for cell in row])

        except Exception as e:
            errors.append(CSVImportError(line=0, message=f"Parse error: {str(e)}"))

        return headers, rows, errors

    @staticmethod
    def preview_csv(content: str, limit: int = 10) -> CSVPreviewResponse:
        """Preview CSV content with validation for multiple choice format"""
        headers, rows, parse_errors = QuizService.parse_csv(content)

        if parse_errors:
            return CSVPreviewResponse(
                headers=headers or ['question', 'option1', 'option2', 'option3', 'option4', 'correct_index'],
                rows=[], total_rows=0, valid_rows=0, errors=parse_errors
            )

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        opt_indices = [col_map.get(f'option{i}') for i in range(1, 5)]
        correct_idx = col_map.get('correct_index')

        preview_rows = []
        valid_count = 0
        all_errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx is not None and q_idx < len(row) else ""
            options = []
            for opt_idx in opt_indices:
                if opt_idx is not None and opt_idx < len(row):
                    options.append(row[opt_idx])
                else:
                    options.append("")
            
            correct_index_str = row[correct_idx] if correct_idx is not None and correct_idx < len(row) else ""
            
            # Validation
            is_valid = bool(question and all(options) and correct_index_str)
            error_msg = None
            
            if not question:
                error_msg = "Missing question"
            elif not all(options):
                error_msg = "Missing one or more options"
            elif not correct_index_str:
                error_msg = "Missing correct_index"
            else:
                try:
                    correct_index = int(correct_index_str)
                    if correct_index < 0 or correct_index > 3:
                        error_msg = "correct_index must be 0-3"
                        is_valid = False
                except ValueError:
                    error_msg = "correct_index must be a number (0-3)"
                    is_valid = False
            
            if not is_valid:
                all_errors.append(CSVImportError(line=line_num, message=error_msg or "Invalid row"))
            else:
                valid_count += 1

            if len(preview_rows) < limit:
                preview_rows.append(CSVPreviewRow(
                    line=line_num, 
                    question=question, 
                    options=options,
                    correct_index=int(correct_index_str) if correct_index_str.isdigit() else 0,
                    is_valid=is_valid, 
                    error=error_msg
                ))

        return CSVPreviewResponse(
            headers=headers, rows=preview_rows,
            total_rows=len(rows), valid_rows=valid_count, errors=all_errors
        )

    @staticmethod
    def import_csv(db: Session, user_id: UUID, content: str, title: str, description: Optional[str] = None) -> CSVImportResult:
        """Import quiz questions from CSV (multiple choice format)"""
        headers, rows, parse_errors = QuizService.parse_csv(content)

        if parse_errors:
            return CSVImportResult(success=False, errors=parse_errors)

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        opt_indices = [col_map.get(f'option{i}') for i in range(1, 5)]
        correct_idx = col_map.get('correct_index')
        explanation_idx = col_map.get('explanation')

        required_cols = [q_idx] + opt_indices + [correct_idx]
        if any(idx is None for idx in required_cols):
            return CSVImportResult(success=False, errors=[CSVImportError(line=1, message="Missing required columns")])

        quiz_set = QuizSet(user_id=user_id, title=title, description=description)
        db.add(quiz_set)
        db.flush()

        imported = 0
        errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx < len(row) else ""
            options = []
            for opt_idx in opt_indices:
                if opt_idx < len(row):
                    options.append(row[opt_idx].strip())
                else:
                    options.append("")
            
            correct_index_str = row[correct_idx] if correct_idx < len(row) else ""
            explanation = row[explanation_idx].strip() if explanation_idx is not None and explanation_idx < len(row) else None

            # Validation
            if not question:
                errors.append(CSVImportError(line=line_num, message="Missing question"))
                continue
            
            if not all(options):
                errors.append(CSVImportError(line=line_num, message="Missing one or more options"))
                continue
            
            try:
                correct_index = int(correct_index_str)
                if correct_index < 0 or correct_index > 3:
                    errors.append(CSVImportError(line=line_num, message="correct_index must be 0-3"))
                    continue
            except (ValueError, TypeError):
                errors.append(CSVImportError(line=line_num, message="correct_index must be a number (0-3)"))
                continue

            q = QuizQuestion(
                quiz_set_id=quiz_set.id,
                question_text=question,
                options=options,
                correct_answer_index=correct_index,
                explanation=explanation,
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
        """Export quiz questions to CSV (multiple choice format)"""
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
        writer.writerow(['question', 'option1', 'option2', 'option3', 'option4', 'correct_index', 'explanation'])

        for q in questions:
            writer.writerow([
                q.question_text,
                q.options[0] if len(q.options) > 0 else '',
                q.options[1] if len(q.options) > 1 else '',
                q.options[2] if len(q.options) > 2 else '',
                q.options[3] if len(q.options) > 3 else '',
                q.correct_answer_index,
                q.explanation or ''
            ])

        return output.getvalue()

    @staticmethod
    def get_csv_template() -> str:
        """Get CSV template for multiple choice format"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['question', 'option1', 'option2', 'option3', 'option4', 'correct_index', 'explanation'])
        writer.writerow(['What is 2+2?', '2', '3', '4', '5', '2', 'Basic addition: 2 plus 2 equals 4'])
        writer.writerow(['Capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', '2', 'Paris is the capital and largest city of France'])
        writer.writerow(['What is the largest planet?', 'Earth', 'Mars', 'Jupiter', 'Saturn', '2', 'Jupiter is the largest planet in our solar system'])
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
                options=q.options,
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
            answers_dict[q_id] = answer.selected_option_index

            if q_id in question_map:
                q = question_map[q_id]
                if answer.selected_option_index == q.correct_answer_index:
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

    @staticmethod
    def get_attempt_with_details(db: Session, attempt_id: UUID, user_id: UUID) -> Optional[Tuple[QuizAttempt, List[QuizAttemptQuestionDetail], str]]:
        """Return attempt with per-question correctness details"""
        attempt = db.query(QuizAttempt).filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == user_id
        ).first()

        if not attempt:
            return None

        questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_set_id == attempt.quiz_set_id
        ).all()
        question_map = {str(q.id): q for q in questions}
        answers = attempt.answers or {}

        details: List[QuizAttemptQuestionDetail] = []
        correct_count = 0

        for q_id, question in question_map.items():
            selected_index = answers.get(q_id)
            is_correct = False
            if selected_index is not None:
                is_correct = selected_index == question.correct_answer_index
            if is_correct:
                correct_count += 1

            details.append(
                QuizAttemptQuestionDetail(
                    question_id=question.id,
                    question_text=question.question_text,
                    options=question.options,
                    correct_answer_index=question.correct_answer_index,
                    selected_option_index=selected_index,
                    is_correct=is_correct,
                    explanation=question.explanation
                )
            )

        # Ensure summary fields are consistent
        attempt.correct_answers = correct_count
        attempt.total_questions = len(question_map)
        attempt.score = (correct_count / attempt.total_questions * 100) if attempt.total_questions > 0 else 0
        db.commit()
        db.refresh(attempt)

        quiz_set_title = None
        if attempt.quiz_set:
            quiz_set_title = attempt.quiz_set.title

        return attempt, details, quiz_set_title


quiz_service = QuizService()
