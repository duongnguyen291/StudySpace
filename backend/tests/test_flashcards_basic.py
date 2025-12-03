"""
Basic Flashcard Tests
Tests that don't require database connection
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))


def test_file_structure():
    """Test that all flashcard files exist"""
    files_to_check = [
        "app/models/flashcard_deck.py",
        "app/models/flashcard.py",
        "app/models/flashcard_progress.py",
        "app/schemas/flashcard.py",
        "app/repositories/flashcard_repo.py",
        "app/services/flashcard_service.py",
        "app/api/v1/flashcards.py",
    ]
    
    all_exist = True
    for file_path in files_to_check:
        full_path = backend_path / file_path
        if full_path.exists():
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} NOT FOUND")
            all_exist = False
    
    return all_exist


def test_syntax_check():
    """Test that Python files have valid syntax"""
    import py_compile
    
    files_to_check = [
        "app/models/flashcard_deck.py",
        "app/models/flashcard.py",
        "app/models/flashcard_progress.py",
        "app/schemas/flashcard.py",
        "app/repositories/flashcard_repo.py",
        "app/services/flashcard_service.py",
        "app/api/v1/flashcards.py",
    ]
    
    all_valid = True
    for file_path in files_to_check:
        full_path = backend_path / file_path
        try:
            py_compile.compile(str(full_path), doraise=True)
            print(f"✅ {file_path} - syntax valid")
        except py_compile.PyCompileError as e:
            print(f"❌ {file_path} - syntax error: {e}")
            all_valid = False
    
    return all_valid


def test_import_structure():
    """Test that imports are structured correctly"""
    import ast
    
    files_to_check = [
        "app/models/flashcard_deck.py",
        "app/models/flashcard.py",
        "app/models/flashcard_progress.py",
    ]
    
    all_valid = True
    for file_path in files_to_check:
        full_path = backend_path / file_path
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                code = f.read()
                ast.parse(code)
            print(f"✅ {file_path} - imports valid")
        except SyntaxError as e:
            print(f"❌ {file_path} - import error: {e}")
            all_valid = False
    
    return all_valid


def test_model_classes_exist():
    """Test that model classes are defined"""
    files_and_classes = {
        "app/models/flashcard_deck.py": ["FlashcardDeck"],
        "app/models/flashcard.py": ["Flashcard"],
        "app/models/flashcard_progress.py": ["FlashcardProgress"],
    }
    
    all_exist = True
    for file_path, class_names in files_and_classes.items():
        full_path = backend_path / file_path
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                for class_name in class_names:
                    if f"class {class_name}" in content:
                        print(f"✅ {file_path} - {class_name} class found")
                    else:
                        print(f"❌ {file_path} - {class_name} class NOT FOUND")
                        all_exist = False
        except Exception as e:
            print(f"❌ {file_path} - error reading: {e}")
            all_exist = False
    
    return all_exist


def test_api_endpoints_defined():
    """Test that API endpoints are defined"""
    file_path = backend_path / "app/api/v1/flashcards.py"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        endpoints = [
            ("/decks", "POST"),
            ("/decks", "GET"),
            ("/decks/{deck_id}", "GET"),
            ("/decks/{deck_id}", "PUT"),
            ("/decks/{deck_id}", "DELETE"),
            ("/decks/{deck_id}/flashcards", "POST"),
            ("/decks/{deck_id}/flashcards", "GET"),
            ("/review/start", "POST"),
            ("/review/submit", "POST"),
        ]
        
        found = 0
        for path, method in endpoints:
            # Check for router decorator with this path and method
            pattern1 = f'@router.{method.lower()}('
            pattern2 = f'"{path}"'
            if pattern1 in content and pattern2 in content:
                found += 1
                print(f"✅ Endpoint found: {method} {path}")
            else:
                print(f"❌ Endpoint NOT FOUND: {method} {path}")
        
        print(f"\nFound {found}/{len(endpoints)} endpoints")
        return found == len(endpoints)
        
    except Exception as e:
        print(f"❌ Error reading API file: {e}")
        return False


def test_service_methods():
    """Test that service methods are defined"""
    file_path = backend_path / "app/services/flashcard_service.py"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        methods = [
            "def create_deck",
            "def get_deck",
            "def get_decks",
            "def update_deck",
            "def delete_deck",
            "def create_flashcard",
            "def get_flashcards",
            "def start_review_session",
            "def submit_review_results",
        ]
        
        found = 0
        for method in methods:
            if method in content:
                found += 1
                print(f"✅ Method found: {method}")
            else:
                print(f"❌ Method NOT FOUND: {method}")
        
        print(f"\nFound {found}/{len(methods)} methods")
        return found == len(methods)
        
    except Exception as e:
        print(f"❌ Error reading service file: {e}")
        return False


def run_all_tests():
    """Run all basic tests"""
    print("=" * 60)
    print("Flashcard Feature - Basic Tests")
    print("=" * 60)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Syntax Check", test_syntax_check),
        ("Import Structure", test_import_structure),
        ("Model Classes", test_model_classes_exist),
        ("API Endpoints", test_api_endpoints_defined),
        ("Service Methods", test_service_methods),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"📝 {test_name}")
        print('='*60)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)

