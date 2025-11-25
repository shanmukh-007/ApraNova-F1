"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveTokens, loginWithGoogle, loginWithGitHub } from "@/lib/auth"
import apiClient from "@/lib/apiClient" // Import axios client here
import { extractErrorMessage } from "@/lib/errorHandler"

type Role = "student" | "admin" | "trainer"

// const roleEmailMap: Record<Role, string> = {
//   student: "dp.student@apranova.com",
//   admin: "admin@apranova.com",
//   trainer: "trainer.dp@apranova.com",
// }

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface LoginFormProps {
  onLoginSuccess?: (user: { role: string }) => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const router = useRouter()

  const emailRef = React.useRef<HTMLInputElement>(null)
  const [role, setRole] = React.useState<Role>("student")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<{
    email?: string
    password?: string
  }>({})

  React.useEffect(() => {
    emailRef.current?.focus()
  }, [])

  function runValidation() {
    const v: { email?: string; password?: string } = {}
    if (!email || !validateEmail(email)) {
      v.email = "Valid email required"
    }
    if (!password || password.length < 8) {
      v.password = "Password must be at least 8 characters"
    }
    setErrors(v)
    return Object.keys(v).length === 0
  }

  function onRoleChange(next: Role) {
    setRole(next)
    setEmail("")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!runValidation()) return

    setSubmitting(true)
    setErrorMsg(null)

    try {
      // Call your Django backend login endpoint here
      const response = await apiClient.post("/users/login/", {
        email,
        password,
        role
      })
      const data = response.data

      // Save tokens (implement this in lib/auth)
      saveTokens(data.access, data.refresh)

      // Use redirect_url from backend if available, otherwise use role
      const redirectUrl = data.redirect_url || `/${data.user.role}/dashboard`
      
      // Pass the user object with role to parent
      if (onLoginSuccess) onLoginSuccess({ role: data.user.role, redirectUrl })
    } catch (err: any) {
      // Extract error message using utility
      const { title, message, fieldErrors } = extractErrorMessage(err);
      
      // Set error message in alert banner
      setErrorMsg(message);
      
      // Set field-specific errors if any
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as any);
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-balance">Sign in</CardTitle>
        <CardDescription className="text-pretty">
          Welcome back! Enter your credentials to access Apra Nova.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMsg ? (
          <Alert
            variant="destructive"
            className="mb-4"
            role="alert"
            aria-live="assertive"
          >
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Role dropdown */}
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={role}
              onValueChange={(v) => onRoleChange(v as Role)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {errors.email ? (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="pl-9 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                )}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            ) : null}
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-end">
            <Link
              href="/reset-password"
              className="text-sm underline-offset-4 hover:underline text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in…
              </span>
            ) : (
              "Login"
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={loginWithGoogle}
              disabled={submitting}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={loginWithGitHub}
              disabled={submitting}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/signup"
              className="underline underline-offset-4 text-primary hover:no-underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
