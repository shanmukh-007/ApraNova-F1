"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Mail, User, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import apiClient from "@/lib/apiClient"
import { extractErrorMessage } from "@/lib/errorHandler"
import { loginWithGoogle, loginWithGitHub, saveTokens } from "@/lib/auth"

type Track = "DP" | "FSD"
type Role = "student" | "admin" | "trainer"

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateName(name: string) {
  return /^[A-Za-z\s]+$/.test(name) && name.trim().length >= 3
}

function passwordCriteria(password: string) {
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNum = /\d/.test(password)
  const longEnough = password.length >= 8
  return { hasUpper, hasLower, hasNum, longEnough }
}

function passwordStrength(password: string) {
  const { hasUpper, hasLower, hasNum, longEnough } = passwordCriteria(password)
  const score = [hasUpper, hasLower, hasNum, longEnough].filter(Boolean).length
  if (score <= 1) return { level: "Weak" as const, bars: 1 }
  if (score === 2 || score === 3) return { level: "Medium" as const, bars: 2 }
  return { level: "Strong" as const, bars: 3 }
}

// // Simulated API calls — replace with actual calls (Auth provider + Stripe)
// async function mockCheckEmailAvailable(email: string) {
//   await new Promise((r) => setTimeout(r, 600))
//   if (email.toLowerCase().startsWith("exists")) {
//     throw new Error("Email already exists")
//   }
//   return true
// }

// async function mockCreateAccount(payload: {
//   name: string
//   email: string
//   password: string
//   track: Track
//   role: Role
// }) {
//   await new Promise((r) => setTimeout(r, 900))
//   // Simulate success
//   return { ok: true }
// }

export default function SignupForm() {
  const router = useRouter()

  const nameRef = React.useRef<HTMLInputElement>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [track, setTrack] = React.useState<Track | "">("")
  const [agreed, setAgreed] = React.useState(true)
  const [role, setRole] = React.useState<Role>("student")
  const [isFromPayment, setIsFromPayment] = React.useState(false)
  
  // Get track from URL parameter or sessionStorage
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlTrack = params.get("track")
    const paymentVerified = params.get("payment_verified")
    const storedTrack = sessionStorage.getItem("selected_track")
    const storedEmail = sessionStorage.getItem("customer_email")
    
    console.log("Signup form - URL track:", urlTrack, "Payment verified:", paymentVerified)
    
    // Check if user came from payment - prioritize URL track over stored track
    if (paymentVerified === "true") {
      const trackToUse = urlTrack || storedTrack
      console.log("Track to use:", trackToUse)
      if (trackToUse && (trackToUse === "DP" || trackToUse === "FSD")) {
        setTrack(trackToUse as Track)
        setIsFromPayment(true)
        // Clear track error when setting from payment
        setErrors(prev => ({ ...prev, track: undefined }))
        setTouched(prev => ({ ...prev, track: true }))
        if (storedEmail) {
          setEmail(storedEmail)
        }
      }
    } else if (urlTrack && (urlTrack === "DP" || urlTrack === "FSD")) {
      setTrack(urlTrack as Track)
      setErrors(prev => ({ ...prev, track: undefined }))
    } else if (storedTrack && (storedTrack === "DP" || storedTrack === "FSD")) {
      setTrack(storedTrack as Track)
      setErrors(prev => ({ ...prev, track: undefined }))
    }
    // Allow signup without payment for testing - don't redirect
  }, [router])

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  const [submitting, setSubmitting] = React.useState(false)
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [errors, setErrors] = React.useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
    track?: string
    agreed?: string
  }>({})

  React.useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function validateAll() {
    const next: typeof errors = {}

    if (!validateName(name)) {
      next.name = "Please enter your full name (letters and spaces, min 3 characters)."
    }
    if (!validateEmail(email)) {
      next.email = "Enter a valid email address."
    }
    const { hasUpper, hasLower, hasNum, longEnough } = passwordCriteria(password)
    if (!hasUpper || !hasLower || !hasNum || !longEnough) {
      next.password = "Password must be 8+ chars and include uppercase, lowercase, and a number."
    }
    if (!confirm || confirm !== password) {
      next.confirm = "Passwords don't match"
    }
    if (role === "student" && !track) {
      next.track = "Please choose your track."
    }
    if (!agreed) {
      next.agreed = "You must agree to the Terms & Conditions."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function validateField(field: string) {
    setTouched((t) => ({ ...t, [field]: true }))
    // Run full validation and let per-field messages show
    validateAll()
  }

  function onRoleChange(next: Role) {
    setRole(next)
    setEmail("")
    if (next === "student") {
      if (!track) setTrack("DP")
    } else if (next === "admin") {
      setTrack("")
    } else {
      setTrack("")
    }
  }

  const { level, bars } = passwordStrength(password)
  const canSubmit =
    validateName(name) &&
    validateEmail(email) &&
    passwordCriteria(password).longEnough &&
    passwordCriteria(password).hasLower &&
    passwordCriteria(password).hasUpper &&
    passwordCriteria(password).hasNum &&
    confirm === password &&
    (role !== "student" || !!track) &&
    agreed &&
    !submitting


  async function checkEmailAvailableAPI(email: string): Promise<boolean> {
    try{
      if (!apiClient || !apiClient.post) {
        console.error('API Client not initialized properly');
        return true; // fallback to allow submission
      }
      const res = await apiClient.post("/users/check-email/", {email})
      return !res.data.exists;
    }catch(error){
      console.error('Email check error:', error);
      return true // fallback to allow submission, or handle error accordingly here
    }
}


  // Function to call Django registration API
  async function createAccount(payload: {
    name: string
    email: string
    password1: string
    password2: string
    track?: string
    role: string
    privacy_accepted: boolean
    privacy_version: string
    marketing_consent: boolean
  }) {
    try {
      if (!apiClient || !apiClient.post) {
        throw new Error('API Client not initialized. Please refresh the page and try again.');
      }

      const res = await apiClient.post("/auth/registration/", payload, { withCredentials: true })

      // Save tokens to localStorage if they exist in the response
      if (res.data.access && res.data.refresh) {
        saveTokens(res.data.access, res.data.refresh)
      } else if (res.data.access_token && res.data.refresh_token) {
        saveTokens(res.data.access_token, res.data.refresh_token)
      }

      return res.data
    } catch (error: any) {
      const data = error.response?.data || {}
      console.error("Signup error response:", error)
      const message =
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.password1?.[0] ||
        data?.password2?.[0] ||
        error.message ||
        "Signup failed"
      throw new Error(message)
    }
  }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError(null)
    setSuccessMsg(null)

    if (!validateAll()) return

    setSubmitting(true)
    try {

      // Check email existence again for safety
      if (await checkEmailAvailableAPI(email) === false) {
        setErrors((prev) => ({
          ...prev,
          email: "Email already exists. Try logging in or reset your password."
        }));
        setSubmitting(false);
        return;
      }

      const payload = {
        username: email,
        name,
        email,
        password1: password,
        password2: confirm,
        track: role === "student" ? track : undefined,
        role,
        privacy_accepted: agreed, // Required by backend
        payment_verified: isFromPayment, // Mark as paid if coming from payment flow
        privacy_version: "1.0",
        marketing_consent: false,
      }
      const response = await createAccount(payload)

      // Show trainer assignment message for students
      if (role === "student" && response) {
        if (response.trainer_assigned) {
          setSuccessMsg(`Account created! Trainer "${response.trainer_name}" has been assigned to you. Redirecting to payment...`)
        } else {
          setSuccessMsg("Account created! A trainer will be assigned to you soon. Redirecting to payment...")
        }
      } else {
        setSuccessMsg("Account created! Redirecting to your dashboard...")
      }

      // Clear payment session data
      sessionStorage.removeItem('payment_verified');
      sessionStorage.removeItem('payment_session_id');
      sessionStorage.removeItem('selected_track');
      sessionStorage.removeItem('customer_email');

      const target =
        role === "admin"
          ? "/admin/dashboard"
          : role === "trainer"
          ? "/trainer/dashboard"
          : "/student/dashboard" // Redirect to dashboard after signup

      setTimeout(() => {
        router.push(target)
      }, 2000)
    } catch (err: any) {
      // Extract error message using utility
      const { title, message, fieldErrors } = extractErrorMessage(err);
      
      // Set global error message
      setGlobalError(message);
      
      // Set field-specific errors if any
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const mappedErrors: typeof errors = {};
        
        // Map backend field names to frontend field names
        if (fieldErrors.email) mappedErrors.email = fieldErrors.email;
        if (fieldErrors.password1) mappedErrors.password = fieldErrors.password1;
        if (fieldErrors.password2) mappedErrors.confirm = fieldErrors.password2;
        if (fieldErrors.username) mappedErrors.email = fieldErrors.username;
        if (fieldErrors.name) mappedErrors.name = fieldErrors.name;
        
        setErrors((prev) => ({ ...prev, ...mappedErrors }));
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-balance">Create your account</CardTitle>
        <CardDescription className="text-pretty">
          Start your Apra Nova journey in your chosen track.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError ? (
          <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
            <AlertTitle>Signup Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        ) : null}
        {successMsg ? (
          <Alert className="mb-4" role="status" aria-live="polite">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {/* Role is fixed to student - no selection needed */}
          <div className="space-y-2">
            <Label>Choose Track {isFromPayment && "(Pre-selected from payment)"}</Label>
            <Select
              key={track || "empty"} // Force re-render when track changes
              value={track || undefined}
              defaultValue={track || undefined}
              onValueChange={(v) => {
                setTrack(v as Track)
                validateField("track")
              }}
              disabled={isFromPayment} // Disable if user came from payment
            >
              <SelectTrigger aria-invalid={Boolean(errors.track)} disabled={isFromPayment}>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DP">Data Professional (DP)</SelectItem>
                  <SelectItem value="FSD">Full Stack Developer (FSD)</SelectItem>
                </SelectContent>
              </Select>
              {touched.track && errors.track ? (
                <p className="text-sm text-destructive">{errors.track}</p>
              ) : null}
            </div>
          
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                ref={nameRef}
                id="name"
                name="name"
                placeholder="Enter your full name"
                className="pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => validateField("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                required
              />
            </div>
            {touched.name && errors.name ? (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={async () => {
                  setTouched((t) => ({ ...t, email: true })) // Mark email as touched
                  if (!validateEmail(email)) {
                    setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
                    return;
                  }
                  // Check if email already exists via API
                  const available = await checkEmailAvailableAPI(email);
                  
                  if (!available) {
                    console.log("Hello")
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email already exists. Try logging in or reset your password.",
                    }));
                  }else {
                    // Clear error only if email is available
                    setErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }
                   
                  // validateField("email");
                  
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
            </div>
            {touched.email && errors.email ? (
              <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
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
                autoComplete="new-password"
                placeholder="Create a password"
                className="pl-9 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validateField("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : "password-help"}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors",
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Strength meter */}
            <div className="space-y-1" id="password-help">
              <div className="flex items-center gap-2" aria-hidden="true">
                <div className={cn("h-1.5 w-full rounded", bars >= 1 ? "bg-destructive" : "bg-muted")} />
                <div className={cn("h-1.5 w-full rounded", bars >= 2 ? "bg-ring" : "bg-muted")} />
                <div className={cn("h-1.5 w-full rounded", bars >= 3 ? "bg-primary" : "bg-muted")} />
              </div>
              <p className="text-xs text-muted-foreground">Strength: {level}</p>
            </div>
            {touched.password && errors.password ? (
              <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
            ) : null}
          </div>
          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="pl-9 pr-10"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => validateField("confirm")}
                aria-invalid={Boolean(errors.confirm)}
                aria-describedby={errors.confirm ? "confirm-error" : undefined}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors",
                )}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.confirm && errors.confirm ? (
              <p id="confirm-error" className="text-sm text-destructive">{errors.confirm}</p>
            ) : null}
          </div>
          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(c) => {
                setAgreed(Boolean(c))
                validateField("agreed")
              }}
              aria-invalid={Boolean(errors.agreed)}
            />
            <div className="grid gap-1.5 leading-tight">
              <label htmlFor="terms" className="text-sm font-medium leading-none">
                I agree to Terms & Conditions
              </label>
              <p className="text-sm text-muted-foreground">
                Read our{" "}
                <Link href="/terms" className="underline underline-offset-4 text-primary hover:no-underline">
                  Terms & Conditions
                </Link>
                .
              </p>
              {touched.agreed && errors.agreed ? <p className="text-sm text-destructive">{errors.agreed}</p> : null}
            </div>
          </div>
          {/* Submit */}
          <Button type="submit" className="w-full" disabled={!canSubmit} aria-disabled={!canSubmit}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </span>
            ) : (
              "Create Account"
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

          {/* Footer link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 text-primary hover:no-underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
