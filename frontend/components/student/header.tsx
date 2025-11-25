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

const tabs = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/project-guide", label: "Project Guide" },
  { href: "/student/quizzes", label: "Quizzes" },
  { href: "/student/submit", label: "Submit" },
  { href: "/student/help", label: "Help" },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("Student")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await apiClient.get("/users/profile")
        if (response.data) {
          setUserName(response.data.name || response.data.username || "Student")
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
    
    // Call backend to blacklist token
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    // Clear local tokens
    clearTokens();
    
    // Redirect to login
    router.push("/login");
  };

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
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              prefetch={true}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === t.href ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.png" alt="Student avatar" />
                <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  {userEmail && <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/profile" prefetch={true}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/settings" prefetch={true}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
