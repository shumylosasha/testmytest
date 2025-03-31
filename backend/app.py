from __future__ import annotations

from manager import ProcurementManager
from printer import Printer
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import json
from datetime import datetime
from typing import List, Dict
import pandas as pd
import PyPDF2
import io
from openai import OpenAI
from dotenv import load_dotenv
from working_agents.market_intelligence_agent import market_intelligence_agent, MarketIntelligence
from agents import Runner, FileSearchTool, custom_span, gen_trace_id, trace, ItemHelpers, Agent
from working_agents.chat_agent import chat_agent, ActionPlan
from working_agents.image_search_agent import ImageSearchResult

# Load environment variables
load_dotenv()

# Configure OpenAI API key
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Load shared inventory data
def load_inventory_data():
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'shared_data/inventory.json')
        print(f"Loading inventory data from: {file_path}")  # Debug print
        
        if not os.path.exists(file_path):
            print(f"Error: File not found at {file_path}")  # Debug print
            return {"items": []}
            
        with open(file_path, 'r') as f:
            data = json.load(f)
            print(f"Successfully loaded {len(data.get('items', []))} items")  # Debug print
            return data
    except Exception as e:
        print(f"Error loading inventory data: {str(e)}")  # Debug print
        return {"items": []}

app = Flask(__name__)
# Enable CORS for all routes with all origins
CORS(app)

# Configure the app
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB max file size
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Add the datetime filter
@app.template_filter('datetime')
def format_datetime(value):
    dt = datetime.fromtimestamp(value)
    return dt.strftime('%Y-%m-%d %H:%M:%S')

# Add these allowed extensions near the top with other configs
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/search', methods=['GET', 'POST'])
async def search():
    if request.method == 'POST':
        query = request.form['query']
        action = request.form.get('action')
        printer = Printer()
        manager = ProcurementManager(printer)
        
        # Set compliance file ID from session if available
        if session.get('compliance_file_id'):
            manager._compliance_file_id = session.get('compliance_file_id')

        try:
            if action == 'plan':
                # First step - get the planned websites
                planned_websites = await manager.plan(query)
                return render_template('search.html', 
                                     query=query,
                                     planned_websites=planned_websites)
            
            elif action == 'search':
                # Second step - run actual search with selected websites
                selected_websites = request.form.getlist('websites')
                results = await manager.run(query, selected_websites)
                return render_template('search.html',
                                     query=query,
                                     results=results)
        finally:
            printer.end()

    return render_template('search.html')

@app.route('/api/compliance', methods=['GET', 'POST'])
async def compliance():
    printer = Printer()
    manager = ProcurementManager(printer)
    message = None
    message_type = None
    
    try:
        if request.method == 'POST':
            if 'file' not in request.files:
                return render_template('compliance.html', 
                                     message='No file selected', 
                                     message_type='error')
            
            file = request.files['file']
            if file.filename == '':
                return render_template('compliance.html', 
                                     message='No file selected', 
                                     message_type='error')

            if file:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)

                try:
                    # Add timestamp when uploading the file
                    upload_time = datetime.now().timestamp()
                    
                    # Upload file and add to vector store
                    file_id = await manager.upload_compliance_doc(filepath, upload_time)
                    session['compliance_file_id'] = file_id
                    
                    message = 'File uploaded successfully and added to vector store!'
                    message_type = 'success'
                except Exception as e:
                    message = f'Error uploading file: {str(e)}'
                    message_type = 'error'
                finally:
                    # Clean up the temporary file
                    os.remove(filepath)

        # Get list of compliance files
        compliance_files = await manager.list_compliance_files()
        
        # Ensure each file in compliance_files has an upload_time
        if compliance_files:
            for file in compliance_files:
                if 'upload_time' not in file:
                    file['upload_time'] = datetime.now().timestamp()  # Default to current time if not set
        
        return render_template('compliance.html', 
                             compliance_files=compliance_files,
                             message=message,
                             message_type=message_type)
    finally:
        printer.end()

@app.route('/api/view_file/<file_id>')
async def view_file(file_id):
    printer = Printer()
    manager = ProcurementManager(printer)
    
    try:
        content = await manager.get_file_content(file_id)
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        printer.end()

@app.route('/api/delete_file/<file_id>', methods=['POST'])
async def delete_file(file_id):
    printer = Printer()
    manager = ProcurementManager(printer)
    
    try:
        # Get vector store ID
        vector_store_id = await manager.get_or_create_vector_store()
        
        # First remove file from vector store
        try:
            await manager.client.vector_stores.files.delete(
                vector_store_id=vector_store_id,
                file_id=file_id
            )
        except Exception as e:
            print(f"Error removing file from vector store: {str(e)}")
        
        # Then delete the file itself
        deleted = await manager.delete_compliance_file(file_id)
        if deleted:
            # If this was the current compliance file, remove it from session
            if session.get('compliance_file_id') == file_id:
                session.pop('compliance_file_id')
            return jsonify({"success": True, "message": "File deleted successfully"})
        else:
            return jsonify({"success": False, "message": "Failed to delete file"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        printer.end()

@app.route('/api/orders')
def orders():
    # TODO: In the future, fetch orders from your database
    mock_orders = [
        {
            'id': 1,
            'created_at': datetime.now(),
            'status': 'Pending',
            'items_count': 0  # Changed to use items_count instead of items list
        }
    ]
    return render_template('orders.html', orders=mock_orders)

@app.route('/api/order/new')
def create_order():
    return render_template('order_detail.html', order=None)

@app.route('/api/order/<int:order_id>')
def view_order(order_id):
    # TODO: In the future, fetch order from your database
    # For now, we'll use mock data
    mock_order = {
        'id': order_id,
        'items': [
            {
                'product_name': 'Sample Product',
                'manufacturer_id': 'MFG123',
                'packaging': 'Box',
                'unit_of_measure': 'Pieces',
                'quantity': 10
            }
        ]
    }
    return render_template('order_detail.html', order=mock_order)

@app.route('/api/order/save', methods=['POST'])
def save_order():
    try:
        data = request.get_json()
        # TODO: In the future, save order to your database
        # For now, we'll just return success
        return jsonify({
            'success': True,
            'message': 'Order saved successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/api/plan_search', methods=['POST'])
async def plan_search():
    printer = Printer()
    manager = ProcurementManager(printer)
    
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400
            
        query = data['query']
        planned_websites = await manager.plan(query)
        return jsonify({'websites': planned_websites})
    except Exception as e:
        print(f"Error in plan_search: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        printer.end()

@app.route('/api/run_search', methods=['POST'])
async def run_search():
    printer = Printer()
    manager = ProcurementManager(printer)
    
    try:
        data = request.get_json()
        if not data or 'query' not in data or 'websites' not in data:
            return jsonify({'error': 'Missing query or websites'}), 400
            
        query = data['query']
        websites = data['websites']
        
        results = await manager.run(query, websites)
        return jsonify(results)
    except Exception as e:
        print(f"Error in run_search: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        printer.end()

@app.route('/api/check_compliance', methods=['POST'])
async def check_compliance():
    printer = Printer()
    manager = ProcurementManager(printer)
    
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        if not products:
            return jsonify({'error': 'No products provided'}), 400
            
        # Check if compliance file is uploaded
        if not session.get('compliance_file_id'):
            return jsonify({'error': 'No compliance file uploaded'}), 400
            
        # Set compliance file ID from session
        manager._compliance_file_id = session.get('compliance_file_id')
            
        # Run compliance check
        compliance_results = await manager.check_compliance_for_products(products)
        
        return jsonify({
            'success': True,
            'compliance_results': [
                {
                    'product_name': result.product_name,
                    'compliant': result.compliant,
                    'explanation': result.explanation
                }
                for result in compliance_results
            ]
        })
    except Exception as e:
        print(f"Error in compliance check: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        printer.end()

@app.route('/api/inventory')
def inventory():
    try:
        inventory_data = load_inventory_data()
        return jsonify(inventory_data['items'])
    except Exception as e:
        print(f"Error in inventory endpoint: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route('/api/inventory/add', methods=['POST'])
def add_inventory_item():
    try:
        data = request.get_json()
        # TODO: Add item to database
        return jsonify({
            'success': True,
            'message': 'Item added successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/api/inventory/update/<item_code>', methods=['PUT'])
def update_inventory_item(item_code):
    try:
        data = request.get_json()
        # TODO: Update item in database
        return jsonify({
            'success': True,
            'message': 'Item updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/api/inventory/delete/<item_code>', methods=['DELETE'])
def delete_inventory_item(item_code):
    try:
        # TODO: Delete item from database
        return jsonify({
            'success': True,
            'message': 'Item deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/api/inventory/item/<item_id>')
def inventory_item(item_id):
    try:
        print(f"Received request for item ID: {item_id}")  # Debug print
        inventory_data = load_inventory_data()
        print(f"Loaded inventory data with {len(inventory_data.get('items', []))} items")  # Debug print
        
        item = next((item for item in inventory_data['items'] if item['id'] == item_id), None)
        
        if item is None:
            print(f"Item not found with ID: {item_id}")  # Debug print
            return jsonify({'error': 'Item not found'}), 404
            
        print(f"Found item: {item['name']}")  # Debug print
        return jsonify(item)
    except Exception as e:
        print(f"Error in inventory_item endpoint: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route('/api/inventory/upload', methods=['POST'])
async def upload_inventory():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'})
        
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Invalid file type'})

    try:
        # Add debug prints
        print(f"Current working directory: {os.getcwd()}")
        print(f"Upload folder path: {app.config['UPLOAD_FOLDER']}")
        print(f"Upload folder exists: {os.path.exists(app.config['UPLOAD_FOLDER'])}")
        print(f"Attempting to upload file: {file.filename}")
        
        # Create uploads directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Full file path: {filepath}")
        
        file.save(filepath)
        print(f"File saved successfully: {os.path.exists(filepath)}")

        # Process file based on type
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf':
            text_content = extract_pdf_text(filepath)
            items = await process_text_with_gpt(text_content)
        else:
            # Handle CSV/Excel
            if file_ext in ['csv']:
                df = pd.read_csv(filepath)
            else:  # xlsx or xls
                df = pd.read_excel(filepath)
            items = await process_dataframe_with_gpt(df.to_json(orient='records'))

        # Clean up the temporary file
        if os.path.exists(filepath):
            os.remove(filepath)
            print("Temporary file removed successfully")
        
        # Return both success status and processed items
        return jsonify({
            'success': True, 
            'message': 'File processed successfully',
            'items': items
        })

    except Exception as e:
        print(f"Error during file processing: {str(e)}")
        # Clean up the temporary file if it exists
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'success': False, 'message': str(e)})

def extract_pdf_text(filepath):
    text = ""
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

async def process_text_with_gpt(text):
    """Process extracted text with GPT to identify inventory items"""
    prompt = f"""
    Parse the following text and return a JSON object containing an 'items' array. Each item in the array should have these exact fields:
    - product_name: The name of the product
    - item_code: The product's unique identifier
    - unit_size: The size per unit (e.g., "100/box")
    - unit_type: The type of unit (e.g., "box", "case", "each")
    - current_stock: The current quantity in stock (as a number)
    - reorder_level: The minimum stock level before reordering (as a number)
    
    Use reasonable default values for any fields that cannot be determined.
    Your response must be a valid JSON object.
    
    Text to parse:
    {text}
    """
    
    response = OpenAI().chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that parses inventory documents and returns JSON. Your response must be a valid JSON object with an 'items' array."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    result = json.loads(response.choices[0].message.content)
    return result.get('items', [])

async def process_dataframe_with_gpt(json_data):
    """Process structured data with GPT to standardize format"""
    prompt = f"""
    Convert the following inventory data into a JSON object containing an 'items' array.
    Each item must have these exact fields:
    - product_name
    - item_code (if available)
    - unit_size
    - unit_type
    - current_stock
    - reorder_level
    
    Your response must be a valid JSON object.
    
    Data to process:
    {json_data}
    """
    
    response = OpenAI().chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that standardizes inventory data into JSON format. Your response must be a valid JSON object with an 'items' array."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    result = json.loads(response.choices[0].message.content)
    return result.get('items', [])

@app.route('/api/send_rfq', methods=['POST'])
async def send_rfq():
    try:
        data = request.get_json()
        emails = data.get('emails', [])
        content = data.get('content', '')
        
        if not emails or not content:
            return jsonify({
                'success': False,
                'message': 'Missing required data'
            }), 400
            
        # In a real implementation, you would:
        # 1. Format the content properly
        # 2. Send actual emails to vendors
        # 3. Store the RFQ in a database
        
        # For now, we'll just simulate success
        return jsonify({
            'success': True,
            'message': f'RFQ sent to {len(emails)} vendors'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/market_intelligence', methods=['POST'])
async def get_market_intelligence():
    try:
        data = request.get_json()
        product_name = data.get('product_name')
        category = data.get('category', '')
        manufacturer = data.get('manufacturer', '')
        price = data.get('price', '')
        vendor = data.get('vendor', '')

        if not product_name:
            return jsonify({'error': 'Product name is required'}), 400

        query = f"""
        Analyze market intelligence for {product_name} in category {category}.
        Current manufacturer: {manufacturer}
        Current price: {price}
        Current vendor: {vendor}
        
        Provide detailed market analysis including:
        - Price trends and forecasts
        - Supply chain status
        - Key manufacturers and market leaders
        - Technology and regulatory updates
        """

        result = await Runner.run(market_intelligence_agent, query)
        market_data = result.final_output_as(MarketIntelligence)
        return jsonify(market_data.dict())

    except Exception as e:
        app.logger.error(f"Market intelligence error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/plan', methods=['POST'])
async def create_chat_plan():
    try:
        data = request.get_json()
        message = data.get('message')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
            
        # Create action plan using chat agent
        result = await Runner.run(chat_agent, message)
        action_plan = result.final_output_as(ActionPlan)
        
        return jsonify({
            'success': True,
            'plan': action_plan.dict()
        })
        
    except Exception as e:
        print(f"Error in chat plan: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/execute', methods=['POST'])
async def execute_chat_plan():
    try:
        data = request.get_json()
        plan = data.get('plan')
        
        if not plan:
            return jsonify({'error': 'No plan provided'}), 400
            
        printer = Printer()
        manager = ProcurementManager(printer)
        
        try:
            # Execute the plan based on action type
            if plan['action_type'] in ['price_check', 'product_search']:
                results = await manager.run(plan['query'], plan['websites'])
                return jsonify({
                    'success': True,
                    'results': results
                })
            else:
                return jsonify({
                    'error': f"Unsupported action type: {plan['action_type']}"
                }), 400
                
        finally:
            printer.end()
            
    except Exception as e:
        print(f"Error executing chat plan: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search_images', methods=['POST'])
async def search_images():
    try:
        data = request.get_json()
        product_name = data.get('product_name')
        website_url = data.get('website_url')
        
        if not product_name or not website_url:
            return jsonify({
                'success': False,
                'message': 'Product name and website URL are required'
            }), 400
            
        printer = Printer()
        manager = ProcurementManager(printer)
        
        try:
            result = await manager.find_product_images(product_name, website_url)
            return jsonify({
                'success': True,
                'result': result
            })
        finally:
            printer.end()
            
    except Exception as e:
        print(f"Error in image search: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Flask server...")  # Debug print
    app.run(host='localhost', port=5001, debug=True) 