"""
Quiz Schemas
Multiple choice format: 1 question with 4 options
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


# ============================================
# Quiz Question Schemas
# ============================================

class QuizQuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=1)
    options: List[str] = Field(..., min_length=4, max_length=4, description="Exactly 4 answer options")
    correct_answer_index: int = Field(..., ge=0, le=3, description="Index of correct answer (0-3)")
    explanation: Optional[str] = None

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) != 4:
            raise ValueError('Must have exactly 4 options')
        if not all(opt.strip() for opt in v):
            raise ValueError('All options must be non-empty')
        return v


class QuizQuestionResponse(BaseModel):
    id: UUID
    quiz_set_id: UUID
    question_text: str
    options: List[str]
    correct_answer_index: int
    explanation: Optional[str] = None
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuizQuestionForAttempt(BaseModel):
    """Question for quiz attempt (hides correct answer)"""
    id: UUID
    question_text: str
    options: List[str]
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
    selected_option_index: int = Field(..., ge=0, le=3, description="Index of selected option (0-3)")


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


class QuizAttemptQuestionDetail(BaseModel):
    question_id: UUID
    question_text: str
    options: List[str]
    correct_answer_index: int
    selected_option_index: Optional[int] = None
    is_correct: bool
    explanation: Optional[str] = None


class QuizAttemptHistoryItem(QuizAttemptResponse):
    quiz_set_title: Optional[str] = None


class QuizAttemptDetailWithAnswers(QuizAttemptResponse):
    quiz_set_title: Optional[str] = None
    questions: List[QuizAttemptQuestionDetail] = []


# ============================================
# CSV Import/Export Schemas (for future use)
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
    options: List[str]
    correct_index: int
    is_valid: bool = True
    error: Optional[str] = None


class CSVPreviewResponse(BaseModel):
    headers: List[str]
    rows: List[CSVPreviewRow]
    total_rows: int
    valid_rows: int
    errors: List[CSVImportError] = []
