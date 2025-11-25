export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',
  
  AUTH: {
    CALLBACK: '/auth/callback',
  },
  
  STUDENT: {
    BASE: '/student',
    DASHBOARD: '/student/dashboard',
    WORKSPACE: '/student/workspace',
    PROJECT_GUIDE: '/student/project-guide',
    SUBMIT: '/student/submit',
  },
  
  TRAINER: {
    BASE: '/trainer',
    DASHBOARD: '/trainer/dashboard',
  },
  
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.RESET_PASSWORD,
  ROUTES.AUTH.CALLBACK,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.STUDENT.BASE,
  ROUTES.TRAINER.BASE,
  ROUTES.ADMIN.BASE,
] as const;
