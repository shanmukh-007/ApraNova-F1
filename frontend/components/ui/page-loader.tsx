"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show loader when pathname changes
    setLoading(true)
    setFadeOut(false)
    
    // Start fade out after 200ms
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 200)
    
    // Hide loader after fade out completes
    const hideTimer = setTimeout(() => {
      setLoading(false)
    }, 400)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-200 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
