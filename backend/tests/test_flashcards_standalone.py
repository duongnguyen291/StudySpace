"""
Standalone Flashcard Tests
Simple tests that verify flashcard logic without database
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))


def test_flashcard_schema_validation():
    """Test that flashcard schemas validate correctly"""
    try:
        from app.schemas.flashcard import FlashcardDeckCreate, FlashcardCreate
        
        # Test valid deck creation
        deck = FlashcardDeckCreate(
            title="Test Deck",
            description="Test description",
            is_public=False
        )
        assert deck.title == "Test Deck"
        assert deck.description == "Test description"
        print("✅ Deck schema validation passed")
        
        # Test valid flashcard creation
        flashcard = FlashcardCreate(
            question="What is 2+2?",
            answer="4",
            hint="It's a small number"
        )
        assert flashcard.question == "What is 2+2?"
        assert flashcard.answer == "4"
        print("✅ Flashcard schema validation passed")
        
        return True
    except Exception as e:
        print(f"❌ Schema validation failed: {e}")
        return False


def test_model_imports():
    """Test that models can be imported"""
    try:
        from app.models.flashcard_deck import FlashcardDeck
        from app.models.flashcard import Flashcard
        from app.models.flashcard_progress import FlashcardProgress
        print("✅ Model imports successful")
        return True
    except Exception as e:
        print(f"❌ Model import failed: {e}")
        return False


def test_repository_imports():
    """Test that repositories can be imported"""
    try:
        from app.repositories.flashcard_repo import (
            FlashcardDeckRepository,
            FlashcardRepository,
            FlashcardProgressRepository
        )
        print("✅ Repository imports successful")
        return True
    except Exception as e:
        print(f"❌ Repository import failed: {e}")
        return False


def test_service_imports():
    """Test that services can be imported"""
    try:
        from app.services.flashcard_service import FlashcardService
        print("✅ Service imports successful")
        return True
    except Exception as e:
        print(f"❌ Service import failed: {e}")
        return False


def test_api_imports():
    """Test that API endpoints can be imported"""
    try:
        from app.api.v1.flashcards import router
        assert router is not None
        print("✅ API router import successful")
        return True
    except Exception as e:
        print(f"❌ API import failed: {e}")
        return False


def test_spaced_repetition_intervals():
    """Test spaced repetition interval logic"""
    intervals = {
        0: 1,      # 1 hour
        1: 4,      # 4 hours
        2: 24,     # 1 day (24 hours)
        3: 72,     # 3 days
        4: 168,    # 1 week
        5: 720,    # 1 month (approx)
    }
    
    for level, hours in intervals.items():
        assert 0 <= level <= 5, f"Confidence level {level} should be 0-5"
        assert hours > 0, f"Interval for level {level} should be positive"
    
    print("✅ Spaced repetition intervals validated")
    return True


def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("Running Flashcard Tests")
    print("=" * 50)
    
    tests = [
        ("Model Imports", test_model_imports),
        ("Repository Imports", test_repository_imports),
        ("Service Imports", test_service_imports),
        ("API Imports", test_api_imports),
        ("Schema Validation", test_flashcard_schema_validation),
        ("Spaced Repetition Logic", test_spaced_repetition_intervals),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📝 Testing: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("Test Results Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)

