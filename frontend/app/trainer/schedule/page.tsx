import { Toaster } from "@/components/ui/toaster"
import TrainerDashboard from "@/components/trainer-dashboard"

export const metadata = {
  title: "Schedule • Apra Nova",
}

export default function Page() {
  return (
    <main>
      <TrainerDashboard initialTab="schedule" />
      <Toaster />
    </main>
  )
}
