from __future__ import annotations

import asyncio
import time
from typing import Dict, List, Any, Optional
from typing_extensions import TypedDict
import json
from datetime import datetime

from agents import Runner, FileSearchTool, custom_span, gen_trace_id, trace, ItemHelpers, Agent
from working_agents.planner import planner_agent, MANDATORY_WEBSITES
from working_agents.shopping_agent import shopping_agent
from working_agents.formatter_agent import formatter_agent, FormattedResults
from working_agents.compliance_agent import create_compliance_agent, ComplianceResult
from working_agents.image_search_agent import image_search_agent, ImageSearchResult
from openai import OpenAI

class ProcurementManager:
    def __init__(self, printer):
        self.printer = printer
        self._compliance_file_id = None
        self._vector_store_id = None
        self.client = OpenAI()
        
    async def create_vector_store(self, name: str = "compliance_store") -> str:
        """Create a vector store for compliance documents"""
        response = self.client.vector_stores.create(
            name=name,
            metadata={"type": "compliance"}
        )
        print(f"Vector store created: {response.id}")
        self._vector_store_id = response.id
        return response.id

    async def get_or_create_vector_store(self, name: str = "compliance_store") -> str:
        """Get existing vector store or create new one"""
        if self._vector_store_id:
            return self._vector_store_id

        # List existing stores
        stores = self.client.vector_stores.list()
        for store in stores:
            if store.name == name:
                self._vector_store_id = store.id
                return store.id

        # Create new if not found
        return await self.create_vector_store(name)

    async def _generate_file_summary(self, file_content: str) -> str:
        """Generate a concise summary of the compliance document"""
        summary_prompt = f"""
        Please provide a brief summary (2-3 sentences) of this compliance document. 
        Focus on the key requirements and standards it defines:

        {file_content[:2000]}  # Using first 2000 chars for summary
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a compliance document summarizer. Be concise and focus on key requirements."},
                {"role": "user", "content": summary_prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()

    def _read_file_content(self, file_path: str) -> str:
        """
        Attempt to read file content with different encodings and handle binary files.
        Returns the file content as a string or a placeholder for binary files.
        """
        # List of encodings to try
        encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        
        # First, try to detect if it's a binary file
        with open(file_path, 'rb') as file:
            content = file.read()
            # Check if file might be binary (contains null bytes or too many non-printable characters)
            if b'\x00' in content[:1024] or sum(1 for c in content[:1024] if c < 32 or c > 126) > 1024 * 0.3:
                return "[Binary file detected - summary not available]"
        
        # Try different encodings
        for encoding in encodings:
            try:
                return content.decode(encoding)
            except UnicodeDecodeError:
                continue
                
        # If all encodings fail, return a placeholder
        return "[File encoding not supported - summary not available]"

    async def upload_compliance_doc(self, file_path: str, upload_time: float) -> str:
        """Upload compliance document to OpenAI and add to vector store"""
        # First read the file content for summary
        file_content = self._read_file_content(file_path)
        
        # Generate summary only if we could read the content
        if not file_content.startswith('['):
            summary = await self._generate_file_summary(file_content)
        else:
            summary = file_content  # Use the placeholder message as summary
        
        # Upload file
        with open(file_path, "rb") as file:
            response = self.client.files.create(
                file=file,
                purpose="assistants"
            )
        self._compliance_file_id = response.id
        
        # Store the metadata with summary
        if not hasattr(self, '_file_metadata'):
            self._file_metadata = {}
        self._file_metadata[response.id] = {
            'upload_time': upload_time,
            'summary': summary
        }

        # Get or create vector store
        vector_store_id = await self.get_or_create_vector_store()
        
        # Add file to vector store
        self.client.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=self._compliance_file_id,
            attributes={
                "type": "compliance", 
                "upload_time": upload_time,
                "summary": summary
            }
        )
        
        return self._compliance_file_id

    async def check_compliance(self, products: List[Dict[str, Any]], file_id: str) -> List[Dict[str, Any]]:
        """Check products against compliance document using vector store search"""
        compliance_results = []
        
        # Get vector store ID - this is causing the issue
        vector_store_id = await self.get_or_create_vector_store()
        
        for product in products:
            product_query = f"""
            Check if this product complies with requirements:
            Name: {product['name']}
            Price: {product['price']}
            Website: {product['website']}
            """
            
            with trace(f"Compliance check for {product['name']}"):
                # Create compliance agent with single vector store ID
                agent = create_compliance_agent(
                    file_id=file_id,
                    vector_store_id=vector_store_id  # Pass single ID instead of array
                )
                result = await Runner.run(agent, product_query)
                compliance_result = result.final_output_as(ComplianceResult)
                
                # Add product name to compliance result
                compliance_result.product_name = product['name']
                
                compliance_results.append(compliance_result)
        
        return compliance_results

    async def plan(self, query: str) -> list[str]:
        """
        First step: Just plan the searches and return the list of websites
        """
        trace_id = gen_trace_id()
        with trace("Search Planning", trace_id=trace_id):
            self.printer.update_item(
                "trace_id",
                f"View trace: https://platform.openai.com/traces/{trace_id}",
                is_done=True,
                hide_checkmark=True,
            )

            self.printer.update_item("planning", "Planning search strategy...")
            result = await Runner.run(
                planner_agent,
                f"Query: {query}",
            )
            search_plan = result.final_output_as(list[str])
            
            self.printer.update_item(
                "planning",
                f"Identified {len(search_plan)} websites to search",
                is_done=True,
            )
            return search_plan

    async def run(self, query: str, selected_websites: list[str]) -> Dict[str, Any]:
        """
        Second step: Run the search with user-selected websites and find product images
        """
        trace_id = gen_trace_id()
        with trace("Procurement Process", trace_id=trace_id):
            self.printer.update_item(
                "trace_id",
                f"View trace: https://platform.openai.com/traces/{trace_id}",
                is_done=True,
                hide_checkmark=True,
            )

            self.printer.update_item(
                "starting",
                "Starting procurement search...",
                is_done=True,
                hide_checkmark=True,
            )

            # Perform searches with selected websites
            search_results = await self._perform_searches(query, selected_websites)
            
            # Format results without compliance check
            formatted_results = await self._format_results(search_results, [], query)
            
            # Search for images for each product
            self.printer.update_item(
                "image_search",
                "Searching for product images...",
                is_done=False
            )
            
            products_with_images = []
            for product in formatted_results.products:
                try:
                    print(f"\nSearching for images for product: {product.name}")
                    image_result = await self.find_product_images(product.name, product.url)
                    product_dict = product.dict()
                    
                    # Add images to the product
                    if image_result['images']:
                        product_dict['images'] = image_result['images']
                        product_dict['image_url'] = image_result['images'][0]['url'] if image_result['images'] else None
                        print(f"Found {len(image_result['images'])} images for {product.name}")
                        for img in image_result['images']:
                            print(f"Image URL: {img['url']}")
                    else:
                        print(f"No images found for {product.name}")
                        product_dict['images'] = []
                        product_dict['image_url'] = None
                    
                    products_with_images.append(product_dict)
                except Exception as e:
                    print(f"Error finding images for {product.name}: {str(e)}")
                    product_dict = product.dict()
                    product_dict['images'] = []
                    product_dict['image_url'] = None
                    products_with_images.append(product_dict)
            
            self.printer.update_item(
                "image_search",
                f"Found images for {len(products_with_images)} products",
                is_done=True
            )
            
            # Display formatted results with images
            if products_with_images:
                self.printer.update_item(
                    "summary",
                    formatted_results.summary,
                    is_done=True,
                    hide_checkmark=True
                )
                
                self.printer.update_item(
                    "products",
                    f"Found {formatted_results.total_products} unique products\n"
                    f"Price range: {formatted_results.price_range}",
                    is_done=True,
                    hide_checkmark=True
                )
                
                # Update products with image information
                for idx, product in enumerate(products_with_images, 1):
                    product_info = f"Product: {product['name']}\n"
                    product_info += f"Price: {product['price']}\n"
                    product_info += f"Website: {product['website']}\n"
                    product_info += f"URL: {product['url']}\n"
                    
                    if product.get('images'):
                        product_info += "Images found:\n"
                        for img in product['images']:
                            product_info += f"- {img['url']}\n"
                    
                    self.printer.update_item(
                        f"product_{idx}",
                        product_info,
                        is_done=True,
                        hide_checkmark=True
                    )
            else:
                self.printer.update_item(
                    "products",
                    "No products found",
                    is_done=True
                )
            
            results = {
                "query": query,
                "summary": formatted_results.summary,
                "total_products": formatted_results.total_products,
                "price_range": formatted_results.price_range,
                "products": products_with_images
            }
            
            self.printer.update_item("final_results", "Search complete", is_done=True)
            return results

    async def check_compliance_for_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Separate method to check compliance for a list of products
        """
        if not self._compliance_file_id:
            return []
            
        self.printer.update_item(
            "compliance",
            "Checking compliance...",
            is_done=False
        )
        
        compliance_results = await self.check_compliance(products, self._compliance_file_id)
        
        self.printer.update_item(
            "compliance",
            "Compliance check complete",
            is_done=True
        )
        
        return compliance_results

    async def _perform_searches(self, query: str, websites: list[str]) -> List[Dict[str, Any]]:
        with custom_span("product_searches"):
            self.printer.update_item("searching", "Searching for products...")
            
            tasks = [
                asyncio.create_task(self._search_website(website, query)) 
                for website in websites
            ]
            
            num_completed = 0
            all_results = []
            for task in asyncio.as_completed(tasks):
                results = await task
                if results:
                    all_results.extend(results)
                num_completed += 1
                self.printer.update_item(
                    "searching", 
                    f"Searching... {num_completed}/{len(tasks)} websites completed"
                )
            
            self.printer.mark_item_done("searching")
            return all_results

    async def _search_website(self, website: str, query: str) -> List[Dict[str, Any]] | None:
        try:
            with custom_span(f"website_{website}"):
                search_query = f"site:{website} {query}"
                result = await Runner.run(shopping_agent, search_query)
                
                products = []
                for product in result.final_output.products:
                    products.append({
                        "name": product.name,
                        "price": product.price,
                        "url": product.url,
                        "website": website
                    })
                return products
        except Exception as e:
            print(f"Error searching website {website}: {str(e)}")
            return None

    async def _format_results(self, search_results: List[dict], compliance_results: List[dict], query: str) -> FormattedResults:
        """Format the search results and compliance data using the formatter agent"""
        self.printer.update_item(
            "formatting",
            "Organizing search results and compliance data...",
            is_done=False
        )
        
        # Combine search results with compliance data
        formatted_data = {
            "search_results": search_results,
            "compliance_results": compliance_results,
            "query": query
        }
        
        result = await Runner.run(
            formatter_agent,
            f"Format these search and compliance results for query '{query}': {formatted_data}"
        )
        
        self.printer.update_item(
            "formatting",
            "Results organized",
            is_done=True
        )
        
        return result.final_output_as(FormattedResults)

    async def run_streamed(self, query: str, selected_websites: list[str]):
        """
        Stream the procurement process using OpenAI Agents SDK streaming.
        Provides detailed streaming updates for each stage of the process.
        
        Args:
            query: The search query
            selected_websites: List of websites to search
            
        Yields:
            Streaming events for various stages of the procurement process
        """
        trace_id = gen_trace_id()
        with trace("Procurement Process", trace_id=trace_id):
            self.printer.update_item(
                "trace_id",
                f"View trace: https://platform.openai.com/traces/{trace_id}",
                is_done=True,
                hide_checkmark=True,
            )

            # Initialize streaming result
            result = Runner.run_streamed(
                shopping_agent,
                input=f"Search for {query} on the following websites: {selected_websites}"
            )
            
            async for event in result.stream_events():
                # Skip raw response events
                if event.type == "raw_response_event":
                    continue
                    
                # Handle agent updates
                elif event.type == "agent_updated_stream_event":
                    yield {
                        "type": "agent_update",
                        "agent": event.new_agent.name
                    }
                    
                # Handle run items (tool calls, outputs, etc)
                elif event.type == "run_item_stream_event":
                    if event.item.type == "tool_call_item":
                        yield {
                            "type": "search_progress",
                            "status": "searching",
                            "website": event.item.tool_name if hasattr(event.item, 'tool_name') else None
                        }
                    elif event.item.type == "tool_call_output_item":
                        products = []
                        try:
                            if event.item.output:
                                products = event.item.output.get('products', [])
                        except:
                            pass
                            
                        yield {
                            "type": "search_results",
                            "products": products
                        }
                    elif event.item.type == "message_output_item":
                        message = ItemHelpers.text_message_output(event.item)
                        if message:
                            yield {
                                "type": "message",
                                "content": message
                            }

            # Format results
            if result.final_output:
                formatted_results = await self._format_results(result.final_output, query)
                yield {
                    "type": "formatted_results",
                    "summary": formatted_results.summary,
                    "total_products": formatted_results.total_products,
                    "price_range": formatted_results.price_range,
                    "products": [product.dict() for product in formatted_results.products]
                }
                
                # Check compliance if document is uploaded
                if self._compliance_file_id:
                    yield {
                        "type": "compliance_check",
                        "status": "started"
                    }
                    
                    compliance_results = await self.check_compliance(
                        [p.dict() for p in formatted_results.products], 
                        self._compliance_file_id
                    )
                    
                    yield {
                        "type": "compliance_check",
                        "status": "completed",
                        "results": compliance_results
                    }
                    
            yield {
                "type": "complete"
            }

    async def list_compliance_files(self) -> List[Dict[str, Any]]:
        """List all uploaded compliance files"""
        response = self.client.files.list()
        files = []
        for file in response:
            file_data = {
                "id": file.id,
                "filename": file.filename,
                "purpose": file.purpose,
                "created_at": file.created_at,
                "status": file.status
            }
            
            # Add upload time and summary if available
            if hasattr(self, '_file_metadata') and file.id in self._file_metadata:
                metadata = self._file_metadata[file.id]
                file_data['upload_time'] = metadata.get('upload_time')
                file_data['summary'] = metadata.get('summary')
            
            files.append(file_data)
            
        return files

    async def get_file_content(self, file_id: str) -> str:
        """Retrieve content of an uploaded compliance file"""
        try:
            response = self.client.files.content(file_id)
            return response.text
        except Exception as e:
            print(f"Error retrieving file content: {str(e)}")
            raise

    async def delete_compliance_file(self, file_id: str) -> bool:
        """Delete a compliance file from OpenAI"""
        try:
            response = self.client.files.delete(file_id)
            
            # Remove from local metadata if exists
            if hasattr(self, '_file_metadata') and file_id in self._file_metadata:
                del self._file_metadata[file_id]
                
            return response.deleted
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            raise

    async def generate_rfq(self, products: List[dict], quantities: List[int]) -> dict:
        """Generate RFQ document for selected products"""
        rfq_id = f"RFQ_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        rfq_document = {
            "id": rfq_id,
            "date": datetime.now().isoformat(),
            "items": [
                {
                    "product": product,
                    "quantity": quantity
                }
                for product, quantity in zip(products, quantities)
            ],
            "terms": {
                "compliance": "Product must be HIPPA, ISO, GMP Compliant",
                "payment": "Payment terms will be NET 60",
                "validity": "All prices must be valid for 30 calendar days from the date of quotation"
            }
        }
        
        return rfq_document

    async def send_rfq(self, rfq_document: dict, vendor_emails: List[str]) -> dict:
        """Mock sending RFQ to vendors"""
        # In a real implementation, this would send actual emails
        # For now, we'll just simulate the sending
        
        return {
            "success": True,
            "message": f"RFQ {rfq_document['id']} sent to {len(vendor_emails)} vendors",
            "sent_to": vendor_emails
        }

    async def find_product_images(self, product_name: str, website_url: str) -> ImageSearchResult:
        """
        Find product images on a specific website using the image search agent
        """
        with custom_span("product_image_search"):
            self.printer.update_item(
                "image_search",
                f"Searching for images of {product_name} on {website_url}...",
                is_done=False
            )
            
            try:
                result = await Runner.run(
                    image_search_agent,
                    f"{product_name}|{website_url}"
                )
                
                self.printer.update_item(
                    "image_search",
                    f"Found {len(result['images'])} images for {product_name}",
                    is_done=True
                )
                
                return result
                
            except Exception as e:
                self.printer.update_item(
                    "image_search",
                    f"Error searching for images: {str(e)}",
                    is_done=True
                )
                return {
                    'product_name': product_name,
                    'images': [],
                    'error': str(e)
                }