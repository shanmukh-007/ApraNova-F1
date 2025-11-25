import apiClient from '@/lib/apiClient';
import { API_CONFIG } from '@/constants/config';
import type { User, AuthTokens, LoginCredentials, SignupData, AuthResponse } from '@/types';

const API_URL = API_CONFIG.BASE_URL;

export const authService = {
  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/api/auth/google/`;
  },

  /**
   * Initiate GitHub OAuth login
   */
  loginWithGitHub: () => {
    window.location.href = `${API_URL}/api/auth/github/`;
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/registration/', data);
    return response.data;
  },

  /**
   * Get user profile
   */
  getUserProfile: async (accessToken: string): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  /**
   * Refresh access token
   */
  refreshAccessToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await fetch(`${API_URL}/api/users/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json();
  },

  /**
   * Request password reset
   * Uses dj-rest-auth endpoint
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password/reset/', { email });
  },

  /**
   * Reset password with token
   * Uses dj-rest-auth endpoint
   */
  resetPassword: async (uid: string, token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/password/reset/confirm/', { 
      uid,
      token,
      new_password1: newPassword,
      new_password2: newPassword
    });
  },

  /**
   * Logout user by blacklisting refresh token
   */
  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post('/users/logout/', { refresh: refreshToken });
    } catch (error) {
      // Even if backend call fails, we still want to clear local tokens
      console.error('Logout error:', error);
    }
  },
};
