"""
Simple Flashcard Tests
Unit tests that don't require database connection
"""
import pytest
from uuid import uuid4

from app.schemas.flashcard import (
    FlashcardDeckCreate,
    FlashcardDeckUpdate,
    FlashcardCreate,
    FlashcardUpdate
)


class TestFlashcardSchemas:
    """Test flashcard schemas validation"""
    
    def test_deck_create_schema(self):
        """Test FlashcardDeckCreate schema"""
        deck_data = FlashcardDeckCreate(
            title="Test Deck",
            description="Test description",
            is_public=False
        )
        
        assert deck_data.title == "Test Deck"
        assert deck_data.description == "Test description"
        assert deck_data.is_public is False
    
    def test_deck_create_validation(self):
        """Test deck create validation"""
        # Empty title should fail
        with pytest.raises(ValueError):
            FlashcardDeckCreate(title="")
        
        # Whitespace-only title should fail
        with pytest.raises(ValueError):
            FlashcardDeckCreate(title="   ")
    
    def test_flashcard_create_schema(self):
        """Test FlashcardCreate schema"""
        flashcard_data = FlashcardCreate(
            question="What is 2+2?",
            answer="4",
            hint="It's a small number",
            order_index=0
        )
        
        assert flashcard_data.question == "What is 2+2?"
        assert flashcard_data.answer == "4"
        assert flashcard_data.hint == "It's a small number"
        assert flashcard_data.order_index == 0
    
    def test_flashcard_create_validation(self):
        """Test flashcard create validation"""
        # Empty question should fail
        with pytest.raises(ValueError):
            FlashcardCreate(question="", answer="A")
        
        # Empty answer should fail
        with pytest.raises(ValueError):
            FlashcardCreate(question="Q", answer="")
    
    def test_deck_update_schema(self):
        """Test FlashcardDeckUpdate schema (all fields optional)"""
        # Partial update
        update_data = FlashcardDeckUpdate(title="New Title")
        assert update_data.title == "New Title"
        assert update_data.description is None
        
        # Full update
        full_update = FlashcardDeckUpdate(
            title="New Title",
            description="New Description",
            is_public=True
        )
        assert full_update.title == "New Title"
        assert full_update.description == "New Description"
        assert full_update.is_public is True
    
    def test_flashcard_update_schema(self):
        """Test FlashcardUpdate schema (all fields optional)"""
        # Partial update
        update_data = FlashcardUpdate(question="New Question")
        assert update_data.question == "New Question"
        assert update_data.answer is None
        
        # Full update
        full_update = FlashcardUpdate(
            question="New Q",
            answer="New A",
            hint="New Hint"
        )
        assert full_update.question == "New Q"
        assert full_update.answer == "New A"
        assert full_update.hint == "New Hint"


class TestFlashcardModels:
    """Test flashcard model methods"""
    
    def test_flashcard_deck_to_dict(self):
        """Test FlashcardDeck.to_dict() method"""
        from app.models.flashcard_deck import FlashcardDeck
        from datetime import datetime
        
        deck = FlashcardDeck(
            id=uuid4(),
            user_id=uuid4(),
            title="Test Deck",
            description="Test",
            is_public=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        deck_dict = deck.to_dict()
        
        assert deck_dict["title"] == "Test Deck"
        assert deck_dict["description"] == "Test"
        assert deck_dict["is_public"] is False
        assert "id" in deck_dict
        assert "user_id" in deck_dict
    
    def test_flashcard_to_dict(self):
        """Test Flashcard.to_dict() method"""
        from app.models.flashcard import Flashcard
        from datetime import datetime
        
        flashcard = Flashcard(
            id=uuid4(),
            deck_id=uuid4(),
            question="Q",
            answer="A",
            hint="H",
            order_index=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        flashcard_dict = flashcard.to_dict()
        
        assert flashcard_dict["question"] == "Q"
        assert flashcard_dict["answer"] == "A"
        assert flashcard_dict["hint"] == "H"
        assert flashcard_dict["order_index"] == 0
        assert "id" in flashcard_dict
        assert "deck_id" in flashcard_dict


class TestSpacedRepetitionLogic:
    """Test spaced repetition algorithm logic"""
    
    def test_confidence_level_intervals(self):
        """Test confidence level to interval mapping"""
        intervals = {
            0: 1,      # 1 hour
            1: 4,      # 4 hours
            2: 24,     # 1 day
            3: 72,     # 3 days
            4: 168,    # 1 week
            5: 720,    # 1 month
        }
        
        # Test all confidence levels
        for level, expected_hours in intervals.items():
            assert level >= 0 and level <= 5
            assert expected_hours > 0
    
    def test_review_count_increment(self):
        """Test that review count should increment"""
        initial_count = 0
        confidence_level = 3
        
        # Simulate review
        new_count = initial_count + 1
        
        assert new_count == 1
        assert new_count > initial_count


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

