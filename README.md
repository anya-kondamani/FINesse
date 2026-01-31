# Financial Statement Tutor

An interactive web application that helps students master financial analysis using real company 10-K filings. Features AI-powered question generation, adaptive difficulty levels, and comprehensive explanations.

## Features

### 🎯 Learning Modes
- **Quiz Mode**: Test knowledge with instant feedback and scoring
- **Practice Mode**: Learn at your own pace with detailed explanations

### 📊 Question Types
- **Easy**: Basic ratio calculations (Current Ratio, Profit Margin, etc.)
- **Medium**: Leverage analysis and qualitative business questions
- **Hard**: DCF modeling and strategic analysis requiring synthesis

### 🤖 AI-Powered Analysis
- LlamaIndex for intelligent document parsing
- Gemini API for generating contextual answers to business questions
- Real-time financial data extraction from 10-K filings

## Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + Tailwind)│
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│  Flask Backend   │
│  ┌────────────┐ │
│  │ LlamaIndex │ │
│  │  Document  │ │
│  │   Parser   │ │
│  └────────────┘ │
│  ┌────────────┐ │
│  │   Gemini   │ │
│  │  LLM API   │ │
│  └────────────┘ │
└─────────────────┘
```

### Frontend Components
- **HomeView**: File upload interface
- **DashboardView**: Company overview and mode selection
- **QuestionView**: Interactive question interface with solutions
- Responsive design with Tailwind CSS
- Professional, education-focused UI

### Backend Services
- **Document Parser**: LlamaIndex-based 10-K parsing
- **Financial Metrics Extraction**: Automated ratio calculation
- **LLM Answer Generation**: Context-aware explanations
- **Vector Search**: Semantic search over filing content

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- Gemini API key

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
```

4. Run the Flask backend:
```bash
python backend.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Install Node dependencies:
```bash
npm install
```

2. Create Tailwind config:
```bash
npx tailwindcss init -p
```

3. Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./financial-tutor.jsx"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Financial Statement Tutor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

5. Create `src/main.jsx`:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import FinancialStatementTutor from '../financial-tutor.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FinancialStatementTutor />
  </React.StrictMode>,
)
```

6. Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

7. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### 1. Upload a 10-K Filing
- Navigate to the home page
- Click to upload a PDF of a company's 10-K filing
- Wait for the document to be parsed (this may take 30-60 seconds)

### 2. Choose Your Learning Path
- **Quiz Mode**: Get immediate feedback and track your score
- **Practice Mode**: Review solutions and explanations at your own pace

### 3. Select Difficulty
- **Easy**: Focus on numerical calculations (ratios, margins)
- **Medium**: Business context and qualitative analysis
- **Hard**: Complex modeling and strategic synthesis

### 4. Answer Questions
- For numerical questions, calculate using provided formulas
- For qualitative questions, click "Generate Solution" to see AI analysis
- Review explanations to deepen understanding

## API Endpoints

### POST `/api/upload`
Upload and parse a 10-K filing

**Request:**
- `file`: PDF file (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "company_id": "string",
    "company_name": "string",
    "ticker": "string",
    "fiscal_year": "string",
    "financials": {...},
    "industry_context": "string",
    "risk_factors": [...],
    "business_description": "string"
  }
}
```

### POST `/api/generate-answer`
Generate AI-powered answer to a question

**Request:**
```json
{
  "company_id": "string",
  "question": "string",
  "context": "string"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "string"
}
```

### POST `/api/query`
Direct query to document index

**Request:**
```json
{
  "company_id": "string",
  "query": "string"
}
```

## Extending the Question Bank

The frontend includes a `questionBank` object that you can easily extend:

```javascript
const questionBank = {
  easy: [
    {
      id: 'e3',
      type: 'numerical',
      category: 'Efficiency Ratios',
      question: 'Calculate the Asset Turnover Ratio',
      formula: 'Revenue / Total Assets',
      hint: 'This measures how efficiently assets generate revenue',
      getAnswer: (data) => (data.financials.revenue / data.financials.totalAssets).toFixed(2),
      explanation: 'Asset turnover shows how efficiently a company uses its assets...'
    }
  ],
  // Add medium and hard questions similarly
}
```

## LlamaIndex Integration Details

The backend uses LlamaIndex to:
1. **Parse Documents**: Convert 10-K PDFs into searchable chunks
2. **Create Vector Index**: Enable semantic search over filing content
3. **Extract Metrics**: Query-based extraction of financial data
4. **Generate Answers**: Context-aware responses using Gemini

### Customizing the Parser

You can modify `_extract_financial_metrics()` to extract additional metrics:

```python
def _extract_financial_metrics(self) -> Dict:
    metrics_queries = {
        "revenue": "What was the total revenue...",
        "ebitda": "What was the EBITDA...",  # Add new metric
        # Add more queries
    }
    # ... rest of method
```

## Performance Optimization

### Backend
- Document parsing is cached per `company_id`
- Vector index persists for the session
- Consider adding Redis for multi-session caching

### Frontend
- React state management keeps UI responsive
- Loading states prevent user confusion
- Consider adding React Query for API caching

## Future Enhancements

### Short Term
- [ ] Add more question types (T/F, multiple choice)
- [ ] Export progress/scores to CSV
- [ ] Add question hints on demand
- [ ] Implement DCF calculator component

### Medium Term
- [ ] Multi-company comparison mode
- [ ] Historical trend analysis across filings
- [ ] Peer benchmarking
- [ ] Custom question creation

### Long Term
- [ ] User accounts and progress tracking
- [ ] Adaptive difficulty based on performance
- [ ] Collaborative learning features
- [ ] Integration with financial databases (Bloomberg, FactSet)

## Troubleshooting

### "Document not indexed" error
- Ensure file was successfully uploaded
- Check Flask logs for parsing errors
- Verify Gemini API key is set correctly

### Slow parsing
- 10-K files can be large (100+ pages)
- First-time embedding generation takes time
- Consider implementing progress indicators

### Incorrect financial data
- LLM extraction may vary based on filing format
- Add validation rules for extracted numbers
- Consider manual data entry fallback

## Contributing

When adding features:
1. Update question bank with new categories
2. Add corresponding API endpoints if needed
3. Update this README with new functionality
4. Test with multiple real 10-K filings

## License

MIT License - See LICENSE file for details

## Acknowledgments

- LlamaIndex for document intelligence
- Google Gemini for language understanding
- Anthropic Claude for development assistance
- Financial statement data from SEC EDGAR