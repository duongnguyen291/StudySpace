"""
Flashcard Feature Tests
Tests for flashcard deck and flashcard CRUD operations
"""
import pytest
from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.user import User
from app.models.flashcard_deck import FlashcardDeck
from app.models.flashcard import Flashcard
from app.models.flashcard_progress import FlashcardProgress
from app.repositories.flashcard_repo import (
    FlashcardDeckRepository,
    FlashcardRepository,
    FlashcardProgressRepository
)
from app.schemas.flashcard import (
    FlashcardDeckCreate,
    FlashcardDeckUpdate,
    FlashcardCreate,
    FlashcardUpdate
)
from app.services.flashcard_service import FlashcardService


@pytest.fixture
def test_user(db: Session):
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@example.com",
        password_hash="hashed_password",
        username="testuser"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_deck(db: Session, test_user: User):
    """Create a test flashcard deck"""
    deck = FlashcardDeck(
        id=uuid4(),
        user_id=test_user.id,
        title="Test Deck",
        description="A test deck",
        is_public=False
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


class TestFlashcardDeckRepository:
    """Tests for FlashcardDeckRepository"""
    
    def test_create_deck(self, db: Session, test_user: User):
        """Test creating a flashcard deck"""
        repo = FlashcardDeckRepository(db)
        deck_data = FlashcardDeckCreate(
            title="French Vocabulary",
            description="Basic French words",
            is_public=False
        )
        
        deck = repo.create(test_user.id, deck_data)
        
        assert deck is not None
        assert deck.title == "French Vocabulary"
        assert deck.description == "Basic French words"
        assert deck.user_id == test_user.id
        assert deck.is_public is False
    
    def test_get_deck_by_id(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test getting a deck by ID"""
        repo = FlashcardDeckRepository(db)
        
        deck = repo.get_by_id(test_deck.id, test_user.id)
        
        assert deck is not None
        assert deck.id == test_deck.id
        assert deck.title == "Test Deck"
    
    def test_get_deck_not_found(self, db: Session, test_user: User):
        """Test getting a non-existent deck"""
        repo = FlashcardDeckRepository(db)
        fake_id = uuid4()
        
        deck = repo.get_by_id(fake_id, test_user.id)
        
        assert deck is None
    
    def test_update_deck(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test updating a deck"""
        repo = FlashcardDeckRepository(db)
        update_data = FlashcardDeckUpdate(
            title="Updated Title",
            description="Updated description"
        )
        
        updated_deck = repo.update(test_deck.id, test_user.id, update_data)
        
        assert updated_deck is not None
        assert updated_deck.title == "Updated Title"
        assert updated_deck.description == "Updated description"
    
    def test_delete_deck(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test deleting a deck"""
        repo = FlashcardDeckRepository(db)
        
        result = repo.delete(test_deck.id, test_user.id)
        
        assert result is True
        
        # Verify deck is deleted
        deleted_deck = repo.get_by_id(test_deck.id, test_user.id)
        assert deleted_deck is None


class TestFlashcardRepository:
    """Tests for FlashcardRepository"""
    
    def test_create_flashcard(self, db: Session, test_deck: FlashcardDeck):
        """Test creating a flashcard"""
        repo = FlashcardRepository(db)
        flashcard_data = FlashcardCreate(
            question="What is 2+2?",
            answer="4",
            hint="It's a small number",
            order_index=0
        )
        
        flashcard = repo.create(test_deck.id, flashcard_data)
        
        assert flashcard is not None
        assert flashcard.question == "What is 2+2?"
        assert flashcard.answer == "4"
        assert flashcard.hint == "It's a small number"
        assert flashcard.deck_id == test_deck.id
    
    def test_get_flashcards_by_deck(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test getting all flashcards in a deck"""
        repo = FlashcardRepository(db)
        
        # Create some flashcards
        flashcard1 = Flashcard(
            deck_id=test_deck.id,
            question="Q1",
            answer="A1",
            order_index=0
        )
        flashcard2 = Flashcard(
            deck_id=test_deck.id,
            question="Q2",
            answer="A2",
            order_index=1
        )
        db.add_all([flashcard1, flashcard2])
        db.commit()
        
        flashcards = repo.get_by_deck(test_deck.id, test_user.id)
        
        assert len(flashcards) == 2
        assert flashcards[0].question == "Q1"
        assert flashcards[1].question == "Q2"
    
    def test_update_flashcard(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test updating a flashcard"""
        repo = FlashcardRepository(db)
        
        # Create a flashcard
        flashcard = Flashcard(
            deck_id=test_deck.id,
            question="Original Q",
            answer="Original A",
            order_index=0
        )
        db.add(flashcard)
        db.commit()
        db.refresh(flashcard)
        
        # Update it
        update_data = FlashcardUpdate(
            question="Updated Q",
            answer="Updated A"
        )
        
        updated = repo.update(flashcard.id, test_deck.id, test_user.id, update_data)
        
        assert updated is not None
        assert updated.question == "Updated Q"
        assert updated.answer == "Updated A"
    
    def test_delete_flashcard(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test deleting a flashcard"""
        repo = FlashcardRepository(db)
        
        # Create a flashcard
        flashcard = Flashcard(
            deck_id=test_deck.id,
            question="Q",
            answer="A",
            order_index=0
        )
        db.add(flashcard)
        db.commit()
        db.refresh(flashcard)
        
        # Delete it
        result = repo.delete(flashcard.id, test_deck.id, test_user.id)
        
        assert result is True
        
        # Verify it's deleted
        deleted = repo.get_by_id(flashcard.id)
        assert deleted is None


class TestFlashcardProgressRepository:
    """Tests for FlashcardProgressRepository"""
    
    def test_get_or_create_progress(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test getting or creating progress"""
        repo = FlashcardProgressRepository(db)
        
        # Create a flashcard
        flashcard = Flashcard(
            deck_id=test_deck.id,
            question="Q",
            answer="A",
            order_index=0
        )
        db.add(flashcard)
        db.commit()
        db.refresh(flashcard)
        
        # Get or create progress
        progress = repo.get_or_create(test_user.id, flashcard.id)
        
        assert progress is not None
        assert progress.user_id == test_user.id
        assert progress.flashcard_id == flashcard.id
        assert progress.confidence_level == 0
        assert progress.review_count == 0
    
    def test_update_progress(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test updating progress after review"""
        repo = FlashcardProgressRepository(db)
        
        # Create a flashcard
        flashcard = Flashcard(
            deck_id=test_deck.id,
            question="Q",
            answer="A",
            order_index=0
        )
        db.add(flashcard)
        db.commit()
        db.refresh(flashcard)
        
        # Update progress with confidence level 3
        progress = repo.update_progress(test_user.id, flashcard.id, 3)
        
        assert progress.confidence_level == 3
        assert progress.review_count == 1
        assert progress.last_reviewed is not None
        assert progress.next_review is not None


class TestFlashcardService:
    """Tests for FlashcardService"""
    
    def test_create_deck_service(self, db: Session, test_user: User):
        """Test creating a deck via service"""
        service = FlashcardService(db)
        deck_data = FlashcardDeckCreate(
            title="Service Test Deck",
            description="Test description"
        )
        
        deck_response = service.create_deck(test_user.id, deck_data)
        
        assert deck_response is not None
        assert deck_response.title == "Service Test Deck"
        assert deck_response.user_id == test_user.id
    
    def test_get_decks_service(self, db: Session, test_user: User):
        """Test getting decks via service"""
        service = FlashcardService(db)
        
        # Create a deck
        deck_data = FlashcardDeckCreate(title="Deck 1")
        service.create_deck(test_user.id, deck_data)
        
        # Get decks
        from app.schemas.flashcard import FlashcardDeckFilter
        filters = FlashcardDeckFilter(page=1, page_size=10)
        response = service.get_decks(test_user.id, filters)
        
        assert response is not None
        assert len(response.decks) >= 1
        assert response.total >= 1
    
    def test_create_flashcard_service(self, db: Session, test_user: User, test_deck: FlashcardDeck):
        """Test creating a flashcard via service"""
        service = FlashcardService(db)
        flashcard_data = FlashcardCreate(
            question="Service Test Q",
            answer="Service Test A"
        )
        
        flashcard = service.create_flashcard(test_deck.id, test_user.id, flashcard_data)
        
        assert flashcard is not None
        assert flashcard.question == "Service Test Q"
        assert flashcard.answer == "Service Test A"
        assert flashcard.deck_id == test_deck.id


# Integration test - requires database connection
@pytest.mark.integration
class TestFlashcardIntegration:
    """Integration tests for flashcard feature"""
    
    def test_full_workflow(self, db: Session, test_user: User):
        """Test complete flashcard workflow"""
        service = FlashcardService(db)
        
        # 1. Create a deck
        deck_data = FlashcardDeckCreate(
            title="Integration Test Deck",
            description="Testing full workflow"
        )
        deck = service.create_deck(test_user.id, deck_data)
        assert deck is not None
        
        # 2. Create flashcards
        flashcard1_data = FlashcardCreate(
            question="Q1",
            answer="A1"
        )
        flashcard2_data = FlashcardCreate(
            question="Q2",
            answer="A2"
        )
        
        card1 = service.create_flashcard(deck.id, test_user.id, flashcard1_data)
        card2 = service.create_flashcard(deck.id, test_user.id, flashcard2_data)
        
        assert card1 is not None
        assert card2 is not None
        
        # 3. Get all flashcards
        flashcards = service.get_flashcards(deck.id, test_user.id)
        assert flashcards is not None
        assert flashcards.total == 2
        
        # 4. Start review session
        from app.schemas.flashcard import ReviewSessionStart
        session_data = ReviewSessionStart(
            deck_id=deck.id,
            mode="random",
            limit=10
        )
        session = service.start_review_session(test_user.id, session_data)
        
        assert session is not None
        assert session.total_cards == 2
        assert len(session.cards) == 2

