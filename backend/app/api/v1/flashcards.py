"""
Flashcard API endpoints
Handles flashcard decks, cards, CSV import/export, and shuffle
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.flashcard_service import flashcard_service
from app.schemas.flashcard import (
    FlashcardDeckCreate, FlashcardDeckResponse, FlashcardDeckDetailResponse,
    FlashcardResponse, CSVImportResult, CSVPreviewResponse
)

router = APIRouter()


# ============================================
# Flashcard Deck Endpoints
# ============================================

@router.get("/decks", response_model=List[FlashcardDeckResponse])
async def get_decks(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get all flashcard decks for current user"""
    user_id = UUID(current_user_id)
    decks = flashcard_service.get_user_decks(db, user_id)
    
    return [FlashcardDeckResponse(
        id=d.id, user_id=d.user_id, title=d.title,
        description=d.description, is_public=d.is_public,
        card_count=flashcard_service.get_card_count(db, d.id),
        created_at=d.created_at, updated_at=d.updated_at
    ) for d in decks]


@router.post("/decks", response_model=FlashcardDeckResponse)
async def create_deck(
    data: FlashcardDeckCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new flashcard deck"""
    user_id = UUID(current_user_id)
    deck = flashcard_service.create_deck(db, user_id, data)
    
    return FlashcardDeckResponse(
        id=deck.id, user_id=deck.user_id, title=deck.title,
        description=deck.description, is_public=deck.is_public,
        card_count=flashcard_service.get_card_count(db, deck.id),
        created_at=deck.created_at, updated_at=deck.updated_at
    )


@router.get("/decks/{deck_id}", response_model=FlashcardDeckDetailResponse)
async def get_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get a flashcard deck with all cards"""
    user_id = UUID(current_user_id)
    deck = flashcard_service.get_deck(db, deck_id, user_id)
    
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    return FlashcardDeckDetailResponse(
        id=deck.id, user_id=deck.user_id, title=deck.title,
        description=deck.description, is_public=deck.is_public,
        card_count=len(deck.flashcards),
        created_at=deck.created_at, updated_at=deck.updated_at,
        flashcards=[FlashcardResponse(
            id=c.id, deck_id=c.deck_id, question=c.question,
            answer=c.answer, hint=c.hint, order_index=c.order_index,
            created_at=c.created_at
        ) for c in sorted(deck.flashcards, key=lambda x: x.order_index)]
    )


@router.delete("/decks/{deck_id}")
async def delete_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete a flashcard deck"""
    user_id = UUID(current_user_id)
    success = flashcard_service.delete_deck(db, deck_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    return {"message": "Deck deleted"}


# ============================================
# Review with Shuffle
# ============================================

@router.get("/decks/{deck_id}/review", response_model=List[FlashcardResponse])
async def get_cards_for_review(
    deck_id: UUID,
    shuffle: bool = Query(False, description="Shuffle cards for review"),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get flashcards for review session (with optional shuffle)"""
    user_id = UUID(current_user_id)
    cards = flashcard_service.get_cards_for_review(db, deck_id, user_id, shuffle)
    
    if not cards:
        raise HTTPException(status_code=404, detail="Deck not found or empty")
    
    return cards


# ============================================
# CSV Import/Export
# ============================================

@router.get("/template")
async def download_template():
    """Download CSV template for flashcard import"""
    template = flashcard_service.get_csv_template()
    
    return StreamingResponse(
        io.BytesIO(template.encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=flashcard-template.csv"}
    )


@router.post("/preview", response_model=CSVPreviewResponse)
async def preview_csv(
    file: UploadFile = File(...),
    limit: int = Query(10, ge=1, le=50)
):
    """Preview CSV file before importing"""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        text = content.decode('utf-8-sig')
    
    return flashcard_service.preview_csv(text, limit)


@router.post("/import", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Import flashcards from CSV file"""
    user_id = UUID(current_user_id)
    
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        text = content.decode('utf-8-sig')
    
    result = flashcard_service.import_csv(db, user_id, text, title, description)
    
    if not result.success:
        raise HTTPException(status_code=400, detail={
            "message": "Import failed",
            "errors": [{"line": e.line, "message": e.message} for e in result.errors]
        })
    
    return result


@router.get("/decks/{deck_id}/export")
async def export_csv(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Export flashcards to CSV file"""
    user_id = UUID(current_user_id)
    csv_content = flashcard_service.export_csv(db, deck_id, user_id)
    
    if csv_content is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    deck = flashcard_service.get_deck(db, deck_id, user_id)
    filename = f"{deck.title.replace(' ', '_')}.csv" if deck else "flashcards.csv"
    
    return StreamingResponse(
        io.BytesIO(csv_content.encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
