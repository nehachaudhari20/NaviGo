"use client"

import { Bell, Mail, Calendar, ChevronDown, X, Plus, Menu } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ServiceCenterHeaderProps {
  onMenuClick?: () => void
}

export default function ServiceCenterHeader({ onMenuClick }: ServiceCenterHeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  return (
    <header className="bg-[#1e40af] text-white">
      <div className="h-14 flex items-center justify-between px-6">
        {/* Left Section - Fibo Studio with tabs */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/10 rounded transition-colors"
          >
            <Menu size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="text-sm font-semibold">Fibo Studio</span>
          </div>
          <X size={16} className="text-white/80 cursor-pointer hover:text-white" />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-7 w-7 p-0">
            <Plus size={14} />
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-white/10 rounded transition-colors">
            <Bell size={18} />
          </button>

          {/* Messages */}
          <button className="relative p-2 hover:bg-white/10 rounded transition-colors">
            <Mail size={18} />
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-white/20 text-white text-xs">S</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-xs font-medium leading-tight">Shams</p>
                  <p className="text-[10px] text-white/80 leading-tight">Fibo Studio</p>
                </div>
                <ChevronDown size={14} className="text-white/80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Shams</p>
                <p className="text-xs text-gray-500">Fibo Studio</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Date Range Row */}
      <div className="h-10 flex items-center justify-end px-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/90">
          <Calendar size={14} />
          <span>Dec 10, 2022 - July 18, 2023</span>
        </div>
      </div>
    </header>
  )
}

