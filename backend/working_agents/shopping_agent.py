from pydantic import BaseModel
from agents import Agent, WebSearchTool
from agents.model_settings import ModelSettings
from typing import List, Optional, Dict

class ProductInfo(BaseModel):
    name: str
    manufacturer_id: str
    mpn: str
    packaging: str
    unit_of_measure: str
    price: str
    price_numeric: Optional[float] = None  # Keep this for sorting
    url: str
    website: str
    image_url: Optional[str] = None  # Add image URL field
    images: Optional[List[Dict[str, str]]] = None  # Add full images array

class ProductSearchResult(BaseModel):
    products: List[ProductInfo]
    """List of products found during the search"""

INSTRUCTIONS = """
You are a shopping assistant specialized in finding products online. For a given website and product query:
1. Search for the product on the specified website
2. Extract key product information including:
   - Product name
   - Manufacturer ID / SKU
   - MPN
   - Packaging details (10bx/cs, 200/bx, 4bx/cs)
   - Unit of Measure (Box/50, Each/1, Case/200, case, box, bx/cs, etc.)
   - Price
   - URL
   - Website name
   - Product image URL (look for main product image, thumbnail, or gallery first image)
3. Return only products that are relevant to the query
4. Format prices consistently (e.g. "$XX.XX")
5. Verify that URLs are valid and complete
6. For image URLs, ensure they are absolute URLs (not relative paths)
7. Include both the main image_url and a full images array with all found images

Return structured data for 3-5 most relevant products found.
"""

shopping_agent = Agent(
    name="Shopping agent",
    instructions=INSTRUCTIONS,
    tools=[WebSearchTool()],
    model_settings=ModelSettings(
        tool_choice="required",
        temperature=0.1
    ),
    output_type=ProductSearchResult
) 