import apiClient from '@/lib/apiClient';
import type { TrainerStudent, Schedule, TrainerSubmission, BatchProgress } from '@/types';

export const trainerService = {
  /**
   * Get all students assigned to the trainer
   */
  getStudents: async (): Promise<TrainerStudent[]> => {
    const response = await apiClient.get('/trainer/students/');
    return response.data;
  },

  /**
   * Get a specific student's details
   */
  getStudent: async (studentId: string): Promise<TrainerStudent> => {
    const response = await apiClient.get(`/trainer/students/${studentId}/`);
    return response.data;
  },

  /**
   * Get all pending submissions
   */
  getSubmissions: async (status?: string): Promise<TrainerSubmission[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/trainer/submissions/', { params });
    return response.data;
  },

  /**
   * Grade a submission
   */
  gradeSubmission: async (submissionId: string, grade: number, feedback: string): Promise<void> => {
    await apiClient.post(`/trainer/submissions/${submissionId}/grade/`, { grade, feedback });
  },

  /**
   * Get trainer's schedule
   */
  getSchedule: async (): Promise<Schedule[]> => {
    const response = await apiClient.get('/trainer/schedule/');
    return response.data;
  },

  /**
   * Create a new schedule item
   */
  createSchedule: async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    const response = await apiClient.post('/trainer/schedule/', schedule);
    return response.data;
  },

  /**
   * Update a schedule item
   */
  updateSchedule: async (scheduleId: string, schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await apiClient.put(`/trainer/schedule/${scheduleId}/`, schedule);
    return response.data;
  },

  /**
   * Delete a schedule item
   */
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    await apiClient.delete(`/trainer/schedule/${scheduleId}/`);
  },

  /**
   * Get batch progress statistics
   */
  getBatchProgress: async (): Promise<BatchProgress[]> => {
    const response = await apiClient.get('/trainer/batches/progress/');
    return response.data;
  },

  /**
   * Get dashboard stats
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/trainer/dashboard/stats/');
    return response.data;
  },
};
