"""
Flashcard Service
Business logic layer for flashcard operations
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime

from app.repositories.flashcard_repo import (
    FlashcardDeckRepository,
    FlashcardRepository,
    FlashcardProgressRepository
)
from app.schemas.flashcard import (
    FlashcardDeckCreate,
    FlashcardDeckUpdate,
    FlashcardDeckResponse,
    FlashcardDeckListResponse,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardResponse,
    FlashcardListResponse,
    FlashcardProgressResponse,
    ReviewSessionStart,
    ReviewCard,
    ReviewSessionResponse,
    ReviewResult,
    FlashcardDeckFilter
)


class FlashcardService:
    """Service for Flashcard business logic"""
    
    def __init__(self, db: Session):
        self.deck_repo = FlashcardDeckRepository(db)
        self.flashcard_repo = FlashcardRepository(db)
        self.progress_repo = FlashcardProgressRepository(db)
        self.db = db
    
    # ============================================
    # DECK OPERATIONS
    # ============================================
    
    def create_deck(self, user_id: UUID, deck_data: FlashcardDeckCreate) -> FlashcardDeckResponse:
        """Create a new flashcard deck"""
        deck = self.deck_repo.create(user_id, deck_data)
        return self._deck_to_response(deck)
    
    def get_deck(self, deck_id: UUID, user_id: UUID) -> Optional[FlashcardDeckResponse]:
        """Get deck by ID"""
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return None
        return self._deck_to_response(deck)
    
    def get_decks(self, user_id: UUID, filters: FlashcardDeckFilter) -> FlashcardDeckListResponse:
        """Get all decks with filters"""
        decks, total = self.deck_repo.get_all(user_id, filters)
        
        deck_responses = [self._deck_to_response(deck) for deck in decks]
        
        total_pages = (total + filters.page_size - 1) // filters.page_size
        
        return FlashcardDeckListResponse(
            decks=deck_responses,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            has_next=filters.page < total_pages,
            has_prev=filters.page > 1
        )
    
    def update_deck(
        self,
        deck_id: UUID,
        user_id: UUID,
        deck_data: FlashcardDeckUpdate
    ) -> Optional[FlashcardDeckResponse]:
        """Update deck"""
        deck = self.deck_repo.update(deck_id, user_id, deck_data)
        if not deck:
            return None
        return self._deck_to_response(deck)
    
    def delete_deck(self, deck_id: UUID, user_id: UUID) -> bool:
        """Delete deck"""
        return self.deck_repo.delete(deck_id, user_id)
    
    # ============================================
    # FLASHCARD OPERATIONS
    # ============================================
    
    def create_flashcard(
        self,
        deck_id: UUID,
        user_id: UUID,
        flashcard_data: FlashcardCreate
    ) -> Optional[FlashcardResponse]:
        """Create a new flashcard in a deck"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return None
        
        flashcard = self.flashcard_repo.create(deck_id, flashcard_data)
        return self._flashcard_to_response(flashcard)
    
    def get_flashcard(
        self,
        flashcard_id: UUID,
        deck_id: UUID,
        user_id: UUID
    ) -> Optional[FlashcardResponse]:
        """Get flashcard by ID"""
        flashcard = self.flashcard_repo.get_by_id(flashcard_id, deck_id)
        if not flashcard:
            return None
        
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return None
        
        return self._flashcard_to_response(flashcard, user_id)
    
    def get_flashcards(
        self,
        deck_id: UUID,
        user_id: UUID
    ) -> Optional[FlashcardListResponse]:
        """Get all flashcards in a deck"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return None
        
        flashcards = self.flashcard_repo.get_by_deck(deck_id, user_id)
        
        flashcard_responses = [
            self._flashcard_to_response(flashcard, user_id)
            for flashcard in flashcards
        ]
        
        return FlashcardListResponse(
            flashcards=flashcard_responses,
            total=len(flashcard_responses),
            deck_id=deck_id
        )
    
    def update_flashcard(
        self,
        flashcard_id: UUID,
        deck_id: UUID,
        user_id: UUID,
        flashcard_data: FlashcardUpdate
    ) -> Optional[FlashcardResponse]:
        """Update flashcard"""
        flashcard = self.flashcard_repo.update(flashcard_id, deck_id, user_id, flashcard_data)
        if not flashcard:
            return None
        return self._flashcard_to_response(flashcard, user_id)
    
    def delete_flashcard(
        self,
        flashcard_id: UUID,
        deck_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete flashcard"""
        return self.flashcard_repo.delete(flashcard_id, deck_id, user_id)
    
    def bulk_create_flashcards(
        self,
        deck_id: UUID,
        user_id: UUID,
        flashcards_data: List[FlashcardCreate]
    ) -> Optional[List[FlashcardResponse]]:
        """Create multiple flashcards at once"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return None
        
        flashcards = self.flashcard_repo.bulk_create(deck_id, flashcards_data)
        return [self._flashcard_to_response(flashcard, user_id) for flashcard in flashcards]
    
    # ============================================
    # REVIEW SESSION OPERATIONS
    # ============================================
    
    def start_review_session(
        self,
        user_id: UUID,
        session_data: ReviewSessionStart
    ) -> Optional[ReviewSessionResponse]:
        """Start a review session"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(session_data.deck_id, user_id)
        if not deck:
            return None
        
        # Get cards for review
        cards = self.progress_repo.get_cards_for_review(
            user_id,
            session_data.deck_id,
            session_data.mode,
            session_data.limit
        )
        
        if not cards:
            return None
        
        # Build review cards with progress info
        review_cards = []
        new_cards_count = 0
        due_cards_count = 0
        
        for card in cards:
            progress = self.progress_repo.get_or_create(user_id, card.id)
            
            is_new = progress.review_count == 0
            is_due = progress.next_review is None or progress.next_review <= datetime.utcnow()
            
            if is_new:
                new_cards_count += 1
            if is_due:
                due_cards_count += 1
            
            review_cards.append(ReviewCard(
                flashcard=self._flashcard_to_response(card),
                progress=FlashcardProgressResponse.model_validate(progress) if progress else None,
                is_new=is_new
            ))
        
        session_id = uuid4()
        
        return ReviewSessionResponse(
            session_id=session_id,
            deck_id=session_data.deck_id,
            cards=review_cards,
            total_cards=len(review_cards),
            new_cards=new_cards_count,
            due_cards=due_cards_count,
            mode=session_data.mode
        )
    
    def submit_review_results(
        self,
        user_id: UUID,
        results: List[ReviewResult]
    ) -> dict:
        """Submit review results and update progress"""
        updated_count = 0
        
        for result in results:
            # Verify flashcard exists
            flashcard = self.flashcard_repo.get_by_id(result.flashcard_id)
            if not flashcard:
                continue
            
            # Verify deck ownership
            deck = self.deck_repo.get_by_id(flashcard.deck_id, user_id)
            if not deck:
                continue
            
            # Update progress
            self.progress_repo.update_progress(
                user_id,
                result.flashcard_id,
                result.confidence_level
            )
            updated_count += 1
        
        return {
            "success": True,
            "updated_count": updated_count,
            "message": f"Successfully updated {updated_count} flashcard(s)"
        }
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    def _deck_to_response(self, deck) -> FlashcardDeckResponse:
        """Convert deck model to response schema"""
        flashcard_count = len(deck.flashcards) if deck.flashcards else 0
        return FlashcardDeckResponse(
            id=deck.id,
            user_id=deck.user_id,
            category_id=deck.category_id,
            title=deck.title,
            description=deck.description,
            is_public=deck.is_public,
            created_at=deck.created_at,
            updated_at=deck.updated_at,
            flashcard_count=flashcard_count
        )
    
    def _flashcard_to_response(
        self,
        flashcard,
        user_id: Optional[UUID] = None
    ) -> FlashcardResponse:
        """Convert flashcard model to response schema"""
        progress = None
        if user_id:
            progress_obj = self.progress_repo.get_or_create(user_id, flashcard.id)
            progress = FlashcardProgressResponse.model_validate(progress_obj)
        
        return FlashcardResponse(
            id=flashcard.id,
            deck_id=flashcard.deck_id,
            question=flashcard.question,
            answer=flashcard.answer,
            hint=flashcard.hint,
            order_index=flashcard.order_index,
            created_at=flashcard.created_at,
            updated_at=flashcard.updated_at,
            progress=progress
        )

