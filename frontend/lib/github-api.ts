/**
 * GitHub API client functions
 */
import apiClient from './apiClient'

export interface GitHubStatus {
  connected: boolean
  username: string
  avatar: string
}

export interface StartProjectResponse {
  success: boolean
  repo_url?: string
  repo_name?: string
  clone_url?: string
  ssh_url?: string
  error?: string
  already_exists?: boolean
}

/**
 * Check GitHub connection status
 */
export async function getGitHubStatus(): Promise<GitHubStatus> {
  const response = await apiClient.get('/users/github/status/')
  return response.data
}

/**
 * Connect GitHub account (redirects to GitHub OAuth)
 */
export function connectGitHub() {
  // Get token from localStorage (using correct key)
  const token = localStorage.getItem('access_token')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  // Include token in URL as query parameter for the redirect
  window.location.href = `${baseUrl}/api/users/github/connect/?token=${token}`
}

/**
 * Disconnect GitHub account
 */
export async function disconnectGitHub(): Promise<void> {
  await apiClient.post('/users/github/disconnect/')
}

/**
 * Start a project (create GitHub repo from template)
 */
export async function startProject(projectId: number): Promise<StartProjectResponse> {
  const response = await apiClient.post(`/curriculum/projects/${projectId}/start_project/`)
  return response.data
}
