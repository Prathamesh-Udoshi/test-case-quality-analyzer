"""
Suggestion Generation Module

This module generates actionable clarifying questions based on detected
ambiguity and assumption issues. Each question helps requirement authors
provide the specific details needed for effective test automation.
"""

from typing import List, Dict, Any, Union

from .ambiguity_detector import AmbiguityIssue
from .assumption_detector import AssumptionIssue


class SuggestionGenerator:
    """
    Generates clarifying questions for detected issues.

    Provides specific, actionable questions that help requirement authors
    eliminate ambiguity and document assumptions explicitly.
    """

    def __init__(self):
        """Initialize the suggestion generator."""
        # Define suggestion templates for different issue types
        self.ambiguity_suggestions = {
            "Subjective term": {
                "fast": "What is the acceptable response time in seconds?",
                "slow": "What is the maximum acceptable response time in seconds?",
                "quick": "What is the acceptable response time in seconds?",
                "secure": "What specific security requirements must be met?",
                "safe": "What specific security or safety criteria must be satisfied?",
                "scalable": "What are the performance requirements for different user loads?",
                "optimal": "What are the specific criteria for optimal performance?",
                "efficient": "What are the efficiency requirements or thresholds?",
                "user-friendly": "What specific usability criteria should be measured?",
                "intuitive": "What specific user experience requirements are expected?",
                "robust": "What specific reliability or error-handling requirements exist?",
                "reliable": "What are the uptime or success rate requirements?",
                "stable": "What are the stability requirements or acceptance criteria?",
                "flexible": "What specific flexibility or adaptability requirements exist?",
                "responsive": "What are the responsiveness requirements in terms of timing?",
                "smooth": "What specific performance characteristics define smoothness?",
                "proper": "What specific criteria define proper behavior?",
                "correct": "What specific acceptance criteria define correctness?",
                "appropriate": "What specific requirements define appropriateness?",
                "adequate": "What quantitative measures define adequacy?",
                "sufficient": "What specific thresholds or requirements define sufficiency?"
            },
            "Weak modality": {
                "should": "Is this a mandatory requirement or optional?",
                "could": "Under what conditions should this behavior occur?",
                "might": "When and under what conditions should this occur?",
                "may": "What determines when this behavior should occur?",
                "can": "What conditions enable this capability?",
                "if possible": "What should happen if this is not possible?",
                "as needed": "What triggers the need for this behavior?",
                "when necessary": "What conditions make this necessary?",
                "ideally": "What is the minimum acceptable behavior if ideal is not achieved?",
                "preferably": "What is the alternative if preference cannot be satisfied?"
            },
            "Undefined reference": {
                "it": "What specific element or component does 'it' refer to?",
                "this": "What specific element or component does 'this' refer to?",
                "that": "What specific element or component does 'that' refer to?",
                "these": "What specific elements or components do 'these' refer to?",
                "those": "What specific elements or components do 'those' refer to?",
                "the system": "Which specific system or subsystem is being referenced?",
                "the component": "Which specific component is being referenced?",
                "the application": "Which specific application is being referenced?",
                "the user": "What type of user or user role is being referenced?"
            },
            "Non-testable statement": {
                "default": "What specific, measurable criteria define success for this requirement?"
            }
        }

        self.assumption_suggestions = {
            "Environment": {
                "UI interaction": "Which browser(s), device(s), and operating system(s) should be supported?",
                "default": "What is the target environment (browser, device, OS) for this requirement?"
            },
            "Data": {
                "user_exists": "What test user accounts should be available?",
                "credentials_exist": "What user credentials should be prepared for testing?",
                "form_filled": "What specific data should be pre-filled in the form?",
                "data_entered": "What test data should be prepared for this scenario?",
                "record_exists": "What test records should exist in the system?",
                "data_exists": "What test data should be available for validation?",
                "default": "What test data or records need to be prepared?"
            },
            "State": {
                "user_logged_in": "Should the user be pre-authenticated for this test?",
                "permissions_granted": "What user role and permissions are required?",
                "condition_exists": "What preconditions must be met to trigger this scenario?",
                "error_trigger": "How can the error condition be reliably reproduced?",
                "failure_condition": "What conditions will cause this failure scenario?",
                "admin_role": "What admin user roles should be available for testing?",
                "manager_role": "What manager user roles should be available for testing?",
                "user_role": "What regular user roles should be available for testing?",
                "default": "What system state or user context is required?"
            }
        }

    def generate_suggestions(self, issues: List[Union[AmbiguityIssue, AssumptionIssue]]) -> List[str]:
        """
        Generate clarifying questions for detected issues.

        Args:
            issues: List of detected ambiguity and assumption issues

        Returns:
            List of clarifying question strings
        """
        suggestions = []

        for issue in issues:
            if isinstance(issue, AmbiguityIssue):
                suggestion = self._generate_ambiguity_suggestion(issue)
            elif isinstance(issue, AssumptionIssue):
                suggestion = self._generate_assumption_suggestion(issue)
            else:
                continue

            if suggestion and suggestion not in suggestions:  # Avoid duplicates
                suggestions.append(suggestion)

        return suggestions

    def _generate_ambiguity_suggestion(self, issue: AmbiguityIssue) -> str:
        """Generate suggestion for ambiguity issue."""
        issue_type = issue.type
        issue_text = issue.text.lower()

        if issue_type in self.ambiguity_suggestions:
            templates = self.ambiguity_suggestions[issue_type]

            # Try exact match first
            if issue_text in templates:
                return templates[issue_text]

            # Try default for the type
            if "default" in templates:
                return templates["default"]

        # Fallback suggestion
        return f"What specific criteria define '{issue.text}'?"

    def _generate_assumption_suggestion(self, issue: AssumptionIssue) -> str:
        """Generate suggestion for assumption issue."""
        category = issue.category

        if category in self.assumption_suggestions:
            templates = self.assumption_suggestions[category]

            # Try to match based on assumption text or type
            assumption_key = self._extract_assumption_key(issue)
            if assumption_key in templates:
                return templates[assumption_key]

            # Try text-based matching
            issue_text_lower = issue.text.lower()
            for key, template in templates.items():
                if key != "default" and key in issue_text_lower:
                    return template

            # Try default for the category
            if "default" in templates:
                return templates["default"]

        # Fallback suggestion
        return f"What specific {category.lower()} requirements are needed?"

    def _extract_assumption_key(self, issue: AssumptionIssue) -> str:
        """Extract a key from assumption issue for template matching."""
        # Try to extract key from assumption text
        assumption_lower = issue.assumption.lower()

        key_mappings = {
            "user exists": "user_exists",
            "credentials": "credentials_exist",
            "logged in": "user_logged_in",
            "permissions": "permissions_granted",
            "form filled": "form_filled",
            "data entered": "data_entered",
            "record exists": "record_exists",
            "condition exists": "condition_exists",
            "data exists": "data_exists",
            "error": "error_trigger",
            "failure": "failure_condition",
            "admin": "admin_role",
            "manager": "manager_role",
            "user": "user_role"
        }

        for phrase, key in key_mappings.items():
            if phrase in assumption_lower:
                return key

        return "default"

    def generate_issue_specific_suggestions(self, issues: List[Union[AmbiguityIssue, AssumptionIssue]]) -> Dict[str, List[str]]:
        """
        Generate suggestions grouped by issue type for detailed reporting.

        Args:
            issues: List of detected issues

        Returns:
            Dictionary mapping issue types to lists of suggestions
        """
        grouped_suggestions = {
            "ambiguity": [],
            "assumptions": []
        }

        for issue in issues:
            if isinstance(issue, AmbiguityIssue):
                suggestion = self._generate_ambiguity_suggestion(issue)
                if suggestion not in grouped_suggestions["ambiguity"]:
                    grouped_suggestions["ambiguity"].append(suggestion)
            elif isinstance(issue, AssumptionIssue):
                suggestion = self._generate_assumption_suggestion(issue)
                if suggestion not in grouped_suggestions["assumptions"]:
                    grouped_suggestions["assumptions"].append(suggestion)

        return grouped_suggestions