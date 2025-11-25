"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { curriculumApi, type Submission } from "@/lib/curriculum-api"
import { ExternalLink, Github, FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const data = await curriculumApi.getSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
      case "APPROVED":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" />Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Needs Revision</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "GITHUB":
        return <Github className="h-4 w-4" />
      case "LINK":
        return <ExternalLink className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Start working on your projects and submit your deliverables to see them here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Submissions</h2>
        <p className="text-muted-foreground">
          Track all your project submissions and feedback
        </p>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getIcon(submission.deliverable_type)}
                    {submission.deliverable_title}
                  </CardTitle>
                  <CardDescription>
                    Project: {submission.project_title}
                  </CardDescription>
                </div>
                {getStatusBadge(submission.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Submission URL */}
              {submission.submission_url && (
                <div>
                  <p className="text-sm font-medium mb-1">Submitted Link:</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="h-3 w-3" />
                      View Submission
                    </a>
                  </Button>
                </div>
              )}

              {/* Submission Text/Notes */}
              {submission.submission_text && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {submission.submission_text}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {submission.feedback && (
                <div>
                  <p className="text-sm font-medium mb-1">Trainer Feedback:</p>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-sm">{submission.feedback}</p>
                    {submission.reviewer_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        — {submission.reviewer_name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Submitted {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                </span>
                {submission.reviewed_at && (
                  <span>
                    • Reviewed {formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
