#!/usr/bin/env python3
"""
Quick API test script to verify the FastAPI backend is working.
Run this before starting the Streamlit frontend.
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_api():
    """Test the API endpoints."""

    print("🧪 Testing AI Requirements Analyzer API")
    print("=" * 50)

    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

    # Test 2: Single analysis
    print("\n2. Testing single analysis...")
    test_text = "The system should load fast and handle errors properly"

    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze",
            json={"text": test_text},
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Single analysis passed")

            # Check required fields
            required_fields = ['ambiguity_score', 'assumption_score', 'readiness_score', 'issues', 'suggestions']
            for field in required_fields:
                if field in result:
                    print(f"   ✅ {field}: {result[field]}")
                else:
                    print(f"   ❌ Missing field: {field}")

        else:
            print(f"❌ Single analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Single analysis error: {e}")
        return False

    # Test 3: Batch analysis
    print("\n3. Testing batch analysis...")
    test_texts = [
        "User logs in with valid credentials",
        "Click the submit button"
    ]

    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze/batch",
            json={"texts": test_texts},
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Batch analysis passed")

            if 'results' in result and len(result['results']) == len(test_texts):
                print(f"   ✅ Processed {len(result['results'])} requirements")
            else:
                print(f"   ❌ Expected {len(test_texts)} results, got {len(result.get('results', []))}")

        else:
            print(f"❌ Batch analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Batch analysis error: {e}")
        return False

    print("\n🎉 All API tests passed! The backend is working correctly.")
    print("\n🚀 You can now run the Streamlit frontend:")
    print("   streamlit run frontend/streamlit_app.py")

    return True

if __name__ == "__main__":
    success = test_api()
    if not success:
        print("\n❌ Some tests failed. Please check that:")
        print("   1. The FastAPI server is running: python app.py")
        print("   2. The server is accessible at http://localhost:8000")
        print("   3. All dependencies are installed: pip install -r requirements.txt")
        exit(1)