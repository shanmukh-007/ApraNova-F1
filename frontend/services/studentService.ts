import apiClient from '@/lib/apiClient';
import type { Project, Submission, Workspace } from '@/types';

export const studentService = {
  /**
   * Get all projects for the student
   */
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/student/projects/');
    return response.data;
  },

  /**
   * Get a specific project by ID
   */
  getProject: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get(`/student/projects/${projectId}/`);
    return response.data;
  },

  /**
   * Get student's workspace
   */
  getWorkspace: async (): Promise<Workspace> => {
    const response = await apiClient.get('/student/workspace/');
    return response.data;
  },

  /**
   * Save workspace file
   */
  saveWorkspaceFile: async (fileId: string, content: string): Promise<void> => {
    await apiClient.put(`/student/workspace/files/${fileId}/`, { content });
  },

  /**
   * Submit a project
   */
  submitProject: async (projectId: string, files: File[]): Promise<Submission> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post(`/student/projects/${projectId}/submit/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get submission history
   */
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await apiClient.get('/student/submissions/');
    return response.data;
  },

  /**
   * Get a specific submission
   */
  getSubmission: async (submissionId: string): Promise<Submission> => {
    const response = await apiClient.get(`/student/submissions/${submissionId}/`);
    return response.data;
  },

  /**
   * Get dashboard stats
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/student/dashboard/stats/');
    return response.data;
  },
};
