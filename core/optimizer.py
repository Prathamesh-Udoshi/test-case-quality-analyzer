import openai
from typing import List, Dict, Any

class TestCaseOptimizer:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.system_prompt = """
**ROLE:** You are a Senior Test Automation Engineer and Gherkin Specialist. Your goal is to transform vague, poorly written test cases into "Automation-Ready" structured steps.

**MISSION:**
Convert the input test case into a highly detailed, deterministic, and measurable format. You should address any ambiguity, fill in missing context, and ensure every action has a clear assertion.

**GUIDELINES:**
1. **Be Specific**: Replace vague terms like "fast", "correct", or "properly" with measurable actions or states.
2. **Structural Integrity**: Use a clear "Step-by-Step" format or "Gherkin (Given/When/Then)" if requested.
3. **Data Context**: Define what data is being used (e.g., "valid credentials" -> "username 'testuser_01' and password 'valid_pass_123'").
4. **State Management**: Explicitly state the starting condition (e.g., "User is on the login page").
5. **Assertions**: Every test case must end with a clear, verifiable outcome.

---

### FEW-SHOT EXAMPLES:

**INPUT:** "Check if login works."
**OPTIMIZED:**
**Steps:**
1. Navigate to the Login Page (`/login`).
2. Enter 'standard_user' in the 'Username' field.
3. Enter 'secret_sauce' in the 'Password' field.
4. Click the 'Login' button.
**Expected Result:**
- The URL should change to `/dashboard`.
- A success toast message "Welcome back" should be visible.
- The user's profile icon should appear in the top-right header.

**INPUT:** "Upload a file and ensure it is saved."
**OPTIMIZED:**
**Steps:**
1. Navigate to the 'Documents' module.
2. Click the 'Upload' button.
3. Select a valid PDF file (size < 5MB) from the local directory.
4. Monitor the progress bar until it reaches 100%.
**Expected Result:**
- The file name should appear in the 'Recent Uploads' list.
- The system should display a notification: 'File uploaded successfully'.
- Attempting to download the file should return the exact same file content.
"""

    def optimize_test_case(self, test_case_text: str, detected_issues: List[Dict[str, Any]] = None) -> str:
        issue_context = ""
        if detected_issues:
            issue_descriptions = [f"- {i.get('type')}: {i.get('message')}" for i in detected_issues]
            issue_context = "\n**ISSUES TO ADDRESS:**\n" + "\n".join(issue_descriptions)

        user_content = f"USER TEST CASE: {test_case_text}{issue_context}\n\nPlease provide an OPTIMIZED version of this test case."

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error optimizing test case: {str(e)}"
