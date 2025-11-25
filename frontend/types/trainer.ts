export interface TrainerStudent {
  id: string;
  name: string;
  email: string;
  batch: string;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'lecture' | 'lab' | 'assessment' | 'meeting';
  batch: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TrainerSubmission {
  id: string;
  studentId: string;
  studentName: string;
  projectTitle: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  grade?: number;
}

export interface BatchProgress {
  batchId: string;
  batchName: string;
  totalStudents: number;
  averageProgress: number;
  completedProjects: number;
  pendingSubmissions: number;
}
