import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onDataExtracted: (data: FinancialData) => void;
}

export interface FinancialData {
  companyName: string;
  fiscalYear: string;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentAssets: number;
  currentLiabilities: number;
  cashFromOperations: number;
  cashFromInvesting: number;
  cashFromFinancing: number;
}

export function FileUpload({ onDataExtracted }: FileUploadProps) {
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        extractFinancialData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTextSubmit = () => {
    extractFinancialData(textInput);
  };

  const extractFinancialData = (text: string) => {
    // In a real application, this would parse actual 10-K/10-Q data
    // For demo purposes, we'll use mock data
    const mockData: FinancialData = {
      companyName: 'Example Corp',
      fiscalYear: '2023',
      revenue: 50000000,
      netIncome: 5000000,
      totalAssets: 100000000,
      totalLiabilities: 40000000,
      totalEquity: 60000000,
      currentAssets: 30000000,
      currentLiabilities: 15000000,
      cashFromOperations: 8000000,
      cashFromInvesting: -3000000,
      cashFromFinancing: -2000000,
    };
    onDataExtracted(mockData);
  };

  const loadSampleData = () => {
    const sampleData: FinancialData = {
      companyName: 'TechVentures Inc.',
      fiscalYear: '2023',
      revenue: 125000000,
      netIncome: 15000000,
      totalAssets: 200000000,
      totalLiabilities: 80000000,
      totalEquity: 120000000,
      currentAssets: 75000000,
      currentLiabilities: 35000000,
      cashFromOperations: 22000000,
      cashFromInvesting: -8000000,
      cashFromFinancing: -5000000,
    };
    onDataExtracted(sampleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Financial Data
        </CardTitle>
        <CardDescription>
          Upload a 10-K/10-Q filing or paste financial data to generate practice problems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4 text-sm text-muted-foreground">
                Upload 10-K or 10-Q filing (PDF, TXT, or HTML)
              </p>
              <input
                type="file"
                accept=".pdf,.txt,.html,.htm"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste financial statement data here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px]"
            />
            <Button onClick={handleTextSubmit} className="w-full">
              Process Data
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <Button onClick={loadSampleData} variant="outline" className="w-full">
            Load Sample Data (TechVentures Inc.)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
