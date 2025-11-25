"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { curriculumApi, type Deliverable } from "@/lib/curriculum-api"
import { Loader2, Link as LinkIcon, FileText, Github } from "lucide-react"

interface SubmissionModalProps {
  open: boolean
  onClose: () => void
  deliverable: Deliverable
  projectId: number
  onSubmitted: () => void
}

export default function SubmissionModal({ 
  open, 
  onClose, 
  deliverable, 
  projectId,
  onSubmitted 
}: SubmissionModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    submission_url: "",
    submission_text: "",
    github_pr_url: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate based on deliverable type
    if (deliverable.deliverable_type === "LINK" && !formData.submission_url) {
      toast({
        title: "Error",
        description: "Please provide a URL",
        variant: "destructive",
      })
      return
    }

    if (deliverable.deliverable_type === "GITHUB" && !formData.submission_url) {
      toast({
        title: "Error",
        description: "Please provide a GitHub repository URL",
        variant: "destructive",
      })
      return
    }

    // Validate GitHub URL format
    if (deliverable.deliverable_type === "GITHUB" && formData.submission_url) {
      if (!formData.submission_url.includes("github.com")) {
        toast({
          title: "Error",
          description: "Please provide a valid GitHub URL",
          variant: "destructive",
        })
        return
      }
    }

    setSubmitting(true)
    try {
      await curriculumApi.createSubmission({
        deliverable: deliverable.id,
        submission_url: formData.submission_url || undefined,
        submission_text: formData.submission_text || undefined,
      })

      toast({
        title: "Success",
        description: "Submission sent for review!",
      })

      onSubmitted()
      onClose()
      
      // Reset form
      setFormData({
        submission_url: "",
        submission_text: "",
        github_pr_url: "",
      })
    } catch (error: any) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to submit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getIcon = () => {
    switch (deliverable.deliverable_type) {
      case "GITHUB":
        return <Github className="h-5 w-5" />
      case "LINK":
        return <LinkIcon className="h-5 w-5" />
      case "FILE":
        return <FileText className="h-5 w-5" />
      case "TEXT":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getPlaceholder = () => {
    switch (deliverable.deliverable_type) {
      case "GITHUB":
        return "https://github.com/username/repository"
      case "LINK":
        return "https://your-deployed-project.netlify.app"
      case "FILE":
        return "https://drive.google.com/file/d/..."
      default:
        return "Enter URL"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            Submit Deliverable
          </DialogTitle>
          <DialogDescription>
            {deliverable.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input for LINK, GITHUB, FILE types */}
          {(deliverable.deliverable_type === "LINK" || 
            deliverable.deliverable_type === "GITHUB" || 
            deliverable.deliverable_type === "FILE") && (
            <div className="space-y-2">
              <Label htmlFor="url">
                {deliverable.deliverable_type === "GITHUB" 
                  ? "GitHub Repository URL *" 
                  : deliverable.deliverable_type === "FILE"
                  ? "File URL (Google Drive, Dropbox, etc.) *"
                  : "Live Project URL *"}
              </Label>
              <Input
                id="url"
                type="url"
                placeholder={getPlaceholder()}
                value={formData.submission_url}
                onChange={(e) => setFormData({ ...formData, submission_url: e.target.value })}
                required
              />
              {deliverable.deliverable_type === "GITHUB" && (
                <p className="text-xs text-muted-foreground">
                  Make sure your repository is public or accessible to reviewers
                </p>
              )}
            </div>
          )}

          {/* GitHub PR URL (optional but recommended) */}
          {deliverable.deliverable_type === "GITHUB" && (
            <div className="space-y-2">
              <Label htmlFor="pr-url" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                Pull Request URL (Optional)
              </Label>
              <Input
                id="pr-url"
                type="url"
                placeholder="https://github.com/username/repo/pull/1"
                value={formData.github_pr_url}
                onChange={(e) => setFormData({ ...formData, github_pr_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Link to your Pull Request for code review
              </p>
            </div>
          )}

          {/* Description/Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes {deliverable.deliverable_type === "TEXT" && "*"}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                deliverable.deliverable_type === "TEXT"
                  ? "Enter your submission text here..."
                  : "Add any notes, explanations, or instructions for the reviewer (optional)"
              }
              value={formData.submission_text}
              onChange={(e) => setFormData({ ...formData, submission_text: e.target.value })}
              rows={4}
              required={deliverable.deliverable_type === "TEXT"}
            />
          </div>

          {deliverable.description && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Requirements:</strong> {deliverable.description}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
