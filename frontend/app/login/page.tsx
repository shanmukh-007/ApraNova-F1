"use client"

import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import LoginForm from "@/components/auth/login-form"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { ArrowLeft, Code2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import React from "react"

// export const metadata: Metadata = {
//   title: "Login • Apra Nova",
//   description: "Sign in to your Apra Nova account",
// }

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || ""
  const { isCheckingAuth } = useAuthRedirect()
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  // Updated to accept user object with role and redirectUrl
  function handleLoginSuccess(user: { role: string; redirectUrl?: string }) {
    // Show loading screen
    setIsRedirecting(true)
    
    // Use redirectUrl from backend if available, otherwise fallback to role-based routing
    const target =
      redirectUrl ||
      user.redirectUrl ||
      (user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "trainer"
        ? "/trainer/dashboard"
        : user.role === "superadmin"
        ? "/superadmin/dashboard"
        : "/student/dashboard")

    // Small delay to show loading animation
    setTimeout(() => {
      router.push(target)
    }, 500)
  }

  // Show loading state while checking authentication or redirecting
  if (isCheckingAuth || isRedirecting) {
    return (
      <main className="min-h-svh flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-200 text-lg font-medium">
              {isRedirecting ? "Logging you in..." : "Checking session..."}
            </p>
            <p className="text-slate-400 text-sm">
              {isRedirecting ? "Redirecting to your dashboard" : "Please wait"}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 dark:bg-slate-900 p-12 flex-col justify-between">
        {/* Logo & Content */}
        <div className="space-y-12">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/Apra Nova Logo-1-02.png" 
              alt="Apra Nova Logo" 
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sign in to continue your learning journey and access your personalized workspace.
            </p>
            
            {/* Full Stack Illustration */}
            <div className="pt-4">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
                <svg className="w-full h-full p-8" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Browser Window - Frontend */}
                  <rect x="20" y="40" width="160" height="120" rx="4" className="fill-blue-100 dark:fill-blue-900/30" stroke="#3b82f6" strokeWidth="2"/>
                  <rect x="20" y="40" width="160" height="20" rx="4" className="fill-blue-500"/>
                  <circle cx="30" cy="50" r="3" className="fill-white"/>
                  <circle cx="40" cy="50" r="3" className="fill-white"/>
                  <circle cx="50" cy="50" r="3" className="fill-white"/>
                  
                  {/* Code Lines in Browser */}
                  <line x1="30" y1="75" x2="90" y2="75" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="85" x2="120" y2="85" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="95" x2="80" y2="95" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="105" x2="110" y2="105" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="115" x2="100" y2="115" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="125" x2="130" y2="125" className="stroke-blue-400" strokeWidth="2"/>
                  <line x1="30" y1="135" x2="70" y2="135" className="stroke-blue-400" strokeWidth="2"/>
                  
                  {/* Server - Backend */}
                  <rect x="220" y="40" width="160" height="120" rx="4" className="fill-purple-100 dark:fill-purple-900/30" stroke="#a855f7" strokeWidth="2"/>
                  <rect x="230" y="55" width="140" height="15" rx="2" className="fill-purple-200 dark:fill-purple-800"/>
                  <rect x="230" y="75" width="140" height="15" rx="2" className="fill-purple-200 dark:fill-purple-800"/>
                  <rect x="230" y="95" width="140" height="15" rx="2" className="fill-purple-200 dark:fill-purple-800"/>
                  <rect x="230" y="115" width="140" height="15" rx="2" className="fill-purple-200 dark:fill-purple-800"/>
                  <circle cx="240" cy="62" r="3" className="fill-emerald-500"/>
                  <circle cx="240" cy="82" r="3" className="fill-emerald-500"/>
                  <circle cx="240" cy="102" r="3" className="fill-emerald-500"/>
                  <circle cx="240" cy="122" r="3" className="fill-emerald-500"/>
                  
                  {/* Server Icon */}
                  <text x="350" y="70" className="text-2xl">⚙️</text>
                  
                  {/* Database */}
                  <ellipse cx="300" cy="200" rx="60" ry="15" className="fill-orange-400" stroke="#f97316" strokeWidth="2"/>
                  <rect x="240" y="200" width="120" height="40" className="fill-orange-300 dark:fill-orange-600"/>
                  <ellipse cx="300" cy="240" rx="60" ry="15" className="fill-orange-400" stroke="#f97316" strokeWidth="2"/>
                  <line x1="240" y1="200" x2="240" y2="240" stroke="#f97316" strokeWidth="2"/>
                  <line x1="360" y1="200" x2="360" y2="240" stroke="#f97316" strokeWidth="2"/>
                  
                  {/* Database Icon */}
                  <text x="290" y="225" className="text-2xl">💾</text>
                  
                  {/* Connection Lines with Animation */}
                  <path d="M 180 100 L 220 100" className="stroke-blue-500" strokeWidth="3" strokeDasharray="4 4" markerEnd="url(#arrowhead-blue)"/>
                  <path d="M 300 160 L 300 185" className="stroke-purple-500" strokeWidth="3" strokeDasharray="4 4" markerEnd="url(#arrowhead-purple)"/>
                  
                  {/* Arrow markers */}
                  <defs>
                    <marker id="arrowhead-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" className="fill-blue-500"/>
                    </marker>
                    <marker id="arrowhead-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" className="fill-purple-500"/>
                    </marker>
                  </defs>
                  
                  {/* Labels with colored backgrounds */}
                  <rect x="70" y="170" width="60" height="20" rx="4" className="fill-blue-500"/>
                  <text x="100" y="184" className="fill-white text-xs font-bold" textAnchor="middle">Frontend</text>
                  
                  <rect x="270" y="170" width="60" height="20" rx="4" className="fill-purple-500"/>
                  <text x="300" y="184" className="fill-white text-xs font-bold" textAnchor="middle">Backend</text>
                  
                  <rect x="265" y="260" width="70" height="20" rx="4" className="fill-orange-500"/>
                  <text x="300" y="274" className="fill-white text-xs font-bold" textAnchor="middle">Database</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground">
          © 2025 ApraNova. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/Apra Nova Logo-1-02.png" 
                alt="Apra Nova Logo" 
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Back to Home */}
          <div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Sign in to your account
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <LoginForm onLoginSuccess={handleLoginSuccess} />

          {/* Sign Up Link - Students Only */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">New student? </span>
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground">
            Need help? <a href="mailto:support@apranova.com" className="hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
