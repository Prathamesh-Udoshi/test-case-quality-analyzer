"""
Comprehensive unit tests for core requirement analysis functionality.

Tests cover:
- Ambiguity detection
- Assumption detection
- Scoring logic
- Suggestion generation
- Text preprocessing
"""

import unittest
from unittest.mock import Mock, patch
import json
import csv
from io import StringIO

from core.ambiguity_detector import AmbiguityDetector, AmbiguityIssue
from core.assumption_detector import AssumptionDetector, AssumptionIssue
from core.scorer import RequirementScorer, ReadinessLevel
from core.suggestions import SuggestionGenerator
from nlp.preprocess import TextPreprocessor
from nlp.patterns import validate_patterns


class TestAmbiguityDetector(unittest.TestCase):
    """Test cases for ambiguity detection functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.detector = AmbiguityDetector()

    def test_detect_subjective_terms(self):
        """Test detection of subjective/vague terms."""
        text = "The system should load fast and be user-friendly"
        issues = self.detector.detect_ambiguities(text)

        # Should detect "fast" and "user-friendly"
        subjective_issues = [i for i in issues if i.type == "Subjective term"]
        self.assertGreater(len(subjective_issues), 0)

        # Check that "fast" is detected
        fast_detected = any("fast" in issue.text for issue in subjective_issues)
        self.assertTrue(fast_detected)

    def test_detect_weak_modality(self):
        """Test detection of weak modality terms."""
        text = "The system should work correctly if possible"
        issues = self.detector.detect_ambiguities(text)

        weak_modality_issues = [i for i in issues if i.type == "Weak modality"]
        self.assertGreater(len(weak_modality_issues), 0)

    def test_detect_undefined_references(self):
        """Test detection of undefined references."""
        text = "The system should handle it properly"
        issues = self.detector.detect_ambiguities(text)

        undefined_issues = [i for i in issues if i.type == "Undefined reference"]
        self.assertGreater(len(undefined_issues), 0)

    def test_detect_non_testable_statements(self):
        """Test detection of non-testable statements."""
        text = "The system should work correctly and handle errors properly"
        issues = self.detector.detect_ambiguities(text)

        non_testable_issues = [i for i in issues if i.type == "Non-testable statement"]
        self.assertGreater(len(non_testable_issues), 0)

    def test_calculate_ambiguity_score(self):
        """Test ambiguity score calculation."""
        # Create mock issues
        issues = [
            AmbiguityIssue("Subjective term", "fast", "Subjective term"),
            AmbiguityIssue("Weak modality", "should", "Weak modality"),
            AmbiguityIssue("Undefined reference", "it", "Undefined reference")
        ]

        score = self.detector.calculate_ambiguity_score(issues)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)

    def test_empty_text(self):
        """Test handling of empty text."""
        issues = self.detector.detect_ambiguities("")
        self.assertEqual(len(issues), 0)

        score = self.detector.calculate_ambiguity_score([])
        self.assertEqual(score, 0)


class TestAssumptionDetector(unittest.TestCase):
    """Test cases for assumption detection functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.detector = AssumptionDetector()

    def test_detect_login_assumptions(self):
        """Test detection of assumptions from login actions."""
        text = "User logs in and accesses dashboard"
        issues = self.detector.detect_assumptions(text)

        self.assertGreater(len(issues), 0)

        # Should detect user and credential assumptions
        assumption_texts = [issue.assumption for issue in issues]
        self.assertTrue(any("user exists" in text.lower() for text in assumption_texts) or
                       any("credentials" in text.lower() for text in assumption_texts))

    def test_detect_navigation_assumptions(self):
        """Test detection of assumptions from navigation actions."""
        text = "Navigate to user profile page"
        issues = self.detector.detect_assumptions(text)

        state_issues = [i for i in issues if i.category == "State"]
        self.assertGreater(len(state_issues), 0)

    def test_detect_environment_assumptions(self):
        """Test detection of environment assumptions."""
        text = "Click the submit button"
        issues = self.detector.detect_assumptions(text)

        env_issues = [i for i in issues if i.category == "Environment"]
        self.assertGreater(len(env_issues), 0)

    def test_detect_data_assumptions(self):
        """Test detection of data assumptions."""
        text = "Submit the form and save data"
        issues = self.detector.detect_assumptions(text)

        data_issues = [i for i in issues if i.category == "Data"]
        self.assertGreater(len(data_issues), 0)

    def test_calculate_assumption_score(self):
        """Test assumption score calculation."""
        issues = [
            AssumptionIssue("Action assumption", "Data", "login", "User exists", "Valid test user exists"),
            AssumptionIssue("Environment assumption", "Environment", "UI action", "Browser needed", "Browser required")
        ]

        score = self.detector.calculate_assumption_score(issues)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)


class TestRequirementScorer(unittest.TestCase):
    """Test cases for scoring functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.scorer = RequirementScorer()

    def test_calculate_readiness_score(self):
        """Test readiness score calculation."""
        ambiguity_score = 60
        assumption_score = 40
        readiness_score = self.scorer.calculate_readiness_score(ambiguity_score, assumption_score)

        expected = 100 - (60 * 0.5 + 40 * 0.5)
        self.assertEqual(readiness_score, expected)

    def test_classify_readiness_ready(self):
        """Test readiness classification for ready requirements."""
        level = self.scorer.classify_readiness(85)
        self.assertEqual(level, ReadinessLevel.READY)

    def test_classify_readiness_needs_clarification(self):
        """Test readiness classification for needs clarification."""
        level = self.scorer.classify_readiness(55)
        self.assertEqual(level, ReadinessLevel.NEEDS_CLARIFICATION)

    def test_classify_readiness_high_risk(self):
        """Test readiness classification for high risk."""
        level = self.scorer.classify_readiness(25)
        self.assertEqual(level, ReadinessLevel.HIGH_RISK)

    def test_analyze_text_integration(self):
        """Test full text analysis integration."""
        text = "The system should load fast and handle errors properly"
        result = self.scorer.analyze_text(text)

        required_keys = ["ambiguity_score", "assumption_score", "readiness_score", "issues"]
        for key in required_keys:
            self.assertIn(key, result)

        # Scores should be within valid ranges
        self.assertGreaterEqual(result["ambiguity_score"], 0)
        self.assertLessEqual(result["ambiguity_score"], 100)
        self.assertGreaterEqual(result["assumption_score"], 0)
        self.assertLessEqual(result["assumption_score"], 100)
        self.assertGreaterEqual(result["readiness_score"], 0)
        self.assertLessEqual(result["readiness_score"], 100)


class TestSuggestionGenerator(unittest.TestCase):
    """Test cases for suggestion generation functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.generator = SuggestionGenerator()

    def test_generate_subjective_suggestions(self):
        """Test suggestion generation for subjective terms."""
        issues = [AmbiguityIssue("Subjective term", "fast", "Subjective term")]
        suggestions = self.generator.generate_suggestions(issues)

        self.assertGreater(len(suggestions), 0)
        self.assertTrue(any("response time" in s.lower() or "seconds" in s.lower() for s in suggestions))

    def test_generate_assumption_suggestions(self):
        """Test suggestion generation for assumptions."""
        issues = [AssumptionIssue("Action assumption", "Data", "login", "User assumption", "Valid test user exists")]
        suggestions = self.generator.generate_suggestions(issues)

        self.assertGreater(len(suggestions), 0)
        self.assertTrue(any("user" in s.lower() or "account" in s.lower() for s in suggestions))

    def test_generate_mixed_suggestions(self):
        """Test suggestion generation for mixed issue types."""
        issues = [
            AmbiguityIssue("Subjective term", "fast", "Subjective term"),
            AssumptionIssue("Environment assumption", "Environment", "click", "Browser needed", "Browser required")
        ]
        suggestions = self.generator.generate_suggestions(issues)

        self.assertGreater(len(suggestions), 0)
        # Should have suggestions for both ambiguity and assumptions
        self.assertGreaterEqual(len(suggestions), 2)

    def test_deduplicate_suggestions(self):
        """Test that duplicate suggestions are removed."""
        issues = [
            AmbiguityIssue("Subjective term", "fast", "Subjective term"),
            AmbiguityIssue("Subjective term", "fast", "Subjective term")  # Duplicate
        ]
        suggestions = self.generator.generate_suggestions(issues)

        # Should deduplicate identical suggestions
        unique_suggestions = set(suggestions)
        self.assertEqual(len(suggestions), len(unique_suggestions))


class TestTextPreprocessor(unittest.TestCase):
    """Test cases for text preprocessing functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.processor = TextPreprocessor()

    def test_clean_text(self):
        """Test text cleaning functionality."""
        text = "  This   has    extra   spaces!  "
        cleaned = self.processor.clean_text(text)

        self.assertEqual(cleaned, "This has extra spaces!")

    def test_preprocess_text(self):
        """Test full text preprocessing."""
        text = "The system should work correctly."
        result = self.processor.preprocess_text(text)

        required_keys = ["original_text", "cleaned_text", "sentences", "tokens"]
        for key in required_keys:
            self.assertIn(key, result)

        self.assertGreater(len(result["tokens"]), 0)
        self.assertGreater(len(result["sentences"]), 0)

    def test_extract_sentences(self):
        """Test sentence extraction."""
        text = "First sentence. Second sentence!"
        result = self.processor.preprocess_text(text)

        sentences = result["sentences"]
        self.assertEqual(len(sentences), 2)
        self.assertIn("First sentence", sentences[0])
        self.assertIn("Second sentence", sentences[1])

    def test_extract_tokens(self):
        """Test token extraction with metadata."""
        text = "The system works"
        result = self.processor.preprocess_text(text)

        tokens = result["tokens"]
        self.assertGreater(len(tokens), 0)

        # Check token structure
        token = tokens[0]
        required_token_keys = ["text", "lemma", "pos", "tag"]
        for key in required_token_keys:
            self.assertIn(key, token)


class TestPatterns(unittest.TestCase):
    """Test cases for pattern validation."""

    def test_validate_patterns(self):
        """Test that patterns are properly defined."""
        result = validate_patterns()
        self.assertTrue(result)

    def test_patterns_structure(self):
        """Test patterns module structure."""
        from nlp import patterns

        # Check that key pattern collections exist
        self.assertTrue(hasattr(patterns, 'AmbiguityPatterns'))
        self.assertTrue(hasattr(patterns, 'AssumptionPatterns'))
        self.assertTrue(hasattr(patterns, 'ScoringPatterns'))


class TestSampleData(unittest.TestCase):
    """Test cases using sample data."""

    def setUp(self):
        """Load sample data for testing."""
        self.sample_data = []
        try:
            with open("data/sample_requirements.csv", "r") as f:
                reader = csv.DictReader(f)
                self.sample_data = list(reader)
        except FileNotFoundError:
            self.skipTest("Sample data file not found")

    def test_sample_data_structure(self):
        """Test that sample data has correct structure."""
        if not self.sample_data:
            self.skipTest("No sample data available")

        required_fields = ["id", "text", "type", "expected_ambiguity_score"]
        for row in self.sample_data:
            for field in required_fields:
                self.assertIn(field, row)
                self.assertTrue(row[field])  # Not empty

    def test_sample_data_analysis(self):
        """Test analysis of sample data."""
        if not self.sample_data:
            self.skipTest("No sample data available")

        scorer = RequirementScorer()

        for row in self.sample_data[:3]:  # Test first few samples
            text = row["text"]
            result = scorer.analyze_text(text)

            # Basic validation
            self.assertIn("ambiguity_score", result)
            self.assertIn("assumption_score", result)
            self.assertIn("readiness_score", result)
            self.assertIn("issues", result)


class TestJSONDataFiles(unittest.TestCase):
    """Test cases for JSON data file validation."""

    def test_ambiguity_keywords_json(self):
        """Test ambiguity keywords JSON structure."""
        try:
            with open("data/ambiguity_keywords.json", "r") as f:
                data = json.load(f)

            # Check main sections exist
            self.assertIn("subjective_terms", data)
            self.assertIn("weak_modality", data)
            self.assertIn("undefined_references", data)

        except FileNotFoundError:
            self.skipTest("Ambiguity keywords file not found")

    def test_assumption_patterns_json(self):
        """Test assumption patterns JSON structure."""
        try:
            with open("data/assumption_patterns.json", "r") as f:
                data = json.load(f)

            # Check main sections exist
            self.assertIn("action_assumptions", data)
            self.assertIn("assumption_definitions", data)
            self.assertIn("environment_indicators", data)

        except FileNotFoundError:
            self.skipTest("Assumption patterns file not found")


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)