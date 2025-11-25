import type React from "react"
import type { Metadata } from "next"
import TrainerHeader from "@/components/trainer/header"

export const metadata: Metadata = {
  title: "Trainer • Apra Nova",
  description: "Trainer area",
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TrainerHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
