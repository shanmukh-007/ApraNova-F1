"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { clearTokens, getRefreshToken } from "@/lib/auth";
import { authService } from "@/services";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

interface TrainerHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  trainerName?: string;
}

export function TrainerHeader({ activeTab, onTabChange, trainerName: propTrainerName = "Trainer" }: TrainerHeaderProps) {
  const router = useRouter();
  const [trainerName, setTrainerName] = useState(propTrainerName);
  const [trainerEmail, setTrainerEmail] = useState("");

  useEffect(() => {
    async function fetchTrainerProfile() {
      try {
        const response = await apiClient.get("/users/profile");
        if (response.data) {
          setTrainerName(response.data.name || response.data.username || "Trainer");
          setTrainerEmail(response.data.email || "");
        }
      } catch (error) {
        console.error("Failed to fetch trainer profile:", error);
      }
    }
    fetchTrainerProfile();
  }, []);

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

  const tabs = [
    { key: "dashboard", label: "Dashboard", href: "/trainer/dashboard" },
    { key: "students", label: "Students", href: "/trainer/students" },
    { key: "submissions", label: "Submissions", href: "/trainer/submissions" },
    { key: "schedule", label: "Schedule", href: "/trainer/schedule" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/trainer/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image 
            src="/apra-nova-logo.png" 
            alt="Apra Nova logo" 
            width={32} 
            height={32} 
            className="rounded object-contain"
            priority
          />
          <span className="font-semibold text-lg tracking-tight">Apra Nova</span>
        </Link>
        <div className="flex items-center gap-3 ml-4">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-lg font-semibold">Apra Nova • Trainer</span>
        </div>
        
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-trainer.png" alt={trainerName} />
                  <AvatarFallback>{trainerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{trainerName}</p>
                {trainerEmail && <p className="text-xs leading-none text-muted-foreground">{trainerEmail}</p>}
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
  );
}
