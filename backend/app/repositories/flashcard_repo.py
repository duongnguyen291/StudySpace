"""
Flashcard Repository
Data access layer for flashcard operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, case
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timedelta

from app.models.flashcard_deck import FlashcardDeck
from app.models.flashcard import Flashcard
from app.models.flashcard_progress import FlashcardProgress
from app.schemas.flashcard import (
    FlashcardDeckCreate,
    FlashcardDeckUpdate,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardDeckFilter
)


class FlashcardDeckRepository:
    """Repository for FlashcardDeck data access"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user_id: UUID, deck_data: FlashcardDeckCreate) -> FlashcardDeck:
        """Create a new flashcard deck"""
        deck = FlashcardDeck(
            user_id=user_id,
            **deck_data.model_dump()
        )
        self.db.add(deck)
        self.db.commit()
        self.db.refresh(deck)
        return deck
    
    def get_by_id(self, deck_id: UUID, user_id: UUID) -> Optional[FlashcardDeck]:
        """Get deck by ID (only if belongs to user)"""
        return self.db.query(FlashcardDeck).filter(
            and_(
                FlashcardDeck.id == deck_id,
                FlashcardDeck.user_id == user_id
            )
        ).first()
    
    def get_all(
        self,
        user_id: UUID,
        filters: FlashcardDeckFilter
    ) -> Tuple[List[FlashcardDeck], int]:
        """Get all decks with filters and pagination"""
        query = self.db.query(FlashcardDeck).filter(FlashcardDeck.user_id == user_id)
        
        # Apply filters
        if filters.category_id:
            query = query.filter(FlashcardDeck.category_id == filters.category_id)
        
        if filters.is_public is not None:
            query = query.filter(FlashcardDeck.is_public == filters.is_public)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    FlashcardDeck.title.ilike(search_term),
                    FlashcardDeck.description.ilike(search_term)
                )
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(FlashcardDeck, filters.sort_by, FlashcardDeck.created_at)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        decks = query.all()
        return decks, total
    
    def update(
        self,
        deck_id: UUID,
        user_id: UUID,
        deck_data: FlashcardDeckUpdate
    ) -> Optional[FlashcardDeck]:
        """Update deck"""
        deck = self.get_by_id(deck_id, user_id)
        if not deck:
            return None
        
        update_data = deck_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(deck, key, value)
        
        self.db.commit()
        self.db.refresh(deck)
        return deck
    
    def delete(self, deck_id: UUID, user_id: UUID) -> bool:
        """Delete deck"""
        deck = self.get_by_id(deck_id, user_id)
        if not deck:
            return False
        
        self.db.delete(deck)
        self.db.commit()
        return True


class FlashcardRepository:
    """Repository for Flashcard data access"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, deck_id: UUID, flashcard_data: FlashcardCreate) -> Flashcard:
        """Create a new flashcard"""
        flashcard = Flashcard(
            deck_id=deck_id,
            **flashcard_data.model_dump()
        )
        self.db.add(flashcard)
        self.db.commit()
        self.db.refresh(flashcard)
        return flashcard
    
    def get_by_id(self, flashcard_id: UUID, deck_id: Optional[UUID] = None) -> Optional[Flashcard]:
        """Get flashcard by ID"""
        query = self.db.query(Flashcard).filter(Flashcard.id == flashcard_id)
        if deck_id:
            query = query.filter(Flashcard.deck_id == deck_id)
        return query.first()
    
    def get_by_deck(self, deck_id: UUID, user_id: UUID) -> List[Flashcard]:
        """Get all flashcards in a deck (only if deck belongs to user)"""
        deck = self.db.query(FlashcardDeck).filter(
            and_(
                FlashcardDeck.id == deck_id,
                FlashcardDeck.user_id == user_id
            )
        ).first()
        
        if not deck:
            return []
        
        return self.db.query(Flashcard).filter(
            Flashcard.deck_id == deck_id
        ).order_by(Flashcard.order_index.asc()).all()
    
    def update(
        self,
        flashcard_id: UUID,
        deck_id: UUID,
        user_id: UUID,
        flashcard_data: FlashcardUpdate
    ) -> Optional[Flashcard]:
        """Update flashcard"""
        # Verify deck ownership
        deck = self.db.query(FlashcardDeck).filter(
            and_(
                FlashcardDeck.id == deck_id,
                FlashcardDeck.user_id == user_id
            )
        ).first()
        
        if not deck:
            return None
        
        flashcard = self.get_by_id(flashcard_id, deck_id)
        if not flashcard:
            return None
        
        update_data = flashcard_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(flashcard, key, value)
        
        self.db.commit()
        self.db.refresh(flashcard)
        return flashcard
    
    def delete(self, flashcard_id: UUID, deck_id: UUID, user_id: UUID) -> bool:
        """Delete flashcard"""
        # Verify deck ownership
        deck = self.db.query(FlashcardDeck).filter(
            and_(
                FlashcardDeck.id == deck_id,
                FlashcardDeck.user_id == user_id
            )
        ).first()
        
        if not deck:
            return False
        
        flashcard = self.get_by_id(flashcard_id, deck_id)
        if not flashcard:
            return False
        
        self.db.delete(flashcard)
        self.db.commit()
        return True
    
    def bulk_create(self, deck_id: UUID, flashcards_data: List[FlashcardCreate]) -> List[Flashcard]:
        """Create multiple flashcards at once"""
        flashcards = [
            Flashcard(deck_id=deck_id, **data.model_dump())
            for data in flashcards_data
        ]
        self.db.add_all(flashcards)
        self.db.commit()
        for flashcard in flashcards:
            self.db.refresh(flashcard)
        return flashcards


class FlashcardProgressRepository:
    """Repository for FlashcardProgress data access"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create(
        self,
        user_id: UUID,
        flashcard_id: UUID,
    ) -> FlashcardProgress:
        """Get existing progress or create new one"""
        progress = self.db.query(FlashcardProgress).filter(
            and_(
                FlashcardProgress.user_id == user_id,
                FlashcardProgress.flashcard_id == flashcard_id,
            )
        ).first()
        
        if not progress:
            progress = FlashcardProgress(
                user_id=user_id,
                flashcard_id=flashcard_id,
                confidence_level=0,
                review_count=0
            )
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)
        
        return progress
    
    def update_progress(
        self,
        user_id: UUID,
        flashcard_id: UUID,
        confidence_level: int
    ) -> FlashcardProgress:
        """Update progress after review"""
        progress = self.get_or_create(user_id, flashcard_id)
        
        # Update progress
        progress.confidence_level = confidence_level
        progress.review_count += 1
        progress.last_reviewed = datetime.utcnow()
        
        # Calculate next review date using spaced repetition
        # Simple algorithm: more confidence = longer interval
        intervals = {
            0: timedelta(hours=1),      # Review again in 1 hour
            1: timedelta(hours=4),      # Review again in 4 hours
            2: timedelta(days=1),       # Review again in 1 day
            3: timedelta(days=3),       # Review again in 3 days
            4: timedelta(days=7),       # Review again in 1 week
            5: timedelta(days=30),      # Review again in 1 month (mastered)
        }
        
        interval = intervals.get(confidence_level, timedelta(days=1))
        progress.next_review = datetime.utcnow() + interval
        
        self.db.commit()
        self.db.refresh(progress)
        return progress
    
    def get_due_cards(
        self,
        user_id: UUID,
        deck_id: UUID
    ) -> List[Flashcard]:
        """Get flashcards that are due for review"""
        now = datetime.utcnow()
        
        # Get flashcards that either:
        # 1. Have no progress (new cards)
        # 2. Have progress with next_review <= now
        subquery = self.db.query(FlashcardProgress.flashcard_id).filter(
            and_(
                FlashcardProgress.user_id == user_id,
                or_(
                    FlashcardProgress.next_review <= now,
                    FlashcardProgress.next_review.is_(None)
                )
            )
        ).subquery()
        
        # Cards with progress that are due
        due_with_progress = self.db.query(Flashcard).join(
            FlashcardProgress,
            and_(
                Flashcard.id == FlashcardProgress.flashcard_id,
                FlashcardProgress.user_id == user_id,
                or_(
                    FlashcardProgress.next_review <= now,
                    FlashcardProgress.next_review.is_(None)
                )
            )
        ).filter(Flashcard.deck_id == deck_id).all()
        
        # Cards without progress (new cards)
        new_cards = self.db.query(Flashcard).filter(
            and_(
                Flashcard.deck_id == deck_id,
                ~Flashcard.id.in_(
                    self.db.query(FlashcardProgress.flashcard_id).filter(
                        FlashcardProgress.user_id == user_id
                    )
                )
            )
        ).all()
        
        # Combine and return unique cards
        all_cards = {card.id: card for card in due_with_progress + new_cards}
        return list(all_cards.values())
    
    def get_random_cards(
        self,
        user_id: UUID,
        deck_id: UUID,
        limit: Optional[int] = None
    ) -> List[Flashcard]:
        """Get random flashcards from deck"""
        query = self.db.query(Flashcard).filter(Flashcard.deck_id == deck_id)
        
        if limit:
            query = query.order_by(func.random()).limit(limit)
        else:
            query = query.order_by(func.random())
        
        return query.all()
    
    def get_cards_for_review(
        self,
        user_id: UUID,
        deck_id: UUID,
        mode: str = "spaced",
        limit: Optional[int] = None
    ) -> List[Flashcard]:
        """Get cards for review session based on mode"""
        if mode == "random":
            return self.get_random_cards(user_id, deck_id, limit)
        else:  # spaced
            cards = self.get_due_cards(user_id, deck_id)
            if limit:
                return cards[:limit]
            return cards

