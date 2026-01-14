"""
Scoring Module

This module provides scoring logic for requirements quality assessment.
Calculates ambiguity score, assumption score, and overall readiness score.
"""

from typing import Dict, Any, List, Tuple
from enum import Enum

from .ambiguity_detector import AmbiguityDetector, AmbiguityIssue
from .assumption_detector import AssumptionDetector, AssumptionIssue


class ReadinessLevel(Enum):
    """Classification levels for requirement readiness."""
    READY = "Ready"
    NEEDS_CLARIFICATION = "Needs clarification"
    HIGH_RISK = "High risk for automation"


class RequirementScorer:
    """
    Calculates quality scores for requirements and test cases.

    Provides three key metrics:
    - ambiguity_score: How ambiguous the text is (0-100)
    - assumption_score: How many hidden assumptions exist (0-100)
    - readiness_score: Overall readiness for automation (0-100)
    """

    def __init__(self):
        """Initialize the scorer with detector instances."""
        self.ambiguity_detector = AmbiguityDetector()
        self.assumption_detector = AssumptionDetector()

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Perform complete analysis of requirement text.

        Args:
            text: Input requirement or test case text

        Returns:
            Dictionary containing all scores, issues, and suggestions
        """
        # Detect issues
        ambiguity_issues = self.ambiguity_detector.detect_ambiguities(text)
        assumption_issues = self.assumption_detector.detect_assumptions(text)

        # Calculate scores
        ambiguity_score = self.ambiguity_detector.calculate_ambiguity_score(ambiguity_issues, text)
        assumption_score = self.assumption_detector.calculate_assumption_score(assumption_issues, text)
        readiness_score = self.calculate_readiness_score(ambiguity_score, assumption_score)

        # Get readiness classification
        readiness_level = self.classify_readiness(readiness_score)

        # Convert issues to serializable format
        issues = self._format_issues(ambiguity_issues + assumption_issues)

        return {
            "ambiguity_score": round(ambiguity_score, 1),
            "assumption_score": round(assumption_score, 1),
            "readiness_score": round(readiness_score, 1),
            "readiness_level": readiness_level.value,
            "issues": issues,
            "total_issues": len(issues)
        }

    def calculate_readiness_score(self, ambiguity_score: float, assumption_score: float) -> float:
        """
        Calculate overall readiness score.

        Formula: readiness = 100 - (ambiguity_score * 0.5 + assumption_score * 0.5)

        Args:
            ambiguity_score: Score from ambiguity detection (0-100)
            assumption_score: Score from assumption detection (0-100)

        Returns:
            Readiness score from 0-100 (higher = more ready)
        """
        # Weight both factors equally
        weighted_score = (ambiguity_score * 0.5) + (assumption_score * 0.5)
        readiness_score = 100 - weighted_score

        # Ensure score is within bounds
        return max(0.0, min(100.0, readiness_score))

    def classify_readiness(self, readiness_score: float) -> ReadinessLevel:
        """
        Classify readiness level based on score.

        Args:
            readiness_score: Calculated readiness score (0-100)

        Returns:
            ReadinessLevel enum value
        """
        if readiness_score >= 70:
            return ReadinessLevel.READY
        elif readiness_score >= 40:
            return ReadinessLevel.NEEDS_CLARIFICATION
        else:
            return ReadinessLevel.HIGH_RISK

    def _format_issues(self, issues: List) -> List[Dict[str, Any]]:
        """
        Convert issue objects to serializable dictionaries.

        Args:
            issues: List of AmbiguityIssue and AssumptionIssue objects

        Returns:
            List of dictionaries with issue details
        """
        formatted_issues = []

        for issue in issues:
            if hasattr(issue, 'category'):  # AssumptionIssue
                formatted_issues.append({
                    "type": issue.type,
                    "category": issue.category,
                    "text": issue.text,
                    "message": issue.message,
                    "assumption": issue.assumption
                })
            else:  # AmbiguityIssue
                formatted_issues.append({
                    "type": issue.type,
                    "text": issue.text,
                    "message": issue.message,
                    "start_char": issue.start_char,
                    "end_char": issue.end_char
                })

        return formatted_issues

    def get_score_breakdown(self, text: str) -> Dict[str, Any]:
        """
        Get detailed score breakdown for debugging/analysis.

        Args:
            text: Input requirement or test case text

        Returns:
            Detailed breakdown of scoring components
        """
        ambiguity_issues = self.ambiguity_detector.detect_ambiguities(text)
        assumption_issues = self.assumption_detector.detect_assumptions(text)

        ambiguity_score = self.ambiguity_detector.calculate_ambiguity_score(ambiguity_issues)
        assumption_score = self.assumption_detector.calculate_assumption_score(assumption_issues)
        readiness_score = self.calculate_readiness_score(ambiguity_score, assumption_score)

        return {
            "text": text,
            "ambiguity": {
                "score": round(ambiguity_score, 1),
                "issue_count": len(ambiguity_issues),
                "issues": [issue.type for issue in ambiguity_issues]
            },
            "assumptions": {
                "score": round(assumption_score, 1),
                "issue_count": len(assumption_issues),
                "categories": list(set(issue.category for issue in assumption_issues if hasattr(issue, 'category')))
            },
            "readiness": {
                "score": round(readiness_score, 1),
                "level": self.classify_readiness(readiness_score).value,
                "formula": f"100 - ({ambiguity_score:.1f} * 0.5 + {assumption_score:.1f} * 0.5)"
            }
        }