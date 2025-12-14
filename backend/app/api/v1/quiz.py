"""
Quiz API endpoints
Simple format: just question and answer
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.quiz_service import quiz_service
from app.schemas.quiz import (
    QuizSetCreate, QuizSetUpdate, QuizSetResponse, QuizSetDetailResponse,
    QuizQuestionCreate, QuizQuestionResponse,
    QuizAttemptCreate, QuizAttemptSubmit, QuizAttemptResponse,
    QuizAttemptDetailResponse, QuizAttemptResultResponse,
    QuizAttemptDetailWithAnswers, QuizAttemptHistoryItem,
    CSVImportResult, CSVPreviewResponse
)

router = APIRouter()


# ============================================
# Quiz Set Endpoints
# ============================================

@router.post("/sets", response_model=QuizSetResponse)
async def create_quiz_set(
    data: QuizSetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new quiz set"""
    try:
        quiz_set = quiz_service.create_quiz_set(db, current_user.id, data)
        # Ensure the quiz is accessible immediately by refreshing the session
        db.refresh(quiz_set)
        question_count = quiz_service.get_question_count(db, quiz_set.id)
        
        return QuizSetResponse(
            id=quiz_set.id,
            user_id=quiz_set.user_id,
            category_id=quiz_set.category_id,
            title=quiz_set.title,
            description=quiz_set.description,
            is_public=quiz_set.is_public,
            question_count=question_count,
            created_at=quiz_set.created_at,
            updated_at=quiz_set.updated_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create quiz: {str(e)}")


@router.get("/sets", response_model=List[QuizSetResponse])
async def get_quiz_sets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all quiz sets for current user"""
    quiz_sets = quiz_service.get_user_quiz_sets(db, current_user.id)
    
    return [QuizSetResponse(
        id=qs.id,
        user_id=qs.user_id,
        category_id=qs.category_id,
        title=qs.title,
        description=qs.description,
        is_public=qs.is_public,
        question_count=quiz_service.get_question_count(db, qs.id),
        created_at=qs.created_at,
        updated_at=qs.updated_at
    ) for qs in quiz_sets]


@router.get("/sets/{quiz_set_id}", response_model=QuizSetDetailResponse)
async def get_quiz_set(
    quiz_set_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a quiz set with questions"""
    quiz_set = quiz_service.get_quiz_set(db, quiz_set_id, current_user.id)
    
    if not quiz_set:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    return QuizSetDetailResponse(
        id=quiz_set.id,
        user_id=quiz_set.user_id,
        category_id=quiz_set.category_id,
        title=quiz_set.title,
        description=quiz_set.description,
        is_public=quiz_set.is_public,
        question_count=len(quiz_set.questions),
        created_at=quiz_set.created_at,
        updated_at=quiz_set.updated_at,
        questions=[QuizQuestionResponse(
            id=q.id,
            quiz_set_id=q.quiz_set_id,
            question_text=q.question_text,
            options=q.options,
            correct_answer_index=q.correct_answer_index,
            explanation=q.explanation,
            order_index=q.order_index,
            created_at=q.created_at
        ) for q in sorted(quiz_set.questions, key=lambda x: x.order_index)]
    )


@router.put("/sets/{quiz_set_id}", response_model=QuizSetResponse)
async def update_quiz_set(
    quiz_set_id: UUID,
    data: QuizSetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a quiz set"""
    quiz_set = quiz_service.update_quiz_set(db, quiz_set_id, current_user.id, data)
    
    if not quiz_set:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    question_count = quiz_service.get_question_count(db, quiz_set.id)
    
    return QuizSetResponse(
        id=quiz_set.id,
        user_id=quiz_set.user_id,
        category_id=quiz_set.category_id,
        title=quiz_set.title,
        description=quiz_set.description,
        is_public=quiz_set.is_public,
        question_count=question_count,
        created_at=quiz_set.created_at,
        updated_at=quiz_set.updated_at
    )


@router.delete("/sets/{quiz_set_id}")
async def delete_quiz_set(
    quiz_set_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a quiz set"""
    success = quiz_service.delete_quiz_set(db, quiz_set_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    return {"message": "Quiz set deleted"}


# ============================================
# Quiz Question Endpoints
# ============================================

@router.post("/sets/{quiz_set_id}/questions", response_model=QuizQuestionResponse)
async def add_question(
    quiz_set_id: UUID,
    data: QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a question to a quiz set"""
    question = quiz_service.add_question(db, quiz_set_id, current_user.id, data)
    
    if not question:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    return QuizQuestionResponse(
        id=question.id,
        quiz_set_id=question.quiz_set_id,
        question_text=question.question_text,
        options=question.options,
        correct_answer_index=question.correct_answer_index,
        explanation=question.explanation,
        order_index=question.order_index,
        created_at=question.created_at
    )


@router.put("/questions/{question_id}", response_model=QuizQuestionResponse)
async def update_question(
    question_id: UUID,
    data: QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a quiz question"""
    question = quiz_service.update_question(db, question_id, current_user.id, data)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return QuizQuestionResponse(
        id=question.id,
        quiz_set_id=question.quiz_set_id,
        question_text=question.question_text,
        options=question.options,
        correct_answer_index=question.correct_answer_index,
        explanation=question.explanation,
        order_index=question.order_index,
        created_at=question.created_at
    )


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a quiz question"""
    success = quiz_service.delete_question(db, question_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question deleted"}


# ============================================
# CSV Import/Export Endpoints
# ============================================

@router.get("/template")
async def download_template():
    """Download CSV template"""
    template = quiz_service.get_csv_template()
    return StreamingResponse(
        io.BytesIO(template.encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=quiz-template.csv"}
    )


@router.post("/preview", response_model=CSVPreviewResponse)
async def preview_csv(file: UploadFile = File(...)):
    """Preview CSV before import"""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be CSV file")
    
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except:
        text = content.decode('utf-8-sig')
    
    return quiz_service.preview_csv(text)


@router.post("/import", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import quiz from CSV"""
    user_id = current_user.id
    
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Must be CSV file")
    
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except:
        text = content.decode('utf-8-sig')
    
    result = quiz_service.import_csv(db, user_id, text, title, description)
    
    if not result.success:
        raise HTTPException(status_code=400, detail="Import failed")
    
    return result


@router.get("/sets/{quiz_set_id}/export")
async def export_csv(
    quiz_set_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export quiz to CSV"""
    csv_content = quiz_service.export_csv(db, quiz_set_id, current_user.id)
    
    if not csv_content:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    return StreamingResponse(
        io.BytesIO(csv_content.encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=quiz.csv"}
    )


# ============================================
# Quiz Attempt Endpoints
# ============================================

@router.post("/attempts", response_model=QuizAttemptDetailResponse)
async def start_attempt(
    data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a quiz attempt"""
    result = quiz_service.start_attempt(db, current_user.id, data)
    
    if not result:
        raise HTTPException(status_code=404, detail="Quiz not found or empty")
    
    attempt, questions = result
    
    return QuizAttemptDetailResponse(
        id=attempt.id,
        user_id=attempt.user_id,
        quiz_set_id=attempt.quiz_set_id,
        score=attempt.score,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        time_spent_seconds=attempt.time_spent_seconds,
        completed_at=attempt.completed_at,
        created_at=attempt.created_at,
        questions=questions
    )


@router.post("/attempts/{attempt_id}/submit", response_model=QuizAttemptResultResponse)
async def submit_attempt(
    attempt_id: UUID,
    data: QuizAttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit quiz answers"""
    attempt = quiz_service.submit_attempt(db, attempt_id, current_user.id, data)
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    return QuizAttemptResultResponse(
        id=attempt.id,
        user_id=attempt.user_id,
        quiz_set_id=attempt.quiz_set_id,
        score=attempt.score,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        time_spent_seconds=attempt.time_spent_seconds,
        completed_at=attempt.completed_at,
        created_at=attempt.created_at,
        answers=attempt.answers
    )


@router.get("/attempts", response_model=List[QuizAttemptHistoryItem])
async def get_attempts(
    quiz_set_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's quiz attempts"""
    attempts = quiz_service.get_user_attempts(db, current_user.id, quiz_set_id, skip=skip, limit=limit)
    
    return [QuizAttemptHistoryItem(
        id=a.id,
        user_id=a.user_id,
        quiz_set_id=a.quiz_set_id,
        quiz_set_title=a.quiz_set.title if a.quiz_set else None,
        score=a.score,
        total_questions=a.total_questions,
        correct_answers=a.correct_answers,
        time_spent_seconds=a.time_spent_seconds,
        completed_at=a.completed_at,
        created_at=a.created_at
    ) for a in attempts]


@router.get("/attempts/{attempt_id}", response_model=QuizAttemptDetailWithAnswers)
async def get_attempt_detail(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific attempt with per-question answers/correctness"""
    result = quiz_service.get_attempt_with_details(db, attempt_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt, details, quiz_set_title = result
    return QuizAttemptDetailWithAnswers(
        id=attempt.id,
        user_id=attempt.user_id,
        quiz_set_id=attempt.quiz_set_id,
        quiz_set_title=quiz_set_title,
        score=attempt.score,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        time_spent_seconds=attempt.time_spent_seconds,
        completed_at=attempt.completed_at,
        created_at=attempt.created_at,
        questions=details
    )
