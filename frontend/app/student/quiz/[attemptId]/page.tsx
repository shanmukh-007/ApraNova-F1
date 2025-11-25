'use client';

import { QuizTaking } from '@/components/student/quiz-taking';
import { use } from 'react';

export default function QuizAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  
  return (
    <div className="container mx-auto p-6">
      <QuizTaking attemptId={parseInt(attemptId)} />
    </div>
  );
}
