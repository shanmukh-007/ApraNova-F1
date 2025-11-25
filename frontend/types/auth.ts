export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'trainer' | 'admin';
  avatar?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'trainer';
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
