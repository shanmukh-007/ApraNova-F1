"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AutoSaveIndicator from "@/components/student/auto-save-indicator"
import ToolCardsSection from "@/components/student/tool-cards-section"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Rocket,
  BookOpen,
  Upload,
  MessageCircle,
  ExternalLink,
  UserCheck,
  Lock,
  Award,
  Database,
  Code,
  ShieldCheck,
  CreditCard,
} from "lucide-react"
import apiClient from "@/lib/apiClient"
import { curriculumApi, type Track, type Project, type ProjectStep } from "@/lib/curriculum-api"

function formatDate() {
  const d = new Date()
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  return date.toLocaleDateString()
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
}

interface UserProfile {
  name: string
  username: string
  email: string
  track: 'DP' | 'FSD' | null
  enrollment_status: 'PENDING_PAYMENT' | 'ENROLLED' | 'SUSPENDED' | 'COMPLETED' | 'WITHDRAWN'
  payment_verified: boolean
  privacy_accepted: boolean
  privacy_accepted_at: string | null
  tools_provisioned: boolean
  assigned_trainer: { name: string; email: string } | null
  superset_url: string
  prefect_url: string
  jupyter_url: string
  workspace_url: string
  github_username: string
  github_connected: boolean
  enrolled_at: string | null
  graduation_date: string | null
}

export default function StudentDashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [trainerInfo, setTrainerInfo] = useState<{ name: string; email: string } | null>(null)
  const [studentName, setStudentName] = useState("Student")
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [githubCommits, setGithubCommits] = useState<GitHubCommit[]>([])
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [userTrack, setUserTrack] = useState<'DP' | 'FSD' | null>(null)
  const [toolUrls, setToolUrls] = useState({
    superset: '',
    prefect: '',
    jupyter: '',
    workspace: ''
  })
  const [completedProjects, setCompletedProjects] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)

  // Fetch GitHub commits from repository
  async function fetchGithubCommits(repoUrl: string) {
    setLoadingCommits(true)
    try {
      // Extract owner and repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) return
      
      const [, owner, repo] = match
      const cleanRepo = repo.replace(/\.git$/, '')
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepo}/commits?per_page=5`
      )
      
      if (response.ok) {
        const commits = await response.json()
        setGithubCommits(commits)
      }
    } catch (error) {
      console.error("Failed to fetch GitHub commits:", error)
    } finally {
      setLoadingCommits(false)
    }
  }

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch profile and tracks in parallel for faster loading
        const [profileResponse, tracks] = await Promise.all([
          apiClient.get("/users/profile"),
          curriculumApi.getTracks()
        ])
        
        // Store complete user profile
        setUserProfile(profileResponse.data)
        
        // Set student name immediately
        if (profileResponse.data.name || profileResponse.data.username) {
          setStudentName(profileResponse.data.name || profileResponse.data.username)
        }
        
        // Set user track and tool URLs
        if (profileResponse.data.track) {
          setUserTrack(profileResponse.data.track)
        }
        setToolUrls({
          superset: profileResponse.data.superset_url || '',
          prefect: profileResponse.data.prefect_url || '',
          jupyter: profileResponse.data.jupyter_url || '',
          workspace: profileResponse.data.workspace_url || ''
        })
        
        // Set trainer info immediately
        if (profileResponse.data.assigned_trainer) {
          setTrainerInfo({
            name: profileResponse.data.assigned_trainer.name || profileResponse.data.assigned_trainer.email,
            email: profileResponse.data.assigned_trainer.email
          })
        }

        // Process curriculum data
        const userTrackCode = profileResponse.data?.track
        
        if (userTrackCode && tracks.length > 0) {
          // Find user's assigned track
          const userTrack = tracks.find(t => t.code === userTrackCode)
          const track = userTrack || tracks[0]
          
          if (track) {
            setCurrentTrack(track)
            setTotalProjects(track.projects.length)
            setCompletedProjects(track.projects.filter(p => p.progress_percentage === 100).length)
            
            // Find current project
            const inProgressProject = track.projects.find(
              p => p.progress_percentage > 0 && p.progress_percentage < 100
            )
            const unlockedProject = track.projects.find(p => p.is_unlocked)
            const project = inProgressProject || unlockedProject || track.projects[0]
            
            setCurrentProject(project)
            
            // Fetch GitHub commits asynchronously (non-blocking)
            if (project?.github_repo_url) {
              // Don't await - let it load in background
              fetchGithubCommits(project.github_repo_url)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // Skeleton loader component
  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        {/* Hero Skeleton */}
        <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-48"></div>
        
        {/* Trainer Info Skeleton */}
        <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-24"></div>
        
        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-slate-200 dark:bg-slate-800 h-96"></div>
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-64"></div>
            <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-48"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AutoSaveIndicator />

      {/* Hero Section - Cool Theme */}
      <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-purple-950/30 border-2 border-cyan-200 dark:border-cyan-800 p-8 md:p-12 shadow-xl">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 border border-cyan-300 dark:border-cyan-700">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent">{formatDate()}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Welcome back, {studentName}! 👋
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-lg max-w-2xl">
              Ready to continue your learning journey? Let's make today count.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Link href={currentProject ? `/student/projects/${currentProject.id}` : "/student/dashboard"} prefetch={true}>
                <Rocket className="mr-2 h-4 w-4" />
                {currentProject ? "Start Project" : "View Projects"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enrollment Status Banner */}
      {!loading && userProfile && (
        <>
          {/* Payment & Enrollment Status */}
          {userProfile.enrollment_status === 'PENDING_PAYMENT' && (
            <Alert className="border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <AlertDescription className="ml-2">
                <div className="font-semibold text-amber-900 dark:text-amber-100">Payment Required</div>
                <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Complete your payment to unlock full access to the {userProfile.track === 'DP' ? 'Data Professional' : 'Full-Stack Developer'} track.
                </div>
                <Button asChild size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                  <Link href="/payment">Complete Payment</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {userProfile.enrollment_status === 'ENROLLED' && !userProfile.privacy_accepted && (
            <Alert className="border-2 border-blue-300 bg-blue-50 dark:bg-blue-950/30">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <AlertDescription className="ml-2">
                <div className="font-semibold text-blue-900 dark:text-blue-100">Privacy Consent Required</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Please review and accept our privacy policy to continue.
                </div>
                <Button asChild size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                  <Link href="/privacy-consent">Review Privacy Policy</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {userProfile.enrollment_status === 'COMPLETED' && (
            <Alert className="border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
              <Award className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="ml-2">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">🎉 Congratulations!</div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  You've completed the {userProfile.track === 'DP' ? 'Data Professional' : 'Full-Stack Developer'} track. Download your certificate below.
                </div>
                <Button asChild size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/student/certificate">Download Certificate</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Journey Progress Overview */}
          {userProfile.enrollment_status === 'ENROLLED' && userProfile.privacy_accepted && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Track Info */}
              <Card className="border-2 border-cyan-200 dark:border-cyan-800 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                      {userProfile.track === 'DP' ? (
                        <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      ) : (
                        <Code className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Your Track</div>
                      <div className="font-bold text-lg text-cyan-700 dark:text-cyan-300">
                        {userProfile.track === 'DP' ? 'Data Pro' : 'Full-Stack'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Progress */}
              <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                      <div className="font-bold text-lg text-teal-700 dark:text-teal-300">
                        {completedProjects} / {totalProjects}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools Status */}
              <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Tools</div>
                      <div className="font-bold text-lg text-purple-700 dark:text-purple-300">
                        {userProfile.tools_provisioned ? 'Ready' : 'Provisioning'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GitHub Status */}
              <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <svg className="h-5 w-5 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">GitHub</div>
                      <div className="font-bold text-lg text-slate-700 dark:text-slate-300">
                        {userProfile.github_connected ? 'Connected' : 'Not Connected'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Trainer Info */}
      {!loading && trainerInfo && (
        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-blue-900 dark:text-blue-100">Your Trainer</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{trainerInfo.name}</div>
              {trainerInfo.name !== trainerInfo.email && (
                <div className="text-sm text-blue-600 dark:text-blue-400">{trainerInfo.email}</div>
              )}
            </div>
            <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>
        </div>
      )}
      
      {!loading && !trainerInfo && (
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-foreground">Trainer Assignment Pending</div>
              <div className="text-sm text-muted-foreground">
                A dedicated trainer will be assigned to you soon to guide your learning journey.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool Cards Section */}
      {!loading && userTrack && (
        <ToolCardsSection
          track={userTrack}
          currentProjectNumber={currentProject?.number || 1}
          supersetUrl={toolUrls.superset}
          prefectUrl={toolUrls.prefect}
          jupyterUrl={toolUrls.jupyter}
          workspaceUrl={toolUrls.workspace}
        />
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* All Projects Overview */}
        <Card className="lg:col-span-2 border-2 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">
                    {currentTrack ? `${currentTrack.name} Projects` : "Your Learning Path"}
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Complete projects in order to unlock the next one
                </CardDescription>
              </div>
              {currentTrack && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {currentTrack.overall_progress}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTrack && currentTrack.projects.length > 0 ? (
              currentTrack.projects.map((project, index) => {
                const isCompleted = project.progress_percentage === 100
                const isInProgress = project.progress_percentage > 0 && project.progress_percentage < 100
                const isLocked = !project.is_unlocked
                const isCapstone = project.project_type === 'CAPSTONE'
                
                return (
                  <div 
                    key={project.id} 
                    className={`group relative rounded-xl border-2 p-5 transition-all ${
                      isCompleted 
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' 
                        : isInProgress
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                        : isLocked
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-60'
                        : 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Project Number/Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white'
                          : isLocked
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <span className="text-lg">{project.number}</span>
                        )}
                      </div>
                      
                      {/* Project Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className={`font-bold text-lg ${
                                isCompleted 
                                  ? 'text-emerald-900 dark:text-emerald-100' 
                                  : isInProgress
                                  ? 'text-blue-900 dark:text-blue-100'
                                  : isLocked
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-foreground'
                              }`}>
                                Project {project.number}: {project.title}
                              </div>
                              {isCapstone && (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                  Capstone
                                </Badge>
                              )}
                            </div>
                            <div className={`text-sm ${
                              isLocked
                                ? 'text-slate-500 dark:text-slate-500'
                                : 'text-muted-foreground'
                            }`}>
                              {project.subtitle || project.description.substring(0, 80) + '...'}
                            </div>
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {project.tech_stack.slice(0, 4).map((tech: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {project.tech_stack.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.tech_stack.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Status Badge */}
                          <div className="text-right space-y-1">
                            <Badge
                              className={`${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : isInProgress
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : isLocked
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-blue-100 text-blue-700 border-blue-300'
                              }`}
                            >
                              {isCompleted ? "✓ Complete" : isInProgress ? "In Progress" : isLocked ? "🔒 Locked" : "Ready"}
                            </Badge>
                            <div className="text-sm font-bold text-muted-foreground">
                              {project.progress_percentage}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {!isLocked && (
                          <div className="space-y-2">
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${project.progress_percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{project.steps.filter((s: ProjectStep) => s.is_completed).length} / {project.steps.length} steps</span>
                              <span>{project.estimated_hours}h estimated</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!isLocked && (
                            <>
                              <Button 
                                asChild 
                                size="sm" 
                                className={isInProgress ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                <Link href={`/student/projects/${project.id}`}>
                                  {isCompleted ? "Review" : isInProgress ? "Continue" : "Start Project"}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              {project.github_repo_url && (
                                <Button asChild size="sm" variant="outline">
                                  <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    GitHub
                                  </a>
                                </Button>
                              )}
                            </>
                          )}
                          {isLocked && (
                            <div className="text-sm text-muted-foreground italic">
                              Complete Project {project.number - 1} to unlock
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-muted-foreground">
                  {loading ? "Loading projects..." : "No projects available"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects Completed</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {currentTrack?.projects.filter(p => p.progress_percentage === 100).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currentTrack?.projects.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                  <span className="text-2xl font-bold">
                    {currentTrack?.projects.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">


        </div>
      </div>
    </div>
  )
}
