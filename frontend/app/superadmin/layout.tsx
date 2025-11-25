import type React from "react"
import type { Metadata } from "next"
import { SuperAdminHeader, SuperAdminSidebar } from "@/components/superadmin"

export const metadata: Metadata = {
  title: "SuperAdmin • Apra Nova",
  description: "SuperAdmin area",
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SuperAdminHeader />
      <div className="flex">
        <SuperAdminSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
