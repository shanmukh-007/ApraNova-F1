import apiClient from '@/lib/apiClient';
import type { UserData, BatchData, PaymentData, SystemMetric, DashboardOverview } from '@/types';

export const adminService = {
  /**
   * Get dashboard overview
   */
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get('/admin/dashboard/overview/');
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async (): Promise<UserData[]> => {
    const response = await apiClient.get('/admin/users/');
    return response.data;
  },

  /**
   * Create a new user
   */
  createUser: async (user: Omit<UserData, 'id'>): Promise<UserData> => {
    const response = await apiClient.post('/admin/users/', user);
    return response.data;
  },

  /**
   * Update a user
   */
  updateUser: async (userId: string, user: Partial<UserData>): Promise<UserData> => {
    const response = await apiClient.put(`/admin/users/${userId}/`, user);
    return response.data;
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}/`);
  },

  /**
   * Update user role
   */
  updateUserRole: async (role: 'student' | 'trainer' | 'admin'): Promise<{ role: string }> => {
    const response = await apiClient.post('/users/update-role/', { role });
    return response.data;
  },

  /**
   * Get all batches
   */
  getBatches: async (): Promise<BatchData[]> => {
    const response = await apiClient.get('/admin/batches/');
    return response.data;
  },

  /**
   * Create a new batch
   */
  createBatch: async (batch: Omit<BatchData, 'id'>): Promise<BatchData> => {
    const response = await apiClient.post('/admin/batches/', batch);
    return response.data;
  },

  /**
   * Update a batch
   */
  updateBatch: async (batchId: string, batch: Partial<BatchData>): Promise<BatchData> => {
    const response = await apiClient.put(`/admin/batches/${batchId}/`, batch);
    return response.data;
  },

  /**
   * Delete a batch
   */
  deleteBatch: async (batchId: string): Promise<void> => {
    await apiClient.delete(`/admin/batches/${batchId}/`);
  },

  /**
   * Get all payments
   */
  getPayments: async (): Promise<PaymentData[]> => {
    const response = await apiClient.get('/admin/payments/');
    return response.data;
  },

  /**
   * Get system metrics
   */
  getSystemMetrics: async (): Promise<SystemMetric[]> => {
    const response = await apiClient.get('/admin/system/metrics/');
    return response.data;
  },

  /**
   * Get analytics data
   */
  getAnalytics: async (period: 'day' | 'week' | 'month' | 'year') => {
    const response = await apiClient.get('/admin/analytics/', { params: { period } });
    return response.data;
  },

  /**
   * Export data
   */
  exportData: async (type: 'users' | 'batches' | 'payments', format: 'csv' | 'json') => {
    const response = await apiClient.get(`/admin/export/${type}/`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
