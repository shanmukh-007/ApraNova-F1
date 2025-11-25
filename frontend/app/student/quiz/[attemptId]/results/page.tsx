'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Home } from 'lucide-react';
import { quizApi, type QuizAttempt, type QuizDetail } from '@/lib/quiz-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function QuizResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      const attemptData = await quizApi.getAttempt(parseInt(attemptId));
      setAttempt(attemptData);
      
      const quizData = await quizApi.getQuiz(attemptData.quiz);
      setQuiz(quizData);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !attempt || !quiz) {
    return <div>Loading results...</div>;
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>{quiz.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold ${scoreColor(attempt.score || 0)}`}>
              {attempt.score?.toFixed(1)}%
            </div>
            <p className="text-muted-foreground">
              {attempt.student_answers?.filter((sa) => sa.is_correct).length || 0} out of{' '}
              {quiz.questions.length} correct
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Question Review</h3>
            {quiz.questions.map((question, idx) => {
              const studentAnswer = attempt.student_answers?.find(
                (sa) => sa.question === question.id
              );
              const isCorrect = studentAnswer?.is_correct;

              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        Question {idx + 1}: {question.question_text}
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {question.answers.map((answer) => {
                      const isSelected = studentAnswer?.selected_answer_ids?.includes(answer.id);
                      const isCorrectAnswer = answer.is_correct;

                      return (
                        <div
                          key={answer.id}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? 'bg-green-50 border-green-200'
                              : isSelected
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{answer.answer_text}</span>
                            {isCorrectAnswer && (
                              <Badge variant="default" className="bg-green-600">
                                Correct
                              </Badge>
                            )}
                            {isSelected && !isCorrectAnswer && (
                              <Badge variant="destructive">Your Answer</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button onClick={() => router.push('/student/quizzes')} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
