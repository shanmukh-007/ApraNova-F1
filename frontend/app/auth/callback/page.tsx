import { redirect } from "next/navigation"

export const dynamic = "force-static"

export default function AuthCallbackPage() {
  // In a real app, verify payment/session and determine role here.
  // For Phase 1, auto-redirect to the student dashboard.
  redirect("/student/dashboard")
}
