"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Users,
  Terminal,
  DollarSign,
  HeartPulse,
  Activity,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  Clock,
  UploadCloud,
  Search,
  Mail,
  RefreshCw,
  CreditCard,
  Receipt,
  Printer,
  Undo2,
  Cloud,
  Database,
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Camera,
  Save,
  Lock,
  Bell,
  EyeOff,
  Globe,
} from "lucide-react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Color palette: use semantic tokens. Accents via chart cell fills (max 5 colors).
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type TabKey = "dashboard" | "users" | "batches" | "payments" | "system" | "settings" | "profile"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard")
  const { toast } = useToast()

  // Mock Data
  const overview = {
    totalUsers: 20,
    activeDelta: "+5 this week",
    activeWorkspaces: 12,
    revenueMonth: 9440,
    revenueDelta: "+12% vs last month",
    systemHealthy: true,
    lastChecked: "2 min ago",
  }

  const recentActivity = [
    { id: 1, type: "payment", text: "John Doe completed payment", user: "John Doe", time: "5 min ago", status: "Paid" },
    {
      id: 2,
      type: "workspace",
      text: "Sarah launched workspace",
      user: "Sarah Lee",
      time: "10 min ago",
      status: "Running",
    },
    {
      id: 3,
      type: "user",
      text: "Arjun Kumar joined Batch 1",
      user: "Arjun Kumar",
      time: "30 min ago",
      status: "Active",
    },
  ]

  const userGrowth = [
    { day: "Mon", signups: 2 },
    { day: "Tue", signups: 4 },
    { day: "Wed", signups: 3 },
    { day: "Thu", signups: 5 },
    { day: "Fri", signups: 7 },
    { day: "Sat", signups: 1 },
    { day: "Sun", signups: 2 },
  ]
  const revenueWeeks = [
    { week: "W1", revenue: 1600 },
    { week: "W2", revenue: 1900 },
    { week: "W3", revenue: 2200 },
    { week: "W4", revenue: 2160 },
  ]
  const workspaceUsage = [
    { name: "Active", value: 75 },
    { name: "Idle", value: 25 },
  ]

  // Users
  type UserRow = {
    id: string
    name: string
    email: string
    track: "DP" | "FSD"
    batch?: string
    status: "Active" | "Inactive"
    payment: "Paid" | "Unpaid" | "Failed"
    joined: string
  }
  const [users, setUsers] = useState<UserRow[]>([
    {
      id: "u1",
      name: "Arjun Kumar",
      email: "arjun.student@apranova.com",
      track: "DP",
      batch: "Batch 1",
      status: "Active",
      payment: "Paid",
      joined: "Oct 1, 2025",
    },
    {
      id: "u2",
      name: "Sarah Lee",
      email: "sarah.lee@example.com",
      track: "FSD",
      batch: "Batch 1",
      status: "Active",
      payment: "Unpaid",
      joined: "Oct 3, 2025",
    },
    {
      id: "u3",
      name: "John Doe",
      email: "john.doe@example.com",
      track: "DP",
      batch: undefined,
      status: "Inactive",
      payment: "Failed",
      joined: "Sep 28, 2025",
    },
  ])
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({})
  const [searchUsers, setSearchUsers] = useState("")
  const [filterTrack, setFilterTrack] = useState<"All" | "DP" | "FSD">("All")
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All")
  const [filterPayment, setFilterPayment] = useState<"All" | "Paid" | "Unpaid" | "Failed">("All")

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchUsers.toLowerCase()
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchTrack = filterTrack === "All" || u.track === filterTrack
      const matchStatus = filterStatus === "All" || u.status === filterStatus
      const matchPayment = filterPayment === "All" || u.payment === filterPayment
      return matchQ && matchTrack && matchStatus && matchPayment
    })
  }, [users, searchUsers, filterTrack, filterStatus, filterPayment])

  // Edit/Delete Modals (Users)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  // Batches
  type BatchRow = {
    id: string
    name: string
    startDate: string
    students: number
    trainer?: string
    track: "DP" | "FSD" | "Mixed"
    status: "Active" | "Upcoming" | "Completed"
    description?: string
  }
  const [batches, setBatches] = useState<BatchRow[]>([
    {
      id: "b1",
      name: "Batch 1 - October 2025",
      startDate: "Oct 1, 2025",
      students: 15,
      trainer: "Priya Singh",
      track: "DP",
      status: "Active",
    },
    {
      id: "b2",
      name: "Batch 2 - November 2025",
      startDate: "Nov 1, 2025",
      students: 0,
      trainer: undefined,
      track: "Mixed",
      status: "Upcoming",
    },
  ])
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<BatchRow | null>(null)
  const [assignStudentsOpen, setAssignStudentsOpen] = useState(false)
  const [assignTrainerOpen, setAssignTrainerOpen] = useState(false)

  // Payments
  type PaymentRow = {
    id: string
    name: string
    email: string
    track: "DP" | "FSD"
    amount: number
    status: "Paid" | "Unpaid" | "Failed"
    date?: string
    method?: string
    stripeCustomer?: string
    txId?: string
  }
  const [payments, setPayments] = useState<PaymentRow[]>([
    {
      id: "p1",
      name: "John Doe",
      email: "john.doe@example.com",
      track: "DP",
      amount: 472,
      status: "Paid",
      date: "Oct 5, 2025 2:30 PM",
      method: "Visa •••• 4242",
      stripeCustomer: "cus_123",
      txId: "tx_ABC123",
    },
    {
      id: "p2",
      name: "Sarah Lee",
      email: "sarah.lee@example.com",
      track: "FSD",
      amount: 472,
      status: "Failed",
      date: "Oct 4, 2025 8:13 PM",
      method: "Visa •••• 4242",
      stripeCustomer: "cus_456",
      txId: "tx_DEF456",
    },
    { id: "p3", name: "Arjun Kumar", email: "arjun.student@apranova.com", track: "DP", amount: 472, status: "Unpaid" },
  ])
  const [paymentDetails, setPaymentDetails] = useState<PaymentRow | null>(null)
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  // System Metrics
  const [systemHealth, setSystemHealth] = useState<"Healthy" | "Degraded" | "Issues">("Healthy")
  const [lastChecked, setLastChecked] = useState<number>(30) // seconds
  useEffect(() => {
    const t = setInterval(() => {
      setLastChecked((s) => (s <= 1 ? 30 : s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const apiResponseTimes = Array.from({ length: 12 }).map((_, i) => ({
    hour: `${i + 1}h`,
    auth: 90 + Math.round(Math.random() * 80),
    containers: 120 + Math.round(Math.random() * 90),
    progress: 110 + Math.round(Math.random() * 70),
    payments: 100 + Math.round(Math.random() * 80),
  }))

  // Helpers
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length
  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUsers[u.id])

  function resetUserSelection() {
    setSelectedUsers({})
  }

  // Toast helper
  const t = (title: string, desc?: string) => toast({ title, description: desc })

  // UI Renderers
  function OverviewCard() {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Total Users</CardTitle>
            <Users className="size-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{overview.totalUsers}</div>
            <div className="mt-1 text-sm text-muted-foreground">Active students</div>
            <div className="mt-2 text-sm text-emerald-600">{overview.activeDelta}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Active Workspaces</CardTitle>
            <Terminal className="size-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{overview.activeWorkspaces}</div>
            <div className="mt-1 text-sm text-muted-foreground">Currently active</div>
            <div className="mt-2 h-2 w-12 animate-pulse rounded-full bg-primary/40" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Total Revenue</CardTitle>
            <DollarSign className="size-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${overview.revenueMonth.toLocaleString()}</div>
            <div className="mt-1 text-sm text-muted-foreground">This month</div>
            <div className="mt-2 text-sm text-emerald-600">{overview.revenueDelta}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">System Health</CardTitle>
            <HeartPulse className="size-5" />
          </CardHeader>
          <CardContent>
            <Badge variant={overview.systemHealthy ? "default" : "destructive"} className="mb-1">
              {overview.systemHealthy ? "Healthy" : "Issues"}
            </Badge>
            <div className="text-sm text-muted-foreground">All systems operational</div>
            <div className="mt-2 text-xs text-muted-foreground">Last checked: {overview.lastChecked}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function RecentActivityTimeline() {
    const iconFor = (t: string) =>
      t === "payment" ? (
        <DollarSign className="size-4" />
      ) : t === "workspace" ? (
        <Terminal className="size-4" />
      ) : (
        <Users className="size-4" />
      )
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across users, payments, and workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((a, idx) => (
              <div key={a.id} className="flex gap-3">
                <div className="mt-1">{iconFor(a.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">{a.text}</span>{" "}
                      <button className="underline decoration-dotted underline-offset-2">{a.user}</button>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                  <Badge
                    className="mt-1 w-fit"
                    variant={
                      a.status === "Paid" || a.status === "Running" || a.status === "Active" ? "default" : "secondary"
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="link" className="px-0">
                View all activity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function QuickStatsCharts() {
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* User Growth */}
        <Card className="overflow-hidden bg-background">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Daily signups (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ChartContainer config={{ signups: { label: "Signups", color: "hsl(var(--chart-1))" } }} className="h-full">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line dataKey="signups" type="monotone" stroke="var(--color-signups)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="overflow-hidden bg-background">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Weekly revenue (last 4 weeks)</CardDescription>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }} className="h-full">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueWeeks} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" maxBarSize={35} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Workspace Usage */}
        <Card className="overflow-hidden bg-background">
          <CardHeader>
            <CardTitle>Workspace Usage</CardTitle>
            <CardDescription>Active vs idle</CardDescription>
          </CardHeader>
          <CardContent className="h-80 p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={workspaceUsage}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={6}
                  isAnimationActive={false}
                >
                  {workspaceUsage.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  function QuickActions() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Button onClick={() => t("Add New User", "Opening user creation flow...")}>
              <Plus className="mr-2 size-4" /> Add New User
            </Button>
            <Button variant="secondary" onClick={() => setActiveTab("batches")}>
              <PackageIcon className="mr-2 size-4" /> Create Batch
            </Button>
            <Button variant="outline" onClick={() => t("Export Reports", "CSV export started")}>
              <Download className="mr-2 size-4" /> Export Reports
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab("settings")}>
              <Settings className="mr-2 size-4" /> System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Dashboard View
  function DashboardView() {
    return (
      <div className="space-y-6">
        <OverviewCard />
        <QuickStatsCharts />
        <RecentActivityTimeline />
        <QuickActions />
      </div>
    )
  }

  // Users View
  function UsersView() {
    const toggleAll = (checked: boolean) => {
      const next: Record<string, boolean> = {}
      filteredUsers.forEach((u) => (next[u.id] = checked))
      setSelectedUsers((prev) => ({ ...prev, ...next }))
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-8"
              />
            </div>
            <Select value={filterTrack} onValueChange={(v: any) => setFilterTrack(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="DP">DP</SelectItem>
                <SelectItem value="FSD">FSD</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={(v: any) => setFilterPayment(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => t("Export to CSV", "User list export started")}>
              <Download className="mr-2 size-4" /> Export to CSV
            </Button>
            <Button
              onClick={() => {
                setEditingUser({
                  id: "new",
                  name: "",
                  email: "",
                  track: "DP",
                  batch: undefined,
                  status: "Active",
                  payment: "Unpaid",
                  joined: "",
                })
                setEditOpen(true)
              }}
            >
              <Plus className="mr-2 size-4" /> Add New User
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 py-3">
              <div className="text-sm">{selectedCount} users selected</div>
              <Select onValueChange={(v) => t("Assign to Batch", `Assigned to ${v}`)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Assign to Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Batch 1">Batch 1</SelectItem>
                  <SelectItem value="Batch 2">Batch 2</SelectItem>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => t("Change Status", `Updated to ${v}`)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 size-4" /> Delete Selected
              </Button>
              <Button variant="ghost" onClick={resetUserSelection}>
                Clear
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={(v: any) => toggleAll(Boolean(v))}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={!!selectedUsers[u.id]}
                        onCheckedChange={(v: any) => setSelectedUsers((s) => ({ ...s, [u.id]: Boolean(v) }))}
                        aria-label={`Select ${u.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-sm font-medium underline decoration-dotted"
                        onClick={() => {
                          setEditingUser(u)
                          setEditOpen(true)
                        }}
                      >
                        {u.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge>{u.track}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.batch ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "Active" ? "default" : "secondary"}>{u.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.payment === "Paid" ? "default" : u.payment === "Unpaid" ? "secondary" : "destructive"
                        }
                      >
                        {u.payment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.joined}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingUser(u)
                          setEditOpen(true)
                        }}
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingUser(u)
                          setDeleteOpen(true)
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => t("View User", u.name)} aria-label="View">
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="p-6 text-center text-sm text-muted-foreground">No users found</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingUser?.id === "new" ? "Add New User" : `Edit User: ${editingUser?.name ?? ""}`}
              </DialogTitle>
              <DialogDescription>Update user details and status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Full Name</Label>
                <Input
                  value={editingUser?.name ?? ""}
                  onChange={(e) => setEditingUser((u) => (u ? { ...u, name: e.target.value } : u))}
                />
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingUser?.email ?? ""}
                  onChange={(e) => setEditingUser((u) => (u ? { ...u, email: e.target.value } : u))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label>Track</Label>
                  <Select
                    value={editingUser?.track}
                    onValueChange={(v: any) => setEditingUser((u) => (u ? { ...u, track: v } : u))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP">DP</SelectItem>
                      <SelectItem value="FSD">FSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label>Batch</Label>
                  <Select
                    value={editingUser?.batch ?? "Unassigned"}
                    onValueChange={(v: any) =>
                      setEditingUser((u) => (u ? { ...u, batch: v === "Unassigned" ? undefined : v } : u))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs text-muted-foreground">Toggle user status</div>
                  </div>
                  <Switch
                    checked={editingUser?.status === "Active"}
                    onCheckedChange={(v) =>
                      setEditingUser((u) => (u ? { ...u, status: v ? "Active" : "Inactive" } : u))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Payment Status</Label>
                  <Select
                    value={editingUser?.payment}
                    onValueChange={(v: any) => setEditingUser((u) => (u ? { ...u, payment: v } : u))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!editingUser) return
                  if (editingUser.id === "new") {
                    const newUser = { ...editingUser, id: `u${Date.now()}`, joined: new Date().toLocaleDateString() }
                    setUsers((arr) => [newUser, ...arr])
                    t("User Created", newUser.name)
                  } else {
                    setUsers((arr) => arr.map((u) => (u.id === editingUser.id ? editingUser : u)))
                    t("User Updated", editingUser.name)
                  }
                  setEditOpen(false)
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>⚠ Delete User?</DialogTitle>
              <DialogDescription>Type DELETE to confirm. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <Card className="bg-muted/30">
              <CardContent className="space-y-1 p-3 text-sm">
                <div>This will also delete:</div>
                <ul className="ml-4 list-disc">
                  <li>Workspace data</li>
                  <li>Project submissions</li>
                  <li>Progress history</li>
                </ul>
              </CardContent>
            </Card>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE" to confirm'
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteConfirm !== "DELETE"}
                onClick={() => {
                  const ids = Object.keys(selectedUsers).filter((id) => selectedUsers[id])
                  setUsers((arr) => arr.filter((u) => !ids.includes(u.id)))
                  resetUserSelection()
                  setDeleteOpen(false)
                  setDeleteConfirm("")
                  t("Users Deleted", `${ids.length} user(s) removed`)
                }}
              >
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Batches View
  function BatchesView() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <Button
            onClick={() => {
              setEditingBatch({ id: "new", name: "", startDate: "", students: 0, track: "DP", status: "Upcoming" })
              setBatchModalOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" /> Create New Batch
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-56">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <button
                        className="font-medium underline decoration-dotted"
                        onClick={() => {
                          setEditingBatch(b)
                          setBatchModalOpen(true)
                        }}
                      >
                        {b.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">{b.startDate}</TableCell>
                    <TableCell>
                      <button
                        className="text-sm underline decoration-dotted"
                        onClick={() => t("Show Students", `${b.students} students`)}
                      >
                        {b.students} students
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">{b.trainer ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge>{b.track}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.status === "Active" ? "default" : b.status === "Upcoming" ? "secondary" : "outline"}
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBatch(b)
                          setBatchModalOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 size-4" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAssignStudentsOpen(true)}>
                        <Users className="mr-2 size-4" /> Assign Students
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAssignTrainerOpen(true)}>
                        <UserTeacherIcon className="mr-2 size-4" /> Assign Trainer
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => t("Batch Deleted", b.name)}>
                        <Trash2 className="mr-2 size-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Batch */}
        <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBatch?.id === "new" ? "Create New Batch" : "Edit Batch"}</DialogTitle>
              <DialogDescription>Define batch details and track.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Batch Name</Label>
                <Input
                  value={editingBatch?.name ?? ""}
                  onChange={(e) => setEditingBatch((b) => (b ? { ...b, name: e.target.value } : b))}
                  placeholder="e.g., Batch 2 - November 2025"
                />
              </div>
              <div className="grid gap-1">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={
                    editingBatch?.startDate && /^\d{4}-\d{2}-\d{2}$/.test(editingBatch.startDate)
                      ? editingBatch.startDate
                      : ""
                  }
                  onChange={(e) => setEditingBatch((b) => (b ? { ...b, startDate: e.target.value } : b))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Track</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["DP", "FSD", "Mixed"] as const).map((opt) => (
                    <Button
                      key={opt}
                      variant={editingBatch?.track === opt ? "default" : "outline"}
                      onClick={() => setEditingBatch((b) => (b ? { ...b, track: opt } : b))}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-1">
                <Label>Description</Label>
                <Textarea
                  maxLength={200}
                  placeholder="Brief description..."
                  value={editingBatch?.description ?? ""}
                  onChange={(e) => setEditingBatch((b) => (b ? { ...b, description: e.target.value } : b))}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {editingBatch?.description?.length ?? 0}/200
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!editingBatch) return
                  if (editingBatch.id === "new") {
                    setBatches((arr) => [{ ...editingBatch, id: `b${Date.now()}` }, ...arr])
                    t("Batch Created", editingBatch.name || "Untitled")
                  } else {
                    setBatches((arr) => arr.map((b) => (b.id === editingBatch.id ? editingBatch : b)))
                    t("Batch Updated", editingBatch.name)
                  }
                  setBatchModalOpen(false)
                }}
              >
                {editingBatch?.id === "new" ? "Create Batch" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Students */}
        <Dialog open={assignStudentsOpen} onOpenChange={setAssignStudentsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Students</DialogTitle>
              <DialogDescription>Select students to add to this batch.</DialogDescription>
            </DialogHeader>
            <Input placeholder="Search students..." />
            <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-3 text-sm">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`stu-${u.id}`} />
                    <Label htmlFor={`stu-${u.id}`}>{u.name}</Label>
                  </div>
                  <Badge>{u.track}</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignStudentsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setAssignStudentsOpen(false)
                  t("Students Assigned", "Added to batch")
                }}
              >
                Assign to Batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Trainer */}
        <Dialog open={assignTrainerOpen} onOpenChange={setAssignTrainerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Trainer</DialogTitle>
              <DialogDescription>Select a trainer for this batch.</DialogDescription>
            </DialogHeader>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Priya Singh">Priya Singh (2 batches)</SelectItem>
                <SelectItem value="Rahul Mehta">Rahul Mehta (1 batch)</SelectItem>
              </SelectContent>
            </Select>
            <Card>
              <CardContent className="p-3 text-sm text-muted-foreground">
                Trainer workload and details will appear here after selection.
              </CardContent>
            </Card>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignTrainerOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setAssignTrainerOpen(false)
                  t("Trainer Assigned", "Trainer linked to batch")
                }}
              >
                Assign Trainer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Payments View
  function PaymentsView() {
    const paidCount = payments.filter((p) => p.status === "Paid").length
    const pendingCount = payments.filter((p) => p.status === "Unpaid").length
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Total Revenue</CardTitle>
              <DollarSign className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">$9,440</div>
              <div className="text-sm text-muted-foreground">All time</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">This Month</CardTitle>
              <Activity className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">$2,360</div>
              <div className="text-sm text-emerald-600">+15% vs Sept</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Paid Students</CardTitle>
              <CreditCard className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{paidCount}</div>
              <div className="text-sm text-muted-foreground">Out of {payments.length} total</div>
              <div className="text-sm">({Math.round((paidCount / Math.max(payments.length, 1)) * 100)}%)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Pending Payments</CardTitle>
              <Clock className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Awaiting payment</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input placeholder="Search by student name or email..." className="pl-8" />
                </div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => t("Export to CSV", "Payment data export started")}>
                <Download className="mr-2 size-4" /> Export to CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Stripe</TableHead>
                      <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <button
                            className="font-medium underline decoration-dotted"
                            onClick={() => t("Open User", p.name)}
                          >
                            {p.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">{p.email}</TableCell>
                        <TableCell>
                          <Badge>{p.track}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${p.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "Paid" ? "default" : p.status === "Unpaid" ? "secondary" : "destructive"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{p.date ?? "—"}</TableCell>
                        <TableCell className="text-sm">{p.method ?? "—"}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="px-0"
                            onClick={() => window.open("https://dashboard.stripe.com/", "_blank")}
                          >
                            View in Stripe
                          </Button>
                        </TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => t("Reminder Sent", p.email)}>
                            <Mail className="mr-2 size-4" /> Reminder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPaymentDetails(p)
                              setRefundOpen(true)
                            }}
                          >
                            <Undo2 className="mr-2 size-4" /> Refund
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPaymentDetails(p)
                              setPaymentDetailsOpen(true)
                            }}
                          >
                            <Eye className="mr-2 size-4" /> Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 4 weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer
                  config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueWeeks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        dataKey="revenue"
                        type="monotone"
                        stroke="var(--color-revenue)"
                        fill="var(--color-revenue)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="pt-2 text-sm">Total: $9,440</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Activity</CardTitle>
                <CardDescription>Latest payment events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge>✓</Badge>
                  <div className="text-sm">
                    <span className="font-medium">John Doe</span> paid $472{" "}
                    <span className="text-muted-foreground">- 2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">✗</Badge>
                  <div className="text-sm">
                    <span className="font-medium">Sarah Lee</span> failed payment{" "}
                    <span className="text-muted-foreground">- 1 day ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge>$</Badge>
                  <div className="text-sm">
                    <span className="font-medium">Mike</span> refunded $472{" "}
                    <span className="text-muted-foreground">- 3 days ago</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-2 w-full bg-transparent">
                  Load More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Details Modal */}
        <Dialog open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>Transaction and student info</DialogDescription>
            </DialogHeader>
            {paymentDetails && (
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3 text-sm">
                    <div className="font-medium">{paymentDetails.name}</div>
                    <div className="text-muted-foreground">{paymentDetails.email}</div>
                    <div className="mt-1">
                      <Badge>{paymentDetails.track}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">${paymentDetails.amount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <Badge
                      variant={
                        paymentDetails.status === "Paid"
                          ? "default"
                          : paymentDetails.status === "Unpaid"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {paymentDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Payment Date</div>
                    <div className="font-medium">{paymentDetails.date ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Method</div>
                    <div className="font-mono">{paymentDetails.method ?? "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">Transaction ID</div>
                    <div className="font-mono">{paymentDetails.txId ?? "—"}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => window.open("https://dashboard.stripe.com/", "_blank")}>
                    <UploadCloud className="mr-2 size-4" /> Open in Stripe
                  </Button>
                  <Button variant="outline">
                    <Receipt className="mr-2 size-4" /> Send Receipt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPaymentDetailsOpen(false)
                      setRefundOpen(true)
                    }}
                  >
                    <Undo2 className="mr-2 size-4" /> Issue Refund
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 size-4" /> Print Invoice
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Modal */}
        <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>This will initiate a refund in Stripe.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Reason</Label>
              <Textarea placeholder="Optional reason..." />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setRefundOpen(false)
                  t("Refund Initiated", "Processing refund via Stripe")
                }}
              >
                Confirm Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // System View
  function SystemView() {
    const totalActive = 12
    const totalUsers = 20
    const apiAvg = Math.round(
      apiResponseTimes.reduce((s, r) => s + (r.auth + r.containers + r.progress + r.payments) / 4, 0) /
        apiResponseTimes.length,
    )

    const nodes = [
      { id: "Node 1", ok: true },
      { id: "Node 2", ok: true },
      { id: "Node 3", ok: true },
    ]
    const redisHitRate = 94.5

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    systemHealth === "Healthy" ? "default" : systemHealth === "Degraded" ? "secondary" : "destructive"
                  }
                  className="text-base"
                >
                  {systemHealth === "Healthy" ? "All Systems Operational" : systemHealth}
                </Badge>
                <div className="text-sm text-muted-foreground">Last checked: {lastChecked} seconds ago</div>
              </div>
              <div className="text-sm text-muted-foreground">99.8% uptime (last 7 days)</div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Active Workspaces</CardTitle>
              <Terminal className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalActive}</div>
              <div className="text-sm text-muted-foreground">Currently running</div>
              <div className="mt-2 h-2 w-12 animate-pulse rounded-full bg-primary/40" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Total Users</CardTitle>
              <Users className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">18 active, 2 inactive</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">API Health</CardTitle>
              <Cloud className="size-5" />
            </CardHeader>
            <CardContent>
              <Badge>Healthy</Badge>
              <div className="mt-1 text-sm text-muted-foreground">Response time: 120ms avg</div>
              <div className="text-sm text-muted-foreground">Success rate: 99.7%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Database Status</CardTitle>
              <Database className="size-5" />
            </CardHeader>
            <CardContent>
              <Badge>Connected</Badge>
              <div className="mt-1 text-sm text-muted-foreground">Pool: 8/20 used</div>
              <div className="text-sm text-muted-foreground">Query time: 45ms avg</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>EKS Cluster Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 text-sm text-muted-foreground">CPU Usage</div>
                <Progress value={45} />
                <div className="mt-1 text-sm">45% of 4 vCPUs</div>
              </div>
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Memory Usage</div>
                <Progress value={38.75} />
                <div className="mt-1 text-sm">6.2 GB / 16 GB (38.75%)</div>
              </div>
              <div className="text-sm">
                Active Pods: 15 <span className="text-muted-foreground">(12 student, 3 system)</span>
              </div>
              <div className="space-y-1 text-sm">
                {nodes.map((n) => (
                  <div key={n.id}>
                    {n.id}: {n.ok ? "Healthy ✓" : "Issue"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aurora PostgreSQL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>Available</Badge>
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Connections</div>
                <Progress value={8} />
                <div className="mt-1 text-sm">8 / 100 max</div>
              </div>
              <div className="text-sm">Storage Used: 12.3 GB / 100 GB</div>
              <div className="text-sm">Avg Query Time: 45ms</div>
              <div className="text-sm">Slow Queries: 0 (last hour)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ElastiCache Redis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>Available</Badge>
              <div className="text-sm">Hit Rate: {redisHitRate}%</div>
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Memory Used</div>
                <Progress value={(256 / 512) * 100} />
                <div className="mt-1 text-sm">256 MB / 512 MB</div>
              </div>
              <div className="text-sm">Connected Clients: 6</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Response Times (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apiResponseTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line dataKey="auth" type="monotone" stroke={CHART_COLORS[0]} />
                  <Line dataKey="containers" type="monotone" stroke={CHART_COLORS[1]} />
                  <Line dataKey="progress" type="monotone" stroke={CHART_COLORS[2]} />
                  <Line dataKey="payments" type="monotone" stroke={CHART_COLORS[3]} />
                </LineChart>
              </ResponsiveContainer>
              <div className="pt-2 text-sm">Overall avg: {apiAvg}ms</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Errors (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <RefreshCw className="mr-2 size-4" /> Refresh
              </Button>
              <Button variant="link" className="ml-auto px-0">
                View All Logs
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Error Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Oct 11, 2025 10:15 AM</TableCell>
                  <TableCell>Container Orchestration</TableCell>
                  <TableCell>ProvisionTimeout</TableCell>
                  <TableCell>Pod did not become ready within 300s</TableCell>
                  <TableCell>
                    <Badge variant="destructive">High</Badge>
                  </TableCell>
                  <TableCell>Investigating</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 size-4" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">EFS (Workspaces)</div>
              <Progress value={9} />
              <div className="mt-1 text-sm">45 GB / 500 GB (9%)</div>
              <div className="text-xs text-muted-foreground">Per-student avg: 2.25 GB</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">S3 (Backups)</div>
              <div className="text-sm">12 GB</div>
              <div className="text-xs text-muted-foreground">Last backup: 2 hours ago</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Database</div>
              <div className="text-sm">12.3 GB</div>
              <div className="text-xs text-muted-foreground">Growth: +500 MB/week</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Workspace Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Switch /> <span>Auto-refresh every 10s</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Pod ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sarah Lee</TableCell>
                  <TableCell className="font-mono">pod_a2f9</TableCell>
                  <TableCell>
                    <Badge>Running</Badge>
                  </TableCell>
                  <TableCell>15%</TableCell>
                  <TableCell>512 MB</TableCell>
                  <TableCell>2h 15m</TableCell>
                  <TableCell>5 min ago</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">
                      🛑 Shutdown
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Profile View
  function ProfileView() {
    const [isSaving, setIsSaving] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [name, setName] = useState("Admin User")
    const [email, setEmail] = useState("admin@apranova.com")
    const [phone, setPhone] = useState("+1 (555) 987-6543")
    const [location, setLocation] = useState("San Francisco, USA")
    const [bio, setBio] = useState("Administrator managing the Apra Nova platform")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [pushNotifications, setPushNotifications] = useState(true)
    const [securityAlerts, setSecurityAlerts] = useState(true)

    const handleSaveProfile = () => {
      setIsSaving(true)
      setTimeout(() => {
        setIsSaving(false)
        t("Profile Updated", "Your profile has been updated successfully")
      }, 1000)
    }

    const handleChangePassword = () => {
      if (newPassword !== confirmPassword) {
        t("Error", "New passwords do not match")
        return
      }
      t("Password Changed", "Your password has been updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  AD
                </div>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{name}</h3>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined Jan 2024
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-9 pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleChangePassword} variant="outline">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about security events</p>
              </div>
              <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Settings View
  function SettingsView() {
    const [isSaving, setIsSaving] = useState(false)
    const [siteName, setSiteName] = useState("Apra Nova")
    const [siteDescription, setSiteDescription] = useState("Professional learning platform")
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [userRegistrationNotif, setUserRegistrationNotif] = useState(true)
    const [paymentNotif, setPaymentNotif] = useState(true)
    const [sessionTimeout, setSessionTimeout] = useState("30")
    const [passwordExpiry, setPasswordExpiry] = useState("90")
    const [twoFactorRequired, setTwoFactorRequired] = useState(false)
    const [smtpHost, setSmtpHost] = useState("smtp.gmail.com")
    const [smtpPort, setSmtpPort] = useState("587")
    const [smtpUser, setSmtpUser] = useState("")

    const handleSaveSettings = () => {
      setIsSaving(true)
      setTimeout(() => {
        setIsSaving(false)
        t("Settings Saved", "Your settings have been updated successfully")
      }, 1000)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Manage platform configuration</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Site Description</Label>
                <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to platform</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable email notifications</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registration Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified on new users</p>
                </div>
                <Switch checked={userRegistrationNotif} onCheckedChange={setUserRegistrationNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payments</p>
                </div>
                <Switch checked={paymentNotif} onCheckedChange={setPaymentNotif} />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require 2FA</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                </div>
                <Switch checked={twoFactorRequired} onCheckedChange={setTwoFactorRequired} />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password Expiry</Label>
                <Select value={passwordExpiry} onValueChange={setPasswordExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Database Backup</Label>
                    <p className="text-sm text-muted-foreground">Last: 2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Backup Now
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Optimization</Label>
                    <p className="text-sm text-muted-foreground">Optimize tables</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Optimize
                  </Button>
                </div>
                <div>
                  <Label>Database Stats</Label>
                  <div className="text-sm space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">12.3 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tables:</span>
                      <span className="font-medium">45</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <AdminHeader 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as TabKey)}
        adminName="Admin"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-4 py-4">
        {/* Sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 flex-col gap-1 border-r py-4 md:flex">
          <SidebarItem
            icon={<Activity className="size-4" />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            icon={<Users className="size-4" />}
            label="User Management"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarItem
            icon={<PackageIcon className="size-4" />}
            label="Batch Management"
            active={activeTab === "batches"}
            onClick={() => setActiveTab("batches")}
          />
          <SidebarItem
            icon={<DollarSign className="size-4" />}
            label="Payment Monitor"
            active={activeTab === "payments"}
            onClick={() => setActiveTab("payments")}
          />
          <SidebarItem
            icon={<HeartPulse className="size-4" />}
            label="System Metrics"
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
          />
          <SidebarItem
            icon={<User className="size-4" />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SidebarItem
            icon={<Settings className="size-4" />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "batches" && <BatchesView />}
          {activeTab === "payments" && <PaymentsView />}
          {activeTab === "system" && <SystemView />}
          {activeTab === "profile" && <ProfileView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  )
}

/* Utilities */
function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
        active ? "bg-muted font-medium" : "hover:bg-muted/60"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

/* Small placeholder icons where lucide lacks named ones */
function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        fill="currentColor"
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73ZM12 3.15 18.74 7 12 10.85 5.26 7ZM5 9.32 11 13v7.68L5 17Z"
      />
    </svg>
  )
}
function UserTeacherIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m-7 8a7 7 0 1 1 14 0H5Z" />
    </svg>
  )
}
