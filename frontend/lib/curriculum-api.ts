import apiClient from './apiClient'

export interface Track {
  id: number
  code: string
  name: string
  description: string
  icon: string
  duration_weeks: number
  projects: Project[]
  overall_progress: number
}

export interface Project {
  id: number
  number: number
  title: string
  subtitle: string
  description: string
  project_type: string
  tech_stack: string[]
  estimated_hours: number
  steps: ProjectStep[]
  deliverables: Deliverable[]
  progress_percentage: number
  is_unlocked: boolean
  github_repo_url?: string
  github_repo_name?: string
  github_repo_created?: boolean
}

export interface ProjectStep {
  id: number
  step_number: number
  title: string
  description: string
  estimated_minutes: number
  resources: any[]
  order: number
  is_completed: boolean
}

export interface Deliverable {
  id: number
  title: string
  description: string
  deliverable_type: string
  is_required: boolean
  order: number
}

export interface StudentProgress {
  id: number
  project: number
  project_title: string
  step: number | null
  step_title: string | null
  is_completed: boolean
  completed_at: string | null
  notes: string
  created_at: string
}

export interface Submission {
  id: number
  deliverable: number
  deliverable_title: string
  deliverable_type: string
  project_title: string
  submission_url: string
  submission_text: string
  submission_file: string
  status: string
  feedback: string
  student_name: string
  reviewer_name: string | null
  reviewed_at: string | null
  submitted_at: string
  updated_at: string
}

export const curriculumApi = {
  // Get all tracks with projects
  getTracks: async (): Promise<Track[]> => {
    const response = await apiClient.get('/curriculum/tracks/')
    return response.data
  },

  // Get specific track
  getTrack: async (id: number): Promise<Track> => {
    const response = await apiClient.get(`/curriculum/tracks/${id}/`)
    return response.data
  },

  // Get student's progress for a track
  getTrackProgress: async (trackId: number): Promise<StudentProgress[]> => {
    const response = await apiClient.get(`/curriculum/tracks/${trackId}/my_progress/`)
    return response.data
  },

  // Get projects (optionally filter by track)
  getProjects: async (trackCode?: string): Promise<Project[]> => {
    const params = trackCode ? { track: trackCode } : {}
    const response = await apiClient.get('/curriculum/projects/', { params })
    return response.data
  },

  // Get specific project
  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/curriculum/projects/${id}/`)
    return response.data
  },

  // Get student's progress
  getMyProgress: async (): Promise<StudentProgress[]> => {
    const response = await apiClient.get('/curriculum/progress/')
    return response.data
  },

  // Mark step as complete
  markStepComplete: async (stepId: number, projectId: number): Promise<StudentProgress> => {
    const response = await apiClient.post('/curriculum/progress/mark_step_complete/', {
      step_id: stepId,
      project_id: projectId
    })
    return response.data
  },

  // Mark step as incomplete
  markStepIncomplete: async (stepId: number, projectId: number): Promise<StudentProgress> => {
    const response = await apiClient.post('/curriculum/progress/mark_step_incomplete/', {
      step_id: stepId,
      project_id: projectId
    })
    return response.data
  },

  // Get submissions
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await apiClient.get('/curriculum/submissions/')
    return response.data
  },

  // Create submission
  createSubmission: async (data: {
    deliverable: number
    submission_url?: string
    submission_text?: string
    submission_file?: string
  }): Promise<Submission> => {
    const response = await apiClient.post('/curriculum/submissions/', data)
    return response.data
  },

  // Review submission (trainer only)
  reviewSubmission: async (submissionId: number, status: string, feedback: string): Promise<Submission> => {
    const response = await apiClient.post(`/curriculum/submissions/${submissionId}/review/`, {
      status,
      feedback
    })
    return response.data
  }
}
