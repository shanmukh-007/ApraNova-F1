"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import MatrixBackground from "./matrix-bg"

// Technology Icons Component
const TechIcon = ({ children, className = "", delay = "0s" }: { children: React.ReactNode; className?: string; delay?: string }) => (
  <div 
    className={`absolute text-4xl opacity-20 dark:opacity-10 ${className}`}
    style={{ 
      animation: `float 20s ease-in-out infinite`,
      animationDelay: delay 
    }}
  >
    {children}
  </div>
)

// Counter animation hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return count
}

export default function Hero() {
  const studentsCount = useCounter(1000, 2000)
  const placementRate = useCounter(95, 2000)
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Matrix Background */}
      <MatrixBackground />
      
      {/* Animated Technology Icons Background */}
      <div className="absolute inset-0 overflow-hidden">
        <TechIcon className="top-[10%] left-[5%]" delay="0s">
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="#8B5CF6"/>
          </svg>
        </TechIcon>
        
        <TechIcon className="top-[20%] right-[10%]" delay="2s">
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3B82F6"/>
          </svg>
        </TechIcon>

        <TechIcon className="top-[60%] left-[8%]" delay="4s">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#10B981"/>
          </svg>
        </TechIcon>

        <TechIcon className="bottom-[15%] right-[15%]" delay="6s">
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" fill="#F59E0B"/>
          </svg>
        </TechIcon>

        <TechIcon className="top-[40%] right-[5%]" delay="8s">
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#EC4899"/>
          </svg>
        </TechIcon>

        <TechIcon className="top-[70%] right-[25%]" delay="10s">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="#6366F1"/>
          </svg>
        </TechIcon>

        <TechIcon className="bottom-[25%] left-[15%]" delay="12s">
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#EF4444"/>
          </svg>
        </TechIcon>

        <TechIcon className="top-[30%] left-[20%]" delay="14s">
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#14B8A6"/>
          </svg>
        </TechIcon>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
          50% { transform: translateY(-10px) translateX(-10px) rotate(-5deg); }
          75% { transform: translateY(-30px) translateX(5px) rotate(3deg); }
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full border border-violet-200 dark:border-violet-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Cloud-Based Learning Platform</span>
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              Learn. Code.{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Build.
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Master in-demand tech skills with our cloud-based IDE, structured curriculum, and expert mentorship. Start coding in minutes, not hours.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg h-14 px-8 shadow-lg shadow-emerald-500/25"
            >
              <Link href="/get-started">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8 border-2"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Login Link */}
          <p className="text-sm text-slate-600 dark:text-slate-400 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>

          {/* Stats with Counter Animation */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            {/* Active Students */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                {studentsCount}+
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Students</div>
            </div>

            {/* Placement Rate */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {placementRate}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Placement Rate</div>
            </div>

            {/* Support */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                24/7
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Support</div>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}
