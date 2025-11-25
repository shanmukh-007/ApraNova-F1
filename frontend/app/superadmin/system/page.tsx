"use client"

import { useState, useEffect } from "react"
import { 
  Server, 
  Database, 
  Activity, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  uptime: string
  requests: number
  errors: number
}

interface Service {
  name: string
  status: "running" | "stopped" | "error"
  uptime: string
  lastChecked: string
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: "0h 0m",
    requests: 0,
    errors: 0,
  })
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchSystemData = async () => {
    setLoading(true)
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        uptime: "15d 7h 23m",
        requests: 125847,
        errors: 23,
      })
      
      setServices([
        {
          name: "API Server",
          status: "running",
          uptime: "15d 7h 23m",
          lastChecked: new Date().toISOString(),
        },
        {
          name: "Database",
          status: "running",
          uptime: "15d 7h 23m",
          lastChecked: new Date().toISOString(),
        },
        {
          name: "Redis Cache",
          status: "running",
          uptime: "15d 7h 23m",
          lastChecked: new Date().toISOString(),
        },
        {
          name: "Email Service",
          status: "running",
          uptime: "15d 7h 23m",
          lastChecked: new Date().toISOString(),
        },
      ])
      
      setLoading(false)
      setLastRefresh(new Date())
    }, 500)
  }

  useEffect(() => {
    fetchSystemData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      case "stopped":
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
      case "error":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "stopped":
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-red-500"
    if (value >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health and performance metrics
          </p>
        </div>
        <Button onClick={fetchSystemData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.cpu}%</div>
            <Progress value={metrics.cpu} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.memory}%</div>
            <Progress value={metrics.memory} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.disk}%</div>
            <Progress value={metrics.disk} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Total Requests</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.requests.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-2">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Error Count</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </div>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.errors}</div>
            <p className="text-sm text-muted-foreground mt-2">
              0.02% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <div>
              <CardTitle>Services Status</CardTitle>
              <CardDescription>Monitor all running services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading services...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(service.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(service.status)}
                          {service.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{service.uptime}</TableCell>
                    <TableCell>
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Logs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Server and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="text-sm font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Server Region</span>
                <span className="text-sm font-medium">US-East-1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Node Version</span>
                <span className="text-sm font-medium">v20.10.0</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database Version</span>
                <span className="text-sm font-medium">PostgreSQL 15.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Redis Version</span>
                <span className="text-sm font-medium">7.0.11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Deployment</span>
                <span className="text-sm font-medium">2 days ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
