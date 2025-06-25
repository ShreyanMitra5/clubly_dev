#!/usr/bin/env python3
"""
Test script for the production SlidesGPT generator system
"""

import json
import os
import tempfile
from pathlib import Path
from production_slidesgpt_generator import ProductionSlidesGPTGenerator, ClubData

def create_test_club_data():
    """Create a test club data file"""
    test_data = {
        "clubId": "test-club-123",
        "userId": "test-user-456",
        "userName": "Test User",
        "userRole": "President",
        "clubName": "Test AI Club",
        "description": "A test club focused on artificial intelligence and machine learning for educational purposes.",
        "mission": "To educate and inspire students about AI through hands-on projects and workshops.",
        "goals": "1. Host weekly AI workshops\n2. Organize hackathons\n3. Build a community of AI enthusiasts\n4. Provide mentorship opportunities",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    return test_data

def test_club_data_loading():
    """Test loading club data from JSON file"""
    print("Testing club data loading...")
    
    # Create temporary test file
    test_data = create_test_club_data()
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(test_data, f)
        temp_file = f.name
    
    try:
        # Test loading
        generator = ProductionSlidesGPTGenerator(api_key="test-key")
        club_data = generator.load_club_data_from_file(temp_file)
        
        # Verify data
        assert club_data.clubName == "Test AI Club"
        assert club_data.userRole == "President"
        assert "AI workshops" in club_data.goals
        
        print("✅ Club data loading test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Club data loading test failed: {e}")
        return False
    finally:
        os.unlink(temp_file)

def test_prompt_generation():
    """Test prompt generation from club data"""
    print("Testing prompt generation...")
    
    try:
        # Create test club data
        test_data = create_test_club_data()
        club_data = ClubData(**test_data)
        
        # Test prompt generation
        generator = ProductionSlidesGPTGenerator(api_key="test-key")
        prompt = generator.create_presentation_prompt(
            club_data, 
            "Introduction to Neural Networks", 
            week=3
        )
        
        # Verify prompt contains expected elements
        assert "Test AI Club" in prompt
        assert "Introduction to Neural Networks" in prompt
        assert "Week 3" in prompt
        assert "President" in prompt
        assert "AI workshops" in prompt
        
        print("✅ Prompt generation test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Prompt generation test failed: {e}")
        return False

def test_file_structure():
    """Test the expected file structure"""
    print("Testing file structure...")
    
    try:
        # Create test directory structure
        with tempfile.TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir) / "data" / "clubs"
            user_dir = data_dir / "test-user-456"
            user_dir.mkdir(parents=True)
            
            # Create test club file
            test_data = create_test_club_data()
            club_file = user_dir / "Test_AI_Club_test-club-123.json"
            
            with open(club_file, 'w') as f:
                json.dump(test_data, f)
            
            # Test finding club file
            generator = ProductionSlidesGPTGenerator(api_key="test-key")
            found_file = generator.find_club_file("Test AI Club", str(data_dir))
            
            assert found_file == str(club_file)
            print("✅ File structure test passed!")
            return True
            
    except Exception as e:
        print(f"❌ File structure test failed: {e}")
        return False

def test_error_handling():
    """Test error handling"""
    print("Testing error handling...")
    
    try:
        generator = ProductionSlidesGPTGenerator(api_key="test-key")
        
        # Test with non-existent file
        try:
            generator.load_club_data_from_file("non_existent_file.json")
            print("❌ Should have raised FileNotFoundError")
            return False
        except FileNotFoundError:
            pass
        
        # Test with invalid JSON
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            f.write("invalid json content")
            temp_file = f.name
        
        try:
            generator.load_club_data_from_file(temp_file)
            print("❌ Should have raised ValueError for invalid JSON")
            return False
        except ValueError:
            pass
        finally:
            os.unlink(temp_file)
        
        print("✅ Error handling test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Running production system tests...\n")
    
    tests = [
        test_club_data_loading,
        test_prompt_generation,
        test_file_structure,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The production system is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    exit(main()) 