"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { curriculumApi, type Submission } from "@/lib/curriculum-api"
import { ExternalLink, RefreshCcw, Loader2, ThumbsUp, ThumbsDown, InboxIcon } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type StatusTab = "Pending" | "Reviewed" | "All"

export default function SubmissionsQueue() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StatusTab>("Pending")
  const [project, setProject] = useState<string>("All")
  const [sort, setSort] = useState<"Newest" | "Oldest" | "NameAZ">("Newest")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [reviewModal, setReviewModal] = useState<{ open: boolean; submission: Submission | null }>({
    open: false,
    submission: null,
  })
  const [feedback, setFeedback] = useState("")
  const [grade, setGrade] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
    if (autoRefresh) {
      const interval = setInterval(fetchSubmissions, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchSubmissions = async () => {
    try {
      // Fetch from new submissions API
      const response = await fetch('/api/submissions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      // Transform to match expected format
      const transformedData = data.map((sub: any) => ({
        id: sub.id,
        student_name: sub.student_name,
        student_email: sub.student_email,
        project_title: `Project ${sub.project_id}`,
        deliverable_type: sub.deliverable_type,
        url: sub.url,
        text_content: sub.text_content,
        status: sub.status,
        submitted_at: sub.submitted_at,
        reviewed_at: sub.reviewed_at,
        trainer_feedback: sub.trainer_feedback,
        grade: sub.grade,
      }))
      
      setSubmissions(transformedData)
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!reviewModal.submission) return
    if (status === "REJECTED" && !feedback.trim()) {
      toast({ title: "Error", description: "Please provide feedback for rejection", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      // Update submission via new API
      const response = await fetch(`/api/submissions/${reviewModal.submission.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          status: status,
          trainer_feedback: feedback,
          grade: grade
        })
      })

      if (!response.ok) {
        throw new Error('Failed to review submission')
      }

      const updatedSubmission = await response.json()
      
      // Update local state
      setSubmissions(submissions.map(s => 
        s.id === reviewModal.submission?.id ? { ...s, ...updatedSubmission } : s
      ))
      
      toast({ 
        title: "Success", 
        description: `Submission ${status.toLowerCase()} successfully` 
      })
      
      setReviewModal({ open: false, submission: null })
      setFeedback("")
      setGrade(null)
    } catch (error) {
      console.error("Review error:", error)
      toast({ 
        title: "Error", 
        description: "Failed to review submission", 
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  function filteredList() {
    let list = submissions
    if (tab === "Pending") list = list.filter((s) => s.status === "PENDING")
    else if (tab === "Reviewed") list = list.filter((s) => s.status !== "PENDING")
    if (project !== "All") list = list.filter((s) => s.project_title.includes(project))
    if (sort === "Newest") list = [...list].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    if (sort === "Oldest") list = [...list].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
    if (sort === "NameAZ") list = [...list].sort((a, b) => a.student_name.localeCompare(b.student_name))
    return list
  }

  const list = filteredList()
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const pageData = list.slice((page - 1) * pageSize, page * pageSize)
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length

  function StatusBadge({ s }: { s: string }) {
    const cls = s === "PENDING" ? "border-orange-200 bg-orange-50 text-orange-800" : s === "APPROVED" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-yellow-200 bg-yellow-50 text-yellow-800"
    const icon = s === "PENDING" ? "⏳" : s === "APPROVED" ? "✅" : "⚠️"
    return <Badge className={cn("border", cls)}><span className="mr-1">{icon}</span> {s === "PENDING" ? "Pending Review" : s === "APPROVED" ? "Approved" : "Changes Requested"}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Submission Queue</CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchSubmissions}><RefreshCcw className="mr-2 size-4" />Refresh</Button>
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
                <label htmlFor="auto-refresh" className="text-muted-foreground">Auto-refresh</label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant={tab === "Pending" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setTab("Pending") }}>
              Pending<span className={cn("ml-2 rounded-md px-1.5 py-0.5 text-xs", "bg-orange-100 text-orange-800")}>{pendingCount}</span>
            </Button>
            <Button variant={tab === "Reviewed" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setTab("Reviewed") }}>Reviewed</Button>
            <Button variant={tab === "All" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setTab("All") }}>All</Button>
            <Select value={project} onValueChange={(v) => { setPage(1); setProject(v) }}><SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger><SelectContent><SelectItem value="All">All Projects</SelectItem><SelectItem value="Project 1">Project 1</SelectItem><SelectItem value="Project 2">Project 2</SelectItem><SelectItem value="Project 3">Project 3</SelectItem></SelectContent></Select>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}><SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="Newest">Newest First</SelectItem><SelectItem value="Oldest">Oldest First</SelectItem><SelectItem value="NameAZ">Student Name A–Z</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <InboxIcon className="size-10 text-muted-foreground" />
              <div className="text-sm font-medium">No submissions found</div>
              <div className="text-sm text-muted-foreground">Great! You're all caught up.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Deliverable</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Repo</TableHead>
                    <TableHead className="w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{s.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{s.student_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.project_title}</TableCell>
                      <TableCell className="text-sm">{s.deliverable_title}</TableCell>
                      <TableCell className="text-sm">
                        <div>{format(new Date(s.submitted_at), "MMM dd yyyy h:mm a")}</div>
                        <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.submitted_at), { addSuffix: true })}</div>
                      </TableCell>
                      <TableCell><StatusBadge s={s.status} /></TableCell>
                      <TableCell>
                        {s.submission_url && (
                          <Button variant="outline" size="sm" onClick={() => window.open(s.submission_url, "_blank", "noopener,noreferrer")}>
                            View <ExternalLink className="ml-2 size-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.status === "PENDING" ? (
                          <Button size="sm" onClick={() => setReviewModal({ open: true, submission: s })}>Review</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setReviewModal({ open: true, submission: s })}>View Feedback</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Page {page} of {pageCount}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {reviewModal.submission && (
        <Dialog open={reviewModal.open} onOpenChange={(open) => { if (!open) { setReviewModal({ open: false, submission: null }); setFeedback("") } }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>{reviewModal.submission.deliverable_title} - {reviewModal.submission.project_title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><p className="text-sm font-medium">Student:</p><p className="text-sm text-muted-foreground">{reviewModal.submission.student_name}</p></div>
              {reviewModal.submission.submission_url && (
                <div><p className="text-sm font-medium mb-2">Submitted Link:</p><Button variant="outline" size="sm" asChild><a href={reviewModal.submission.submission_url} target="_blank" rel="noopener noreferrer" className="gap-2"><ExternalLink className="h-3 w-3" />Open Submission</a></Button></div>
              )}
              {reviewModal.submission.submission_text && (
                <div><p className="text-sm font-medium mb-1">Student Notes:</p><p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{reviewModal.submission.submission_text}</p></div>
              )}
              {reviewModal.submission.feedback && (
                <div><p className="text-sm font-medium mb-1">Your Previous Feedback:</p><div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg"><p className="text-sm">{reviewModal.submission.feedback}</p></div></div>
              )}
              <div><p className="text-sm font-medium mb-2">Your Feedback:</p><Textarea placeholder="Provide feedback for the student..." value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} /></div>
              <p className="text-xs text-muted-foreground">Submitted {formatDistanceToNow(new Date(reviewModal.submission.submitted_at), { addSuffix: true })}</p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setReviewModal({ open: false, submission: null }); setFeedback("") }} disabled={submitting}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleReview("REJECTED")} disabled={submitting} className="gap-2">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}<ThumbsDown className="h-4 w-4" />Request Changes</Button>
              <Button onClick={() => handleReview("APPROVED")} disabled={submitting} className="gap-2">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}<ThumbsUp className="h-4 w-4" />Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
