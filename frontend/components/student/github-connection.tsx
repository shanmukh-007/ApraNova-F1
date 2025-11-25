"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Github, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { getGitHubStatus, connectGitHub, disconnectGitHub, type GitHubStatus } from "@/lib/github-api"
import { getUserProfile } from "@/lib/auth"

export default function GitHubConnection() {
  const [status, setStatus] = useState<GitHubStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [userRole, setUserRole] = useState<string>('student')
  const { toast } = useToast()

  useEffect(() => {
    fetchUserRole()
    fetchStatus()
    
    // Check for OAuth callback success
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') {
      toast({
        title: "GitHub Connected!",
        description: "Your GitHub account has been successfully connected.",
      })
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
      fetchStatus()
    }
  }, [])

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const profile = await getUserProfile(token)
        setUserRole(profile.role || 'student')
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const data = await getGitHubStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch GitHub status:', error)
      toast({
        title: "Error",
        description: "Failed to check GitHub connection status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    connectGitHub()
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnectGitHub()
      toast({
        title: "GitHub Disconnected",
        description: "Your GitHub account has been disconnected.",
      })
      await fetchStatus()
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect GitHub account",
        variant: "destructive",
      })
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          {userRole === 'trainer' 
            ? 'Connect your GitHub account to review student code and collaborate on projects'
            : 'Connect your GitHub account to enable automatic repository creation and project management'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.connected ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {userRole === 'trainer'
                  ? 'GitHub connection is required to review student code and provide feedback.'
                  : 'GitHub connection is required to start projects and submit assignments.'
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">Benefits of connecting GitHub:</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                {userRole === 'trainer' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Get automatic access to student repositories as collaborator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Review student code and Pull Requests directly on GitHub</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Track student commits and project progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Provide inline code comments and feedback</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Automatic project repository creation from templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Trainer gets automatic access to review your code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Track your commits and project progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Professional workflow with Pull Requests</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <Button onClick={handleConnect} className="w-full sm:w-auto">
              <Github className="mr-2 h-4 w-4" />
              Connect GitHub Account
            </Button>
          </>
        ) : (
          <>
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your GitHub account is connected and ready to use.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={status.avatar} alt={status.username} />
                  <AvatarFallback>
                    <Github className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">@{status.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
