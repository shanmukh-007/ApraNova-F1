"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  BookOpen,
  Settings,
  UserCheck,
  TrendingUp,
  Activity,
  Package,
} from "lucide-react"

function formatDate() {
  const d = new Date()
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("Admin")

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAdminName("Admin")
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
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-100 dark:border-blue-900 p-8 md:p-12 shadow-lg">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{formatDate()}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
              Welcome back, {adminName}! 👋
            </h1>
            <p className="text-blue-700 dark:text-blue-300 text-lg max-w-2xl">
              Manage your platform, monitor users, and track performance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 starting this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              <Link href="/admin/users">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-muted-foreground">View and edit user accounts</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
            >
              <Link href="/admin/batches">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                    <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Manage Batches</div>
                    <div className="text-sm text-muted-foreground">Create and organize batches</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
            >
              <Link href="/admin/payments">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Payment Management</div>
                    <div className="text-sm text-muted-foreground">Track and manage payments</div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="justify-start h-auto py-4 border-2 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all"
            >
              <Link href="/admin/settings">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">System Settings</div>
                    <div className="text-sm text-muted-foreground">Configure platform settings</div>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="space-y-6">
          <Card className="border-2 shadow-lg bg-emerald-50 dark:bg-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Workspaces</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300">
                  12 Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Signups Today</span>
                <span className="text-2xl font-bold text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Payments</span>
                <span className="text-2xl font-bold text-blue-600">15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Support Tickets</span>
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
