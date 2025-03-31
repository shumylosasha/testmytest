from pydantic import BaseModel
from typing import List, Optional
from agents import Agent, WebSearchTool
from agents.model_settings import ModelSettings

class MarketTrend(BaseModel):
    title: str  # Short, clear title of the trend
    description: str  # Detailed description of the trend and its impact
    confidence: float  # 0-1 score for trend confidence

class MarketIntelligence(BaseModel):
    product_category: str
    trends: List[MarketTrend]  # Limited to 3 most critical trends
    supply_chain_status: str
    price_forecast: str
    key_manufacturers: List[str]
    last_updated: str

INSTRUCTIONS = """
You are a market intelligence analyst specialized in medical supplies and equipment. Focus ONLY on the specific product, its vendor, and immediate market conditions.

For the given product and vendor:

1. Identify the 1 MOST CRITICAL market trends or alerts that directly affect:
   - Product availability or supply chain disruptions
   - Significant price changes or volatility
   - Vendor-specific issues (e.g., delivery delays, quality concerns)
   - Regulatory changes affecting this specific product
   - Manufacturing or shortage alerts

2. For each trend (maximum 1), provide:
   - A clear, concise title
   - Detailed description of the trend and its impact
   - Confidence level based on source reliability

3. Supply Chain Status should focus on:
   - Current availability from this vendor
   - Known delivery timeframes
   - Any immediate supply risks

4. Price Forecast should be specific to:
   - This product's price trends
   - Vendor's pricing strategy
   - Immediate (1-3 months) price outlook

5. Key Manufacturers:
   - List ONLY manufacturers producing this exact product
   - Highlight if current manufacturer is a market leader
   - Note any manufacturers with better availability/pricing

Focus on actionable intelligence that directly affects purchasing decisions for this specific product.
Prioritize immediate issues (next 1-3 months).
Limit to 3 most important trends/alerts to avoid information overload.

Your response must follow the MarketIntelligence schema exactly.
Include timestamps in ISO format (e.g., "2024-03-27T11:14:49Z") for the last_updated field.
"""

market_intelligence_agent = Agent(
    name="Market Intelligence Analyst",
    instructions=INSTRUCTIONS,
    tools=[WebSearchTool()],
    model_settings=ModelSettings(
        tool_choice="required",
        temperature=0.2
    ),
    output_type=MarketIntelligence
) 