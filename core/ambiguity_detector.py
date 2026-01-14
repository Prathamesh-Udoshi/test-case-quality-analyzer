"""
Ambiguity Detection Module

This module provides rule-based detection of ambiguity in requirements and test cases.
Uses spaCy for tokenization, POS tagging, and dependency parsing to identify:
- Subjective/vague terms
- Weak modality terms
- Undefined references
- Non-testable statements
"""

import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

import spacy
from spacy.tokens import Doc


@dataclass
class AmbiguityIssue:
    """Represents a detected ambiguity issue."""
    type: str
    text: str
    message: str
    start_char: int = None
    end_char: int = None


class AmbiguityDetector:
    """
    Detects various types of ambiguity in requirement text using rule-based NLP.

    This detector identifies:
    - Subjective terms (fast, secure, scalable, etc.)
    - Weak modality (should, could, might, etc.)
    - Undefined references (it, this, that without clear antecedent)
    - Non-testable statements (handle properly, work correctly)
    """

    def __init__(self, nlp_model: str = "en_core_web_sm"):
        """
        Initialize the ambiguity detector.

        Args:
            nlp_model: spaCy language model to use (default: en_core_web_sm)
        """
        try:
            self.nlp = spacy.load(nlp_model)
        except OSError:
            # Fallback to blank model if en_core_web_sm not available
            self.nlp = spacy.blank("en")

        # Define ambiguity patterns
        self.subjective_terms = {
            "fast", "slow", "quick", "rapid", "secure", "safe", "scalable",
            "optimal", "efficient", "user-friendly", "intuitive", "robust",
            "reliable", "stable", "flexible", "portable", "compatible",
            "accessible", "responsive", "smooth", "seamless", "clean",
            "proper", "correct", "appropriate", "adequate", "sufficient"
        }

        self.weak_modality_terms = {
            "should", "could", "might", "may", "can", "if possible",
            "as needed", "when necessary", "ideally", "preferably"
        }

        self.undefined_references = {
            "it", "this", "that", "these", "those", "the system",
            "the component", "the application", "the user"
        }

        self.non_testable_patterns = [
            r"handle.*properly",
            r"work.*correctly",
            r"function.*properly",
            r"behave.*correctly",
            r"perform.*properly",
            r"process.*correctly"
        ]

    def detect_ambiguities(self, text: str) -> List[AmbiguityIssue]:
        """
        Detect all types of ambiguity in the given text.

        Args:
            text: Input requirement or test case text

        Returns:
            List of AmbiguityIssue objects with detected problems
        """
        issues = []

        # Process text with spaCy
        doc = self.nlp(text.lower())

        # Detect subjective terms
        issues.extend(self._detect_subjective_terms(doc, text))

        # Detect weak modality
        issues.extend(self._detect_weak_modality(doc, text))

        # Detect undefined references
        issues.extend(self._detect_undefined_references(doc, text))

        # Detect non-testable statements
        issues.extend(self._detect_non_testable_statements(text))

        return issues

    def _detect_subjective_terms(self, doc: Doc, original_text: str) -> List[AmbiguityIssue]:
        """Detect subjective/vague terms in the text."""
        issues = []

        for token in doc:
            if token.text in self.subjective_terms:
                start_char = self._find_char_position(original_text, token.text, token.idx)
                end_char = start_char + len(token.text) if start_char is not None else None

                issues.append(AmbiguityIssue(
                    type="Subjective term",
                    text=token.text,
                    message=f"Subjective performance/behavior term: '{token.text}'",
                    start_char=start_char,
                    end_char=end_char
                ))

        return issues

    def _detect_weak_modality(self, doc: Doc, original_text: str) -> List[AmbiguityIssue]:
        """Detect weak modality terms that indicate optionality."""
        issues = []

        for token in doc:
            if token.text in self.weak_modality_terms:
                start_char = self._find_char_position(original_text, token.text, token.idx)
                end_char = start_char + len(token.text) if start_char is not None else None

                issues.append(AmbiguityIssue(
                    type="Weak modality",
                    text=token.text,
                    message=f"Optional/weak requirement term: '{token.text}'",
                    start_char=start_char,
                    end_char=end_char
                ))

        return issues

    def _detect_undefined_references(self, doc: Doc, original_text: str) -> List[AmbiguityIssue]:
        """Detect pronouns and references without clear antecedents."""
        issues = []

        for token in doc:
            if token.text in self.undefined_references:
                # Check if this is likely an undefined reference
                # Simple heuristic: if it's a pronoun or demonstrative without clear context
                if self._is_undefined_reference(token, doc):
                    start_char = self._find_char_position(original_text, token.text, token.idx)
                    end_char = start_char + len(token.text) if start_char is not None else None

                    issues.append(AmbiguityIssue(
                        type="Undefined reference",
                        text=token.text,
                        message=f"Potentially undefined reference: '{token.text}'",
                        start_char=start_char,
                        end_char=end_char
                    ))

        return issues

    def _detect_non_testable_statements(self, text: str) -> List[AmbiguityIssue]:
        """Detect statements that are too vague to be testable."""
        issues = []

        text_lower = text.lower()
        for pattern in self.non_testable_patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                issues.append(AmbiguityIssue(
                    type="Non-testable statement",
                    text=match.group(),
                    message=f"Non-testable requirement: '{match.group()}'",
                    start_char=match.start(),
                    end_char=match.end()
                ))

        return issues

    def _is_undefined_reference(self, token, doc: Doc) -> bool:
        """
        Determine if a token is likely an undefined reference.

        This is a simple heuristic - in production, this could be enhanced
        with more sophisticated coreference resolution.
        """
        # Simple heuristics for undefined references
        if token.pos_ == "PRON" or token.dep_ in ["det", "poss"]:
            # Check if there's a clear antecedent in nearby context
            # This is a simplified approach - real coreference resolution is complex
            return True

        return False

    def _find_char_position(self, original_text: str, token_text: str, token_idx: int) -> int:
        """
        Find the character position of a token in the original text.

        This is a simplified approach. In production, spaCy's character offsets
        should be used if available.
        """
        try:
            # Simple approach: find the token in the original text
            # This may not be perfect for complex texts
            return original_text.lower().find(token_text, token_idx)
        except:
            return None

    def calculate_ambiguity_score(self, issues: List[AmbiguityIssue], text: str = "") -> float:
        """
        Calculate ambiguity score based on detected issues.

        Uses a sophisticated scoring algorithm that considers:
        - Issue severity and type
        - Issue density (issues per word)
        - Text complexity
        - Multiple instances of same issue type

        Args:
            issues: List of detected ambiguity issues
            text: Original text (optional, for density calculation)

        Returns:
            Score from 0-100 (higher = more ambiguous)
        """
        if not issues:
            return 0.0

        # Base weights for different ambiguity types
        base_weights = {
            "Subjective term": 8,      # Less severe individually
            "Weak modality": 12,       # Moderate severity
            "Undefined reference": 15, # More severe
            "Non-testable statement": 20  # Most severe
        }

        # Count issues by type to handle multiples
        issue_counts = {}
        for issue in issues:
            issue_type = issue.type
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1

        # Calculate base score from issue types
        base_score = 0
        for issue_type, count in issue_counts.items():
            weight = base_weights.get(issue_type, 6)
            # Diminishing returns for multiple instances of same type
            if count == 1:
                base_score += weight
            elif count == 2:
                base_score += weight * 1.5  # 50% bonus for second instance
            elif count <= 4:
                base_score += weight * 1.8  # 80% bonus for 3-4 instances
            else:
                base_score += weight * 2.0  # 100% bonus for 5+ instances

        # Factor in text length and density
        text_length = len(text.split()) if text else 50  # Default to 50 words if not provided

        # Density factor: more issues per word = higher score
        density_factor = len(issues) / max(text_length, 10)  # At least 10 words

        # Complexity factor based on text length
        if text_length < 20:
            complexity_factor = 1.2  # Short texts are more critical
        elif text_length < 50:
            complexity_factor = 1.0  # Normal texts
        else:
            complexity_factor = 0.8  # Long texts can be more forgiving

        # Calculate final score
        density_score = min(40, density_factor * 100)  # Cap density contribution at 40 points
        final_score = (base_score * complexity_factor) + density_score

        # Apply sigmoid-like normalization to prevent extreme scores
        # This gives a nice curve where scores cluster around meaningful ranges
        if final_score < 20:
            final_score *= 0.8  # Reduce low scores slightly
        elif final_score > 80:
            final_score = 80 + (final_score - 80) * 0.3  # Dampen very high scores

        return max(0.0, min(100.0, final_score))