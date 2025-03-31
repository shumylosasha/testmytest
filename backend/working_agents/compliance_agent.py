from pydantic import BaseModel
from agents import Agent, FileSearchTool
from agents.model_settings import ModelSettings
from typing import List, Dict, Any

class ComplianceResult(BaseModel):
    """Result of a compliance check for a single product"""
    product_name: str
    compliant: bool
    explanation: str
    matched_file_info: str  # Information about the matched compliance document
    drug_description: str   # Description of drugs mentioned in the document

class ComplianceCheckResults(BaseModel):
    """Collection of compliance check results"""
    results: List[ComplianceResult]

INSTRUCTIONS = """
You are a compliance checking agent specialized in reviewing products against compliance requirements. Your role is to:

1. Review the provided compliance documents thoroughly
2. For each product, determine if it meets compliance requirements by:
   - Checking product specifications against compliance rules
   - Verifying any required certifications or standards
   - Ensuring packaging and labeling meet requirements
   - Identifying and documenting the source compliance document
   - Extracting and summarizing drug-related information
   
3. Provide clear decisions with brief explanations that include:
   - A yes/no determination on compliance
   - Key factors that influenced the decision
   - Any specific compliance rules referenced
   - Information about the matched compliance document
   - Brief description of drugs mentioned in the document

Be thorough but concise in your assessments. Focus on factual compliance criteria rather than subjective evaluations.
Ensure to extract and document relevant drug information from compliance documents.
"""

def create_compliance_agent(file_id: str, vector_store_id: str = None) -> Agent:
    """Create a compliance checking agent with access to uploaded compliance docs"""
    
    return Agent(
        name="Compliance Checker",
        instructions=INSTRUCTIONS,
        tools=[
            FileSearchTool(
                max_num_results=3,
                vector_store_ids=["vs_67e32445d4788191a105ba3c378106da"],  # Always pass a list, never None
                include_search_results=True
            )
        ],
        model_settings=ModelSettings(
            temperature=0.1  # Low temperature for more consistent compliance decisions
        ),
        output_type=ComplianceResult
    )