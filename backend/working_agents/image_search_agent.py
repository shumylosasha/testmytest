from typing import List, Optional
import requests
from bs4 import BeautifulSoup
from agents import Agent, Runner
from typing_extensions import TypedDict
import logging
import re

class ProductImage(TypedDict):
    url: str
    alt_text: Optional[str]
    source_url: str

class ImageSearchResult(TypedDict):
    product_name: str
    images: List[ProductImage]
    error: Optional[str]

class ImageSearchAgent(Agent):
    def __init__(self):
        super().__init__(
            name="image_search_agent",
            instructions="""
            You are an agent that searches for product images on specified websites.
            You will receive a product name and website URL, and should return a list of image URLs found.
            """
        )
        
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text"""
        # Remove special characters and split into words
        words = re.findall(r'\w+', text.lower())
        # Filter out common words and short words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        return [word for word in words if word not in common_words and len(word) > 2]
        
    async def _search_images(self, product_name: str, website_url: str) -> ImageSearchResult:
        """
        Search for product images on a specific website using BeautifulSoup
        """
        try:
            # Add headers to mimic a browser request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            }
            
            # Make the request
            response = requests.get(website_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract keywords from product name
            product_keywords = self._extract_keywords(product_name)
            logging.info(f"Searching for images with keywords: {product_keywords}")
            
            # Try different common image selectors
            found_images = []
            
            # Common product image selectors for medical supply websites
            selectors = [
                # Main product image selectors
                "img[alt*='{}']",  # Images with alt text containing product name
                "img[src*='product']",  # Images with 'product' in src
                "img[src*='{}']",  # Images with product name in src
                
                # Specific medical supply website selectors
                ".product-image img",  # Common product image class
                "#product-image img",  # Common product image ID
                "[data-testid*='product-image'] img",  # Data test ID containing product-image
                ".product-gallery img",  # Product gallery images
                ".product-thumbnail img",  # Product thumbnail images
                ".product-main-image img",  # Main product image
                ".product-detail-image img",  # Product detail images
                ".product-img img",  # Generic product image class
                
                # Additional medical supply specific selectors
                ".product-media img",  # Product media section
                ".product-photos img",  # Product photos section
                ".product-images img",  # Product images section
                ".product-view img",  # Product view section
                ".product-picture img",  # Product picture section
                ".product-photo img",  # Product photo section
                ".product-image-gallery img",  # Product image gallery
                ".product-image-container img",  # Product image container
                ".product-image-wrapper img",  # Product image wrapper
                ".product-image-slider img",  # Product image slider
                ".product-image-carousel img",  # Product image carousel
                
                # Generic image selectors with product context
                "img[class*='product']",  # Images with 'product' in class
                "img[class*='item']",  # Images with 'item' in class
                "img[class*='main']",  # Images with 'main' in class
                "img[class*='gallery']",  # Images with 'gallery' in class
                "img[class*='photo']",  # Images with 'photo' in class
                "img[class*='picture']",  # Images with 'picture' in class
                "img[class*='media']",  # Images with 'media' in class
                
                # Data attribute selectors
                "img[data-product-image]",  # Data attribute for product images
                "img[data-image-type='product']",  # Data attribute for product image type
                "img[data-image='product']",  # Data attribute for product image
                
                # Specific medical supply website patterns
                "img[src*='medical']",  # Images with 'medical' in src
                "img[src*='supply']",  # Images with 'supply' in src
                "img[src*='healthcare']",  # Images with 'healthcare' in src
                "img[src*='hospital']",  # Images with 'hospital' in src
            ]
            
            # Try each selector
            for selector in selectors:
                try:
                    # Format selector with product name if needed
                    formatted_selector = selector.format(product_name.lower())
                    elements = soup.select(formatted_selector)
                    
                    for element in elements:
                        try:
                            # Get image URL
                            img_url = element.get('src')
                            if not img_url:
                                continue
                                
                            # Handle relative URLs
                            if img_url.startswith('//'):
                                img_url = f"https:{img_url}"
                            elif img_url.startswith('/'):
                                img_url = f"{website_url.rstrip('/')}{img_url}"
                            elif not img_url.startswith(('http://', 'https://')):
                                img_url = f"{website_url.rstrip('/')}/{img_url.lstrip('/')}"
                            
                            # Get alt text
                            alt_text = element.get('alt', '')
                            
                            # Extract keywords from alt text and URL
                            alt_keywords = self._extract_keywords(alt_text)
                            url_keywords = self._extract_keywords(img_url)
                            
                            # Check if any product keywords match with alt text or URL keywords
                            has_matching_keyword = any(
                                keyword in alt_keywords or keyword in url_keywords
                                for keyword in product_keywords
                            )
                            
                            # Also check for medical supply related terms
                            has_medical_context = any(
                                term in alt_text.lower() or term in img_url.lower()
                                for term in ['medical', 'supply', 'healthcare', 'hospital', 'product']
                            )
                            
                            if (has_matching_keyword or has_medical_context) and img_url.startswith('http'):
                                found_images.append({
                                    'url': img_url,
                                    'alt_text': alt_text,
                                    'source_url': website_url
                                })
                        except Exception as e:
                            logging.warning(f"Error processing image element: {str(e)}")
                            continue
                            
                except Exception as e:
                    logging.warning(f"Error with selector {selector}: {str(e)}")
                    continue
            
            # If no images found with selectors, try finding all images and filter by keywords
            if not found_images:
                all_images = soup.find_all('img')
                for img in all_images:
                    try:
                        img_url = img.get('src')
                        if not img_url:
                            continue
                            
                        # Handle relative URLs
                        if img_url.startswith('//'):
                            img_url = f"https:{img_url}"
                        elif img_url.startswith('/'):
                            img_url = f"{website_url.rstrip('/')}{img_url}"
                        elif not img_url.startswith(('http://', 'https://')):
                            img_url = f"{website_url.rstrip('/')}/{img_url.lstrip('/')}"
                        
                        # Get alt text
                        alt_text = img.get('alt', '')
                        
                        # Extract keywords from alt text and URL
                        alt_keywords = self._extract_keywords(alt_text)
                        url_keywords = self._extract_keywords(img_url)
                        
                        # Check if any product keywords match with alt text or URL keywords
                        has_matching_keyword = any(
                            keyword in alt_keywords or keyword in url_keywords
                            for keyword in product_keywords
                        )
                        
                        # Also check for medical supply related terms
                        has_medical_context = any(
                            term in alt_text.lower() or term in img_url.lower()
                            for term in ['medical', 'supply', 'healthcare', 'hospital', 'product']
                        )
                        
                        if (has_matching_keyword or has_medical_context) and img_url.startswith('http'):
                            found_images.append({
                                'url': img_url,
                                'alt_text': alt_text,
                                'source_url': website_url
                            })
                    except Exception as e:
                        logging.warning(f"Error processing fallback image: {str(e)}")
                        continue
            
            # Log the results
            if found_images:
                logging.info(f"Found {len(found_images)} images for {product_name}")
                for img in found_images:
                    logging.info(f"Image URL: {img['url']}")
            else:
                logging.warning(f"No images found for {product_name}")
            
            return {
                'product_name': product_name,
                'images': found_images,
                'error': None
            }
                
        except Exception as e:
            logging.error(f"Error searching for images: {str(e)}")
            return {
                'product_name': product_name,
                'images': [],
                'error': str(e)
            }
    
    async def run(self, input_text: str) -> ImageSearchResult:
        """
        Run the image search agent
        Expected input format: "product_name|website_url"
        """
        try:
            product_name, website_url = input_text.split('|')
            return await self._search_images(product_name.strip(), website_url.strip())
        except ValueError:
            return {
                'product_name': '',
                'images': [],
                'error': 'Invalid input format. Expected: "product_name|website_url"'
            }

# Create the agent instance
image_search_agent = ImageSearchAgent() 