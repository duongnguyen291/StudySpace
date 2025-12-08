"""
Flashcard Service
Business logic layer for flashcard operations
"""
import csv
import io
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
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
    FlashcardDeckFilter,
    FlashcardCSVPreviewResponse,
    FlashcardCSVImportResult,
    FlashcardCSVImportError,
    FlashcardCSVPreviewRow
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

    # ============================================
    # CSV IMPORT/EXPORT (simple: question, answer [, hint])
    # ============================================

    @staticmethod
    def _parse_csv(content: str) -> Tuple[List[str], List[List[str]], List[FlashcardCSVImportError]]:
        """Parse CSV content and return headers, rows, errors"""
        errors: List[FlashcardCSVImportError] = []
        rows: List[List[str]] = []
        headers: List[str] = []

        try:
            reader = csv.reader(io.StringIO(content))
            lines = list(reader)

            if not lines:
                errors.append(FlashcardCSVImportError(line=0, message="Empty file"))
                return headers, rows, errors

            headers = [h.strip().lower() for h in lines[0]]

            if 'question' not in headers:
                errors.append(FlashcardCSVImportError(line=1, message="Missing 'question' column"))
            if 'answer' not in headers:
                errors.append(FlashcardCSVImportError(line=1, message="Missing 'answer' column"))

            for row in lines[1:]:
                if not row or (len(row) == 1 and not row[0].strip()):
                    continue
                rows.append([cell.strip() for cell in row])

        except Exception as e:
            errors.append(FlashcardCSVImportError(line=0, message=f"Parse error: {str(e)}"))

        return headers, rows, errors

    def preview_csv(self, user_id: UUID, deck_id: UUID, content: str, limit: int = 10) -> FlashcardCSVPreviewResponse:
        """Preview CSV content with validation"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return FlashcardCSVPreviewResponse(headers=[], rows=[], total_rows=0, valid_rows=0, errors=[
                FlashcardCSVImportError(line=0, message="Deck not found")
            ])

        headers, rows, parse_errors = self._parse_csv(content)

        if parse_errors:
            return FlashcardCSVPreviewResponse(
                headers=headers or ['question', 'answer', 'hint'],
                rows=[],
                total_rows=0,
                valid_rows=0,
                errors=parse_errors
            )

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')
        hint_idx = col_map.get('hint')

        preview_rows: List[FlashcardCSVPreviewRow] = []
        valid_count = 0
        all_errors: List[FlashcardCSVImportError] = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx is not None and q_idx < len(row) else ""
            answer = row[a_idx] if a_idx is not None and a_idx < len(row) else ""
            hint = row[hint_idx] if hint_idx is not None and hint_idx < len(row) else ""

            is_valid = bool(question and answer)
            error_msg = None if is_valid else "Missing question or answer"

            if not is_valid:
                all_errors.append(FlashcardCSVImportError(line=line_num, message=error_msg))
            else:
                valid_count += 1

            if len(preview_rows) < limit:
                preview_rows.append(FlashcardCSVPreviewRow(
                    line=line_num,
                    question=question,
                    answer=answer,
                    is_valid=is_valid,
                    error=error_msg
                ))

        return FlashcardCSVPreviewResponse(
            headers=headers,
            rows=preview_rows,
            total_rows=len(rows),
            valid_rows=valid_count,
            errors=all_errors
        )

    def import_csv(self, user_id: UUID, deck_id: UUID, content: str) -> FlashcardCSVImportResult:
        """Import flashcards from CSV into a deck"""
        # Verify deck ownership
        deck = self.deck_repo.get_by_id(deck_id, user_id)
        if not deck:
            return FlashcardCSVImportResult(success=False, flashcards_imported=0, errors=[
                FlashcardCSVImportError(line=0, message="Deck not found")
            ])

        headers, rows, parse_errors = self._parse_csv(content)
        if parse_errors:
            return FlashcardCSVImportResult(success=False, flashcards_imported=0, errors=parse_errors)

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')
        hint_idx = col_map.get('hint')

        imported = 0
        errors: List[FlashcardCSVImportError] = []
        to_create: List[FlashcardCreate] = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx is not None and q_idx < len(row) else ""
            answer = row[a_idx] if a_idx is not None and a_idx < len(row) else ""
            hint = row[hint_idx] if hint_idx is not None and hint_idx < len(row) else None

            if not question or not answer:
                errors.append(FlashcardCSVImportError(line=line_num, message="Missing question or answer"))
                continue

            to_create.append(FlashcardCreate(question=question, answer=answer, hint=hint))
            imported += 1

        if not imported:
            return FlashcardCSVImportResult(success=False, flashcards_imported=0, errors=errors or [
                FlashcardCSVImportError(line=0, message="No valid flashcards found")
            ])

        # bulk create
        self.flashcard_repo.bulk_create(deck_id, to_create)
        return FlashcardCSVImportResult(success=True, flashcards_imported=imported, errors=errors)
    
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

