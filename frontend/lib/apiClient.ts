// lib/apiClient.ts

import axios, { AxiosInstance } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshAccessToken,
} from "./auth";

// Ensure the API URL is provided via environment variable
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

if (!baseURL && typeof window !== 'undefined') {
  console.warn(
    "NEXT_PUBLIC_API_URL is not set. Using relative URLs (/api) which will be proxied by Next.js rewrites."
  );
}

// Log the baseURL for debugging
if (typeof window !== 'undefined') {
  console.log('API Client initialized with baseURL:', baseURL ? `${baseURL}/api` : "/api");
}

const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to headers
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await refreshAccessToken(getRefreshToken()!);
        saveTokens(refreshRes.access, refreshRes.refresh);
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${refreshRes.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Verify apiClient is properly initialized
if (typeof window !== 'undefined' && !apiClient) {
  console.error('CRITICAL: apiClient failed to initialize!');
}

export default apiClient;
