"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/project-guide", label: "Project Guide" },
  { href: "/student/quizzes", label: "Take Quizzes" },
  { href: "/student/submissions", label: "My Submissions" },
  { href: "/student/workspace", label: "Launch Workspace" },
  { href: "/student/help", label: "Help & Support" },
]

const quickActions = [
  { 
    title: "Project Guide", 
    description: "View instructions",
    href: "/student/project-guide",
    color: "neutral"
  },
  { 
    title: "Take Quizzes", 
    description: "Test your knowledge",
    href: "/student/quizzes",
    color: "neutral"
  },
  { 
    title: "Submit Project", 
    description: "Upload your work",
    href: "/student/submit",
    color: "neutral"
  },
  { 
    title: "Discord Community", 
    description: "Connect with peers",
    href: "https://discord.gg/apranova",
    color: "neutral",
    external: true
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] w-64 shrink-0 border-r bg-background overflow-y-auto block">
      <div className="flex h-full flex-col min-h-0">
        {/* Quick Actions - Right below logo */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Component = action.external ? 'a' : Link
              const linkProps = action.external 
                ? { href: action.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: action.href }
              
              return (
                <Component
                  key={action.href}
                  {...linkProps}
                  className="block p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:shadow-md"
                >
                  <div className="font-semibold text-sm mb-0.5 text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </Component>
              )
            })}
          </div>
        </div>


      </div>
    </aside>
  )
}
