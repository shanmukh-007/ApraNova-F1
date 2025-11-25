"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authService } from "@/services/authService"
import { Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react"

function ResetPasswordConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState({ password: false, confirmPassword: false })

  useEffect(() => {
    if (!uid || !token) {
      setError("Invalid or missing reset link. Please request a new password reset link.")
    }
  }, [uid, token])

  function validatePassword(pwd: string) {
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNum = /\d/.test(pwd)
    const longEnough = pwd.length >= 8
    return { hasUpper, hasLower, hasNum, longEnough, isValid: hasUpper && hasLower && hasNum && longEnough }
  }

  function getPasswordStrength(pwd: string) {
    const { hasUpper, hasLower, hasNum, longEnough } = validatePassword(pwd)
    const score = [hasUpper, hasLower, hasNum, longEnough].filter(Boolean).length
    if (score <= 1) return { level: "Weak", color: "text-red-600", bars: 1 }
    if (score === 2 || score === 3) return { level: "Medium", color: "text-yellow-600", bars: 2 }
    return { level: "Strong", color: "text-green-600", bars: 3 }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setTouched({ password: true, confirmPassword: true })

    if (!uid || !token) {
      setError("Invalid reset link")
      return
    }

    const { isValid } = validatePassword(password)
    if (!isValid) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and a number")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      await authService.resetPassword(uid, token, password)
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Failed to reset password. The link may have expired."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordStrength = getPasswordStrength(password)

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
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Password Reset Successful!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your password has been reset successfully. Redirecting to login...
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
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

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className="pl-9 pr-10"
                      required
                      disabled={isSubmitting || !uid || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1 flex-1 rounded ${
                              bar <= passwordStrength.bars ? "bg-current " + passwordStrength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.level}
                      </p>
                    </div>
                  )}

                  {/* Password Requirements */}
                  {touched.password && password && (
                    <div className="text-xs space-y-1">
                      <p className={passwordValidation.longEnough ? "text-green-600" : "text-muted-foreground"}>
                        {passwordValidation.longEnough ? "✓" : "○"} At least 8 characters
                      </p>
                      <p className={passwordValidation.hasUpper ? "text-green-600" : "text-muted-foreground"}>
                        {passwordValidation.hasUpper ? "✓" : "○"} One uppercase letter
                      </p>
                      <p className={passwordValidation.hasLower ? "text-green-600" : "text-muted-foreground"}>
                        {passwordValidation.hasLower ? "✓" : "○"} One lowercase letter
                      </p>
                      <p className={passwordValidation.hasNum ? "text-green-600" : "text-muted-foreground"}>
                        {passwordValidation.hasNum ? "✓" : "○"} One number
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      className="pl-9 pr-10"
                      required
                      disabled={isSubmitting || !uid || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isSubmitting ||
                    !uid ||
                    !token ||
                    !password ||
                    !confirmPassword ||
                    !passwordValidation.isValid ||
                    password !== confirmPassword
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
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
    </main>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}
