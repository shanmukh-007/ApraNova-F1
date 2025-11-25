"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/apiClient"

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Profile data
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [track, setTrack] = useState("")
  const [joinedDate, setJoinedDate] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get("/users/profile")
        console.log("Profile API response:", response.data)
        if (response.data) {
          setName(response.data.name || response.data.username || "")
          setEmail(response.data.email || "")
          setTrack(response.data.track || "")
          
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
  }, [])

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

  return (
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
                <AvatarFallback className="text-2xl">{name ? name.slice(0, 2).toUpperCase() : "ST"}</AvatarFallback>
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
                {track && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Track: {track}
                  </div>
                )}
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
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Input
                id="track"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                placeholder="Your learning track"
                disabled
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
