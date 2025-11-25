export const APP_CONFIG = {
  APP_NAME: 'Apranova',
  APP_DESCRIPTION: 'Learning Management System',
  APP_VERSION: '1.0.0',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const AUTH_CONFIG = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY: 3600, // 1 hour in seconds
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  THEME: 'theme',
} as const;

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
] as const;

export const STATUS_COLORS = {
  active: 'hsl(var(--chart-1))',
  inactive: 'hsl(var(--muted))',
  pending: 'hsl(var(--chart-3))',
  completed: 'hsl(var(--chart-2))',
  failed: 'hsl(var(--destructive))',
} as const;
