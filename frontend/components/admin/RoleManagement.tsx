"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { adminService } from "@/services/adminService"
import { Loader2, CheckCircle2, Shield } from "lucide-react"

type Role = "student" | "trainer" | "admin"

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role>("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleUpdateRole() {
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await adminService.updateUserRole(selectedRole)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Failed to update role"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Role Management</CardTitle>
        </div>
        <CardDescription>Update your account role (for testing/admin purposes)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Role updated successfully to <strong>{selectedRole}</strong>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="role">Select New Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Changing your role will affect your dashboard access and permissions
          </p>
        </div>

        <Button onClick={handleUpdateRole} disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Role...
            </>
          ) : (
            "Update Role"
          )}
        </Button>

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium mb-1">Role Descriptions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• <strong>Student:</strong> Access to learning materials and project submissions</li>
            <li>• <strong>Trainer:</strong> Manage students, grade submissions, and schedule</li>
            <li>• <strong>Admin:</strong> Full system access and user management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
