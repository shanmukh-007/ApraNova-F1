import apiClient from './apiClient';

export interface Quiz {
  id: number;
  title: string;
  description: string;
  created_by_name: string;
  generation_type: 'PROMPT' | 'WEB_SEARCH';
  is_active: boolean;
  created_at: string;
  question_count: number;
}

export interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'SINGLE' | 'MULTIPLE';
  order: number;
  answers: Answer[];
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface QuizAttempt {
  id: number;
  student: number;
  student_name: string;
  quiz: number;
  quiz_title: string;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  score: number | null;
  started_at: string;
  submitted_at: string | null;
  student_answers: StudentAnswer[];
}

export interface StudentAnswer {
  id: number;
  question: number;
  selected_answer_ids?: number[];
  is_correct: boolean | null;
  answered_at: string;
}

export interface GenerateQuizRequest {
  title: string;
  prompt: string;
  generation_type: 'PROMPT' | 'WEB_SEARCH';
  num_questions: number;
}

export const quizApi = {
  // Trainer endpoints
  generateQuiz: async (data: GenerateQuizRequest): Promise<QuizDetail> => {
    const response = await apiClient.post('/quiz/quizzes/generate/', data);
    return response.data;
  },

  listQuizzes: async (): Promise<Quiz[]> => {
    const response = await apiClient.get('/quiz/quizzes/');
    return response.data;
  },

  getQuiz: async (id: number): Promise<QuizDetail> => {
    const response = await apiClient.get(`/quiz/quizzes/${id}/`);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await apiClient.delete(`/quiz/quizzes/${id}/`);
  },

  // Student endpoints
  startQuiz: async (quizId: number): Promise<QuizAttempt> => {
    const response = await apiClient.post(`/quiz/quizzes/${quizId}/start/`);
    return response.data;
  },

  submitAnswer: async (
    attemptId: number,
    questionId: number,
    answerIds: number[]
  ): Promise<StudentAnswer> => {
    const response = await apiClient.post(`/quiz/attempts/${attemptId}/answer/`, {
      question_id: questionId,
      answer_ids: answerIds,
    });
    return response.data;
  },

  submitQuiz: async (attemptId: number): Promise<QuizAttempt> => {
    const response = await apiClient.post(`/quiz/attempts/${attemptId}/submit/`);
    return response.data;
  },

  getAttempt: async (attemptId: number): Promise<QuizAttempt> => {
    const response = await apiClient.get(`/quiz/attempts/${attemptId}/`);
    return response.data;
  },

  getMyAttempts: async (): Promise<QuizAttempt[]> => {
    const response = await apiClient.get('/quiz/attempts/');
    return response.data;
  },

  getQuizAttempts: async (quizId: number): Promise<QuizAttempt[]> => {
    const response = await apiClient.get(`/quiz/quizzes/${quizId}/attempts/`);
    return response.data;
  },
};
