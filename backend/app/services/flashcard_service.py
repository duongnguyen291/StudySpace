"""
Flashcard Service
Business logic for flashcard management and CSV import/export
"""
import csv
import io
import random
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.flashcard import FlashcardDeck, Flashcard
from app.schemas.flashcard import (
    FlashcardDeckCreate, FlashcardCreate,
    CSVImportError, CSVImportResult, CSVPreviewRow, CSVPreviewResponse,
    FlashcardResponse
)


class FlashcardService:
    """Service class for flashcard operations"""

    # ============================================
    # Deck Operations
    # ============================================

    @staticmethod
    def create_deck(db: Session, user_id: UUID, data: FlashcardDeckCreate) -> FlashcardDeck:
        """Create a new flashcard deck with optional cards"""
        deck = FlashcardDeck(
            user_id=user_id,
            title=data.title,
            description=data.description,
            is_public=data.is_public
        )
        db.add(deck)
        db.flush()

        if data.flashcards:
            for idx, card_data in enumerate(data.flashcards):
                card = Flashcard(
                    deck_id=deck.id,
                    question=card_data.question,
                    answer=card_data.answer,
                    hint=card_data.hint,
                    order_index=idx
                )
                db.add(card)

        db.commit()
        db.refresh(deck)
        return deck

    @staticmethod
    def get_deck(db: Session, deck_id: UUID, user_id: Optional[UUID] = None) -> Optional[FlashcardDeck]:
        """Get a flashcard deck by ID"""
        query = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id)
        if user_id:
            query = query.filter((FlashcardDeck.user_id == user_id) | (FlashcardDeck.is_public == True))
        return query.first()

    @staticmethod
    def get_user_decks(db: Session, user_id: UUID) -> List[FlashcardDeck]:
        """Get all flashcard decks for a user"""
        return db.query(FlashcardDeck).filter(
            FlashcardDeck.user_id == user_id
        ).order_by(FlashcardDeck.created_at.desc()).all()

    @staticmethod
    def delete_deck(db: Session, deck_id: UUID, user_id: UUID) -> bool:
        """Delete a flashcard deck"""
        deck = db.query(FlashcardDeck).filter(
            FlashcardDeck.id == deck_id,
            FlashcardDeck.user_id == user_id
        ).first()

        if not deck:
            return False

        db.delete(deck)
        db.commit()
        return True

    @staticmethod
    def get_card_count(db: Session, deck_id: UUID) -> int:
        """Get the number of cards in a deck"""
        return db.query(func.count(Flashcard.id)).filter(
            Flashcard.deck_id == deck_id
        ).scalar() or 0

    # ============================================
    # CSV Import/Export
    # ============================================

    @staticmethod
    def parse_csv(content: str) -> Tuple[List[str], List[List[str]], List[CSVImportError]]:
        """Parse CSV content"""
        errors = []
        rows = []
        headers = []

        try:
            reader = csv.reader(io.StringIO(content))
            lines = list(reader)

            if not lines:
                errors.append(CSVImportError(line=0, message="Empty file"))
                return headers, rows, errors

            headers = [h.strip().lower() for h in lines[0]]

            if 'question' not in headers:
                errors.append(CSVImportError(line=1, message="Missing 'question' column"))
            if 'answer' not in headers:
                errors.append(CSVImportError(line=1, message="Missing 'answer' column"))

            for row in lines[1:]:
                if not row or (len(row) == 1 and not row[0].strip()):
                    continue
                rows.append([cell.strip() for cell in row])

        except Exception as e:
            errors.append(CSVImportError(line=0, message=f"Parse error: {str(e)}"))

        return headers, rows, errors

    @staticmethod
    def preview_csv(content: str, limit: int = 10) -> CSVPreviewResponse:
        """Preview CSV content with validation"""
        headers, rows, parse_errors = FlashcardService.parse_csv(content)

        if parse_errors:
            return CSVPreviewResponse(
                headers=headers or ['question', 'answer'],
                rows=[], total_rows=0, valid_rows=0, errors=parse_errors
            )

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')

        preview_rows = []
        valid_count = 0
        all_errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx is not None and q_idx < len(row) else ""
            answer = row[a_idx] if a_idx is not None and a_idx < len(row) else ""

            is_valid = True
            error_msg = None

            if not question:
                is_valid = False
                error_msg = "Missing question"
                all_errors.append(CSVImportError(line=line_num, message=error_msg))
            elif not answer:
                is_valid = False
                error_msg = "Missing answer"
                all_errors.append(CSVImportError(line=line_num, message=error_msg))
            else:
                valid_count += 1

            if len(preview_rows) < limit:
                preview_rows.append(CSVPreviewRow(
                    line=line_num, question=question, answer=answer,
                    is_valid=is_valid, error=error_msg
                ))

        return CSVPreviewResponse(
            headers=headers, rows=preview_rows,
            total_rows=len(rows), valid_rows=valid_count, errors=all_errors
        )

    @staticmethod
    def import_csv(db: Session, user_id: UUID, content: str, title: str, description: Optional[str] = None) -> CSVImportResult:
        """Import flashcards from CSV"""
        headers, rows, parse_errors = FlashcardService.parse_csv(content)

        if parse_errors:
            return CSVImportResult(success=False, errors=parse_errors)

        col_map = {h: i for i, h in enumerate(headers)}
        q_idx = col_map.get('question')
        a_idx = col_map.get('answer')

        if q_idx is None or a_idx is None:
            return CSVImportResult(success=False, errors=[CSVImportError(line=1, message="Missing columns")])

        deck = FlashcardDeck(user_id=user_id, title=title, description=description)
        db.add(deck)
        db.flush()

        imported = 0
        errors = []

        for line_num, row in enumerate(rows, start=2):
            question = row[q_idx] if q_idx < len(row) else ""
            answer = row[a_idx] if a_idx < len(row) else ""

            if not question or not answer:
                errors.append(CSVImportError(line=line_num, message="Missing question or answer"))
                continue

            card = Flashcard(
                deck_id=deck.id,
                question=question,
                answer=answer,
                order_index=imported
            )
            db.add(card)
            imported += 1

        if imported == 0:
            db.rollback()
            return CSVImportResult(success=False, errors=errors or [CSVImportError(line=0, message="No valid cards")])

        db.commit()
        db.refresh(deck)

        return CSVImportResult(success=True, deck_id=deck.id, cards_imported=imported, errors=errors)

    @staticmethod
    def export_csv(db: Session, deck_id: UUID, user_id: UUID) -> Optional[str]:
        """Export flashcards to CSV"""
        deck = db.query(FlashcardDeck).filter(
            FlashcardDeck.id == deck_id,
            (FlashcardDeck.user_id == user_id) | (FlashcardDeck.is_public == True)
        ).first()

        if not deck:
            return None

        cards = db.query(Flashcard).filter(
            Flashcard.deck_id == deck_id
        ).order_by(Flashcard.order_index).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['question', 'answer'])

        for card in cards:
            writer.writerow([card.question, card.answer])

        return output.getvalue()

    @staticmethod
    def get_csv_template() -> str:
        """Get CSV template"""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['question', 'answer'])
        writer.writerow(['What is the capital of France?', 'Paris'])
        writer.writerow(['2 + 2 = ?', '4'])
        return output.getvalue()

    # ============================================
    # Shuffle (for review session)
    # ============================================

    @staticmethod
    def get_cards_for_review(db: Session, deck_id: UUID, user_id: UUID, shuffle: bool = False) -> List[FlashcardResponse]:
        """Get flashcards for review, optionally shuffled"""
        deck = db.query(FlashcardDeck).filter(
            FlashcardDeck.id == deck_id,
            (FlashcardDeck.user_id == user_id) | (FlashcardDeck.is_public == True)
        ).first()

        if not deck:
            return []

        cards = db.query(Flashcard).filter(
            Flashcard.deck_id == deck_id
        ).order_by(Flashcard.order_index).all()

        if shuffle:
            cards = list(cards)
            random.shuffle(cards)

        return [FlashcardResponse(
            id=c.id, deck_id=c.deck_id, question=c.question,
            answer=c.answer, hint=c.hint, order_index=c.order_index,
            created_at=c.created_at
        ) for c in cards]


flashcard_service = FlashcardService()

