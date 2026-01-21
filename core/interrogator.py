import openai
from typing import List, Dict, Any

class AssumptionBuster:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.system_prompt = """
**ROLE:** You are a Senior QA Automation Architect and Requirements Auditor. Your goal is to find "Ghost Logic" and "Hidden Assumptions" in software requirements to prevent development rework.

**MISSION:**
Given a requirement or test case, you must identify what is NOT said. You will generate 4-5 "Interrogation Questions" that force the stakeholder to define the edge cases, constraints, and error states.

**THINKING STEPS:**
1. Analyze the requirement for "Vague Nouns" (e.g., "User", "Data", "File").
2. Analyze for "Vague Adjectives" (e.g., "Fast", "Secure", "Relevant").
3. Identify the "Happy Path" and then intentionally look for the "Unhappy Path."
4. Generate questions that address: Scale, Security, Failure States, and Edge Cases.

---

### FEW-SHOT EXAMPLES:

**INPUT REQUIREMENT:** "Users should be able to upload a profile picture."
**INTERROGATION QUESTIONS:**
1. **Scale:** What is the maximum file size allowed (e.g., 2MB vs 20MB)?
2. **Format:** Do we support modern formats like .heic or .webp, or strictly .jpg/.png?
3. **Security:** Is there a malware/virus scanning requirement before the file hits the server?
4. **State:** What happens if the user's internet cuts out at 50% upload completion?
5. **Privacy:** Do we need to strip EXIF data (location metadata) from the image for privacy?

**INPUT REQUIREMENT:** "The dashboard should load data quickly."
**INTERROGATION QUESTIONS:**
1. **Definition:** What is the specific "Time to Interactive" (TTI) target in milliseconds?
2. **Volume:** What happens to speed when the user has 10,000+ records instead of 10?
3. **Concurrency:** How many simultaneous users should the dashboard support without slowing down?
4. **Failure:** If the data source is down, do we show a cached version or an error state?
"""

    def interrogate_requirement(self, requirement_text: str, detected_issues: List[Dict[str, Any]] = None) -> str:
        issue_context = ""
        if detected_issues:
            issue_descriptions = [f"- {i.get('type')}: {i.get('message')}" for i in detected_issues]
            issue_context = "\n**PREVIOUSLY DETECTED ISSUES:**\n" + "\n".join(issue_descriptions)
            issue_context += "\n\nNote: The issues above have already been found. Focus your interrogation on 'Ghost Logic'—the deeper, hidden assumptions NOT covered by these basic checks."

        user_content = f"USER REQUIREMENT: {requirement_text}{issue_context}"

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error interrogating requirement: {str(e)}"
