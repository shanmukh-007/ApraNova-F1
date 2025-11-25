"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Database, Code, Clock, CheckCircle2, Circle, Lock, 
  ExternalLink, Github, FileText, Link as LinkIcon, Loader2 
} from "lucide-react"
import { curriculumApi, type Track, type Project, type ProjectStep, type Deliverable, type Submission } from "@/lib/curriculum-api"
import { getGitHubStatus, startProject, type GitHubStatus } from "@/lib/github-api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import apiClient from "@/lib/apiClient"
import SubmissionModal from "./submission-modal"

export default function CurriculumPage() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [userTrack, setUserTrack] = useState<string>("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [githubStatus, setGithubStatus] = useState<GitHubStatus | null>(null)
  const [startingProject, setStartingProject] = useState<number | null>(null)
  const [submissionModal, setSubmissionModal] = useState<{
    open: boolean
    deliverable: Deliverable | null
    projectId: number | null
  }>({
    open: false,
    deliverable: null,
    projectId: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchUserAndCurriculum()
    fetchGitHubStatus()
  }, [])
  
  const fetchGitHubStatus = async () => {
    try {
      const status = await getGitHubStatus()
      setGithubStatus(status)
    } catch (error) {
      console.error('Failed to fetch GitHub status:', error)
    }
  }

  const fetchUserAndCurriculum = async () => {
    try {
      // First, get user profile to know their track
      const profileResponse = await apiClient.get('/users/profile')
      console.log('Profile response:', profileResponse.data)
      
      const userTrackCode = profileResponse.data?.track
      console.log('User track code:', userTrackCode)
      
      if (!userTrackCode) {
        toast({
          title: "Error",
          description: "No track assigned to your account. Please contact support.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      
      setUserTrack(userTrackCode)
      
      // Then fetch all tracks
      const tracksData = await curriculumApi.getTracks()
      console.log('Tracks data:', tracksData)
      
      // Find and set the user's track
      const myTrack = tracksData.find(t => t.code === userTrackCode)
      console.log('My track:', myTrack)
      
      if (myTrack) {
        setSelectedTrack(myTrack)
      } else if (tracksData.length > 0) {
        setSelectedTrack(tracksData[0]) // Fallback
      }

      // Fetch submissions to show status
      const submissionsData = await curriculumApi.getSubmissions()
      setSubmissions(submissionsData)
    } catch (error: any) {
      console.error('Curriculum load error:', error)
      console.error('Error details:', error?.response?.data)
      
      const errorMessage = error?.response?.status === 401 
        ? "Please log in to view curriculum" 
        : error?.message || "Failed to load curriculum"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Redirect to login if unauthorized
      if (error?.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshCurriculum = async () => {
    try {
      const tracksData = await curriculumApi.getTracks()
      const myTrack = tracksData.find(t => t.code === userTrack)
      if (myTrack) {
        setSelectedTrack(myTrack)
      }
    } catch (error) {
      // Silent refresh error
    }
  }

  const handleStepToggle = async (step: ProjectStep, project: Project) => {
    try {
      if (step.is_completed) {
        await curriculumApi.markStepIncomplete(step.id, project.id)
      } else {
        await curriculumApi.markStepComplete(step.id, project.id)
      }
      // Refresh curriculum to update progress
      await refreshCurriculum()
      toast({
        title: "Success",
        description: step.is_completed ? "Step marked as incomplete" : "Step completed!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }

  const handleStartProject = async (projectId: number) => {
    if (!githubStatus?.connected) {
      toast({
        title: "GitHub Not Connected",
        description: "Please connect your GitHub account in Settings first.",
        variant: "destructive",
      })
      return
    }

    setStartingProject(projectId)
    try {
      const result = await startProject(projectId)
      
      if (result.success) {
        toast({
          title: "Project Started!",
          description: result.already_exists 
            ? "Repository already exists" 
            : "Repository created successfully",
        })
        
        // Refresh data
        await fetchUserAndCurriculum()
        await fetchGitHubStatus()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to start project:', error)
      toast({
        title: "Error",
        description: "Failed to start project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setStartingProject(null)
    }
  }

  const getTrackIcon = (code: string) => {
    return code === 'DP' ? <Database className="h-5 w-5" /> : <Code className="h-5 w-5" />
  }

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'LINK':
        return <LinkIcon className="h-4 w-4" />
      case 'GITHUB':
        return <Github className="h-4 w-4" />
      case 'FILE':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDeliverableSubmission = (deliverableId: number) => {
    return submissions.find(s => s.deliverable === deliverableId)
  }

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
      case "APPROVED":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive" className="gap-1">Needs Revision</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading curriculum...</p>
        </div>
      </div>
    )
  }

  if (!selectedTrack) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No curriculum available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/student/dashboard" className="underline-offset-4 hover:underline">
          Dashboard
        </Link>{" "}
        / Project Guide
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedTrack.name} Track
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          {getTrackIcon(selectedTrack.code)}
          {selectedTrack.code}
        </Badge>
      </div>

      {/* Track Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedTrack.name}</CardTitle>
              <CardDescription className="mt-2">{selectedTrack.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedTrack.duration_weeks} weeks
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{selectedTrack.overall_progress}%</span>
            </div>
            <Progress value={selectedTrack.overall_progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <div className="space-y-4">
        {selectedTrack.projects.map((project) => (
          <Card key={project.id} className={!project.is_unlocked ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">
                      Project {project.number}: {project.title}
                    </CardTitle>
                    {!project.is_unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{project.project_type}</Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {project.estimated_hours}h
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-medium mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech, idx) => (
                    <Badge key={idx} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Project Progress</span>
                  <span className="font-medium">{project.progress_percentage}%</span>
                </div>
                <Progress value={project.progress_percentage} className="h-2" />
              </div>

              {/* Start Project Button or Repo Link */}
              {project.is_unlocked && (
                <div className="pt-2">
                  {project.github_repo_created && project.github_repo_url ? (
                    // Show repo link if already created
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Repository Created
                        </p>
                        <a 
                          href={project.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center gap-1"
                        >
                          <Github className="h-3 w-3" />
                          {project.github_repo_name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : project.progress_percentage === 0 ? (
                    // Show start button if not started
                    <>
                      <Button
                        onClick={() => handleStartProject(project.id)}
                        disabled={!githubStatus?.connected || startingProject === project.id}
                        className="w-full sm:w-auto"
                      >
                        {startingProject === project.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Repository...
                          </>
                        ) : (
                          <>
                            <Github className="mr-2 h-4 w-4" />
                            Start Project
                          </>
                        )}
                      </Button>
                      {!githubStatus?.connected && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Connect GitHub in Settings to start this project
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* Workflow Steps */}
              {project.is_unlocked && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger className="text-sm font-medium">
                      Workflow Steps ({project.steps.filter(s => s.is_completed).length}/{project.steps.length} completed)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {project.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              checked={step.is_completed}
                              onCheckedChange={() => handleStepToggle(step, project)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Step {step.step_number}
                                </span>
                                <span className={`text-sm font-medium ${step.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {step.title}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {step.estimated_minutes} minutes
                              </div>
                            </div>
                            {step.is_completed && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Deliverables */}
                  <AccordionItem value="deliverables">
                    <AccordionTrigger className="text-sm font-medium">
                      Deliverables ({project.deliverables.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {project.deliverables.map((deliverable) => {
                          const submission = getDeliverableSubmission(deliverable.id)
                          return (
                            <div
                              key={deliverable.id}
                              className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                              <div className="mt-1">
                                {getDeliverableIcon(deliverable.deliverable_type)}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">{deliverable.title}</span>
                                  {deliverable.is_required && (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  )}
                                  {submission && getSubmissionStatusBadge(submission.status)}
                                </div>
                                {deliverable.description && (
                                  <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {deliverable.deliverable_type}
                                </Badge>
                              </div>
                              {submission ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  asChild
                                >
                                  <Link href="/student/submissions">
                                    View Status
                                  </Link>
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSubmissionModal({
                                    open: true,
                                    deliverable,
                                    projectId: project.id,
                                  })}
                                >
                                  Submit
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {!project.is_unlocked && (
                <div className="text-center py-6 text-muted-foreground">
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Complete Project {project.number - 1} to unlock this project</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submission Modal */}
      {submissionModal.deliverable && submissionModal.projectId && (
        <SubmissionModal
          open={submissionModal.open}
          onClose={() => setSubmissionModal({ open: false, deliverable: null, projectId: null })}
          deliverable={submissionModal.deliverable}
          projectId={submissionModal.projectId}
          onSubmitted={() => {
            // Refresh curriculum to update submission status
            fetchUserAndCurriculum()
          }}
        />
      )}
    </div>
  )
}
