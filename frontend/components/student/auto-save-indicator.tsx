"use client"

import * as React from "react"
import { Check, AlertTriangle, Save, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type State = "saving" | "saved" | "ago" | "error"

export default function AutoSaveIndicator() {
  const [state, setState] = React.useState<State>("saved")
  const [ago, setAgo] = React.useState("2 min ago")

  React.useEffect(() => {
    // Simulate state changes
    const seq: State[] = ["saving", "saved", "ago"]
    let i = 0
    const id = setInterval(() => {
      setState(seq[i % seq.length])
      if (seq[i % seq.length] === "ago") setAgo("2 min ago")
      i++
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed right-4 top-16 z-30">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs shadow-sm",
          state === "saving" && "bg-yellow-50 text-yellow-900 border-yellow-200",
          state === "saved" && "bg-emerald-50 text-emerald-900 border-emerald-200",
          state === "ago" && "bg-muted text-foreground border-border",
          state === "error" && "bg-red-50 text-red-900 border-red-200",
        )}
        role="status"
        aria-live="polite"
      >
        {state === "saving" && <Save className="h-3.5 w-3.5 animate-pulse" />}
        {state === "saved" && <Check className="h-3.5 w-3.5" />}
        {state === "ago" && <Clock className="h-3.5 w-3.5" />}
        {state === "error" && <AlertTriangle className="h-3.5 w-3.5" />}
        <span>
          {state === "saving" && "Saving..."}
          {state === "saved" && "Saved"}
          {state === "ago" && `Last saved: ${ago}`}
          {state === "error" && "Save failed"}
        </span>
      </div>
    </div>
  )
}
