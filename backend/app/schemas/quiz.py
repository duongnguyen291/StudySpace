"""
Quiz Schemas
Simple format: just question and answer
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================
# Quiz Question Schemas
# ============================================

class QuizQuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=1)
    correct_answer: str = Field(..., min_length=1)


class QuizQuestionResponse(BaseModel):
    id: UUID
    quiz_set_id: UUID
    question_text: str
    correct_answer: str
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionForAttempt(BaseModel):
    """Question for quiz attempt (hides answer)"""
    id: UUID
    question_text: str
    order_index: int

    class Config:
        from_attributes = True


# ============================================
# Quiz Set Schemas
# ============================================

class QuizSetBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = False


class QuizSetCreate(QuizSetBase):
    category_id: Optional[UUID] = None
    questions: Optional[List[QuizQuestionCreate]] = None


class QuizSetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class QuizSetResponse(QuizSetBase):
    id: UUID
    user_id: UUID
    category_id: Optional[UUID] = None
    question_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuizSetDetailResponse(QuizSetResponse):
    questions: List[QuizQuestionResponse] = []


# ============================================
# Quiz Attempt Schemas
# ============================================

class QuizAttemptCreate(BaseModel):
    quiz_set_id: UUID


class QuizAttemptAnswer(BaseModel):
    question_id: UUID
    user_answer: str


class QuizAttemptSubmit(BaseModel):
    answers: List[QuizAttemptAnswer]
    time_spent_seconds: Optional[int] = None


class QuizAttemptResponse(BaseModel):
    id: UUID
    user_id: UUID
    quiz_set_id: UUID
    score: Optional[float] = None
    total_questions: int
    correct_answers: int
    time_spent_seconds: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptDetailResponse(QuizAttemptResponse):
    questions: List[QuizQuestionForAttempt] = []


class QuizAttemptResultResponse(QuizAttemptResponse):
    answers: Optional[dict] = None


# ============================================
# CSV Import/Export Schemas
# ============================================

class CSVImportError(BaseModel):
    line: int
    message: str


class CSVImportResult(BaseModel):
    success: bool
    quiz_set_id: Optional[UUID] = None
    questions_imported: int = 0
    errors: List[CSVImportError] = []


class CSVPreviewRow(BaseModel):
    line: int
    question: str
    answer: str
    is_valid: bool = True
    error: Optional[str] = None


class CSVPreviewResponse(BaseModel):
    headers: List[str]
    rows: List[CSVPreviewRow]
    total_rows: int
    valid_rows: int
    errors: List[CSVImportError] = []
