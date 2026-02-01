import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { BookOpen, Eye, EyeOff, Calculator, TrendingUp, Banknote } from 'lucide-react';
import { FinancialData } from './FileUpload';

interface PracticeProblemsProps {
  data: FinancialData;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface Problem {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  solution: string;
  explanation: string;
  icon: React.ReactNode;
}

export function PracticeProblems({ data, skillLevel }: PracticeProblemsProps) {
  const [visibleSolutions, setVisibleSolutions] = useState<Set<string>>(new Set());

  const toggleSolution = (problemId: string) => {
    setVisibleSolutions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const generateProblems = (): Problem[] => {
    const currentRatio = data.currentAssets / data.currentLiabilities;
    const debtToEquity = data.totalLiabilities / data.totalEquity;
    const profitMargin = (data.netIncome / data.revenue) * 100;
    const roa = (data.netIncome / data.totalAssets) * 100;
    const roe = (data.netIncome / data.totalEquity) * 100;

    const problems: Problem[] = [
      {
        id: '1',
        category: 'Liquidity Analysis',
        difficulty: 'beginner',
        question: `Calculate the current ratio for ${data.companyName}. Current Assets: $${(data.currentAssets / 1000000).toFixed(1)}M, Current Liabilities: $${(data.currentLiabilities / 1000000).toFixed(1)}M. What does this ratio tell us about the company's short-term financial health?`,
        solution: `Current Ratio = ${currentRatio.toFixed(2)}`,
        explanation: `The current ratio is calculated by dividing current assets by current liabilities: $${(data.currentAssets / 1000000).toFixed(1)}M ÷ $${(data.currentLiabilities / 1000000).toFixed(1)}M = ${currentRatio.toFixed(2)}. A ratio above 1.0 indicates the company has more current assets than current liabilities, suggesting good short-term liquidity. This company's ratio of ${currentRatio.toFixed(2)} means it has $${currentRatio.toFixed(2)} in current assets for every $1 of current liabilities.`,
        icon: <Calculator className="w-4 h-4" />
      },
      {
        id: '2',
        category: 'Leverage Analysis',
        difficulty: 'beginner',
        question: `What is ${data.companyName}'s debt-to-equity ratio? Total Liabilities: $${(data.totalLiabilities / 1000000).toFixed(1)}M, Total Equity: $${(data.totalEquity / 1000000).toFixed(1)}M. How would you interpret this ratio?`,
        solution: `Debt-to-Equity Ratio = ${debtToEquity.toFixed(2)}`,
        explanation: `The debt-to-equity ratio measures financial leverage: $${(data.totalLiabilities / 1000000).toFixed(1)}M ÷ $${(data.totalEquity / 1000000).toFixed(1)}M = ${debtToEquity.toFixed(2)}. This means the company has $${debtToEquity.toFixed(2)} of debt for every $1 of equity. ${debtToEquity < 1 ? 'A ratio below 1.0 suggests conservative use of debt, which may indicate lower financial risk.' : 'A ratio above 1.0 suggests the company relies more heavily on debt financing, which increases financial risk but can also amplify returns.'}`,
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: '3',
        category: 'Profitability Analysis',
        difficulty: 'intermediate',
        question: `Calculate the net profit margin for ${data.companyName}. Revenue: $${(data.revenue / 1000000).toFixed(1)}M, Net Income: $${(data.netIncome / 1000000).toFixed(1)}M. Compare this to industry standards and explain what it reveals about operational efficiency.`,
        solution: `Net Profit Margin = ${profitMargin.toFixed(2)}%`,
        explanation: `Net profit margin = (Net Income ÷ Revenue) × 100 = ($${(data.netIncome / 1000000).toFixed(1)}M ÷ $${(data.revenue / 1000000).toFixed(1)}M) × 100 = ${profitMargin.toFixed(2)}%. This indicates that the company retains $${(profitMargin / 100).toFixed(3)} as profit for every dollar of revenue. Higher margins suggest better cost control and pricing power. Technology companies often have margins of 15-30%, while retail typically sees 2-5%.`,
        icon: <Banknote className="w-4 h-4" />
      },
      {
        id: '4',
        category: 'Return Metrics',
        difficulty: 'intermediate',
        question: `Calculate both ROA and ROE for ${data.companyName}. Total Assets: $${(data.totalAssets / 1000000).toFixed(1)}M, Total Equity: $${(data.totalEquity / 1000000).toFixed(1)}M, Net Income: $${(data.netIncome / 1000000).toFixed(1)}M. Why is ROE higher than ROA, and what does this tell us about the company's use of leverage?`,
        solution: `ROA = ${roa.toFixed(2)}%, ROE = ${roe.toFixed(2)}%`,
        explanation: `ROA = (Net Income ÷ Total Assets) × 100 = ${roa.toFixed(2)}%. ROE = (Net Income ÷ Total Equity) × 100 = ${roe.toFixed(2)}%. ROE is higher because total assets include both equity and debt financing. The difference between ROE (${roe.toFixed(2)}%) and ROA (${roa.toFixed(2)}%) reflects the company's use of financial leverage. The leverage multiplier is ${(data.totalAssets / data.totalEquity).toFixed(2)}x, meaning assets are ${(data.totalAssets / data.totalEquity).toFixed(2)} times equity, with the difference funded by debt.`,
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: '5',
        category: 'Cash Flow Analysis',
        difficulty: 'advanced',
        question: `Analyze ${data.companyName}'s cash flow statement. Operating Cash Flow: $${(data.cashFromOperations / 1000000).toFixed(1)}M, Investing Cash Flow: $${(data.cashFromInvesting / 1000000).toFixed(1)}M, Financing Cash Flow: $${(data.cashFromFinancing / 1000000).toFixed(1)}M, Net Income: $${(data.netIncome / 1000000).toFixed(1)}M. What does the relationship between operating cash flow and net income tell us? What stage of the business lifecycle might this company be in?`,
        solution: `Operating CF to Net Income Ratio = ${(data.cashFromOperations / data.netIncome).toFixed(2)}`,
        explanation: `The operating cash flow of $${(data.cashFromOperations / 1000000).toFixed(1)}M ${data.cashFromOperations > data.netIncome ? 'exceeds' : 'is less than'} net income of $${(data.netIncome / 1000000).toFixed(1)}M, giving a ratio of ${(data.cashFromOperations / data.netIncome).toFixed(2)}. ${data.cashFromOperations > data.netIncome ? 'This is positive, indicating high-quality earnings with strong cash generation.' : 'This suggests earnings quality concerns, as profits aren\'t converting to cash.'} The negative investing cash flow of $${(data.cashFromInvesting / 1000000).toFixed(1)}M indicates capital expenditures, suggesting growth investment. Negative financing cash flow of $${(data.cashFromFinancing / 1000000).toFixed(1)}M suggests debt repayment or dividend payments, typical of mature, profitable companies generating excess cash.`,
        icon: <Calculator className="w-4 h-4" />
      },
      {
        id: '6',
        category: 'Comprehensive Analysis',
        difficulty: 'advanced',
        question: `Using DuPont analysis, decompose ${data.companyName}'s ROE into its three components: profit margin, asset turnover, and financial leverage. Revenue: $${(data.revenue / 1000000).toFixed(1)}M, Net Income: $${(data.netIncome / 1000000).toFixed(1)}M, Total Assets: $${(data.totalAssets / 1000000).toFixed(1)}M, Total Equity: $${(data.totalEquity / 1000000).toFixed(1)}M. Which component contributes most to ROE?`,
        solution: `ROE = ${roe.toFixed(2)}% (Profit Margin × Asset Turnover × Equity Multiplier)`,
        explanation: `DuPont Analysis breaks down ROE:\n\n1. Profit Margin = Net Income ÷ Revenue = ${profitMargin.toFixed(2)}%\n2. Asset Turnover = Revenue ÷ Total Assets = ${(data.revenue / data.totalAssets).toFixed(2)}\n3. Equity Multiplier = Total Assets ÷ Total Equity = ${(data.totalAssets / data.totalEquity).toFixed(2)}\n\nROE = ${profitMargin.toFixed(2)}% × ${(data.revenue / data.totalAssets).toFixed(2)} × ${(data.totalAssets / data.totalEquity).toFixed(2)} = ${roe.toFixed(2)}%\n\nThis shows that ROE is driven by ${profitMargin > 10 ? 'strong profitability' : (data.revenue / data.totalAssets) > 1 ? 'efficient asset utilization' : 'financial leverage'}. Understanding these components helps identify whether returns come from operational efficiency, asset productivity, or financial engineering.`,
        icon: <BookOpen className="w-4 h-4" />
      },
    ];

    // Filter problems based on skill level
    const difficultyMap = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['beginner', 'intermediate', 'advanced']
    };

    return problems.filter(p => difficultyMap[skillLevel].includes(p.difficulty));
  };

  const problems = generateProblems();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Practice Problems
        </CardTitle>
        <CardDescription>
          Work through these problems to master financial analysis. Click "Show Solution" to reveal answers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {problems.map((problem) => (
            <AccordionItem key={problem.id} value={problem.id}>
              <AccordionTrigger className="text-left">
                <div className="flex items-start gap-3 flex-1 pr-4">
                  <div className="mt-1">{problem.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{problem.category}</Badge>
                      <Badge variant={
                        problem.difficulty === 'beginner' ? 'default' :
                        problem.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                      }>
                        {problem.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm">{problem.question}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-10 space-y-4">
                  <Button
                    onClick={() => toggleSolution(problem.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {visibleSolutions.has(problem.id) ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Solution
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Solution
                      </>
                    )}
                  </Button>

                  {visibleSolutions.has(problem.id) && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-semibold mb-1">Solution:</p>
                        <p className="text-lg font-mono">{problem.solution}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Explanation:</p>
                        <p className="text-sm whitespace-pre-line">{problem.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
