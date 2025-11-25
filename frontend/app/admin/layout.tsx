import type React from "react"
import type { Metadata } from "next"
import AdminHeader from "@/components/admin/header"

export const metadata: Metadata = {
  title: "Admin • Apra Nova",
  description: "Admin area",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
