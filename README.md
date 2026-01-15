# AI Requirements Ambiguity & Assumptions Detector 🚀

An NLP-powered quality gate designed to analyze software requirements and test cases. This tool identifies subjective language, weak modalities, and hidden assumptions to prevent flaky test automation and engineering rework.

---

## 🎯 Project Overview

This repository provides a production-ready solution for **Requirements Engineering Quality (REQ)**. By leveraging `spaCy` and custom rule-based logic, it quantifies the readiness of a requirement before it reaches the development or automation phase.

### Key Capabilities
* **Ambiguity Detection**: Flags subjective terms (e.g., "fast", "user-friendly") and undefined references (e.g., "it", "this").
* **Assumption Inference**: Detects implicit dependencies on environment, data, or state.
* **Quantified Readiness**: Generates a 0–100 score to categorize requirements as *Ready*, *Needs Clarification*, or *High Risk*.
* **Actionable Feedback**: Provides specific clarification questions for stakeholders.

---

## 🏗️ Architecture & Implementation

The project is modularized to ensure separation of concerns, reflecting a "clean code" approach:

* **`core/`**: The engine of the application, containing the scoring logic, assumption inference, and suggestion generators.
* **`nlp/`**: Pre-processing pipelines and pattern definitions using `spaCy`.
* **`frontend/`**: Diverse UI implementations, including **Streamlit** (recommended), and a **FastAPI** backend.
* **`data/`**: Centralized JSON-based configuration for detection keywords and patterns, allowing for easy domain adaptation.

---

## 🛠️ Tech Stack

* **Language**: Python 3.10+
* **NLP**: `spaCy` (Rule-based matching and POS tagging)
* **Backend**: `FastAPI` / `Uvicorn`
* **Frontend**: `Streamlit`, `Flask`
* **Version Control**: `Git`

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10 or higher
* `pip` package manager

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/Prathamesh-Udoshi/ai-req-assumptions-analyzer.git](https://github.com/Prathamesh-Udoshi/ai-req-assumptions-analyzer.git)
    cd req_quality_ai
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Download the NLP model**:
    ```bash
    python -m spacy download en_core_web_sm
    ```

### Running the Application

To start the **FastAPI** backend:
```bash
python app.py
```


### 🚀 Launching the Streamlit Dashboard

To start the interactive web interface, run the following command in your terminal:

```bash
streamlit run frontend/streamlit_app.py
```

###   Why Rule-Based NLP?

Unlike "black-box" machine learning models, this tool uses a transparent rule-based NLP approach. This ensures that every flag and score is explainable, which is critical for enterprise quality gates where developers and stakeholders need to know exactly why a requirement was flagged for clarification.