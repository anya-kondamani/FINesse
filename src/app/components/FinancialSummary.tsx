import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Building2, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { FinancialData } from './FileUpload';

interface FinancialSummaryProps {
  data: FinancialData;
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const calculateRatios = () => {
    const currentRatio = data.currentAssets / data.currentLiabilities;
    const debtToEquity = data.totalLiabilities / data.totalEquity;
    const profitMargin = (data.netIncome / data.revenue) * 100;
    const roa = (data.netIncome / data.totalAssets) * 100;
    const roe = (data.netIncome / data.totalEquity) * 100;

    return { currentRatio, debtToEquity, profitMargin, roa, roe };
  };

  const ratios = calculateRatios();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {data.companyName} - FY {data.fiscalYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(data.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="text-2xl font-semibold">{formatCurrency(data.netIncome)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-semibold">{formatCurrency(data.totalAssets)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Financial Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Ratio</p>
              <p className="text-xl font-semibold">{ratios.currentRatio.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">D/E Ratio</p>
              <p className="text-xl font-semibold">{ratios.debtToEquity.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-xl font-semibold">{ratios.profitMargin.toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ROA</p>
              <p className="text-xl font-semibold">{ratios.roa.toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ROE</p>
              <p className="text-xl font-semibold">{ratios.roe.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Cash Flow Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Operating Activities</p>
              <p className="text-xl font-semibold">{formatCurrency(data.cashFromOperations)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Investing Activities</p>
              <p className="text-xl font-semibold">{formatCurrency(data.cashFromInvesting)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financing Activities</p>
              <p className="text-xl font-semibold">{formatCurrency(data.cashFromFinancing)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
