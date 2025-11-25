"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Users, 
  Shield, 
  Activity, 
  TrendingUp, 
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalAdmins: number
  systemUptime: string
  todayRegistrations: number
  errorRate: number
}

interface RecentActivity {
  id: string
  type: "user_registered" | "admin_action" | "system_alert"
  message: string
  timestamp: string
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAdmins: 0,
    systemUptime: "0h",
    todayRegistrations: 0,
    errorRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchDashboardData = async () => {
      setLoading(true)
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalAdmins: 8,
          systemUptime: "15d 7h",
          todayRegistrations: 23,
          errorRate: 0.02,
        })
        
        setRecentActivity([
          {
            id: "1",
            type: "user_registered",
            message: "New user registered: john.doe@example.com",
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: "2",
            type: "admin_action",
            message: "Admin updated system settings",
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: "3",
            type: "user_registered",
            message: "New user registered: jane.smith@example.com",
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          },
          {
            id: "4",
            type: "system_alert",
            message: "Database backup completed successfully",
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          },
        ])
        
        setLoading(false)
      }, 500)
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return <UserPlus className="h-4 w-4 text-blue-600" />
      case "admin_action":
        return <Shield className="h-4 w-4 text-purple-600" />
      case "system_alert":
        return <AlertCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your system and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+{stats.todayRegistrations}</span> today
            </p>
            <Link href="/superadmin/users">
              <Button variant="link" className="px-0 h-auto mt-2" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.activeUsers.toLocaleString()}</div>
            <Progress 
              value={(stats.activeUsers / stats.totalUsers) * 100} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              System administrators
            </p>
            <Link href="/superadmin/admins">
              <Button variant="link" className="px-0 h-auto mt-2" size="sm">
                Manage <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {stats.systemUptime}
            </p>
            <Link href="/superadmin/system">
              <Button variant="link" className="px-0 h-auto mt-2" size="sm">
                View details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">+156</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              +12.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium">{(stats.errorRate * 100).toFixed(2)}%</span>
              </div>
              <Progress value={stats.errorRate * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                System is performing optimally
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events and actions</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <span className="text-sm">{activity.message}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {getTimeAgo(activity.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/superadmin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/superadmin/admins">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Manage Admins
              </Button>
            </Link>
            <Link href="/superadmin/system">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                System Monitor
              </Button>
            </Link>
            <Link href="/superadmin/settings">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
