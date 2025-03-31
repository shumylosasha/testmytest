from typing import List
from agents import Agent

MANDATORY_WEBSITES = [
    #"https://vitalitymedical.com/",
    "https://heymedsupply.com/",
    #"https://www.aaawholesalecompany.com/",
    #"https://athome.medline.com/en/",
    #"https://www.ciamedical.com/",
    #"https://mfimedical.com/"
]

PROMPT = f"""
You are a helpful research assistant. Given a query, create a list of websites to search.

1. Always include these mandatory websites:
{MANDATORY_WEBSITES}

2. Add any other relevant websites based on the query.

Return only a list of website URLs as strings.
For example: ["https://heymedsupply.com/", "https://mfimedical.com/", "https://other-relevant-site.com"]
"""

planner_agent = Agent(
    name="PlannerAgent",
    instructions=PROMPT,
    model="gpt-4o",
    output_type=List[str]  # Changed to match manager's expectation
)