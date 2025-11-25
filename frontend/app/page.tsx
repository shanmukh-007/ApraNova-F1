"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/landing/navbar"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import HowItWorks from "@/components/landing/how-it-works"
import Tracks from "@/components/landing/tracks"
import Testimonials from "@/components/landing/testimonials"
import Footer from "@/components/landing/footer"
import Image from "next/image"

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show loader for 1.5 seconds on first load
    const timer = setTimeout(() => {
      setLoading(false)
      sessionStorage.setItem('preloader-shown', 'true')
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="animate-in fade-in duration-500">
            <Image 
              src="/Apra Nova Logo-1-02.png" 
              alt="Apra Nova Logo" 
              width={180}
              height={60}
              className="h-16 w-auto object-contain mx-auto"
              priority
            />
          </div>
          
          {/* Spinner */}
          <div className="relative animate-in fade-in duration-1000 delay-300">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-2 animate-in fade-in duration-1000 delay-500">
            <p className="text-slate-200 text-lg font-medium">Loading Apra Nova</p>
            <p className="text-slate-400 text-sm">Preparing your experience...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Tracks />
      <Testimonials />
      <Footer />
    </div>
  )
}
