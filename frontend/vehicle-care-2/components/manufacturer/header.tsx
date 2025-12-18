"use client"

import { Search, Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export default function ManufacturerHeader() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-6">
      {/* Left: Welcome Message */}
      <div className="text-white">
        <span className="text-sm font-medium text-gray-300">Welcome back, </span>
        <span className="text-sm font-semibold text-white">{user?.email?.split("@")[0] || "Manufacturer"}</span>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, products, inventory..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications and User Profile */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm border border-white/10">
          <Bell size={18} className="text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-black"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors backdrop-blur-sm border border-white/10">
              <Avatar className="w-8 h-8 ring-2 ring-cyan-500/30">
                <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/10 backdrop-blur-xl border-white/10">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-white">{user?.email || "Manufacturer"}</p>
              <p className="text-xs text-gray-400">Manufacturer Dashboard</p>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

