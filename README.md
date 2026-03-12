# ReqQuality AI 🚀

An intelligent, AI-powered quality gate designed to analyze test cases and requirements. This tool identifies ambiguous language, hidden assumptions, and automation risks before they become costly bugs or flaky tests.

---

## 🎯 Project Overview

ReqQuality AI is a professional solution for **Test Case Quality Assurance**. By leveraging a hybrid approach of rule-based NLP and LLM intelligence, it quantifies the automation-readiness of requirements and provides actionable paths to optimization.

### Key Capabilities
*   **🔍 Multi-Signal Analysis**: Detects vague terminology, untestable statements, and reference uncertainty with confidence scoring.
*   **🛡️ Hidden Assumption Finder**: Surfaces implicit dependencies across environment, data, and system state that often lead to "works on my machine" failures.
*   **📈 Automation Readiness Mean**: Provides a quantified readiness score (0-100) with classification (Ready, Needs Clarification, High Risk).
*   **🤖 AI Deep Interrogation**: An LLM-powered module that hunts for "Ghost Logic" and generates interrogation questions for stakeholders.
*   **✨ Test Case Optimizer**: Automatically transforms loosely written test cases into structured, deterministic, and automation-ready steps.
*   **📦 Batch Processing**: Upload CSVs or bulk-paste requirements to analyze entire test suites in seconds.
*   **📊 Quality Dashboard**: Aggregated metrics and visualizations to track requirement quality health across the baseline dataset.

---

## 🏗️ Architecture & Implementation

The project is built with a decoupled architecture for maximum scalability and performance:

*   **`frontend/`**: A premium **Next.js 14** application featuring a professional dark zinc aesthetic, Framer Motion animations, and real-time SSE streaming.
*   **`app.py`**: A high-performance **FastAPI** backend that orchestrates NLP pipelines and AI agent requests.
*   **`core/`**: The intelligence engine featuring context-aware rules, assumption strength classification, and LLM-driven optimization logic.
*   **`nlp/`**: NLP pre-processing pipelines utilizing `spaCy` for POS tagging and dependency parsing.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, Tailwind CSS v4, Framer Motion, Lucide React, Recharts.
*   **Backend**: Python 3.10+, FastAPI, Uvicorn.
*   **NLP & AI**: `spaCy`, `OpenAI GPT-4o` (for Deep Interrogation & Optimization).
*   **Styling**: Professional Dark Zinc/Indigo theme with custom animation utilities.

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.10 or higher
*   Node.js 18 or higher
*   OpenAI API Key (Set in `.env`)

### Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Prathamesh-Udoshi/ai-req-assumptions-analyzer.git
    cd req_quality_ai
    ```

2.  **Backend Setup**:
    ```bash
    # Create virtual environment
    python -m venv .venv
    .venv/Scripts/Activate.ps1 # Windows
    
    # Install dependencies
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start Backend** (Port 8001):
    ```bash
    # From root directory
    python app.py
    ```

2.  **Start Frontend** (Port 3000):
    ```bash
    # From frontend directory
    npm run dev
    ```

3.  **Navigate to**:
    *   `http://localhost:3000/` — **Landing Page** (Overview & Discovery)
    *   `http://localhost:3000/analyze` — **Single Analysis** (Deep-dive tool)
    *   `http://localhost:3000/batch` — **High-volume Processing**
    *   `http://localhost:3000/dashboard` — **Analytics & Monitoring**

---