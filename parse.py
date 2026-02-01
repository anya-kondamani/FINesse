"""
Financial Statement Tutor - Backend API
Handles 10-K parsing with LlamaIndex and LLM-based answer generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from typing import Dict, List, Optional
import re

# LlamaIndex imports
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Document
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import Settings

from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
#CORS(app)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

# Configure LlamaIndex with Gemini
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

Settings.llm = Gemini(
    api_key=GEMINI_API_KEY,
    model="models/gemini-2.5-pro"
)
Settings.embed_model = GeminiEmbedding(
    api_key=GEMINI_API_KEY,
    model_name="models/embedding-001"
)

# Global storage for parsed documents
parsed_documents = {}


class FinancialDocumentParser:
    """Parse and analyze 10-K filings using LlamaIndex"""
    
    def __init__(self):
        self.index = None
        self.query_engine = None
        
    def parse_10k(self, file_path: str, company_id: str) -> Dict:
        """
        Parse a 10-K filing and extract structured financial data
        
        Args:
            file_path: Path to the uploaded 10-K file
            company_id: Unique identifier for the company
            
        Returns:
            Dictionary containing parsed financial data
        """
        # Load and parse the document
        documents = SimpleDirectoryReader(
            input_files=[file_path]
        ).load_data()
        
        # Create vector index for semantic search
        self.index = VectorStoreIndex.from_documents(documents)
        self.query_engine = self.index.as_query_engine(
            similarity_top_k=5,
            response_mode="tree_summarize"
        )
        
        # Extract key financial metrics
        financial_data = self._extract_financial_metrics()
        
        # Extract company information
        company_info = self._extract_company_info()
        
        # Extract risk factors
        risk_factors = self._extract_risk_factors()
        
        # Extract business description
        business_desc = self._extract_business_description()
        
        return {
            "company_id": company_id,
            "company_name": company_info.get("name", "Unknown Company"),
            "ticker": company_info.get("ticker", "N/A"),
            "fiscal_year": company_info.get("fiscal_year", "2024"),
            "financials": financial_data,
            "industry_context": company_info.get("industry", "General"),
            "risk_factors": risk_factors,
            "business_description": business_desc,
            "index_created": True
        }
    
    def _extract_financial_metrics(self) -> Dict:
        """Extract key financial metrics from the 10-K"""
        
        metrics_queries = {
            "revenue": "What was the total revenue or net sales for the most recent fiscal year? Provide only the number.",
            "net_income": "What was the net income for the most recent fiscal year? Provide only the number.",
            "total_assets": "What were the total assets at the end of the most recent fiscal year? Provide only the number.",
            "total_liabilities": "What were the total liabilities at the end of the most recent fiscal year? Provide only the number.",
            "current_assets": "What were the current assets at the end of the most recent fiscal year? Provide only the number.",
            "current_liabilities": "What were the current liabilities at the end of the most recent fiscal year? Provide only the number.",
            "operating_cash_flow": "What was the operating cash flow for the most recent fiscal year? Provide only the number.",
            "capital_expenditures": "What were the capital expenditures for the most recent fiscal year? Provide only the number."
        }
        
        financials = {}
        
        for metric, query in metrics_queries.items():
            try:
                response = self.query_engine.query(query)
                # Extract numerical value from response
                value = self._extract_number(str(response))
                financials[metric] = value
            except Exception as e:
                print(f"Error extracting {metric}: {e}")
                financials[metric] = 0
        
        # Calculate derived metrics
        if financials.get("operating_cash_flow") and financials.get("capital_expenditures"):
            financials["free_cash_flow"] = (
                financials["operating_cash_flow"] - financials["capital_expenditures"]
            )
        else:
            financials["free_cash_flow"] = 0
            
        return financials
    
    def _extract_company_info(self) -> Dict:
        """Extract company identification and industry information"""
        
        try:
            name_response = self.query_engine.query(
                "What is the full legal name of the company? Provide only the company name."
            )
            
            ticker_response = self.query_engine.query(
                "What is the stock ticker symbol? Provide only the ticker."
            )
            
            industry_response = self.query_engine.query(
                "What industry or sector does this company operate in? Provide a brief description."
            )
            
            fiscal_year_response = self.query_engine.query(
                "What fiscal year does this 10-K report cover? Provide only the year."
            )
            
            return {
                "name": str(name_response).strip(),
                "ticker": str(ticker_response).strip().upper(),
                "industry": str(industry_response).strip(),
                "fiscal_year": str(fiscal_year_response).strip()
            }
        except Exception as e:
            print(f"Error extracting company info: {e}")
            return {
                "name": "Unknown Company",
                "ticker": "N/A",
                "industry": "General",
                "fiscal_year": "2024"
            }
    
    def _extract_risk_factors(self) -> List[str]:
        """Extract key risk factors from the 10-K"""
        
        try:
            response = self.query_engine.query(
                "List the top 5 most significant risk factors mentioned in the Risk Factors section. "
                "Provide brief descriptions for each."
            )
            
            # Parse response into list
            risk_text = str(response)
            risks = [r.strip() for r in risk_text.split('\n') if r.strip() and len(r.strip()) > 10]
            return risks[:5] if risks else ["Market volatility", "Competition", "Regulatory changes"]
            
        except Exception as e:
            print(f"Error extracting risk factors: {e}")
            return ["Market volatility", "Competition", "Regulatory changes"]
    
    def _extract_business_description(self) -> str:
        """Extract a summary of the company's business"""
        
        try:
            response = self.query_engine.query(
                "Provide a brief 2-3 sentence summary of the company's primary business operations "
                "and revenue sources."
            )
            return str(response).strip()
        except Exception as e:
            print(f"Error extracting business description: {e}")
            return "Business description not available"
    
    def _extract_number(self, text: str) -> float:
        """Extract numerical value from text response"""
        
        # Remove common words and clean text
        text = text.replace(',', '').replace('$', '')
        
        # Look for numbers with million/billion indicators
        billion_match = re.search(r'(\d+\.?\d*)\s*billion', text.lower())
        if billion_match:
            return float(billion_match.group(1)) * 1_000_000_000
        
        million_match = re.search(r'(\d+\.?\d*)\s*million', text.lower())
        if million_match:
            return float(million_match.group(1)) * 1_000_000
        
        # Look for standalone numbers
        number_match = re.search(r'(\d+\.?\d*)', text)
        if number_match:
            return float(number_match.group(1))
        
        return 0
    
    def generate_llm_answer(self, question: str, context: str) -> str:
        """
        Generate an answer to a qualitative question using LLM with document context
        
        Args:
            question: The question to answer
            context: Additional context about what to focus on
            
        Returns:
            Generated answer as string
        """
        if not self.query_engine:
            return "Error: Document not indexed. Please upload a 10-K filing first."
        
        prompt = f"""You are a financial analysis tutor helping students learn from real 10-K filings.

Question: {question}

Context to consider: {context}

Provide a comprehensive, educational answer that:
1. Directly addresses the question using specific information from this company's 10-K
2. Explains the financial reasoning and concepts involved
3. References specific data points, metrics, or disclosures from the filing
4. Highlights key insights a student should learn
5. Uses clear, accessible language appropriate for someone learning financial analysis

Structure your response with clear paragraphs and avoid bullet points."""

        try:
            response = self.query_engine.query(prompt)
            return str(response)
        except Exception as e:
            print(f"Error generating LLM answer: {e}")
            return "Error generating answer. Please try again."


# API Endpoints

@app.route('/api/upload', methods=['POST'])
def upload_10k():
    """Handle 10-K file upload and parsing"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save file temporarily
    upload_dir = 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)
    
    # Generate company ID
    company_id = file.filename.split('.')[0]
    
    # Parse document
    try:
        parser = FinancialDocumentParser()
        parsed_data = parser.parse_10k(file_path, company_id)
        
        # Store parser instance for later queries
        parsed_documents[company_id] = parser
        
        return jsonify({
            'success': True,
            'data': parsed_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/generate-answer', methods=['POST'])
def generate_answer():
    """Generate LLM-based answer to a question"""
    
    data = request.json
    company_id = data.get('company_id')
    question = data.get('question')
    context = data.get('context', '')
    
    if not company_id or not question:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    if company_id not in parsed_documents:
        return jsonify({'error': 'Company document not found. Please upload first.'}), 404
    
    parser = parsed_documents[company_id]
    
    try:
        answer = parser.generate_llm_answer(question, context)
        return jsonify({
            'success': True,
            'answer': answer
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/query', methods=['POST'])
def query_document():
    """Query the document index directly"""
    
    data = request.json
    company_id = data.get('company_id')
    query = data.get('query')
    
    if not company_id or not query:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    if company_id not in parsed_documents:
        return jsonify({'error': 'Company document not found'}), 404
    
    parser = parsed_documents[company_id]
    
    try:
        response = parser.query_engine.query(query)
        return jsonify({
            'success': True,
            'response': str(response)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'documents_loaded': len(parsed_documents)
    }), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)