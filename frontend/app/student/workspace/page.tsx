"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Rocket, ExternalLink, Code2, Sparkles, Zap, Database, BarChart3 } from "lucide-react"
import apiClient from "@/lib/apiClient"

type State = "inactive" | "provisioning" | "ready" | "error"
type WorkspaceType = "vscode" | "superset"

export default function WorkspacePage() {
  const [state, setState] = React.useState<State>("inactive")
  const [progress, setProgress] = React.useState(0)
  const [workspaceUrl, setWorkspaceUrl] = React.useState<string>("")
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [workspaceType, setWorkspaceType] = React.useState<WorkspaceType>("vscode")
  const [userTrack, setUserTrack] = React.useState<string>("FSD")

  // Fetch user profile to determine track
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiClient.get("/users/profile/")
        const track = res.data.track || "FSD"
        setUserTrack(track)
        setWorkspaceType(track === "DP" ? "superset" : "vscode")
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
      }
    }
    fetchUserProfile()
  }, [])

  React.useEffect(() => {
    let timer: number | undefined
    if (state === "provisioning") {
      setProgress(0)
      // Superset takes longer to initialize (60-90 seconds)
      const interval = workspaceType === "superset" ? 1800 : 1200
      timer = window.setInterval(() => {
        setProgress((p) => {
          const next = Math.min(100, p + 10)
          if (next === 100) {
            window.clearInterval(timer)
            setTimeout(() => setState("ready"), 600)
          }
          return next
        })
      }, interval)
    }
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [state, workspaceType])

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Link href="/student/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Workspace</span>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-3 py-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
          workspaceType === "superset" 
            ? "bg-purple-100 dark:bg-purple-900/30" 
            : "bg-blue-100 dark:bg-blue-900/30"
        }`}>
          {workspaceType === "superset" ? (
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          ) : (
            <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <h1 className={`text-3xl font-bold tracking-tight ${
          workspaceType === "superset"
            ? "text-purple-600 dark:text-purple-400"
            : "text-blue-600 dark:text-blue-400"
        }`}>
          {workspaceType === "superset" ? "Your Data Analytics Workspace" : "Your Cloud Workspace"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {workspaceType === "superset" 
            ? "Apache Superset - Professional data visualization and analytics platform"
            : "A fully configured development environment, ready in seconds"
          }
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Launch Workspace</CardTitle>
              <CardDescription className="text-base">
                {workspaceType === "superset" 
                  ? "Your personal Apache Superset analytics platform"
                  : "Your personal VS Code environment in the cloud"
                }
              </CardDescription>
            </div>
            {state === "ready" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Active</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {state === "inactive" && (
            <>
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {workspaceType === "superset" ? (
                  <>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">Data Viz</div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Interactive dashboards</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-blue-900 dark:text-blue-100">SQL Editor</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">Query databases</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">Pre-loaded</div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300">Sample datasets</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-blue-900 dark:text-blue-100">Instant Setup</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">Ready in 30 seconds</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">Auto-Save</div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Never lose progress</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">Full VS Code</div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300">All extensions included</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Workspace Info */}
              <div className="rounded-xl border bg-slate-50 dark:bg-slate-900/50 p-5 space-y-3">
                <div className="font-medium text-sm">Your Environment Includes:</div>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {workspaceType === "superset" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Interactive Dashboards
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        SQL Lab Editor
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Chart Builder
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Database Connections
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Python 3.12
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Pandas & NumPy
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Jupyter Notebooks
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Git Integration
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Launch Button */}
              <Button
                size="lg"
                className={`w-full h-14 text-base font-semibold text-white shadow-lg ${
                  workspaceType === "superset"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={async () => {
                  setState("provisioning");
                  setErrorMessage("");
                  try {
                    const res = await apiClient.post("/users/workspace/create/");
                    const url = res.data.url || "";
                    const type = res.data.workspace_type || workspaceType;
                    setWorkspaceUrl(url);
                    setWorkspaceType(type);
                    
                    // Set ready state immediately for shared Superset
                    setState("ready");
                    
                    // Auto-open workspace in new tab
                    if (url) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    }
                  } catch (err: any) {
                    setState("error");
                    const errorData = err.response?.data || {};
                    let message = errorData.message || errorData.error || "Failed to provision workspace";
                    
                    // Add instructions if available
                    if (errorData.instructions) {
                      message += "\n\nInstructions:\n" + errorData.instructions;
                    }
                    
                    setErrorMessage(message);
                  }
                }}
              >
                <Rocket className="mr-2 h-5 w-5" />
                {workspaceType === "superset" ? "Launch Superset" : "Launch Workspace"}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                Your work is automatically saved and synced to the cloud
              </p>
            </>
          )}

          {state === "provisioning" && (
            <>
              <div className="space-y-6 py-4">
                {/* Animated Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-blue-200/50 dark:bg-blue-800/30 animate-ping" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Setting up your workspace</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out shadow-lg shadow-blue-500/50" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>

                {/* Status Steps */}
                <div className="space-y-3 pt-2">
                  {[
                    { label: "Creating container", done: progress > 25 },
                    { label: "Installing dependencies", done: progress > 50 },
                    { label: "Configuring environment", done: progress > 75 },
                    { label: "Finalizing setup", done: progress > 90 }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        step.done 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {step.done ? '✓' : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <span className={step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  {workspaceType === "superset" 
                    ? "Superset initialization takes 60-90 seconds on first launch"
                    : "This usually takes 15-30 seconds"
                  }
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setState("inactive")}
              >
                Cancel
              </Button>
            </>
          )}

          {state === "ready" && (
            <>
              {/* Success Animation */}
              <div className="text-center space-y-4 py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-in zoom-in duration-500">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                    Workspace Ready!
                  </h3>
                  <p className="text-muted-foreground">
                    {workspaceType === "superset"
                      ? "Superset is initializing. Click below to open when ready (may take 60-90 seconds)"
                      : "Your development environment is live and waiting"
                    }
                  </p>
                </div>
              </div>

              {/* Workspace URL Card */}
              <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Workspace URL</span>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live</span>
                  </div>
                </div>
                <div className="font-mono text-sm text-emerald-800 dark:text-emerald-200 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 break-all">
                  {workspaceUrl}
                </div>
              </div>

              {/* Open Button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                asChild
                onClick={() => {
                  if (workspaceUrl) {
                    window.open(workspaceUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <a href={workspaceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open Workspace
                </a>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your work auto-saves every 10 seconds</span>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              {/* Error State */}
              <div className="text-center space-y-4 py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">
                    Setup Failed
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {errorMessage || "We couldn't create your workspace. This is usually temporary."}
                  </p>
                </div>
              </div>

              {/* Error Details */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
                  <div className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setState("provisioning");
                    setErrorMessage("");
                  }}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="flex-1"
                  asChild
                >
                  <a href="mailto:support@apranova.com">
                    Contact Support
                  </a>
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Need help? Our support team is here for you
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium">Need Help?</div>
              <p className="text-sm text-muted-foreground">
                Check out our{" "}
                <Link href="/student/help" className="text-blue-600 dark:text-blue-400 hover:underline">
                  workspace guide
                </Link>
                {" "}or{" "}
                <a href="mailto:support@apranova.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  contact support
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
