"""
Patterns and Rules Module

This module defines patterns, rules, and configurations used by the
ambiguity and assumption detectors. Centralizes all pattern definitions
for maintainability and consistency.
"""

import re
from typing import Dict, List, Set, Any


class AmbiguityPatterns:
    """Patterns for detecting different types of ambiguity."""

    # Subjective/vague terms that need quantification
    SUBJECTIVE_TERMS: Set[str] = {
        # Performance terms
        "fast", "slow", "quick", "rapid", "speedy", "snappy", "instant",
        "immediate", "instantaneous", "lightning", "blazing", "swift",

        # Quality terms
        "good", "bad", "better", "best", "worse", "worst", "excellent",
        "poor", "superior", "inferior", "great", "terrible", "outstanding",

        # Usability terms
        "easy", "hard", "simple", "complex", "intuitive", "confusing",
        "user-friendly", "difficult", "straightforward", "complicated",
        "effortless", "challenging", "painless", "frustrating",

        # Reliability terms
        "reliable", "unreliable", "robust", "fragile", "stable", "unstable",
        "consistent", "inconsistent", "dependable", "flaky", "solid",

        # Security terms
        "secure", "insecure", "safe", "unsafe", "protected", "vulnerable",
        "trustworthy", "risky", "encrypted", "exposed", "guarded",

        # Scalability terms
        "scalable", "non-scalable", "flexible", "rigid", "adaptable", "inflexible",
        "extensible", "limited", "expandable", "constrained", "elastic",

        # Efficiency terms
        "efficient", "inefficient", "optimal", "suboptimal", "effective", "ineffective",
        "productive", "wasteful", "streamlined", "cumbersome", "lean",

        # General vague terms
        "proper", "correct", "appropriate", "adequate", "sufficient", "enough",
        "reasonable", "acceptable", "satisfactory", "unsatisfactory", "ideal",
        "perfect", "flawless", "impeccable", "pristine", "clean", "clear",
        "obvious", "normal", "standard", "typical", "usual", "regular"
    }

    # Weak modality terms indicating optionality
    WEAK_MODALITY_TERMS: Set[str] = {
        # Modal verbs
        "should", "could", "might", "may", "can", "shall", "ought",

        # Conditional phrases
        "if possible", "when possible", "as needed", "when necessary",
        "depending on", "in case of", "provided that", "assuming that",

        # Preference indicators
        "ideally", "preferably", "ideally", "would like", "would prefer",

        # Frequency qualifiers
        "generally", "usually", "typically", "normally", "commonly",
        "often", "sometimes", "occasionally", "rarely", "frequently",

        # Probability terms
        "probably", "likely", "unlikely", "presumably", "apparently",
        "possibly", "potentially", "conceivably", "arguably",

        # Optional actions
        "can optionally", "may optionally", "could optionally",
        "might optionally", "should optionally"
    }

    # Potentially undefined references
    UNDEFINED_REFERENCES: Set[str] = {
        # Pronouns
        "it", "this", "that", "these", "those", "them", "they", "their", "its",

        # System references
        "the system", "the application", "the software", "the platform",
        "the component", "the module", "the service", "the interface",
        "the framework", "the architecture", "the infrastructure",

        # User references
        "the user", "the customer", "the client", "the admin", "the administrator",
        "the manager", "the operator", "the visitor", "the guest", "the member",

        # Data references
        "the data", "the information", "the content", "the record", "the entry",
        "the item", "the object", "the element", "the entity", "the resource",

        # UI references
        "the page", "the screen", "the form", "the field", "the button",
        "the link", "the menu", "the panel", "the dialog", "the modal",

        # Process references
        "the process", "the workflow", "the procedure", "the method",
        "the algorithm", "the function", "the routine",

        # Business references
        "the business", "the company", "the organization", "the team",
        "the department", "the division", "the group"
    }

    # Regex patterns for non-testable statements
    NON_TESTABLE_PATTERNS: List[str] = [
        r"handle.*properly",
        r"work.*correctly",
        r"function.*properly",
        r"behave.*correctly",
        r"perform.*properly",
        r"process.*correctly",
        r"respond.*appropriately",
        r"act.*properly",
        r"operate.*correctly",
        r"run.*smoothly",
        r"integrate.*seamlessly"
    ]

    # Context-aware patterns that might be ambiguous
    CONTEXT_DEPENDENT_PATTERNS: Dict[str, List[str]] = {
        "performance": [
            r"load.*fast",
            r"respond.*quickly",
            r"process.*efficiently"
        ],
        "usability": [
            r"easy.*to.*use",
            r"user.*friendly",
            r"intuitive.*interface"
        ],
        "reliability": [
            r"work.*reliably",
            r"handle.*gracefully",
            r"recover.*properly"
        ]
    }


class AssumptionPatterns:
    """Patterns for detecting implicit assumptions."""

    # Actions that imply user/data assumptions
    ACTION_PATTERNS: Dict[str, List[str]] = {
        "login": ["user_exists", "credentials_exist"],
        "log in": ["user_exists", "credentials_exist"],
        "sign in": ["user_exists", "credentials_exist"],
        "authenticate": ["user_exists", "credentials_exist"],

        "navigate": ["user_logged_in"],
        "access": ["user_logged_in", "permissions_granted"],
        "view": ["user_logged_in", "permissions_granted"],
        "see": ["user_logged_in", "permissions_granted"],

        "submit": ["form_filled", "user_logged_in"],
        "save": ["data_entered", "user_logged_in"],
        "update": ["record_exists", "user_logged_in"],
        "delete": ["record_exists", "user_logged_in", "permissions_granted"],

        "search": ["user_logged_in"],
        "filter": ["user_logged_in"],
        "sort": ["user_logged_in"],

        "verify": ["condition_exists"],
        "check": ["condition_exists"],
        "validate": ["data_exists"],
        "confirm": ["condition_exists"],

        "upload": ["file_exists", "user_logged_in"],
        "download": ["file_exists", "user_logged_in", "permissions_granted"],
        "export": ["data_exists", "user_logged_in"],

        "edit": ["record_exists", "user_logged_in", "permissions_granted"],
        "modify": ["record_exists", "user_logged_in", "permissions_granted"],

        "send": ["recipient_exists", "user_logged_in"],
        "receive": ["sender_exists"],
        "message": ["communication_setup"]
    }

    # Assumption types and their descriptions
    ASSUMPTION_DEFINITIONS: Dict[str, str] = {
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
        "communication_setup": "Communication channel is configured"
    }

    # Category mappings for assumptions
    ASSUMPTION_CATEGORIES: Dict[str, str] = {
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
        "communication_setup": "Environment"
    }

    # Environment indicators that should be explicit
    ENVIRONMENT_INDICATORS: Set[str] = {
        "browser", "chrome", "firefox", "safari", "edge", "opera",
        "mobile", "desktop", "tablet", "phone",
        "ios", "android", "windows", "mac", "linux", "ubuntu",
        "device", "platform", "network", "wifi", "cellular",
        "screen", "resolution", "viewport"
    }

    # UI interaction verbs that imply environment assumptions
    UI_ACTIONS: Set[str] = {
        "click", "tap", "press", "select", "choose", "pick",
        "type", "enter", "input", "fill", "scroll", "swipe",
        "hover", "drag", "drop", "zoom", "pinch"
    }


class ScoringPatterns:
    """Patterns for scoring calculations."""

    # Weights for different ambiguity types
    AMBIGUITY_WEIGHTS: Dict[str, int] = {
        "Subjective term": 15,
        "Weak modality": 20,
        "Undefined reference": 25,
        "Non-testable statement": 30
    }

    # Weights for different assumption categories
    ASSUMPTION_WEIGHTS: Dict[str, int] = {
        "Environment": 30,
        "Data": 20,
        "State": 25
    }

    # Readiness score thresholds
    READINESS_THRESHOLDS: Dict[str, tuple] = {
        "Ready": (70, 100),
        "Needs clarification": (40, 69),
        "High risk for automation": (0, 39)
    }


class TextPatterns:
    """General text processing patterns."""

    # Patterns for detecting different text types
    REQUIREMENT_PATTERNS: List[str] = [
        r"(should|must|shall|will)",
        r"(user|system|application)",
        r"(when|if|then)",
        r"(verify|check|validate|confirm)",
        r"(display|show|present)",
        r"(enter|input|type|select)"
    ]

    # Patterns for detecting test case text
    TEST_CASE_PATTERNS: List[str] = [
        r"(given|when|then)",
        r"(step|scenario|test case)",
        r"(expected|actual)",
        r"(pass|fail|result)"
    ]

    # Common stop words to filter out
    STOP_WORDS: Set[str] = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "can", "shall"
    }


def get_compiled_patterns() -> Dict[str, Any]:
    """
    Get compiled regex patterns for efficient matching.

    Returns:
        Dictionary of compiled patterns
    """
    return {
        "non_testable": [re.compile(pattern, re.IGNORECASE)
                        for pattern in AmbiguityPatterns.NON_TESTABLE_PATTERNS],
        "context_dependent": {
            category: [re.compile(pattern, re.IGNORECASE)
                      for pattern in patterns]
            for category, patterns in AmbiguityPatterns.CONTEXT_DEPENDENT_PATTERNS.items()
        },
        "requirement_indicators": [re.compile(pattern, re.IGNORECASE)
                                  for pattern in TextPatterns.REQUIREMENT_PATTERNS],
        "test_case_indicators": [re.compile(pattern, re.IGNORECASE)
                                for pattern in TextPatterns.TEST_CASE_PATTERNS]
    }


def validate_patterns() -> bool:
    """
    Validate that all patterns are properly defined.

    Returns:
        True if all patterns are valid
    """
    try:
        # Test compiling all regex patterns
        compiled = get_compiled_patterns()

        # Check that all expected keys exist
        required_keys = ["non_testable", "context_dependent", "requirement_indicators", "test_case_indicators"]
        for key in required_keys:
            if key not in compiled:
                print(f"Missing required pattern key: {key}")
                return False

        # Check assumption mappings
        for action, assumptions in AssumptionPatterns.ACTION_PATTERNS.items():
            for assumption in assumptions:
                if assumption not in AssumptionPatterns.ASSUMPTION_DEFINITIONS:
                    print(f"Undefined assumption: {assumption}")
                    return False

        return True

    except Exception as e:
        print(f"Pattern validation error: {e}")
        return False


if __name__ == "__main__":
    # Validate patterns when run directly
    if validate_patterns():
        print("All patterns validated successfully!")
    else:
        print("Pattern validation failed!")