"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues
function ThemeToggleInner() {
  const { useTheme } = require("@/contexts/theme-context")
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  
  // Only render after mount to avoid SSR issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}

export const ThemeToggle = dynamic(() => Promise.resolve(ThemeToggleInner), {
  ssr: false,
  loading: () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      aria-label="Toggle theme"
      disabled
    >
      <Sun className="h-4 w-4" />
    </Button>
  ),
})