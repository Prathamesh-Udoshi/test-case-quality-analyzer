"""
Assumption Detection Module

This module detects implicit assumptions in requirements and test cases that
are not explicitly stated. These hidden assumptions can lead to flaky tests
and rework during automation.

Detects assumptions in three categories:
- Environment assumptions (browser, OS, device, network)
- Data assumptions (valid users, credentials, test data)
- State assumptions (user logged in, feature enabled, permissions)
"""

import re
from typing import List, Dict, Any, Set
from dataclasses import dataclass

import spacy
from spacy.tokens import Doc


@dataclass
class AssumptionIssue:
    """Represents a detected assumption issue."""
    type: str
    category: str
    text: str
    message: str
    assumption: str


class AssumptionDetector:
    """
    Detects implicit assumptions in requirement text using rule-based inference.

    This detector identifies missing preconditions and context that are assumed
    but not explicitly stated in the requirements.
    """

    def __init__(self, nlp_model: str = "en_core_web_sm"):
        """
        Initialize the assumption detector.

        Args:
            nlp_model: spaCy language model to use (default: en_core_web_sm)
        """
        try:
            self.nlp = spacy.load(nlp_model)
        except OSError:
            # Fallback to blank model if en_core_web_sm not available
            self.nlp = spacy.blank("en")

        # Define action patterns that imply assumptions
        self.action_patterns = {
            # Authentication actions
            "login": ["user_exists", "credentials_exist"],
            "log in": ["user_exists", "credentials_exist"],
            "sign in": ["user_exists", "credentials_exist"],
            "authenticate": ["user_exists", "credentials_exist"],
            "logout": ["user_logged_in"],
            "log out": ["user_logged_in"],
            "sign out": ["user_logged_in"],

            # Navigation and access actions
            "navigate": ["user_logged_in"],
            "access": ["user_logged_in", "permissions_granted"],
            "view": ["user_logged_in", "permissions_granted"],
            "see": ["user_logged_in", "permissions_granted"],
            "visit": ["user_logged_in"],
            "go to": ["user_logged_in"],
            "open": ["user_logged_in"],
            "enter": ["user_logged_in"],
            "browse": ["user_logged_in"],

            # Data manipulation actions
            "submit": ["form_filled", "user_logged_in"],
            "save": ["data_entered", "user_logged_in"],
            "update": ["record_exists", "user_logged_in", "permissions_granted"],
            "delete": ["record_exists", "user_logged_in", "permissions_granted"],
            "edit": ["record_exists", "user_logged_in", "permissions_granted"],
            "modify": ["record_exists", "user_logged_in", "permissions_granted"],
            "create": ["user_logged_in", "permissions_granted"],
            "add": ["user_logged_in", "permissions_granted"],
            "insert": ["user_logged_in", "permissions_granted"],

            # Search and filter actions
            "search": ["user_logged_in"],
            "filter": ["user_logged_in"],
            "sort": ["user_logged_in"],
            "find": ["user_logged_in"],
            "query": ["user_logged_in"],
            "lookup": ["user_logged_in"],

            # Verification and validation actions
            "verify": ["condition_exists", "user_logged_in"],
            "check": ["condition_exists", "user_logged_in"],
            "validate": ["data_exists", "user_logged_in"],
            "confirm": ["condition_exists", "user_logged_in"],
            "ensure": ["condition_exists", "user_logged_in"],
            "assert": ["condition_exists", "user_logged_in"],
            "test": ["condition_exists", "user_logged_in"],

            # File operations
            "upload": ["file_exists", "user_logged_in"],
            "download": ["file_exists", "user_logged_in", "permissions_granted"],
            "export": ["data_exists", "user_logged_in"],
            "import": ["file_exists", "user_logged_in", "permissions_granted"],
            "attach": ["file_exists", "user_logged_in"],
            "share": ["file_exists", "user_logged_in", "permissions_granted"],

            # Communication actions
            "send": ["recipient_exists", "user_logged_in"],
            "receive": ["sender_exists"],
            "message": ["communication_setup"],
            "email": ["recipient_exists", "user_logged_in"],
            "notify": ["recipient_exists", "user_logged_in"],
            "contact": ["recipient_exists", "user_logged_in"],
            "communicate": ["communication_setup"],

            # User role specific actions
            "admin": ["admin_role", "user_logged_in"],
            "manager": ["manager_role", "user_logged_in"],
            "administrator": ["admin_role", "user_logged_in"],
            "supervisor": ["manager_role", "user_logged_in"],

            # Error and failure handling
            "error": ["error_trigger"],
            "fail": ["failure_condition"],
            "crash": ["error_trigger"],
            "break": ["error_trigger"],
            "handle": ["error_trigger"],
            "recover": ["failure_condition"],

            # Configuration and settings
            "configure": ["admin_role", "user_logged_in"],
            "setup": ["admin_role", "user_logged_in"],
            "customize": ["user_logged_in"],
            "personalize": ["user_logged_in"],
            "settings": ["user_logged_in"],
            "preferences": ["user_logged_in"],

            # Reporting and analytics
            "report": ["data_exists", "user_logged_in", "permissions_granted"],
            "analytics": ["data_exists", "user_logged_in", "permissions_granted"],
            "dashboard": ["user_logged_in"],
            "metrics": ["data_exists", "user_logged_in", "permissions_granted"],
            "statistics": ["data_exists", "user_logged_in", "permissions_granted"],

            # Integration and API actions
            "integrate": ["external_service_exists"],
            "connect": ["external_service_exists"],
            "sync": ["external_service_exists"],
            "api": ["api_access_configured"],
            "webhook": ["webhook_configured"],
            "callback": ["callback_configured"]
        }

        # Define assumption descriptions
        self.assumption_descriptions = {
            "user_exists": "Valid test user exists in the system",
            "credentials_exist": "User credentials are available and valid",
            "user_logged_in": "User is already authenticated/logged in",
            "permissions_granted": "User has necessary permissions for the action",
            "form_filled": "Form is already filled with valid data",
            "data_entered": "Required data has been entered",
            "record_exists": "Target record exists in the system",
            "condition_exists": "Condition to verify is present",
            "data_exists": "Required data exists for validation",
            "error_trigger": "Error condition can be triggered",
            "failure_condition": "Failure scenario can be reproduced",
            "admin_role": "Admin user role is available",
            "manager_role": "Manager user role is available",
            "user_role": "Regular user role is available",
            "file_exists": "Required file exists for the operation",
            "recipient_exists": "Message recipient exists",
            "sender_exists": "Message sender exists",
            "communication_setup": "Communication channel is configured",
            "external_service_exists": "External service or API is available and accessible",
            "api_access_configured": "API access credentials and endpoints are configured",
            "webhook_configured": "Webhook endpoints are set up and accessible",
            "callback_configured": "Callback mechanisms are properly configured"
        }

        # Environment assumptions that should be explicit
        self.environment_indicators = {
            "browser", "chrome", "firefox", "safari", "edge",
            "mobile", "desktop", "tablet", "ios", "android",
            "windows", "mac", "linux", "device", "network"
        }

    def detect_assumptions(self, text: str) -> List[AssumptionIssue]:
        """
        Detect all implicit assumptions in the given text.

        Args:
            text: Input requirement or test case text

        Returns:
            List of AssumptionIssue objects with detected assumptions
        """
        issues = []

        # Process text with spaCy
        doc = self.nlp(text.lower())

        # Detect action-based assumptions
        issues.extend(self._detect_action_assumptions(doc, text))

        # Detect missing environment specifications
        issues.extend(self._detect_environment_assumptions(text))

        # Detect data and state assumptions from context
        issues.extend(self._detect_context_assumptions(text))

        return issues

    def _detect_action_assumptions(self, doc: Doc, original_text: str) -> List[AssumptionIssue]:
        """Detect assumptions implied by specific actions mentioned in text."""
        issues = []
        text_lower = original_text.lower()

        for action, assumptions in self.action_patterns.items():
            if action in text_lower:
                for assumption_key in assumptions:
                    if not self._is_assumption_explicit(text_lower, assumption_key):
                        issues.append(AssumptionIssue(
                            type="Action assumption",
                            category=self._get_assumption_category(assumption_key),
                            text=action,
                            message=f"Action '{action}' implies assumption",
                            assumption=self.assumption_descriptions.get(assumption_key, assumption_key)
                        ))

        return issues

    def _detect_environment_assumptions(self, text: str) -> List[AssumptionIssue]:
        """Detect missing environment specifications."""
        issues = []
        text_lower = text.lower()

        # Check for UI interactions without environment specification
        ui_actions = ["click", "type", "select", "scroll", "hover", "tap"]
        has_ui_action = any(action in text_lower for action in ui_actions)

        if has_ui_action:
            # Check if any environment is mentioned
            has_environment = any(env in text_lower for env in self.environment_indicators)

            if not has_environment:
                issues.append(AssumptionIssue(
                    type="Environment assumption",
                    category="Environment",
                    text="UI interaction",
                    message="UI interaction without environment specification",
                    assumption="Browser, device, or platform is specified"
                ))

        return issues

    def _detect_context_assumptions(self, text: str) -> List[AssumptionIssue]:
        """Detect assumptions from broader context patterns."""
        issues = []
        text_lower = text.lower()

        # Check for user-specific actions without user context
        user_actions = ["profile", "settings", "account", "dashboard"]
        if any(action in text_lower for action in user_actions):
            if not self._has_user_context(text_lower):
                issues.append(AssumptionIssue(
                    type="Context assumption",
                    category="State",
                    text="User-specific action",
                    message="User-specific action without user context",
                    assumption="User is logged in and authenticated"
                ))

        # Check for data operations without data context
        data_actions = ["search", "filter", "sort", "export"]
        if any(action in text_lower for action in data_actions):
            if not self._has_data_context(text_lower):
                issues.append(AssumptionIssue(
                    type="Context assumption",
                    category="Data",
                    text="Data operation",
                    message="Data operation without data context",
                    assumption="Required data exists in the system"
                ))

        return issues

    def _is_assumption_explicit(self, text: str, assumption_key: str) -> bool:
        """
        Check if an assumption is explicitly stated in the text.

        This is a simple keyword-based check. In production, this could be
        enhanced with more sophisticated NLP.
        """
        explicit_indicators = {
            "user_exists": ["user exists", "test user", "valid user"],
            "credentials_exist": ["credentials", "password", "login details"],
            "user_logged_in": ["logged in", "authenticated", "signed in"],
            "permissions_granted": ["permission", "authorized", "access granted"],
            "form_filled": ["filled", "entered", "completed"],
            "data_entered": ["entered", "provided", "input"],
            "record_exists": ["exists", "available", "present"],
            "condition_exists": ["condition", "scenario", "case"],
            "data_exists": ["data exists", "available data"],
            "error_trigger": ["error occurs", "error condition"],
            "failure_condition": ["failure", "error case"],
        }

        indicators = explicit_indicators.get(assumption_key, [])
        return any(indicator in text for indicator in indicators)

    def _get_assumption_category(self, assumption_key: str) -> str:
        """Map assumption key to category."""
        category_mapping = {
            "user_exists": "Data",
            "credentials_exist": "Data",
            "user_logged_in": "State",
            "permissions_granted": "State",
            "form_filled": "Data",
            "data_entered": "Data",
            "record_exists": "Data",
            "condition_exists": "State",
            "data_exists": "Data",
            "error_trigger": "State",
            "failure_condition": "State",
            "admin_role": "State",
            "manager_role": "State",
            "user_role": "State",
            "file_exists": "Data",
            "recipient_exists": "Data",
            "sender_exists": "Data",
            "communication_setup": "Environment",
            "external_service_exists": "Environment",
            "api_access_configured": "Environment",
            "webhook_configured": "Environment",
            "callback_configured": "Environment"
        }

        return category_mapping.get(assumption_key, "Unknown")

    def _has_user_context(self, text: str) -> bool:
        """Check if text has explicit user context."""
        user_indicators = [
            "user", "login", "authenticate", "sign in", "logged in",
            "account", "profile", "session"
        ]
        return any(indicator in text for indicator in user_indicators)

    def _has_data_context(self, text: str) -> bool:
        """Check if text has explicit data context."""
        data_indicators = [
            "data", "record", "entry", "information", "content",
            "database", "exists", "available", "present"
        ]
        return any(indicator in text for indicator in data_indicators)

    def calculate_assumption_score(self, issues: List[AssumptionIssue], text: str = "") -> float:
        """
        Calculate assumption score based on detected issues.

        Uses a sophisticated scoring algorithm that considers:
        - Assumption category and severity
        - Assumption density and criticality
        - Text context and dependencies
        - Multiple assumption types

        Args:
            issues: List of detected assumption issues
            text: Original text (optional, for context analysis)

        Returns:
            Score from 0-100 (higher = more assumptions)
        """
        if not issues:
            return 0.0

        # Base weights for different assumption categories
        base_weights = {
            "Environment": 18,  # Most critical - missing environment can break tests
            "Data": 12,         # Important - missing data causes test failures
            "State": 15,        # Critical - wrong state assumptions cause flaky tests
        }

        # Count issues by category to handle multiples
        category_counts = {}
        assumption_types = set()

        for issue in issues:
            category = issue.category
            category_counts[category] = category_counts.get(category, 0) + 1
            assumption_types.add(issue.type)

        # Calculate base score from categories
        base_score = 0
        for category, count in category_counts.items():
            weight = base_weights.get(category, 10)
            # Multiple assumptions in same category are very problematic
            if count == 1:
                base_score += weight
            elif count == 2:
                base_score += weight * 1.6  # 60% bonus for second assumption
            else:
                base_score += weight * 2.0  # 100% bonus for 3+ assumptions

        # Bonus for multiple assumption types (diverse hidden dependencies)
        type_diversity_bonus = len(assumption_types) * 3
        base_score += min(15, type_diversity_bonus)  # Cap at 15 points

        # Factor in text length and context
        text_length = len(text.split()) if text else 50

        # Short texts with assumptions are more concerning
        if text_length < 15:
            context_factor = 1.3  # Very short texts are critical
        elif text_length < 30:
            context_factor = 1.1  # Short texts still concerning
        else:
            context_factor = 1.0  # Normal texts

        # Density factor: assumptions per word
        density_factor = len(issues) / max(text_length, 8)  # At least 8 words
        density_score = min(35, density_factor * 150)  # Cap density contribution

        # Calculate final score
        final_score = (base_score * context_factor) + density_score

        # Apply normalization curve
        if final_score < 15:
            final_score *= 0.9  # Slightly reduce very low scores
        elif final_score > 75:
            final_score = 75 + (final_score - 75) * 0.4  # Dampen very high scores

        return max(0.0, min(100.0, final_score))