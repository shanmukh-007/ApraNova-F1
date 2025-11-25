"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ToolCard from "@/components/student/tool-card"
import {
  ArrowLeft,
  CheckCircle2,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  ExternalLink,
  Github,
  Upload,
  FileText,
  Database,
  BarChart3,
  Code,
  Loader2,
} from "lucide-react"
import { curriculumApi, type Project } from "@/lib/curriculum-api"
import apiClient from "@/lib/apiClient"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [dbCredentials, setDbCredentials] = useState<any>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<Record<string, any>>({})

  const handleInputChange = (deliverableId: string, field: string, value: string) => {
    setSubmissions(prev => ({
      ...prev,
      [deliverableId]: {
        ...prev[deliverableId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      // Submit each deliverable
      const submissionPromises = Object.entries(submissions).map(async ([deliverableId, data]) => {
        if (data.url || data.file) {
          return apiClient.post('/submissions/', {
            project: projectId,
            deliverable: deliverableId,
            submission_url: data.url,
            notes: data.notes || ''
          })
        }
      })
      
      await Promise.all(submissionPromises.filter(Boolean))
      setSubmitSuccess(true)
      
      // Reset submissions after successful submit
      setTimeout(() => {
        setSubmissions({})
      }, 2000)
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchProject() {
      try {
        const [profileResponse, tracks] = await Promise.all([
          apiClient.get("/users/profile"),
          curriculumApi.getTracks()
        ])
        
        setUserProfile(profileResponse.data)
        
        // Find the project across all tracks
        for (const track of tracks) {
          const foundProject = track.projects.find(p => p.id.toString() === projectId)
          if (foundProject) {
            setProject(foundProject)
            break
          }
        }
        
        // Fetch DB credentials if DP track
        if (profileResponse.data.track === 'DP') {
          try {
            const credResponse = await apiClient.get("/users/db-credentials")
            setDbCredentials(credResponse.data)
          } catch (error) {
            console.error("Failed to fetch DB credentials:", error)
          }
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto">
        <Alert className="border-2 border-red-300 bg-red-50 dark:bg-red-950/30">
          <AlertDescription>
            <div className="font-semibold text-red-900 dark:text-red-100">Project Not Found</div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1">
              The project you're looking for doesn't exist or you don't have access to it.
            </div>
            <Button asChild size="sm" className="mt-3" variant="outline">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const isCompleted = project.progress_percentage === 100
  const isInProgress = project.progress_percentage > 0 && project.progress_percentage < 100
  const completedSteps = project.steps.filter(s => s.is_completed).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/student/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Project Header */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isInProgress
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : project.number}
                </div>
                <div>
                  <CardTitle className="text-3xl">Project {project.number}: {project.title}</CardTitle>
                  {project.subtitle && (
                    <CardDescription className="text-base mt-1">{project.subtitle}</CardDescription>
                  )}
                </div>
              </div>
              
              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech: string, i: number) => (
                    <Badge key={i} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="text-right space-y-2">
              <Badge
                className={`text-sm ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : isInProgress
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {isCompleted ? "✓ Complete" : isInProgress ? "In Progress" : "Not Started"}
              </Badge>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {project.progress_percentage}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{project.estimated_hours}h estimated</span>
              </div>
              <span>{completedSteps} / {project.steps.length} steps completed</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {project.github_repo_url && (
              <Button asChild variant="outline">
                <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View Repository
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/student/project-guide">
                <BookOpen className="mr-2 h-4 w-4" />
                View Guide
              </Link>
            </Button>
            {isCompleted && (
              <Button asChild variant="outline">
                <Link href="/student/submit">
                  <Upload className="mr-2 h-4 w-4" />
                  View Submissions
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Tools */}
      {userProfile && userProfile.track === 'DP' && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Project Tools & Resources
            </CardTitle>
            <CardDescription>Access your development tools and database credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Jupyter Lab */}
            <ToolCard
              icon={<Code className="w-6 h-6" />}
              title="Jupyter Lab"
              description="Python notebook for data cleaning and analysis"
              url={userProfile.jupyter_url || "http://localhost:8888"}
              status="active"
              color="orange"
            />

            {/* PostgreSQL Credentials */}
            {dbCredentials && (
              <ToolCard
                icon={<Database className="w-6 h-6" />}
                title="PostgreSQL Database"
                description="Your dedicated database schema for this project"
                credentials={{
                  host: dbCredentials.host || "localhost",
                  port: dbCredentials.port || "5432",
                  database: dbCredentials.database || "apranova_db",
                  schema: dbCredentials.schema_name || `dp_student_${userProfile.id}`,
                  username: dbCredentials.username || "student",
                  password: dbCredentials.password || "••••••••",
                  connectionString: dbCredentials.connection_string || `postgresql://${dbCredentials.username}:${dbCredentials.password}@${dbCredentials.host}:${dbCredentials.port}/${dbCredentials.database}`
                }}
                status="active"
                color="blue"
              />
            )}

            {/* Apache Superset */}
            <ToolCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Apache Superset"
              description="Build interactive dashboards and visualizations"
              url={userProfile.superset_url || "http://localhost:8088"}
              status="active"
              color="cyan"
            />
          </CardContent>
        </Card>
      )}

      {/* FSD Track Tools */}
      {userProfile && userProfile.track === 'FSD' && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Project Tools & Resources
            </CardTitle>
            <CardDescription>Access your development environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Workspace / Code Server */}
            <ToolCard
              icon={<Code className="w-6 h-6" />}
              title="Cloud IDE"
              description="VS Code in your browser for full-stack development"
              url={userProfile.workspace_url || "http://localhost:8080"}
              status={userProfile.tools_provisioned ? 'active' : 'provisioning'}
              color="blue"
            />

            {/* GitHub */}
            {project?.github_repo_url && (
              <ToolCard
                icon={<Github className="w-6 h-6" />}
                title="GitHub Repository"
                description="Your project code repository"
                url={project.github_repo_url}
                status="active"
                color="purple"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Steps */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Project Steps
          </CardTitle>
          <CardDescription>Follow these steps to complete the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.steps.map((step, index) => {
            const stepCompleted = step.is_completed
            const stepInProgress = !step.is_completed && step.order === project.steps.find(s => !s.is_completed)?.order
            
            return (
              <div 
                key={step.id} 
                className={`rounded-xl border-2 p-5 transition-all ${
                  stepCompleted 
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' 
                    : stepInProgress
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                    stepCompleted
                      ? 'bg-emerald-500 text-white'
                      : stepInProgress
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {stepCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm">{step.step_number}</span>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className={`font-semibold text-lg ${
                          stepCompleted 
                            ? 'text-emerald-900 dark:text-emerald-100' 
                            : stepInProgress
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {step.title}
                        </div>
                        <div className={`text-sm ${
                          stepCompleted
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : stepInProgress
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {step.description}
                        </div>
                      </div>
                      
                      <Badge
                        className={`${
                          stepCompleted
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : stepInProgress
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {stepCompleted ? "Done" : stepInProgress ? "Active" : "Pending"}
                      </Badge>
                    </div>

                    {/* Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.resources.map((resource: any, i: number) => (
                          <Button key={i} asChild size="sm" variant="outline">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-3 w-3" />
                              {resource.title || `Resource ${i + 1}`}
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Estimated Time */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      <span>{step.estimated_minutes} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Deliverables & Submission Form */}
      {project.deliverables && project.deliverables.length > 0 && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Your Work
            </CardTitle>
            <CardDescription>Upload your deliverables for trainer review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitSuccess && (
              <Alert className="border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-900 dark:text-emerald-100">
                  Successfully submitted for review! Your trainer will review your work soon.
                </AlertDescription>
              </Alert>
            )}

            {project.deliverables.map((deliverable: any) => {
              const submissionData = submissions[deliverable.id] || {}
              const isSubmitted = submissionData.status === 'SUBMITTED' || submissionData.status === 'UNDER_REVIEW'
              
              return (
                <div 
                  key={deliverable.id}
                  className={`rounded-lg border-2 p-4 space-y-3 ${
                    isSubmitted 
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {deliverable.title}
                        {deliverable.is_required && (
                          <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Required</Badge>
                        )}
                        {isSubmitted && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                      {deliverable.description && (
                        <div className="text-sm text-muted-foreground">
                          {deliverable.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {deliverable.deliverable_type}
                    </Badge>
                  </div>

                  {/* Submission Input based on type */}
                  {deliverable.deliverable_type === 'LINK' && (
                    <input
                      type="url"
                      placeholder="https://your-dashboard-url.com"
                      value={submissionData.url || ''}
                      onChange={(e) => handleInputChange(deliverable.id, 'url', e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-3 py-2 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-background text-foreground focus:border-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                  
                  {deliverable.deliverable_type === 'GITHUB' && (
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={submissionData.url || ''}
                      onChange={(e) => handleInputChange(deliverable.id, 'url', e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-3 py-2 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-background text-foreground focus:border-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                  
                  {deliverable.deliverable_type === 'FILE' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleInputChange(deliverable.id, 'file', e.target.files?.[0])}
                        disabled={isSubmitted}
                        className="flex-1 text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/50 dark:file:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                  
                  {deliverable.deliverable_type === 'TEXT' && (
                    <textarea
                      placeholder="Enter your description or notes..."
                      rows={3}
                      value={submissionData.text_content || ''}
                      onChange={(e) => handleInputChange(deliverable.id, 'text_content', e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-3 py-2 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-background text-foreground focus:border-cyan-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                </div>
              )
            })}
            
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
