import { useState, useEffect } from 'react';
import { FileUpload, FinancialData } from './components/FileUpload';
import { FinancialSummary } from './components/FinancialSummary';
import { PracticeProblems } from './components/PracticeProblems';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { SkillLevelSelector } from './components/SkillLevelSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { BookOpen, HelpCircle, BarChart3 } from 'lucide-react';

export default function App() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(() => {
    const saved = localStorage.getItem('skillLevel');
    return (saved as 'beginner' | 'intermediate' | 'advanced') || 'beginner';
  });

  useEffect(() => {
    localStorage.setItem('skillLevel', skillLevel);
  }, [skillLevel]);

  const handleDataExtracted = (data: FinancialData) => {
    setFinancialData(data);
  };

  const handleSkillLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSkillLevel(level);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Financial Analysis Tutor</h1>
              <p className="text-muted-foreground">
                Master financial analysis through real SEC filings
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload and Settings */}
          <div className="space-y-6">
            <FileUpload onDataExtracted={handleDataExtracted} />
            <SkillLevelSelector
              selectedLevel={skillLevel}
              onLevelChange={handleSkillLevelChange}
            />
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {!financialData ? (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">Get Started</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Upload a 10-K/10-Q filing or load sample data to begin practicing
                    financial analysis
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Financial Summary */}
                <FinancialSummary data={financialData} />

                {/* Tabs for Problems and Quiz */}
                <Tabs defaultValue="problems" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="problems" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Practice Problems
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Interactive Quiz
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="problems" className="mt-6">
                    <PracticeProblems data={financialData} skillLevel={skillLevel} />
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-6">
                    <InteractiveQuiz data={financialData} skillLevel={skillLevel} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Financial Analysis Tutor - Practice problems are generated based on uploaded financial data.
            For educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
