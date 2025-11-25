"use client"

import { useState } from "react"
import Link from "next/link"
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { authService } from "@/services/authService"
import { Loader2, CheckCircle2, Mail } from "lucide-react"

export default function ResetPasswordClient() {
  const { isCheckingAuth } = useAuthRedirect()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState(false)

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <main className="min-h-svh flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking session...</p>
        </div>
      </main>
    )
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setTouched(true)

    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      await authService.requestPasswordReset(email)
      setSuccess(true)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Failed to send reset email. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className="min-h-svh flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0 0), var(--color-muted) 40%, var(--color-background) 80%)",
      }}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Email Sent!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                  </AlertDescription>
                </Alert>
                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                    }}
                    className="text-primary underline underline-offset-4 hover:no-underline"
                  >
                    try again
                  </button>
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      className="pl-9"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {touched && !email && (
                    <p className="text-sm text-destructive">Email is required</p>
                  )}
                  {touched && email && !isValidEmail(email) && (
                    <p className="text-sm text-destructive">Please enter a valid email</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !email || !isValidEmail(email)}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="underline underline-offset-4 text-primary hover:no-underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}
