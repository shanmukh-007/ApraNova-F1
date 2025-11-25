"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { clearTokens, getRefreshToken } from "@/lib/auth"
import { authService } from "@/services"
import apiClient from "@/lib/apiClient"
import { User, LogOut, Settings } from "lucide-react"

const tabs = [
  { href: "/trainer/dashboard", label: "Dashboard" },
  { href: "/trainer/students", label: "My Students" },
  { href: "/trainer/submissions", label: "Submissions" },
  { href: "/trainer/quizzes", label: "Quizzes" },
  { href: "/trainer/schedule", label: "Schedule" },
]

export default function TrainerHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("Trainer")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await apiClient.get("/users/profile")
        if (response.data) {
          setUserName(response.data.name || response.data.username || "Trainer")
          setUserEmail(response.data.email || "")
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    }
    fetchUserProfile()
  }, [])

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    clearTokens();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 md:px-6">
        <Link href="/trainer/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <Image 
            src="/Apra Nova Logo-1-02.png" 
            alt="Apra Nova Logo" 
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === t.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-offset-background hover:ring-primary transition-all">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/trainer/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/trainer/settings" className="cursor-pointer">
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
