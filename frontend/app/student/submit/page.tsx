"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  AlertCircle,
  ExternalLink,
  Github,
  ArrowRight,
} from "lucide-react"
import { curriculumApi } from "@/lib/curriculum-api"
import apiClient from "@/lib/apiClient"

interface Submission {
  id: number
  project_id: number
  deliverable_id: number
  deliverable_type: string
  url: string
  text_content: string
  status: string
  submitted_at: string
  reviewed_at: string | null
  trainer_feedback: string
  grade: number | null
}

export default function SubmitPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileResponse, submissionsResponse, tracks] = await Promise.all([
          apiClient.get("/users/profile"),
          apiClient.get("/submissions/"),
          curriculumApi.getTracks()
        ])
        
        setUserProfile(profileResponse.data)
        setSubmissions(submissionsResponse.data)
        
        // Get all projects from user's track
        const userTrack = tracks.find((t: any) => t.code === profileResponse.data.track)
        if (userTrack) {
          setProjects(userTrack.projects)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    )
  }

  // Calculate statistics
  const totalSubmissions = submissions.length
  const submittedCount = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length
  const revisionCount = submissions.filter(s => s.status === 'REVISION_REQUESTED').length

  // Group submissions by project
  const submissionsByProject = submissions.reduce((acc: any, sub) => {
    if (!acc[sub.project_id]) {
      acc[sub.project_id] = []
    }
    acc[sub.project_id].push(sub)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Submit Your Work
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your project submissions and get feedback from trainers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </div>
              <Upload className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{submittedCount}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Under Review</div>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{approvedCount}</div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">Approved</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{revisionCount}</div>
                <div className="text-sm text-amber-600 dark:text-amber-400">Needs Revision</div>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Before You Submit Checklist */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Before You Submit
          </CardTitle>
          <CardDescription>Make sure you meet all requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">Code is committed to GitHub</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">All requirements completed</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">Code is tested and working</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">Documentation updated</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm">Ready to submit</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Progress: 4/5 checks completed
          </div>
        </CardContent>
      </Card>

      {/* Project Submissions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Submissions</h2>
        
        {projects.length === 0 ? (
          <Alert>
            <AlertDescription>
              No projects available yet. Complete your enrollment to access projects.
            </AlertDescription>
          </Alert>
        ) : (
          projects.map((project) => {
            const projectSubmissions = submissionsByProject[project.id] || []
            const hasSubmissions = projectSubmissions.length > 0
            
            return (
              <Card key={project.id} className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        Project {project.number}: {project.title}
                      </CardTitle>
                      {project.subtitle && (
                        <CardDescription>{project.subtitle}</CardDescription>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/student/projects/${project.id}`}>
                        View Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!hasSubmissions ? (
                    <Alert>
                      <AlertDescription className="flex items-center justify-between">
                        <span>No submissions yet for this project</span>
                        <Button asChild size="sm">
                          <Link href={`/student/projects/${project.id}`}>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Now
                          </Link>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2">
                      {projectSubmissions.map((submission: Submission) => (
                        <div
                          key={submission.id}
                          className={`rounded-lg border-2 p-4 ${
                            submission.status === 'APPROVED'
                              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                              : submission.status === 'REVISION_REQUESTED'
                              ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
                              : submission.status === 'REJECTED'
                              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
                              : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {submission.deliverable_type}
                                </Badge>
                                <Badge
                                  className={`text-xs ${
                                    submission.status === 'APPROVED'
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                      : submission.status === 'REVISION_REQUESTED'
                                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                                      : submission.status === 'REJECTED'
                                      ? 'bg-red-100 text-red-700 border-red-300'
                                      : 'bg-blue-100 text-blue-700 border-blue-300'
                                  }`}
                                >
                                  {submission.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              {submission.url && (
                                <a
                                  href={submission.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  {submission.deliverable_type === 'GITHUB' ? (
                                    <Github className="h-3 w-3" />
                                  ) : (
                                    <ExternalLink className="h-3 w-3" />
                                  )}
                                  {submission.url}
                                </a>
                              )}
                              
                              {submission.text_content && (
                                <p className="text-sm text-muted-foreground">
                                  {submission.text_content.substring(0, 100)}
                                  {submission.text_content.length > 100 && '...'}
                                </p>
                              )}
                              
                              <div className="text-xs text-muted-foreground">
                                Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                              </div>
                              
                              {submission.trainer_feedback && (
                                <Alert className="mt-2">
                                  <AlertDescription>
                                    <div className="font-semibold text-sm mb-1">Trainer Feedback:</div>
                                    <div className="text-sm">{submission.trainer_feedback}</div>
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {submission.grade && (
                                <div className="text-sm font-semibold">
                                  Grade: {submission.grade}/100
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Git Verification Section (Optional Enhancement) */}
      {userProfile?.github_connected && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Git Verification
            </CardTitle>
            <CardDescription>Your GitHub activity status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <div className="space-y-1">
                <div className="font-semibold">Status</div>
                <div className="text-sm text-muted-foreground">
                  Latest commit: Today 10:21 • Author: Student
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                Verified
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
