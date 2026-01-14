"""
Streamlit Frontend for AI Requirements Quality Analyzer

A simple, interactive web interface for analyzing requirement ambiguity and assumptions.
Built with Streamlit for rapid prototyping and easy deployment.
"""

import streamlit as st
import requests
import json
import pandas as pd
import time
from typing import Dict, Any, List
import plotly.express as px
import plotly.graph_objects as go


# Configuration
API_BASE_URL = "http://localhost:8000"  # Change this for production
DEFAULT_EXAMPLES = [
    "The system should load fast and handle errors properly",
    "User logs in with valid credentials and accesses dashboard",
    "Click the submit button and verify error message appears",
    "The application must respond quickly to user interactions",
    "Given user is logged in, when clicking save, then data should persist",
    "System should be scalable and handle up to 1000 concurrent users",
    "Navigate to user profile page and update personal information"
]


class RequirementsAnalyzer:
    """Frontend interface for the requirements analysis API."""

    def __init__(self, api_url: str = API_BASE_URL):
        self.api_url = api_url

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze a single requirement text."""
        try:
            # Debug: Show what we're sending
            st.write(f"Debug: Sending request to {self.api_url}/analyze")
            st.write(f"Debug: Request data: {{'text': '{text[:50]}...'}}")

            response = requests.post(
                f"{self.api_url}/analyze",
                json={"text": text},
                timeout=30
            )

            st.write(f"Debug: Response status: {response.status_code}")

            response.raise_for_status()
            result = response.json()

            st.write(f"Debug: Response received: {type(result)}")
            if isinstance(result, dict):
                st.write(f"Debug: Response keys: {list(result.keys())}")

            return result

        except requests.exceptions.ConnectionError:
            st.error("❌ Cannot connect to API server. Make sure the FastAPI server is running on http://localhost:8000")
            st.info("Start the server with: `python app.py`")
            return None
        except requests.exceptions.Timeout:
            st.error("⏰ API request timed out. The server might be overloaded.")
            return None
        except requests.exceptions.HTTPError as e:
            st.error(f"🔴 HTTP Error: {e.response.status_code} - {e.response.reason}")
            try:
                error_detail = e.response.json()
                st.error(f"Details: {error_detail}")
            except:
                st.error(f"Response: {e.response.text}")
            return None
        except requests.exceptions.RequestException as e:
            st.error(f"📡 Network Error: {str(e)}")
            return None
        except ValueError as e:
            st.error(f"📄 JSON Parse Error: {str(e)}")
            return None
        except Exception as e:
            st.error(f"💥 Unexpected Error: {str(e)}")
            return None

    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Analyze multiple requirements in batch."""
        try:
            response = requests.post(
                f"{self.api_url}/analyze/batch",
                json={"texts": texts},
                timeout=60
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except requests.exceptions.RequestException as e:
            st.error(f"Batch API Error: {str(e)}")
            return []

    def health_check(self) -> bool:
        """Check if the API is available."""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            return response.status_code == 200
        except:
            return False


def main():
    """Main Streamlit application."""

    # Page configuration
    st.set_page_config(
        page_title="AI Requirements Analyzer",
        page_icon="🔍",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # Custom CSS for better styling
    st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .ready-badge {
        background-color: #28a745;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .needs-clarification-badge {
        background-color: #ffc107;
        color: black;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .high-risk-badge {
        background-color: #dc3545;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    </style>
    """, unsafe_allow_html=True)

    # Header
    st.markdown('<div class="main-header">🔍 AI Requirements Analyzer</div>', unsafe_allow_html=True)
    st.markdown("**Detect ambiguity and hidden assumptions in your requirements before test automation**")

    # Initialize analyzer
    analyzer = RequirementsAnalyzer()

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Settings")

        # API Status
        if analyzer.health_check():
            st.success("✅ API Connected")
        else:
            st.error("❌ API Not Available")
            st.info("Make sure the FastAPI server is running on port 8000")

        st.markdown("---")

        # Navigation
        page = st.radio(
            "Choose Analysis Mode:",
            ["Single Analysis", "Batch Analysis", "Dashboard"],
            index=0
        )

        st.markdown("---")

        # Examples
        with st.expander("📝 Example Requirements"):
            for example in DEFAULT_EXAMPLES:
                if st.button(f"Use: {example[:50]}...", key=example):
                    st.session_state.requirement_text = example
                    st.rerun()

    # Main content based on selected page
    if page == "Single Analysis":
        show_single_analysis(analyzer)
    elif page == "Batch Analysis":
        show_batch_analysis(analyzer)
    else:  # Dashboard
        show_dashboard(analyzer)


def show_single_analysis(analyzer: RequirementsAnalyzer):
    """Single requirement analysis page."""

    st.header("📄 Single Requirement Analysis")

    # Initialize session state for text input
    if 'requirement_text' not in st.session_state:
        st.session_state.requirement_text = ""

    # Input section
    col1, col2 = st.columns([3, 1])

    with col1:
        # Text input
        requirement_text = st.text_area(
            "Enter your requirement or test case:",
            value=st.session_state.requirement_text,
            height=100,
            placeholder="Example: The system should load fast and handle errors properly",
            key="main_text_area"
        )

        # Update session state when text changes
        if requirement_text != st.session_state.requirement_text:
            st.session_state.requirement_text = requirement_text

    with col2:
        st.markdown("**Quick Examples:**")
        for i, example in enumerate(DEFAULT_EXAMPLES[:3]):
            if st.button(f"Ex {i+1}", key=f"quick_{i}"):
                st.session_state.requirement_text = example
                st.rerun()

    # Debug info (remove in production)
    if st.checkbox("Show debug info", key="debug_checkbox"):
        st.write(f"Current text: '{requirement_text}'")
        st.write(f"Text length: {len(requirement_text.strip())}")
        st.write(f"API Status: {analyzer.health_check()}")

    # Analysis button
    if st.button("🔍 Analyze", type="primary", use_container_width=True):
        text_to_analyze = requirement_text.strip()

        # Debug logging
        st.write(f"Debug: Analyzing text: '{text_to_analyze[:50]}...'")
        st.write(f"Debug: Text length: {len(text_to_analyze)}")

        if not text_to_analyze:
            st.error("Please enter some text to analyze.")
            st.error("Debug: Text appears to be empty after stripping.")
            return

        with st.spinner("Analyzing requirement..."):
            result = analyzer.analyze_text(text_to_analyze)

        if result:
            st.success("Analysis completed successfully!")
            display_analysis_result(text_to_analyze, result)
        else:
            st.error("Analysis failed. Please check the API connection and try again.")
            st.info("Make sure the FastAPI server is running on http://localhost:8000")


def show_batch_analysis(analyzer: RequirementsAnalyzer):
    """Batch analysis page."""

    st.header("📊 Batch Analysis")

    st.markdown("Analyze multiple requirements at once for efficient quality assessment.")

    # Input method
    input_method = st.radio(
        "Choose input method:",
        ["Manual Entry", "CSV Upload", "Sample Data"],
        horizontal=True
    )

    requirements = []

    if input_method == "Manual Entry":
        # Multi-line text input
        batch_text = st.text_area(
            "Enter requirements (one per line):",
            height=200,
            placeholder="Enter each requirement on a new line...\n\nExample:\nThe system should load fast\nUser logs in with valid credentials\nClick submit button"
        )

        if batch_text.strip():
            requirements = [line.strip() for line in batch_text.split('\n') if line.strip()]

    elif input_method == "CSV Upload":
        # File upload
        uploaded_file = st.file_uploader(
            "Upload CSV file with requirements",
            type=['csv'],
            help="CSV should have a 'text' column containing requirements"
        )

        if uploaded_file:
            try:
                df = pd.read_csv(uploaded_file)
                if 'text' in df.columns:
                    requirements = df['text'].dropna().tolist()
                    st.success(f"Loaded {len(requirements)} requirements from CSV")
                else:
                    st.error("CSV must contain a 'text' column")
            except Exception as e:
                st.error(f"Error reading CSV: {e}")

    else:  # Sample Data
        try:
            df = pd.read_csv("../data/sample_requirements.csv")
            requirements = df['text'].tolist()[:10]  # First 10 samples
            st.info(f"Using {len(requirements)} sample requirements")
        except:
            requirements = DEFAULT_EXAMPLES
            st.info(f"Using {len(requirements)} default examples")

    # Show requirements preview
    if requirements:
        with st.expander(f"📋 Requirements to Analyze ({len(requirements)})"):
            for i, req in enumerate(requirements, 1):
                st.write(f"{i}. {req}")

    # Analyze button
    if st.button("🔍 Analyze Batch", type="primary", use_container_width=True):
        if not requirements:
            st.error("No requirements to analyze.")
            return

        with st.spinner(f"Analyzing {len(requirements)} requirements..."):
            results = analyzer.analyze_batch(requirements)

        if results:
            display_batch_results(requirements, results)


def show_dashboard(analyzer: RequirementsAnalyzer):
    """Dashboard with analytics and insights."""

    st.header("📈 Quality Dashboard")

    st.markdown("Analyze trends and quality metrics across your requirements.")

    # Load sample data for demo
    try:
        df = pd.read_csv("../data/sample_requirements.csv")
        sample_texts = df['text'].tolist()

        with st.spinner("Analyzing sample requirements..."):
            results = analyzer.analyze_batch(sample_texts[:20])  # Analyze first 20

        if results:
            display_dashboard_metrics(results)

    except Exception as e:
        st.error(f"Could not load sample data: {e}")
        st.info("Make sure the sample_requirements.csv file exists in the data directory")


def display_analysis_result(text: str, result: Dict[str, Any]):
    """Display detailed analysis result."""

    # Overview metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Ambiguity Score", f"{result['ambiguity_score']:.1f}")

    with col2:
        st.metric("Assumption Score", f"{result['assumption_score']:.1f}")

    with col3:
        st.metric("Readiness Score", f"{result['readiness_score']:.1f}")

    with col4:
        readiness_class = result['readiness_level']
        if readiness_class == "Ready":
            st.markdown(f'<div class="ready-badge">{readiness_class}</div>', unsafe_allow_html=True)
        elif readiness_class == "Needs clarification":
            st.markdown(f'<div class="needs-clarification-badge">{readiness_class}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="high-risk-badge">{readiness_class}</div>', unsafe_allow_html=True)

    # Visual representation
    st.markdown("### 📊 Score Visualization")
    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=['Ambiguity', 'Assumptions', 'Readiness'],
        y=[result['ambiguity_score'], result['assumption_score'], result['readiness_score']],
        marker_color=['#ff6b6b', '#4ecdc4', '#45b7d1']
    ))

    fig.update_layout(
        title="Quality Scores",
        yaxis_title="Score (0-100)",
        yaxis_range=[0, 100],
        height=300
    )

    st.plotly_chart(fig, use_container_width=True)

    # Issues breakdown
    if result['issues']:
        st.markdown("### ⚠️ Detected Issues")

        # Group issues by type
        issue_types = {}
        for issue in result['issues']:
            issue_type = issue.get('type', 'Unknown')
            if issue_type not in issue_types:
                issue_types[issue_type] = []
            issue_types[issue_type].append(issue)

        for issue_type, issues in issue_types.items():
            with st.expander(f"{issue_type} ({len(issues)})", expanded=True):
                for issue in issues:
                    st.markdown(f"**Text:** {issue.get('text', 'N/A')}")
                    st.markdown(f"**Message:** {issue.get('message', 'N/A')}")
                    if 'assumption' in issue:
                        st.markdown(f"**Assumption:** {issue['assumption']}")
                    st.markdown("---")

    # Suggestions
    if result['suggestions']:
        st.markdown("### 💡 Clarification Questions")
        for i, suggestion in enumerate(result['suggestions'], 1):
            st.markdown(f"{i}. {suggestion}")

    # Original text
    with st.expander("📝 Original Text"):
        st.write(text)


def display_batch_results(texts: List[str], results: List[Dict[str, Any]]):
    """Display batch analysis results."""

    # Summary statistics
    valid_results = [r for r in results if isinstance(r, dict) and 'readiness_score' in r]

    if not valid_results:
        st.error("No valid results to display")
        return

    st.markdown("### 📊 Batch Analysis Summary")

    # Summary metrics
    col1, col2, col3, col4 = st.columns(4)

    avg_ambiguity = sum(r['ambiguity_score'] for r in valid_results) / len(valid_results)
    avg_assumption = sum(r['assumption_score'] for r in valid_results) / len(valid_results)
    avg_readiness = sum(r['readiness_score'] for r in valid_results) / len(valid_results)

    readiness_counts = {}
    for r in valid_results:
        level = r.get('readiness_level', 'Unknown')
        readiness_counts[level] = readiness_counts.get(level, 0) + 1

    with col1:
        st.metric("Average Ambiguity", f"{avg_ambiguity:.1f}")

    with col2:
        st.metric("Average Assumptions", f"{avg_assumption:.1f}")

    with col3:
        st.metric("Average Readiness", f"{avg_readiness:.1f}")

    with col4:
        most_common = max(readiness_counts, key=readiness_counts.get)
        st.metric("Most Common Status", most_common)

    # Readiness distribution
    st.markdown("### 🎯 Readiness Distribution")
    labels = list(readiness_counts.keys())
    values = list(readiness_counts.values())

    fig = px.pie(
        values=values,
        names=labels,
        title="Requirements Readiness Distribution",
        color_discrete_sequence=['#28a745', '#ffc107', '#dc3545']
    )
    st.plotly_chart(fig, use_container_width=True)

    # Detailed results table
    st.markdown("### 📋 Detailed Results")

    table_data = []
    for i, (text, result) in enumerate(zip(texts, results)):
        if isinstance(result, dict):
            table_data.append({
                'ID': i + 1,
                'Text': text[:50] + '...' if len(text) > 50 else text,
                'Ambiguity': f"{result.get('ambiguity_score', 0):.1f}",
                'Assumptions': f"{result.get('assumption_score', 0):.1f}",
                'Readiness': f"{result.get('readiness_score', 0):.1f}",
                'Status': result.get('readiness_level', 'Error'),
                'Issues': len(result.get('issues', []))
            })
        else:
            table_data.append({
                'ID': i + 1,
                'Text': text[:50] + '...' if len(text) > 50 else text,
                'Ambiguity': 'Error',
                'Assumptions': 'Error',
                'Readiness': 'Error',
                'Status': 'Error',
                'Issues': 0
            })

    df = pd.DataFrame(table_data)
    st.dataframe(df, use_container_width=True)

    # Export option
    if st.button("📥 Export Results to CSV"):
        csv_data = df.to_csv(index=False)
        st.download_button(
            label="Download CSV",
            data=csv_data,
            file_name="requirements_analysis_results.csv",
            mime="text/csv",
            key="download_csv"
        )


def display_dashboard_metrics(results: List[Dict[str, Any]]):
    """Display dashboard metrics and charts."""

    valid_results = [r for r in results if isinstance(r, dict) and 'readiness_score' in r]

    if not valid_results:
        st.error("No valid results for dashboard")
        return

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)

    total_reqs = len(valid_results)
    ready_count = sum(1 for r in valid_results if r.get('readiness_level') == 'Ready')
    clarification_count = sum(1 for r in valid_results if r.get('readiness_level') == 'Needs clarification')
    high_risk_count = sum(1 for r in valid_results if r.get('readiness_level') == 'High risk for automation')

    with col1:
        st.metric("Total Requirements", total_reqs)

    with col2:
        ready_pct = (ready_count / total_reqs) * 100
        st.metric("Ready for Automation", f"{ready_pct:.1f}%")

    with col3:
        clarification_pct = (clarification_count / total_reqs) * 100
        st.metric("Needs Clarification", f"{clarification_pct:.1f}%")

    with col4:
        high_risk_pct = (high_risk_count / total_reqs) * 100
        st.metric("High Risk", f"{high_risk_pct:.1f}%")

    # Score distributions
    st.markdown("### 📈 Score Distributions")

    col1, col2 = st.columns(2)

    with col1:
        ambiguity_scores = [r['ambiguity_score'] for r in valid_results]
        fig1 = px.histogram(
            ambiguity_scores,
            title="Ambiguity Score Distribution",
            labels={'value': 'Ambiguity Score'},
            color_discrete_sequence=['#ff6b6b']
        )
        st.plotly_chart(fig1, use_container_width=True)

    with col2:
        readiness_scores = [r['readiness_score'] for r in valid_results]
        fig2 = px.histogram(
            readiness_scores,
            title="Readiness Score Distribution",
            labels={'value': 'Readiness Score'},
            color_discrete_sequence=['#45b7d1']
        )
        st.plotly_chart(fig2, use_container_width=True)

    # Top issues
    st.markdown("### ⚠️ Most Common Issues")

    issue_counts = {}
    for result in valid_results:
        for issue in result.get('issues', []):
            issue_type = issue.get('type', 'Unknown')
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1

    if issue_counts:
        top_issues = sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        fig3 = px.bar(
            x=[item[0] for item in top_issues],
            y=[item[1] for item in top_issues],
            title="Most Common Issue Types",
            labels={'x': 'Issue Type', 'y': 'Count'},
            color_discrete_sequence=['#ffa726']
        )
        fig3.update_xaxes(tickangle=45)
        st.plotly_chart(fig3, use_container_width=True)
    else:
        st.info("No issues detected in the analyzed requirements!")


if __name__ == "__main__":
    main()