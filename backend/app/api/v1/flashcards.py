"""
Flashcards API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.flashcard_service import FlashcardService
from app.schemas.flashcard import (
    FlashcardDeckCreate,
    FlashcardDeckUpdate,
    FlashcardDeckResponse,
    FlashcardDeckListResponse,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardResponse,
    FlashcardListResponse,
    ReviewSessionStart,
    ReviewSessionResponse,
    ReviewResult,
    FlashcardDeckFilter,
    FlashcardCSVImportResult,
    FlashcardCSVPreviewResponse
)

router = APIRouter()

# ============================================
# DEPENDENCIES
# ============================================
def get_flashcard_service(db: Session = Depends(get_db)) -> FlashcardService:
    """Dependency to get FlashcardService instance"""
    return FlashcardService(db)

# ============================================
# DECK ENDPOINTS
# ============================================

@router.post(
    "/decks",
    response_model=FlashcardDeckResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new flashcard deck",
    description="Create a new flashcard deck for the current user"
)
async def create_deck(
    deck_data: FlashcardDeckCreate,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Create a new flashcard deck"""
    return service.create_deck(current_user.id, deck_data)


@router.get(
    "/decks",
    response_model=FlashcardDeckListResponse,
    summary="Get all flashcard decks",
    description="Get all flashcard decks for the current user with filtering and pagination"
)
async def get_decks(
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Get all flashcard decks with filters"""
    filters = FlashcardDeckFilter(
        category_id=category_id,
        search=search,
        is_public=is_public,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return service.get_decks(current_user.id, filters)


@router.get(
    "/decks/{deck_id}",
    response_model=FlashcardDeckResponse,
    summary="Get flashcard deck by ID",
    description="Get a specific flashcard deck by ID"
)
async def get_deck(
    deck_id: UUID,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Get flashcard deck by ID"""
    deck = service.get_deck(deck_id, current_user.id)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return deck


@router.put(
    "/decks/{deck_id}",
    response_model=FlashcardDeckResponse,
    summary="Update flashcard deck",
    description="Update a flashcard deck by ID"
)
async def update_deck(
    deck_id: UUID,
    deck_data: FlashcardDeckUpdate,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Update flashcard deck"""
    deck = service.update_deck(deck_id, current_user.id, deck_data)
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return deck


@router.delete(
    "/decks/{deck_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete flashcard deck",
    description="Delete a flashcard deck by ID"
)
async def delete_deck(
    deck_id: UUID,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Delete flashcard deck"""
    success = service.delete_deck(deck_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return None

# ============================================
# FLASHCARD ENDPOINTS
# ============================================

@router.post(
    "/decks/{deck_id}/flashcards",
    response_model=FlashcardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new flashcard",
    description="Create a new flashcard in a deck"
)
async def create_flashcard(
    deck_id: UUID,
    flashcard_data: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Create a new flashcard"""
    flashcard = service.create_flashcard(deck_id, current_user.id, flashcard_data)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return flashcard


@router.post(
    "/decks/{deck_id}/flashcards/bulk",
    response_model=List[FlashcardResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create multiple flashcards",
    description="Create multiple flashcards in a deck at once"
)
async def bulk_create_flashcards(
    deck_id: UUID,
    flashcards_data: List[FlashcardCreate],
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Create multiple flashcards"""
    flashcards = service.bulk_create_flashcards(deck_id, current_user.id, flashcards_data)
    if not flashcards:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return flashcards


@router.get(
    "/decks/{deck_id}/flashcards",
    response_model=FlashcardListResponse,
    summary="Get all flashcards in a deck",
    description="Get all flashcards in a specific deck"
)
async def get_flashcards(
    deck_id: UUID,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Get all flashcards in a deck"""
    result = service.get_flashcards(deck_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found"
        )
    return result


@router.get(
    "/flashcards/{flashcard_id}",
    response_model=FlashcardResponse,
    summary="Get flashcard by ID",
    description="Get a specific flashcard by ID"
)
async def get_flashcard(
    flashcard_id: UUID,
    deck_id: UUID = Query(..., description="Deck ID"),
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Get flashcard by ID"""
    flashcard = service.get_flashcard(flashcard_id, deck_id, current_user.id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return flashcard


@router.put(
    "/flashcards/{flashcard_id}",
    response_model=FlashcardResponse,
    summary="Update flashcard",
    description="Update a flashcard by ID"
)
async def update_flashcard(
    flashcard_id: UUID,
    deck_id: UUID = Query(..., description="Deck ID"),
    flashcard_data: FlashcardUpdate = ...,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Update flashcard"""
    flashcard = service.update_flashcard(flashcard_id, deck_id, current_user.id, flashcard_data)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return flashcard


@router.delete(
    "/flashcards/{flashcard_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete flashcard",
    description="Delete a flashcard by ID"
)
async def delete_flashcard(
    flashcard_id: UUID,
    deck_id: UUID = Query(..., description="Deck ID"),
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Delete flashcard"""
    success = service.delete_flashcard(flashcard_id, deck_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    return None


# ============================================
# CSV IMPORT/PREVIEW (similar to quiz)
# ============================================


@router.post(
    "/decks/{deck_id}/preview",
    response_model=FlashcardCSVPreviewResponse,
    summary="Preview CSV for flashcards",
    description="Preview CSV content before importing flashcards"
)
async def preview_flashcards_csv(
    deck_id: UUID,
    file: UploadFile = File(...),
    limit: int = Query(10, ge=1, le=100, description="Number of rows to preview"),
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must be a CSV file")

    content = await file.read()
    try:
        text = content.decode('utf-8')
    except Exception:
        text = content.decode('utf-8-sig')

    return service.preview_csv(current_user.id, deck_id, text, limit=limit)


@router.post(
    "/decks/{deck_id}/import",
    response_model=FlashcardCSVImportResult,
    summary="Import flashcards from CSV",
    description="Import flashcards into a deck from CSV (columns: question, answer, optional hint)"
)
async def import_flashcards_csv(
    deck_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must be a CSV file")

    content = await file.read()
    try:
        text = content.decode('utf-8')
    except Exception:
        text = content.decode('utf-8-sig')

    result = service.import_csv(current_user.id, deck_id, text)
    if not result.success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Import failed")
    return result

# ============================================
# REVIEW SESSION ENDPOINTS
# ============================================

@router.post(
    "/review/start",
    response_model=ReviewSessionResponse,
    summary="Start a review session",
    description="Start a review session for a flashcard deck"
)
async def start_review_session(
    session_data: ReviewSessionStart,
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Start a review session"""
    session = service.start_review_session(current_user.id, session_data)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard deck not found or no cards available for review"
        )
    return session


@router.post(
    "/review/submit",
    status_code=status.HTTP_200_OK,
    summary="Submit review results",
    description="Submit review results and update flashcard progress"
)
async def submit_review_results(
    results: List[ReviewResult],
    current_user: User = Depends(get_current_user),
    service: FlashcardService = Depends(get_flashcard_service)
):
    """Submit review results"""
    return service.submit_review_results(current_user.id, results)
