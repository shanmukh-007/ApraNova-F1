"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react"

function formatDate() {
  const d = new Date()
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

export default function TrainerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [trainerName, setTrainerName] = useState("Trainer")

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setTrainerName("Trainer")
      setLoading(false)
    }, 500)
  }, [])

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto p-6 animate-pulse">
        <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-48"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-32"></div>
          <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-32"></div>
          <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-32"></div>
          <div className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-100 dark:border-purple-900 p-8 md:p-12 shadow-lg">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">{formatDate()}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-purple-900 dark:text-purple-100">
              Welcome back, {trainerName}! 👋
            </h1>
            <p className="text-purple-700 dark:text-purple-300 text-lg max-w-2xl">
              Guide your students, track their progress, and help them succeed.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across 2 batches</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Awaiting feedback</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Projects reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and activities</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
            >
              <Link href="/trainer/students">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">View My Students</div>
                    <div className="text-sm text-muted-foreground">Monitor student progress</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              <Link href="/trainer/reviews">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Review Submissions</div>
                    <div className="text-sm text-muted-foreground">Provide feedback on projects</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
            >
              <Link href="/trainer/schedule">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Schedule Sessions</div>
                    <div className="text-sm text-muted-foreground">Manage meetings and calls</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all"
            >
              <Link href="/trainer/messages">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                    <MessageCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Messages</div>
                    <div className="text-sm text-muted-foreground">Communicate with students</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all"
            >
              <Link href="/trainer/quizzes">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                    <Award className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">AI Quiz Generator</div>
                    <div className="text-sm text-muted-foreground">Create quizzes with AI</div>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-2 shadow-lg bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">John submitted Project 3</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah completed Module 2</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message from Alex</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="border-2 shadow-lg bg-purple-50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-purple-200 dark:border-purple-800">
                <div className="font-semibold text-sm">1-on-1 with John</div>
                <div className="text-xs text-muted-foreground">Today, 3:00 PM</div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-purple-200 dark:border-purple-800">
                <div className="font-semibold text-sm">Batch Review Session</div>
                <div className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</div>
              </div>
              <Button variant="outline" size="sm" className="w-full border-purple-300 dark:border-purple-700">
                View All Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-2 shadow-lg bg-emerald-50 dark:bg-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Student Success Rate</span>
                <span className="text-2xl font-bold text-emerald-600">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                <span className="text-2xl font-bold text-emerald-600">2h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Student Rating</span>
                <span className="text-2xl font-bold text-emerald-600">4.8</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
