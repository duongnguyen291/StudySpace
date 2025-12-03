"""
Flashcard Schemas
Pydantic schemas for flashcard request/response validation
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================
# Flashcard Schemas
# ============================================

class FlashcardBase(BaseModel):
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)
    hint: Optional[str] = None


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardResponse(FlashcardBase):
    id: UUID
    deck_id: UUID
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Flashcard Deck Schemas
# ============================================

class FlashcardDeckBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = False


class FlashcardDeckCreate(FlashcardDeckBase):
    flashcards: Optional[List[FlashcardCreate]] = None


class FlashcardDeckResponse(FlashcardDeckBase):
    id: UUID
    user_id: UUID
    card_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FlashcardDeckDetailResponse(FlashcardDeckResponse):
    flashcards: List[FlashcardResponse] = []


# ============================================
# CSV Import/Export Schemas
# ============================================

class CSVImportError(BaseModel):
    line: int
    message: str


class CSVImportResult(BaseModel):
    success: bool
    deck_id: Optional[UUID] = None
    cards_imported: int = 0
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

