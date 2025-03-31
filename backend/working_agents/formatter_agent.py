from pydantic import BaseModel
from typing import List, Optional
from agents import Agent
from agents.model_settings import ModelSettings
from .shopping_agent import ProductInfo  # Import ProductInfo from shopping_agent
from .compliance_agent import ComplianceResult
from .market_intelligence_agent import MarketTrend

class FormattedResults(BaseModel):
    summary: str
    """A brief summary of the search results"""
    
    total_products: int
    """Total number of unique products found"""
    
    price_range: str
    """Price range of found products"""
    
    products: List[ProductInfo]
    """List of formatted and deduplicated products"""
    
    market_trends: Optional[List[MarketTrend]]  # Add market trends
    compliance_results: Optional[List[ComplianceResult]]
    """Compliance check results for each product"""

INSTRUCTIONS = """
You are a data formatting specialist that organizes procurement search results and compliance data into a clear, structured format.
Your task is to:
1. Analyze the raw search results and compliance data
2. Remove duplicates based on product name and URL
3. Group similar products
4. Sort by price (lowest to highest)
5. Create a summary of findings including compliance status

Format prices consistently and highlight the best deals. Include compliance information in the summary.
"""

formatter_agent = Agent(
    name="FormatterAgent",
    instructions=INSTRUCTIONS,
    model="gpt-4o",
    output_type=FormattedResults
)