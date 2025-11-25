import { STORAGE_KEYS } from '@/constants/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function loginWithGoogle() {
  window.location.href = `${API_URL}/accounts/google/login/`;
}

export async function loginWithGitHub() {
  window.location.href = `${API_URL}/accounts/github/login/`;
}

export async function getUserProfile(accessToken: string) {
  const response = await fetch(`${API_URL}/api/users/profile/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${API_URL}/api/users/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!response.ok) throw new Error('Failed to refresh token');
  return response.json();
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}
