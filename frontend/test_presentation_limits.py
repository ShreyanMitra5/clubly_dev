#!/usr/bin/env python3
"""
Test script for presentation limits system
This script tests the API endpoints and database functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"  # Change this to your actual URL

# IMPORTANT: Replace these with actual club and user IDs from your system
# You can find these by:
# 1. Looking at your database
# 2. Checking the browser network tab when using the app
# 3. Looking at the club data files in your data/clubs directory

# Option 1: Use a real club ID from your data/clubs directory
# Look in frontend/data/clubs/ for actual club files
TEST_CLUB_ID = "AI_Club_9858e0fc-69ea-4251-9ed4-3f58cbcba216"  # Example from your data
TEST_USER_ID = "user_2z1Cce3SkuBOMMBZkMasjVJhaWK"  # Example from your data

# Option 2: Use a club name if your system supports it
# TEST_CLUB_ID = "AI Club"  # Try using the club name instead

# Option 3: Get the first available club dynamically
def get_first_available_club():
    """Try to get the first available club from the system"""
    try:
        # Try to get clubs from the API if available
        response = requests.get(f"{BASE_URL}/api/clubs")
        if response.status_code == 200:
            clubs = response.json()
            if clubs and len(clubs) > 0:
                return clubs[0].get('id') or clubs[0].get('clubId')
        
        # Fallback: try to read from data directory
        import os
        data_dir = "frontend/data/clubs"
        if os.path.exists(data_dir):
            user_dirs = [d for d in os.listdir(data_dir) if d.startswith('user_')]
            if user_dirs:
                user_dir = user_dirs[0]
                club_files = os.listdir(os.path.join(data_dir, user_dir))
                if club_files:
                    # Extract club ID from filename (remove .json extension)
                    club_id = club_files[0].replace('.json', '')
                    return club_id, user_dir
        
        return None, None
    except Exception as e:
        print(f"Could not get club automatically: {e}")
        return None, None

# Try to get a real club automatically
print("Attempting to find a real club for testing...")
real_club_id, real_user_id = get_first_available_club()

if real_club_id:
    TEST_CLUB_ID = real_club_id
    if real_user_id:
        TEST_USER_ID = real_user_id
    print(f"✅ Using real club ID: {TEST_CLUB_ID}")
    print(f"✅ Using real user ID: {TEST_USER_ID}")
else:
    print("⚠️  Could not find a real club automatically")
    print("   Please update TEST_CLUB_ID and TEST_USER_ID with real values")
    print("   You can find these in your data/clubs directory or database")

def test_check_usage():
    """Test the usage check endpoint"""
    print("Testing usage check endpoint...")
    
    url = f"{BASE_URL}/api/presentations/check-usage"
    payload = {"clubId": TEST_CLUB_ID}
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return data
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def test_increment_usage():
    """Test the usage increment endpoint"""
    print("\nTesting usage increment endpoint...")
    
    url = f"{BASE_URL}/api/presentations/check-usage"
    payload = {"clubId": TEST_CLUB_ID, "userId": TEST_USER_ID}
    
    try:
        response = requests.put(url, json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return data
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def test_presentation_generation():
    """Test the presentation generation endpoint"""
    print("\nTesting presentation generation endpoint...")
    
    url = f"{BASE_URL}/api/slidesgpt/generate"
    payload = {
        "clubId": TEST_CLUB_ID,
        "topic": "Test Presentation",
        "theme": "modern",
        "prompt": "This is a test presentation for testing the limits system."
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Presentation generated successfully!")
            return data
        elif response.status_code == 429:
            print("Limit reached (expected behavior)")
            return None
        elif response.status_code == 404:
            print("Club not found - check TEST_CLUB_ID")
            return None
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def run_limit_test():
    """Run a complete test of the limits system"""
    print("=" * 50)
    print("PRESENTATION LIMITS SYSTEM TEST")
    print("=" * 50)
    
    # Initial usage check
    print("\n1. Initial usage check:")
    initial_usage = test_check_usage()
    
    if not initial_usage:
        print("❌ Initial usage check failed")
        return
    
    print(f"✅ Initial usage: {initial_usage.get('currentUsage', 0)}/{initial_usage.get('monthlyLimit', 5)}")
    
    # Test multiple generations to reach limit
    max_attempts = 6  # Try to exceed the limit
    successful_generations = 0
    
    for attempt in range(1, max_attempts + 1):
        print(f"\n{attempt}. Attempting presentation generation {attempt}:")
        
        # Check usage before generation
        usage_before = test_check_usage()
        if not usage_before:
            print("❌ Usage check failed")
            continue
            
        print(f"   Usage before: {usage_before.get('currentUsage', 0)}/{usage_before.get('monthlyLimit', 5)}")
        
        # Try to generate
        result = test_presentation_generation()
        
        if result:
            successful_generations += 1
            print(f"   ✅ Generation {attempt} successful")
        else:
            print(f"   ❌ Generation {attempt} failed or blocked")
        
        # Check usage after generation
        time.sleep(1)  # Small delay to ensure database updates
        usage_after = test_check_usage()
        if usage_after:
            print(f"   Usage after: {usage_after.get('currentUsage', 0)}/{usage_after.get('monthlyLimit', 5)}")
        
        # If we've reached the limit, break
        if usage_after and not usage_after.get('canGenerate', True):
            print(f"   🚫 Limit reached after {attempt} generations")
            break
    
    # Final summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    print(f"Successful generations: {successful_generations}")
    print(f"Expected limit: 5")
    
    if successful_generations <= 5:
        print("✅ Limit enforcement working correctly")
    else:
        print("❌ Limit enforcement failed - exceeded 5 generations")
    
    # Final usage check
    final_usage = test_check_usage()
    if final_usage:
        print(f"Final usage: {final_usage.get('currentUsage', 0)}/{final_usage.get('monthlyLimit', 5)}")
        print(f"Can generate: {final_usage.get('canGenerate', True)}")

def test_database_queries():
    """Test database queries (run these in Supabase SQL Editor)"""
    print("\n" + "=" * 50)
    print("DATABASE TEST QUERIES")
    print("=" * 50)
    print("Run these queries in your Supabase SQL Editor:")
    print()
    
    queries = [
        "-- Check if table exists",
        "SELECT table_name FROM information_schema.tables WHERE table_name = 'presentation_usage';",
        "",
        "-- Check table structure",
        "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'presentation_usage' ORDER BY ordinal_position;",
        "",
        "-- Check current usage for test club",
        f"SELECT * FROM presentation_usage WHERE club_id = '{TEST_CLUB_ID}' ORDER BY month_year DESC;",
        "",
        "-- Check all usage data",
        "SELECT club_id, month_year, usage_count, created_at FROM presentation_usage ORDER BY month_year DESC, usage_count DESC;",
        "",
        "-- Monthly usage summary",
        "SELECT month_year, COUNT(*) as clubs_with_usage, SUM(usage_count) as total_presentations FROM presentation_usage GROUP BY month_year ORDER BY month_year DESC;"
    ]
    
    for query in queries:
        print(query)

if __name__ == "__main__":
    print("Starting presentation limits system test...")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Club ID: {TEST_CLUB_ID}")
    print(f"Test User ID: {TEST_USER_ID}")
    print()
    
    try:
        # Run the main test
        run_limit_test()
        
        # Show database queries
        test_database_queries()
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
    
    print("\nTest completed!")
