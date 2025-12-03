"""
Flashcard Schemas
Pydantic schemas for flashcard validation and serialization
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# ============================================
# DECK SCHEMAS
# ============================================

class FlashcardDeckBase(BaseModel):
    """Base schema for flashcard deck"""
    title: str = Field(..., min_length=1, max_length=255, description="Deck title")
    description: Optional[str] = Field(None, description="Deck description")
    category_id: Optional[UUID] = Field(None, description="Category ID")
    is_public: bool = Field(default=False, description="Whether deck is public")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()


class FlashcardDeckCreate(FlashcardDeckBase):
    """Schema for creating a new flashcard deck"""
    pass


class FlashcardDeckUpdate(BaseModel):
    """Schema for updating a flashcard deck (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    is_public: Optional[bool] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v


class FlashcardDeckResponse(FlashcardDeckBase):
    """Schema for flashcard deck response"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    flashcard_count: Optional[int] = Field(None, description="Number of flashcards in deck")

    class Config:
        from_attributes = True


# ============================================
# FLASHCARD SCHEMAS
# ============================================

class FlashcardBase(BaseModel):
    """Base schema for flashcard"""
    question: str = Field(..., min_length=1, description="Flashcard question")
    answer: str = Field(..., min_length=1, description="Flashcard answer")
    hint: Optional[str] = Field(None, description="Optional hint")
    order_index: int = Field(default=0, ge=0, description="Order index in deck")

    @field_validator('question', 'answer')
    @classmethod
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Question and answer cannot be empty')
        return v.strip()


class FlashcardCreate(FlashcardBase):
    """Schema for creating a new flashcard"""
    pass


class FlashcardUpdate(BaseModel):
    """Schema for updating a flashcard (all fields optional)"""
    question: Optional[str] = Field(None, min_length=1)
    answer: Optional[str] = Field(None, min_length=1)
    hint: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)

    @field_validator('question', 'answer')
    @classmethod
    def validate_content(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Question and answer cannot be empty')
        return v.strip() if v else v


class FlashcardResponse(FlashcardBase):
    """Schema for flashcard response"""
    id: UUID
    deck_id: UUID
    created_at: datetime
    updated_at: datetime
    progress: Optional['FlashcardProgressResponse'] = None

    class Config:
        from_attributes = True


# ============================================
# PROGRESS SCHEMAS
# ============================================

class FlashcardProgressBase(BaseModel):
    """Base schema for flashcard progress"""
    confidence_level: int = Field(default=0, ge=0, le=5, description="Confidence level 0-5")
    review_count: int = Field(default=0, ge=0, description="Number of times reviewed")


class FlashcardProgressResponse(FlashcardProgressBase):
    """Schema for flashcard progress response"""
    id: UUID
    user_id: UUID
    flashcard_id: UUID
    last_reviewed: Optional[datetime] = None
    next_review: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FlashcardProgressUpdate(BaseModel):
    """Schema for updating flashcard progress after review"""
    confidence_level: int = Field(..., ge=0, le=5, description="Confidence level after review (0-5)")


# ============================================
# REVIEW SESSION SCHEMAS
# ============================================

class ReviewSessionStart(BaseModel):
    """Schema for starting a review session"""
    deck_id: UUID
    mode: str = Field(default="random", description="Review mode: 'random' or 'spaced'")
    limit: Optional[int] = Field(None, ge=1, description="Maximum number of cards to review")


class ReviewCard(BaseModel):
    """Schema for a card in review session"""
    flashcard: FlashcardResponse
    progress: Optional[FlashcardProgressResponse] = None
    is_new: bool = Field(default=True, description="Whether this is a new card for the user")


class ReviewSessionResponse(BaseModel):
    """Schema for review session response"""
    session_id: UUID
    deck_id: UUID
    cards: List[ReviewCard]
    total_cards: int
    new_cards: int
    due_cards: int
    mode: str


class ReviewResult(BaseModel):
    """Schema for submitting a review result"""
    flashcard_id: UUID
    confidence_level: int = Field(..., ge=0, le=5, description="Confidence level 0-5")


class ReviewSessionComplete(BaseModel):
    """Schema for completing a review session"""
    session_id: UUID
    results: List[ReviewResult] = Field(..., min_length=1)


# ============================================
# LIST RESPONSES
# ============================================

class FlashcardDeckListResponse(BaseModel):
    """Schema for paginated deck list"""
    decks: List[FlashcardDeckResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


class FlashcardListResponse(BaseModel):
    """Schema for flashcard list in a deck"""
    flashcards: List[FlashcardResponse]
    total: int
    deck_id: UUID


# ============================================
# FILTER SCHEMAS
# ============================================

class FlashcardDeckFilter(BaseModel):
    """Schema for filtering flashcard decks"""
    category_id: Optional[UUID] = None
    search: Optional[str] = None
    is_public: Optional[bool] = None
    
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="created_at", description="Field to sort by")
    sort_order: str = Field(default="desc", description="Sort order: asc or desc")

    @field_validator('sort_order')
    @classmethod
    def validate_sort_order(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('Sort order must be asc or desc')
        return v

