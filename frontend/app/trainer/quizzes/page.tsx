'use client';

import { useState, useEffect } from 'react';
import { QuizGenerator } from '@/components/trainer/quiz-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash2 } from 'lucide-react';
import { quizApi, type Quiz } from '@/lib/quiz-api';
import { toast } from 'sonner';

export default function TrainerQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await quizApi.listQuizzes();
      setQuizzes(data);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await quizApi.deleteQuiz(id);
      toast.success('Quiz deleted');
      loadQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
        <p className="text-muted-foreground">Create and manage AI-generated quizzes</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuizGenerator onSuccess={loadQuizzes} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Quizzes</h2>
          {loading ? (
            <div>Loading...</div>
          ) : quizzes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No quizzes yet. Generate your first quiz!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {quiz.title}
                        </CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{quiz.question_count} questions</Badge>
                      <Badge variant="outline">{quiz.generation_type}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
