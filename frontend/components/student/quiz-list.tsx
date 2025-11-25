'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Play } from 'lucide-react';
import { quizApi, type Quiz } from '@/lib/quiz-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleStartQuiz = async (quizId: number) => {
    try {
      const attempt = await quizApi.startQuiz(quizId);
      router.push(`/student/quiz/${attempt.id}`);
    } catch (error) {
      toast.error('Failed to start quiz');
    }
  };

  if (loading) {
    return <div>Loading quizzes...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {quiz.title}
            </CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions:</span>
              <Badge variant="secondary">{quiz.question_count}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created by:</span>
              <span>{quiz.created_by_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(quiz.created_at).toLocaleDateString()}
            </div>
            <Button onClick={() => handleStartQuiz(quiz.id)} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
