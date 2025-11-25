'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { quizApi, type QuizDetail, type QuizAttempt } from '@/lib/quiz-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuizTakingProps {
  attemptId: number;
}

export function QuizTaking({ attemptId }: QuizTakingProps) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadQuizData();
  }, [attemptId]);

  const loadQuizData = async () => {
    try {
      const attemptData = await quizApi.getAttempt(attemptId);
      setAttempt(attemptData);
      
      const quizData = await quizApi.getQuiz(attemptData.quiz);
      setQuiz(quizData);
      
      // Load existing answers
      const existingAnswers: Record<number, number[]> = {};
      attemptData.student_answers?.forEach((sa) => {
        if (sa.selected_answer_ids) {
          existingAnswers[sa.question] = sa.selected_answer_ids;
        }
      });
      setAnswers(existingAnswers);
    } catch (error) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const handleAnswerChange = async (questionId: number, answerIds: number[]) => {
    setAnswers({ ...answers, [questionId]: answerIds });
    
    // Auto-save answer
    try {
      await quizApi.submitAnswer(attemptId, questionId, answerIds);
    } catch (error) {
      toast.error('Failed to save answer');
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const result = await quizApi.submitQuiz(attemptId);
      toast.success(`Quiz submitted! Score: ${result.score?.toFixed(1)}%`);
      router.push(`/student/quiz/${attemptId}/results`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz || !currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question_text}</h3>
            
            {currentQuestion.question_type === 'SINGLE' ? (
              <RadioGroup
                value={answers[currentQuestion.id]?.[0]?.toString() || ''}
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, [parseInt(value)])
                }
              >
                {currentQuestion.answers.map((answer) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                    <Label htmlFor={`answer-${answer.id}`} className="font-normal">
                      {answer.answer_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {currentQuestion.answers.map((answer) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`answer-${answer.id}`}
                      checked={answers[currentQuestion.id]?.includes(answer.id) || false}
                      onCheckedChange={(checked) => {
                        const current = answers[currentQuestion.id] || [];
                        const updated = checked
                          ? [...current, answer.id]
                          : current.filter((id) => id !== answer.id);
                        handleAnswerChange(currentQuestion.id, updated);
                      }}
                    />
                    <Label htmlFor={`answer-${answer.id}`} className="font-normal">
                      {answer.answer_text}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={idx === currentQuestionIndex ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
