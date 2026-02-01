import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { GraduationCap } from 'lucide-react';

interface SkillLevelSelectorProps {
  selectedLevel: 'beginner' | 'intermediate' | 'advanced';
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

export function SkillLevelSelector({ selectedLevel, onLevelChange }: SkillLevelSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Select Your Skill Level
        </CardTitle>
        <CardDescription>
          Choose your proficiency level to get tailored practice problems and quizzes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedLevel}
          onValueChange={(value: string) => onLevelChange(value as 'beginner' | 'intermediate' | 'advanced')}
        >
          <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer">
            <RadioGroupItem value="beginner" id="beginner" />
            <div className="flex-1">
              <Label htmlFor="beginner" className="cursor-pointer">
                <p className="font-semibold">Beginner</p>
                <p className="text-sm text-muted-foreground">
                  Basic ratio calculations and fundamental concepts
                </p>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <div className="flex-1">
              <Label htmlFor="intermediate" className="cursor-pointer">
                <p className="font-semibold">Intermediate</p>
                <p className="text-sm text-muted-foreground">
                  Multiple ratio analysis and comparative interpretation
                </p>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer">
            <RadioGroupItem value="advanced" id="advanced" />
            <div className="flex-1">
              <Label htmlFor="advanced" className="cursor-pointer">
                <p className="font-semibold">Advanced</p>
                <p className="text-sm text-muted-foreground">
                  DuPont analysis, cash flow interpretation, and integrated analysis
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
