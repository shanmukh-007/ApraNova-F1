"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, GraduationCap, CreditCard, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/batches", label: "Batches", icon: GraduationCap },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="sticky top-14 hidden h-[calc(100svh-56px)] w-64 shrink-0 border-r bg-background md:block">
      <div className="flex h-full flex-col p-4">
        <nav className="grid gap-1.5 flex-1">
          {items.map((it) => {
            const Icon = it.icon
            const active = pathname === it.href
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  )
}
