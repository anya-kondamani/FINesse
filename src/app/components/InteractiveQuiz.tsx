import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { FinancialData } from './FileUpload';

interface InteractiveQuizProps {
  data: FinancialData;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export function InteractiveQuiz({ data, skillLevel }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const generateQuestions = (): QuizQuestion[] => {
    const currentRatio = data.currentAssets / data.currentLiabilities;
    const debtToEquity = data.totalLiabilities / data.totalEquity;
    const profitMargin = (data.netIncome / data.revenue) * 100;
    const roe = (data.netIncome / data.totalEquity) * 100;

    const questions: QuizQuestion[] = [
      {
        id: '1',
        question: `${data.companyName} has current assets of $${(data.currentAssets / 1000000).toFixed(1)}M and current liabilities of $${(data.currentLiabilities / 1000000).toFixed(1)}M. What is the current ratio?`,
        options: [
          '1.00',
          currentRatio.toFixed(2),
          (currentRatio * 0.5).toFixed(2),
          (currentRatio * 1.5).toFixed(2)
        ],
        correctAnswer: 1,
        explanation: `Current Ratio = Current Assets ÷ Current Liabilities = $${(data.currentAssets / 1000000).toFixed(1)}M ÷ $${(data.currentLiabilities / 1000000).toFixed(1)}M = ${currentRatio.toFixed(2)}`,
        difficulty: 'beginner'
      },
      {
        id: '2',
        question: `If ${data.companyName}'s current ratio is ${currentRatio.toFixed(2)}, what does this indicate about the company?`,
        options: [
          'The company is insolvent',
          currentRatio >= 1.5 ? 'The company has strong short-term liquidity' : 'The company may face liquidity challenges',
          'The company has too much debt',
          'The company is unprofitable'
        ],
        correctAnswer: 1,
        explanation: `A current ratio of ${currentRatio.toFixed(2)} ${currentRatio >= 1.5 ? 'indicates strong short-term liquidity, as the company has sufficient current assets to cover current liabilities' : currentRatio >= 1 ? 'suggests adequate liquidity, though monitoring is advised' : 'may indicate potential liquidity challenges'}.`,
        difficulty: 'beginner'
      },
      {
        id: '3',
        question: `${data.companyName} generated $${(data.cashFromOperations / 1000000).toFixed(1)}M from operations and spent $${Math.abs(data.cashFromInvesting / 1000000).toFixed(1)}M on investments. What does this likely indicate?`,
        options: [
          'The company is in financial distress',
          'The company is investing in future growth',
          'The company has poor management',
          'The company is reducing operations'
        ],
        correctAnswer: 1,
        explanation: `Positive operating cash flow of $${(data.cashFromOperations / 1000000).toFixed(1)}M combined with negative investing cash flow indicates the company is generating cash from core operations and reinvesting it in assets for future growth—a healthy sign for a growing business.`,
        difficulty: 'intermediate'
      },
      {
        id: '4',
        question: `The debt-to-equity ratio for ${data.companyName} is ${debtToEquity.toFixed(2)}. What does this mean?`,
        options: [
          `For every $1 of equity, the company has $${debtToEquity.toFixed(2)} of debt`,
          'The company has no debt',
          `The company has $${debtToEquity.toFixed(2)} in equity`,
          'The company is overvalued'
        ],
        correctAnswer: 0,
        explanation: `A debt-to-equity ratio of ${debtToEquity.toFixed(2)} means the company has $${debtToEquity.toFixed(2)} in liabilities for every $1 of shareholders' equity. This measures the company's financial leverage.`,
        difficulty: 'intermediate'
      },
      {
        id: '5',
        question: `${data.companyName}'s net profit margin is ${profitMargin.toFixed(2)}%. Which statement is most accurate?`,
        options: [
          profitMargin < 5 ? 'This is a low margin suggesting tight cost controls are needed' : profitMargin < 15 ? 'This is a moderate margin typical of many industries' : 'This is a high margin indicating strong pricing power',
          'Profit margin has no relation to profitability',
          'Higher margins always mean better companies',
          'Margins cannot be compared across industries'
        ],
        correctAnswer: 0,
        explanation: `A net profit margin of ${profitMargin.toFixed(2)}% means the company keeps $${(profitMargin / 100).toFixed(3)} of profit for every dollar of sales. ${profitMargin < 5 ? 'This is relatively low and suggests the company operates in a competitive industry or needs to improve cost management.' : profitMargin < 15 ? 'This is moderate and typical for many industries.' : 'This is high and indicates strong competitive positioning and/or operational efficiency.'}`,
        difficulty: 'intermediate'
      },
      {
        id: '6',
        question: `Using the DuPont framework, ROE can be decomposed into three components. What are they?`,
        options: [
          'Revenue, Costs, and Profit',
          'Profit Margin, Asset Turnover, and Financial Leverage',
          'Cash Flow, Debt, and Equity',
          'Current Ratio, Quick Ratio, and Cash Ratio'
        ],
        correctAnswer: 1,
        explanation: `The DuPont analysis breaks down ROE into: (1) Profit Margin (profitability), (2) Asset Turnover (efficiency), and (3) Financial Leverage (use of debt). This helps identify the drivers of shareholder returns.`,
        difficulty: 'advanced'
      },
      {
        id: '7',
        question: `${data.companyName}'s operating cash flow ($${(data.cashFromOperations / 1000000).toFixed(1)}M) ${data.cashFromOperations > data.netIncome ? 'exceeds' : 'is less than'} its net income ($${(data.netIncome / 1000000).toFixed(1)}M). What does this suggest?`,
        options: [
          'The financial statements contain errors',
          data.cashFromOperations > data.netIncome ? 'High-quality earnings with strong cash conversion' : 'Potential earnings quality concerns',
          'The company is bankrupt',
          'Revenue recognition is delayed'
        ],
        correctAnswer: 1,
        explanation: `${data.cashFromOperations > data.netIncome ? 'When operating cash flow exceeds net income, it indicates high-quality earnings. The company is converting profits to actual cash, often due to favorable working capital management.' : 'When net income exceeds operating cash flow, it may indicate earnings quality concerns. Profits may be tied up in receivables or inventory, or aggressive revenue recognition may be occurring.'}`,
        difficulty: 'advanced'
      },
      {
        id: '8',
        question: `If ${data.companyName}'s ROE is ${roe.toFixed(2)}% and the equity multiplier is ${(data.totalAssets / data.totalEquity).toFixed(2)}, how does leverage impact returns?`,
        options: [
          'Leverage has no impact on ROE',
          'Leverage amplifies returns to equity holders',
          'Leverage only affects debt holders',
          'ROE would be the same without leverage'
        ],
        correctAnswer: 1,
        explanation: `An equity multiplier of ${(data.totalAssets / data.totalEquity).toFixed(2)} means assets are ${(data.totalAssets / data.totalEquity).toFixed(2)}x equity. This leverage amplifies both gains and losses. The use of debt financing increases ROE beyond what would be achieved with equity alone, but also increases financial risk.`,
        difficulty: 'advanced'
      }
    ];

    // Filter based on skill level
    const difficultyMap = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['beginner', 'intermediate', 'advanced']
    };

    return questions.filter(q => difficultyMap[skillLevel].includes(q.difficulty));
  };

  const questions = generateQuestions();

  useEffect(() => {
    setUserAnswers(new Array(questions.length).fill(null));
  }, [questions.length]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setUserAnswers(new Array(questions.length).fill(null));
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (quizComplete) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold">
              {score}/{questions.length}
            </div>
            <p className="text-xl">
              {percentage >= 80 ? '🎉 Excellent work!' : percentage >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}
            </p>
            <p className="text-muted-foreground">
              You scored {percentage.toFixed(0)}% on this quiz
            </p>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border ${
                  userAnswers[index] === question.correctAnswer
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {userAnswers[index] === question.correctAnswer ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Question {index + 1}</p>
                    <p className="text-sm">{question.question}</p>
                    {userAnswers[index] !== question.correctAnswer && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        Correct answer: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleRestartQuiz} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Interactive Quiz</CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription className="mt-2">
          Test your understanding with this {skillLevel}-level quiz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Badge className="mb-3">{currentQ.difficulty}</Badge>
          <p className="text-lg">{currentQ.question}</p>
        </div>

        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value: string) => handleAnswerSelect(parseInt(value))}
          disabled={showResult}
        >
          {currentQ.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-4 rounded-lg border ${
                showResult
                  ? index === currentQ.correctAnswer
                    ? 'bg-green-50 border-green-200'
                    : index === selectedAnswer
                    ? 'bg-red-50 border-red-200'
                    : ''
                  : 'hover:bg-accent'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
              {showResult && index === currentQ.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {showResult && index === selectedAnswer && index !== currentQ.correctAnswer && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          ))}
        </RadioGroup>

        {showResult && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold mb-2">
              {selectedAnswer === currentQ.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-sm">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="flex-1"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="flex-1">
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Current Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
        </div>
      </CardContent>
    </Card>
  );
}
