export const ROLES = {
  STUDENT: 'student',
  TRAINER: 'trainer',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: {
    canAccessDashboard: true,
    canAccessWorkspace: true,
    canSubmitProjects: true,
    canViewGrades: true,
  },
  [ROLES.TRAINER]: {
    canAccessDashboard: true,
    canManageStudents: true,
    canGradeSubmissions: true,
    canCreateSchedule: true,
    canViewAnalytics: true,
  },
  [ROLES.ADMIN]: {
    canAccessDashboard: true,
    canManageUsers: true,
    canManageBatches: true,
    canViewPayments: true,
    canManageSystem: true,
    canViewAllAnalytics: true,
  },
} as const;
