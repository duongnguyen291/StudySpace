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
from app.services.quiz_service import quiz_service
from app.schemas.quiz import (
    QuizSetCreate, QuizSetUpdate, QuizSetResponse, QuizSetDetailResponse,
    QuizQuestionCreate, QuizQuestionResponse,
    QuizAttemptCreate, QuizAttemptSubmit, QuizAttemptResponse,
    QuizAttemptDetailResponse, QuizAttemptResultResponse,
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
    current_user_id: str = Depends(get_current_user)
):
    """Create a new quiz set"""
    user_id = UUID(current_user_id)
    quiz_set = quiz_service.create_quiz_set(db, user_id, data)
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


@router.get("/sets", response_model=List[QuizSetResponse])
async def get_quiz_sets(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get all quiz sets for current user"""
    user_id = UUID(current_user_id)
    quiz_sets = quiz_service.get_user_quiz_sets(db, user_id)
    
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
    current_user_id: str = Depends(get_current_user)
):
    """Get a quiz set with questions"""
    user_id = UUID(current_user_id)
    quiz_set = quiz_service.get_quiz_set(db, quiz_set_id, user_id)
    
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
            correct_answer=q.correct_answer,
            order_index=q.order_index,
            created_at=q.created_at
        ) for q in sorted(quiz_set.questions, key=lambda x: x.order_index)]
    )


@router.delete("/sets/{quiz_set_id}")
async def delete_quiz_set(
    quiz_set_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete a quiz set"""
    user_id = UUID(current_user_id)
    success = quiz_service.delete_quiz_set(db, quiz_set_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Quiz set not found")
    
    return {"message": "Quiz set deleted"}


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
    current_user_id: str = Depends(get_current_user)
):
    """Import quiz from CSV"""
    user_id = UUID(current_user_id)
    
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
    current_user_id: str = Depends(get_current_user)
):
    """Export quiz to CSV"""
    user_id = UUID(current_user_id)
    csv_content = quiz_service.export_csv(db, quiz_set_id, user_id)
    
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
    current_user_id: str = Depends(get_current_user)
):
    """Start a quiz attempt"""
    user_id = UUID(current_user_id)
    result = quiz_service.start_attempt(db, user_id, data)
    
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
    current_user_id: str = Depends(get_current_user)
):
    """Submit quiz answers"""
    user_id = UUID(current_user_id)
    attempt = quiz_service.submit_attempt(db, attempt_id, user_id, data)
    
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


@router.get("/attempts", response_model=List[QuizAttemptResponse])
async def get_attempts(
    quiz_set_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get user's quiz attempts"""
    user_id = UUID(current_user_id)
    attempts = quiz_service.get_user_attempts(db, user_id, quiz_set_id)
    
    return [QuizAttemptResponse(
        id=a.id,
        user_id=a.user_id,
        quiz_set_id=a.quiz_set_id,
        score=a.score,
        total_questions=a.total_questions,
        correct_answers=a.correct_answers,
        time_spent_seconds=a.time_spent_seconds,
        completed_at=a.completed_at,
        created_at=a.created_at
    ) for a in attempts]
