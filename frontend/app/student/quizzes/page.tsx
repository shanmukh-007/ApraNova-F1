'use client';

import { QuizList } from '@/components/student/quiz-list';

export default function StudentQuizzesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes</p>
      </div>

      <QuizList />
    </div>
  );
}
