"""
Intelligent Test Case Quality Analyzer API

FastAPI application providing test case quality analysis.
Analyzes test cases and requirements to detect ambiguity
and hidden assumptions before test automation.
"""

import logging
import json
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.scorer import RequirementScorer
from core.suggestions import SuggestionGenerator
from nlp.preprocess import TextPreprocessor
from core.interrogator import AssumptionBuster
from core.optimizer import TestCaseOptimizer
from core.config import settings


# ---------------------------
# Logging
# ---------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# ---------------------------
# FastAPI App
# ---------------------------

app = FastAPI(
    title="Intelligent Test Case Quality Analyzer",
    description="Detects ambiguity and hidden assumptions in test cases and requirements",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# ---------------------------
# CORS
# ---------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# Core Components
# ---------------------------

scorer = RequirementScorer()
suggestion_generator = SuggestionGenerator()
text_preprocessor = TextPreprocessor()


# ---------------------------
# Request Models
# ---------------------------

class AnalyzeRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Test case or requirement text to analyze"
    )


class RequirementInput(BaseModel):
    text: str
    issues: List[Dict[str, Any]] = []


class OptimizeRequest(BaseModel):
    text: str
    issues: List[Dict[str, Any]] = []


# ---------------------------
# Response Models
# ---------------------------

class ComponentScore(BaseModel):
    score: float
    components: Dict[str, Any]


class AmbiguityAnalysis(BaseModel):
    score: float
    confidence: str
    components: Dict[str, Any]


class AssumptionAnalysis(BaseModel):
    score: float
    components: Dict[str, Any]


class ImpactIssue(BaseModel):
    type: str
    message: str
    impact: str
    category: str | None = None
    assumption: str | None = None


class AnalyzeResponse(BaseModel):
    ambiguity: AmbiguityAnalysis
    assumptions: AssumptionAnalysis
    readiness_score: float
    readiness_level: str
    issues: List[ImpactIssue]
    clarifying_questions: List[str]


# ---------------------------
# Routes
# ---------------------------

@app.get("/")
async def root():
    return {
        "message": "Intelligent Test Case Quality Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "components": {
            "scorer": "available",
            "nlp": "available"
        }
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_test_case(request: AnalyzeRequest):

    try:

        text = request.text.strip()

        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        logger.info(f"Analyzing: {text[:100]}")

        analysis_result = scorer.analyze_text(text)

        clarifying_questions = scorer._generate_clarifying_questions(
            analysis_result.get("issues", []),
            text
        )

        analysis_result["clarifying_questions"] = clarifying_questions

        return AnalyzeResponse(**analysis_result)

    except Exception as e:

        logger.error(str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/analyze/batch")
async def analyze_batch(request: Dict[str, Any]):

    texts = request.get("texts", [])

    if not texts:
        raise HTTPException(400, "No texts provided")

    results = []

    for text in texts:

        try:

            analysis = scorer.analyze_text(text)

            clarifying_questions = scorer._generate_clarifying_questions(
                analysis.get("issues", []),
                text
            )

            analysis["clarifying_questions"] = clarifying_questions

            results.append(analysis)

        except Exception as e:

            results.append({"error": str(e)})

    return {
        "results": results,
        "total": len(results)
    }


@app.post("/analyze/interrogate")
async def interrogate(requirement: RequirementInput):

    try:

        buster = AssumptionBuster(
            api_key=settings.OPENAI_API_KEY
        )

        questions = buster.interrogate_requirement(
            requirement.text,
            requirement.issues
        )

        return {
            "requirement": requirement.text,
            "questions": questions
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/analyze/interrogate/stream")
async def interrogate_stream(requirement: RequirementInput):

    async def event_generator():

        try:

            buster = AssumptionBuster(
                api_key=settings.OPENAI_API_KEY
            )

            for token in buster.interrogate_stream(
                requirement.text,
                requirement.issues
            ):

                yield f"data: {json.dumps({'token': token})}\n\n"

        except Exception as e:

            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/analyze/optimize")
async def optimize_test_case(request: OptimizeRequest):

    try:

        optimizer = TestCaseOptimizer(
            api_key=settings.OPENAI_API_KEY
        )

        optimized = optimizer.optimize_test_case(
            request.text,
            request.issues
        )

        return {
            "original": request.text,
            "optimized": optimized
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/analyze/optimize/stream")
async def optimize_stream(request: OptimizeRequest):

    async def event_generator():

        try:

            optimizer = TestCaseOptimizer(
                api_key=settings.OPENAI_API_KEY
            )

            for token in optimizer.optimize_stream(
                request.text,
                request.issues
            ):

                yield f"data: {json.dumps({'token': token})}\n\n"

        except Exception as e:

            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ---------------------------
# Middleware
# ---------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):

    logger.info(f"{request.method} {request.url}")

    response = await call_next(request)

    logger.info(f"Response: {response.status_code}")

    return response


# ---------------------------
# Run Server
# ---------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )