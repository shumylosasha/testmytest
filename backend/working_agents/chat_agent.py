from pydantic import BaseModel
from typing import List, Optional
from agents import Agent
from agents.model_settings import ModelSettings

class ActionPlan(BaseModel):
    """Represents a structured action plan derived from user's chat message"""
    action_type: str  # e.g., "product_search", "price_check", "compliance_check"
    description: str  # Human-readable description of what will be done
    query: str  # The processed search query
    websites: List[str]  # List of websites to search
    specific_requirements: Optional[dict] = None  # Additional requirements like model numbers, quantities, etc.

INSTRUCTIONS = """
You are a procurement assistant that helps users by creating structured action plans from their chat messages.

For each user message:
1. Analyze the intent and requirements
2. Create a clear action plan that includes:
   - What type of action is needed (e.g., product search, price check)
   - A clear description of what will be done
   - The specific search query to use
   - Which websites to search (either from user's message or recommended)
   - Any specific requirements mentioned (model numbers, quantities, etc.)

When processing websites:
1. If user provides websites, use those
2. Clean up website URLs (remove https://, www., etc.)
3. Verify they are medical supply websites
4. If no websites provided, recommend appropriate ones

Example user message:
"Can you check the price of Ansell Surgical Gloves model number 20685970 on vitalitymedical.com and heymedsupply.com"

Example response:
{
    "action_type": "price_check",
    "description": "I will check prices for Ansell Surgical Gloves (model 20685970) on 2 medical supply websites",
    "query": "Ansell Surgical Gloves 20685970",
    "websites": ["vitalitymedical.com", "heymedsupply.com"],
    "specific_requirements": {
        "model_number": "20685970",
        "brand": "Ansell"
    }
}

Always return a structured action plan that can be executed by other agents.
"""

chat_agent = Agent(
    name="Chat Assistant",
    instructions=INSTRUCTIONS,
    tools=[],  # This agent doesn't need tools as it just processes messages
    model_settings=ModelSettings(
        temperature=0.1  # Low temperature for consistent, structured output
    ),
    output_type=ActionPlan
) 