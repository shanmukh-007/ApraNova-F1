'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { quizApi, type GenerateQuizRequest } from '@/lib/quiz-api';
import { toast } from 'sonner';

export function QuizGenerator({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GenerateQuizRequest>({
    title: '',
    prompt: '',
    generation_type: 'PROMPT',
    num_questions: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await quizApi.generateQuiz(formData);
      toast.success('Quiz generated successfully!');
      setFormData({
        title: '',
        prompt: '',
        generation_type: 'PROMPT',
        num_questions: 5,
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate AI Quiz
        </CardTitle>
        <CardDescription>
          Create a quiz using AI based on a topic or web search
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Python Basics Quiz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Generation Type</Label>
            <RadioGroup
              value={formData.generation_type}
              onValueChange={(value: 'PROMPT' | 'WEB_SEARCH') =>
                setFormData({ ...formData, generation_type: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PROMPT" id="prompt" />
                <Label htmlFor="prompt" className="font-normal">
                  Topic/Prompt Based
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WEB_SEARCH" id="web-search" />
                <Label htmlFor="web-search" className="font-normal">
                  Web Search Based
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">
              {formData.generation_type === 'PROMPT' ? 'Topic/Prompt' : 'Search Query'}
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder={
                formData.generation_type === 'PROMPT'
                  ? 'e.g., Python functions, loops, and data structures'
                  : 'e.g., React hooks best practices'
              }
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_questions">Number of Questions</Label>
            <Input
              id="num_questions"
              type="number"
              min={1}
              max={20}
              value={formData.num_questions}
              onChange={(e) =>
                setFormData({ ...formData, num_questions: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
