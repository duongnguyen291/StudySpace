"""
Flashcards API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/decks")
async def create_deck():
    """Create a new flashcard deck"""
    return {"message": "Create deck endpoint - to be implemented"}


@router.get("/decks")
async def get_decks():
    """Get all flashcard decks"""
    return {"message": "Get decks endpoint - to be implemented"}

