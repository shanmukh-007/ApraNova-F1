import type React from "react"
import type { Metadata } from "next"
import Header from "@/components/student/header"
import Sidebar from "@/components/student/sidebar"

export const metadata: Metadata = {
  title: "Student • Apra Nova",
  description: "Student area",
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
