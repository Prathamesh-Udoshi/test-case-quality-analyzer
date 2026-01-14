#!/usr/bin/env python3
"""
Convenient launcher for the Streamlit frontend with API validation.
This script checks that everything is working before starting the UI.
"""

import subprocess
import sys
import time
import requests
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
STREAMLIT_FILE = "frontend/streamlit_app.py"

def check_python_version():
    """Check Python version."""
    if sys.version_info < (3, 10):
        print("❌ Python 3.10+ is required")
        return False
    print(f"✅ Python {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required packages are installed."""
    required_packages = [
        'fastapi', 'uvicorn', 'spacy', 'streamlit', 'plotly', 'requests'
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)

    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False

    print("✅ All required packages installed")
    return True

def check_spacy_model():
    """Check if spaCy model is installed."""
    try:
        import spacy
        spacy.load("en_core_web_sm")
        print("✅ spaCy model 'en_core_web_sm' loaded")
        return True
    except OSError:
        print("❌ spaCy model 'en_core_web_sm' not found")
        print("Install with: python -m spacy download en_core_web_sm")
        return False

def check_files():
    """Check if required files exist."""
    required_files = [
        "app.py",
        "core/ambiguity_detector.py",
        "core/assumption_detector.py",
        "core/scorer.py",
        "frontend/streamlit_app.py",
        "data/sample_requirements.csv"
    ]

    missing = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing.append(file_path)

    if missing:
        print(f"❌ Missing files: {', '.join(missing)}")
        return False

    print("✅ All required files present")
    return True

def test_api_connection():
    """Test if API is accessible."""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is accessible")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure to start the API server first: python app.py")
        return False
    except Exception as e:
        print(f"❌ API connection error: {e}")
        return False

def start_streamlit():
    """Start the Streamlit application."""
    try:
        print("\n🚀 Starting Streamlit application...")
        print("   This will open a new browser window/tab")
        print("   Press Ctrl+C to stop the application")
        print()

        # Start Streamlit
        subprocess.run([
            sys.executable, "-m", "streamlit", "run",
            STREAMLIT_FILE,
            "--server.headless", "true",
            "--server.address", "0.0.0.0",
            "--server.port", "8501"
        ], check=True)

    except KeyboardInterrupt:
        print("\n👋 Streamlit application stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Streamlit: {e}")
        return False

    return True

def main():
    """Main launcher function."""
    print("🔍 AI Requirements Analyzer - Streamlit Launcher")
    print("=" * 55)

    # Run checks
    checks = [
        ("Python version", check_python_version),
        ("Dependencies", check_dependencies),
        ("spaCy model", check_spacy_model),
        ("Required files", check_files),
        ("API connection", test_api_connection)
    ]

    all_passed = True
    for check_name, check_func in checks:
        print(f"Checking {check_name}...", end=" ")
        if not check_func():
            all_passed = False

    if not all_passed:
        print("\n❌ Some checks failed. Please fix the issues above and try again.")
        return False

    print("\n🎉 All checks passed! Ready to start Streamlit.")

    # Start Streamlit
    start_streamlit()

    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        sys.exit(1)