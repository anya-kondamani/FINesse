import React, { useState, useEffect } from 'react';
import { Upload, BookOpen, Target, Brain, CheckCircle, XCircle, ChevronRight, FileText, TrendingUp, DollarSign, BarChart3, Calculator, Lightbulb } from 'lucide-react';

// Main App Component
const FinancialStatementTutor = () => {
  const [currentView, setCurrentView] = useState('home');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [quizMode, setQuizMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Simulated company data parser (replace with actual LlamaIndex integration)
  const parseCompanyData = async (file) => {
    // This would be your LlamaIndex backend call
    return {
      companyName: "Example Corp",
      ticker: "EXMP",
      fiscalYear: "2024",
      financials: {
        revenue: 1250000000,
        netIncome: 180000000,
        totalAssets: 3500000000,
        totalLiabilities: 2100000000,
        currentAssets: 850000000,
        currentLiabilities: 420000000,
        operatingCashFlow: 220000000,
        freeCashFlow: 165000000
      },
      industryContext: "Technology - Software",
      riskFactors: ["Market competition", "Regulatory changes", "Cybersecurity threats"]
    };
  };

  // Question bank for numerical problems
  const questionBank = {
    easy: [
      {
        id: 'e1',
        type: 'numerical',
        category: 'Liquidity Ratios',
        question: 'Calculate the Current Ratio',
        formula: 'Current Assets / Current Liabilities',
        hint: 'This ratio measures a company\'s ability to pay short-term obligations',
        getAnswer: (data) => (data.financials.currentAssets / data.financials.currentLiabilities).toFixed(2),
        explanation: 'The current ratio indicates whether a company has enough resources to meet its obligations over the next 12 months. A ratio above 1.0 suggests the company can cover its short-term liabilities.'
      },
      {
        id: 'e2',
        type: 'numerical',
        category: 'Profitability Ratios',
        question: 'Calculate the Net Profit Margin (%)',
        formula: '(Net Income / Revenue) × 100',
        hint: 'This shows what percentage of revenue translates to profit',
        getAnswer: (data) => ((data.financials.netIncome / data.financials.revenue) * 100).toFixed(2),
        explanation: 'Net profit margin shows how much profit a company makes for every dollar of revenue. Higher margins typically indicate better operational efficiency and pricing power.'
      }
    ],
    medium: [
      {
        id: 'm1',
        type: 'numerical',
        category: 'Leverage Ratios',
        question: 'Calculate the Debt-to-Equity Ratio',
        formula: 'Total Liabilities / (Total Assets - Total Liabilities)',
        hint: 'This measures financial leverage and risk',
        getAnswer: (data) => {
          const equity = data.financials.totalAssets - data.financials.totalLiabilities;
          return (data.financials.totalLiabilities / equity).toFixed(2);
        },
        explanation: 'The debt-to-equity ratio shows how much debt a company uses to finance its assets relative to equity. A higher ratio indicates more leverage and potentially higher financial risk.'
      },
      {
        id: 'm2',
        type: 'llm',
        category: 'Risk Analysis',
        question: 'Based on the risk factors disclosed in the 10-K, which risk poses the greatest threat to the company\'s revenue growth and why?',
        requiresLLM: true,
        context: 'Analyze the risk factors section and business description',
        explanation: 'This requires understanding the company\'s business model, revenue sources, and evaluating which disclosed risks could most significantly impact future performance.'
      }
    ],
    hard: [
      {
        id: 'h1',
        type: 'dcf',
        category: 'Valuation',
        question: 'Build a simplified 3-year DCF model',
        instructions: 'Estimate fair value using: 1) Historical FCF growth rate, 2) Industry average WACC of 8%, 3) Terminal growth rate of 3%',
        requiresLLM: false,
        fields: ['year1_fcf', 'year2_fcf', 'year3_fcf', 'terminal_value', 'enterprise_value'],
        explanation: 'DCF valuation estimates intrinsic value by projecting future cash flows and discounting them to present value.'
      },
      {
        id: 'h2',
        type: 'llm',
        category: 'Strategic Analysis',
        question: 'Evaluate the company\'s competitive position based on its market strategy and financial performance. What are the key strengths and vulnerabilities?',
        requiresLLM: true,
        context: 'Analyze MD&A, business description, and financial metrics together',
        explanation: 'This requires synthesizing qualitative business information with quantitative financial data to assess competitive positioning.'
      }
    ]
  };

  // Generate LLM answer using Gemini API
  const generateLLMAnswer = async (question, companyData) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a financial analysis tutor. Based on the following company data and 10-K information, provide a comprehensive answer to this question:

Question: ${question.question}

Company: ${companyData.companyName} (${companyData.ticker})
Industry: ${companyData.industryContext}
Fiscal Year: ${companyData.fiscalYear}

Financial Data:
- Revenue: $${(companyData.financials.revenue / 1000000).toFixed(0)}M
- Net Income: $${(companyData.financials.netIncome / 1000000).toFixed(0)}M
- Total Assets: $${(companyData.financials.totalAssets / 1000000).toFixed(0)}M
- Operating Cash Flow: $${(companyData.financials.operatingCashFlow / 1000000).toFixed(0)}M

Risk Factors: ${companyData.riskFactors.join(', ')}

Context: ${question.context}

Provide a detailed, educational answer that:
1. Directly answers the question
2. Explains the financial reasoning
3. References specific data points
4. Highlights key insights a student should learn

Format your response as a clear, well-structured explanation.`
            }
          ]
        })
      });

      const data = await response.json();
      const answer = data.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
      
      return answer;
    } catch (error) {
      console.error("Error generating LLM answer:", error);
      return "Error generating answer. Please try again.";
    }
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setCurrentView('processing');
      
      // Simulate processing (replace with actual LlamaIndex parsing)
      setTimeout(async () => {
        const parsed = await parseCompanyData(file);
        setCompanyData(parsed);
        setCurrentView('dashboard');
      }, 2000);
    }
  };

  // Start quiz or practice
  const startSession = (mode, diff) => {
    setQuizMode(mode);
    setDifficulty(diff);
    setScore({ correct: 0, total: 0 });
    loadQuestion(diff);
    setCurrentView('question');
  };

  // Load a question
  const loadQuestion = (diff) => {
    const questions = questionBank[diff];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQ);
    setUserAnswer('');
    setShowSolution(false);
  };

  // Check answer
  const checkAnswer = async () => {
    if (currentQuestion.type === 'numerical') {
      const correctAnswer = currentQuestion.getAnswer(companyData);
      const isCorrect = Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) < 0.1;
      
      if (quizMode === 'quiz') {
        setScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));
      }
      setShowSolution(true);
    } else if (currentQuestion.type === 'llm') {
      setCurrentView('generating');
      const llmAnswer = await generateLLMAnswer(currentQuestion, companyData);
      setCurrentQuestion(prev => ({ ...prev, generatedAnswer: llmAnswer }));
      setCurrentView('question');
      setShowSolution(true);
    }
  };

  // Home View
  const HomeView = () => (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mb-6 shadow-lg">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Financial Statement Tutor
          </h1>
          <p className="text-xl text-gray-600">
            Master financial analysis with real 10-K filings
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-10">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
              <p className="text-gray-600 mb-6">Upload a company's 10-K filing to begin</p>
            </div>

            <label className="block cursor-pointer">
              <div className="border-3 border-dashed border-emerald-300 rounded-2xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300">
                <Upload className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload 10-K filing
                </p>
                <p className="text-sm text-gray-500">PDF format recommended</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
              />
            </label>

            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-gray-700">Ratio Analysis</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium text-gray-700">Cash Flow</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium text-gray-700">Valuation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Processing View
  const ProcessingView = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Processing 10-K Filing</h2>
        <p className="text-gray-600">Parsing financial statements and extracting data...</p>
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {companyData.companyName}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {companyData.ticker}
                </span>
                <span>{companyData.industryContext}</span>
                <span>FY {companyData.fiscalYear}</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(companyData.financials.revenue / 1000000000).toFixed(2)}B
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Net Income</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${(companyData.financials.netIncome / 1000000).toFixed(0)}M
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(companyData.financials.totalAssets / 1000000000).toFixed(2)}B
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Free Cash Flow</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(companyData.financials.freeCashFlow / 1000000).toFixed(0)}M
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            Choose Your Learning Path
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Quiz Mode</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Test your knowledge with instant feedback and scoring
              </p>
              <div className="space-y-2">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => startSession('quiz', diff)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium capitalize"
                  >
                    {diff} Quiz
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Practice Mode</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Learn at your own pace with detailed explanations
              </p>
              <div className="space-y-2">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => startSession('practice', diff)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-medium capitalize"
                  >
                    {diff} Practice
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Learning Tip</h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Start with easy questions to build confidence with ratio calculations, 
                  then progress to medium questions that incorporate business context. 
                  Hard questions include DCF models and comprehensive analysis requiring 
                  synthesis of multiple financial concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Question View
  const QuestionView = () => {
    const correctAnswer = currentQuestion.type === 'numerical' 
      ? currentQuestion.getAnswer(companyData)
      : null;

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            {quizMode === 'quiz' && (
              <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-md border border-gray-200">
                <span className="text-sm font-medium text-gray-600">Score:</span>
                <span className="text-lg font-bold text-emerald-600">
                  {score.correct}/{score.total}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                  {difficulty}
                </span>
                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>
              {currentQuestion.formula && (
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-emerald-500">
                  <p className="text-sm text-gray-600 mb-1">Formula:</p>
                  <p className="font-mono text-lg text-gray-900">{currentQuestion.formula}</p>
                </div>
              )}
              {currentQuestion.instructions && (
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500 mt-4">
                  <p className="text-sm text-blue-900">{currentQuestion.instructions}</p>
                </div>
              )}
            </div>

            {currentQuestion.type === 'numerical' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  placeholder="Enter your answer"
                  disabled={showSolution}
                />
              </div>
            )}

            {currentQuestion.hint && !showSolution && (
              <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400 mb-6">
                <p className="text-sm font-medium text-amber-900 mb-1">💡 Hint:</p>
                <p className="text-amber-800">{currentQuestion.hint}</p>
              </div>
            )}

            {!showSolution ? (
              <button
                onClick={checkAnswer}
                disabled={currentQuestion.type === 'numerical' && !userAnswer}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg"
              >
                {currentQuestion.type === 'llm' ? 'Generate Solution' : 'Check Answer'}
              </button>
            ) : (
              <div className="space-y-6">
                {currentQuestion.type === 'numerical' && (
                  <div className={`rounded-xl p-6 border-2 ${
                    Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) < 0.1
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) < 0.1 ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h3 className="text-xl font-bold">
                        {Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) < 0.1
                          ? 'Correct!'
                          : 'Incorrect'}
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Correct Answer:</span> {correctAnswer}
                    </p>
                    {Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) >= 0.1 && (
                      <p className="text-gray-700">
                        <span className="font-medium">Your Answer:</span> {userAnswer}
                      </p>
                    )}
                  </div>
                )}

                {currentQuestion.type === 'llm' && currentQuestion.generatedAnswer && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-500">
                    <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI-Generated Solution
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line">
                      {currentQuestion.generatedAnswer}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">📚 Explanation</h3>
                  <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => loadQuestion(difficulty)}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    End Session
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Company Context</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>
                <span className="ml-2 font-medium">{companyData.companyName}</span>
              </div>
              <div>
                <span className="text-gray-600">Industry:</span>
                <span className="ml-2 font-medium">{companyData.industryContext}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generating View
  const GeneratingView = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Generating AI Solution</h2>
        <p className="text-gray-600">Analyzing company data and formulating answer...</p>
      </div>
    </div>
  );

  // Render appropriate view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {currentView === 'home' && <HomeView />}
      {currentView === 'processing' && <ProcessingView />}
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'question' && <QuestionView />}
      {currentView === 'generating' && <GeneratingView />}
    </div>
  );
};

export default FinancialStatementTutor;