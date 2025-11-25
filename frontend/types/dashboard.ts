export interface DashboardOverview {
  totalUsers: number;
  activeDelta: string;
  activeWorkspaces: number;
  revenueMonth: number;
  revenueDelta: string;
  systemHealthy: boolean;
  lastChecked: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'trainer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
}

export interface BatchData {
  id: string;
  name: string;
  trainer: string;
  students: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface PaymentData {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  method: string;
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
