"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { clearTokens, getRefreshToken } from "@/lib/auth"
import { authService } from "@/services"

export function SuperAdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    const refreshToken = getRefreshToken()
    
    if (refreshToken) {
      await authService.logout(refreshToken)
    }
    
    clearTokens()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image 
            src="/Apra Nova Logo-1-02.png" 
            alt="Apra Nova Logo" 
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <Shield className="h-4 w-4 text-primary ml-2" />
        </Link>

        <nav className="hidden md:flex items-center gap-4 ml-auto">
          <Link
            href="/superadmin/dashboard"
            className="text-sm transition-colors hover:text-foreground text-muted-foreground"
          >
            Dashboard
          </Link>
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.png" alt="SuperAdmin avatar" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>SuperAdmin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/superadmin/profile" prefetch={true}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/superadmin/settings" prefetch={true}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
