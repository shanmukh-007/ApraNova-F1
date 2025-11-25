export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted';
  dueDate: string;
  progress: number;
}

export interface Submission {
  id: string;
  projectId: string;
  studentId: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  feedback?: string;
  grade?: number;
  files: SubmissionFile[];
}

export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Workspace {
  id: string;
  name: string;
  lastModified: string;
  files: WorkspaceFile[];
}

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}
