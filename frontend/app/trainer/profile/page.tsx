"use client"

import { useState, useEffect } from "react"
import { Calendar, Camera, Save, BookOpen, Home, Users, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/apiClient"
import { TrainerHeader } from "@/components/trainer/TrainerHeader"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TrainerProfilePage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Profile data
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [joinedDate, setJoinedDate] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get("/users/profile")
        console.log("Trainer Profile API response:", response.data)
        if (response.data) {
          setName(response.data.name || response.data.username || "")
          setEmail(response.data.email || "")
          
          // Format joined date
          if (response.data.created_at) {
            const date = new Date(response.data.created_at)
            setJoinedDate(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [toast])

  const handleSaveProfile = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TrainerHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <TrainerHeader />

      {/* Shell with Sidebar */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-lg border bg-card p-3">
          <Link href="/trainer/dashboard">
            <div className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            )}>
              <Home className="size-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link href="/trainer/students">
            <div className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            )}>
              <Users className="size-4" />
              <span>My Students</span>
            </div>
          </Link>
          <Link href="/trainer/submissions">
            <div className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            )}>
              <ListChecks className="size-4" />
              <span>Submission Queue</span>
            </div>
          </Link>
          <Link href="/trainer/schedule">
            <div className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            )}>
              <Calendar className="size-4" />
              <span>Office Hours</span>
            </div>
          </Link>
        </aside>

        {/* Main Content */}
        <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground">Dashboard / Profile</div>

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{name ? name.slice(0, 2).toUpperCase() : "TR"}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {joinedDate || "Recently"}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Role: Trainer
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  )
}
