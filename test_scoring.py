#!/usr/bin/env python3
"""
Test script to verify the improved scoring logic for ambiguity and assumptions.
"""

import sys
import os

# Ensure project root is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.scorer import RequirementScorer


def test_scoring_logic():
    """Test the improved scoring logic with various examples."""

    scorer = RequirementScorer()

    test_cases = [
        # High ambiguity, low assumptions
        ("The system should be fast, efficient, and user-friendly", "High Ambiguity"),

        # High assumptions, low ambiguity
        ("User logs in and accesses dashboard", "High Assumptions"),

        # Both high
        ("The fast system should handle user login properly", "Both High"),

        # Both low
        ("Verify the login button works", "Both Low"),

        # Edge cases
        ("", "Empty text"),
        ("The system works correctly and efficiently", "Multiple subjective terms"),
        ("User navigates to profile and updates information", "Navigation assumptions"),
        ("Verify error message displays when invalid data entered", "Mixed case"),
    ]

    print("🧪 Testing Improved Scoring Logic")
    print("=" * 60)

    for text, description in test_cases:
        print(f"\n📝 Test Case: {description}")
        print(f"Text: '{text}'")

        if not text.strip():
            print("⚠️  Skipped empty text")
            continue

        result = scorer.analyze_text(text)

        print("Results:")
        print(f"   Ambiguity Score: {result['ambiguity_score']:.1f}")
        print(f"   Assumption Score: {result['assumption_score']:.1f}")
        print(f"   Quality Score: {result['quality_score']:.1f}")
        print(f"   Readiness: {result['readiness_level']}")
        print(f"   Issues: {len(result['issues'])} total")

        # Break down issues by type
        ambiguity_issues = [
            i for i in result['issues']
            if hasattr(i, 'type') and i.type in [
                'Subjective term',
                'Weak modality',
                'Undefined reference',
                'Non-testable statement'
            ]
        ]

        assumption_issues = [
            i for i in result['issues']
            if hasattr(i, 'category')
        ]

        print(f"   - Ambiguity issues: {len(ambiguity_issues)}")
        print(f"   - Assumption issues: {len(assumption_issues)}")

        # Show top 3 issues
        if result['issues']:
            print("   Top issues:")
            for idx, issue in enumerate(result['issues'][:3], 1):
                if hasattr(issue, 'type'):
                    print(f"     {idx}. {issue.type}: '{issue.text}'")
                else:
                    print(f"     {idx}. {issue.category}: {issue.assumption}")


def test_dataset_consistency():
    """Test that the scoring produces reasonable results for the dataset."""

    import pandas as pd

    print("\n\n📊 Testing Dataset Consistency")
    print("=" * 40)

    try:
        df = pd.read_csv("data/sample_requirements.csv")
        scorer = RequirementScorer()

        samples = df.head(10)

        print("Testing first 10 samples from dataset:")
        print("-" * 70)

        zero_ambiguity = 0
        zero_assumptions = 0

        for idx, row in samples.iterrows():
            text = row['text']
            expected_ambiguity = row['expected_ambiguity_score']
            expected_assumption = row['expected_assumption_score']

            result = scorer.analyze_text(text)

            actual_ambiguity = result['ambiguity_score']
            actual_assumption = result['assumption_score']

            if actual_ambiguity == 0:
                zero_ambiguity += 1
            if actual_assumption == 0:
                zero_assumptions += 1

            ambiguity_ok = abs(actual_ambiguity - expected_ambiguity) <= 20
            assumption_ok = abs(actual_assumption - expected_assumption) <= 20

            status = "✅" if (ambiguity_ok and assumption_ok) else "⚠️"

            print(
                f"{idx:2d} | "
                f"Ambiguity: {actual_ambiguity:6.1f} (exp {expected_ambiguity:6.1f}) | "
                f"Assumption: {actual_assumption:6.1f} (exp {expected_assumption:6.1f}) | "
                f"{status}"
            )

        print("\nSummary:")
        print(f"- Samples with zero ambiguity: {zero_ambiguity}/10")
        print(f"- Samples with zero assumptions: {zero_assumptions}/10")

        if zero_ambiguity > 3 or zero_assumptions > 3:
            print("⚠️  Warning: Too many zero scores detected!")
            print("   The scoring logic may need further adjustment.")
        else:
            print("✅ Scoring appears reasonable for the dataset.")

    except FileNotFoundError:
        print("❌ Dataset file not found: data/sample_requirements.csv")
    except Exception as e:
        print(f"❌ Error testing dataset: {e}")


if __name__ == "__main__":
    test_scoring_logic()
    test_dataset_consistency()
