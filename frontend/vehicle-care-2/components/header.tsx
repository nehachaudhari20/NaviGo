"use client"

import { Bell, Search, Menu, Crown, Sparkles, LogOut } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const isServicingPage = pathname?.includes("/servicing")
  const isSupportPage = pathname?.includes("/support")

  const handleLogout = () => {
    // Clear auth state first
    logout()
    // Immediately redirect to login page
    window.location.href = "/login"
  }

  return (
    <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      {isServicingPage || isSupportPage ? (
        <div className="flex flex-col w-full">
          {/* Top Row: Menu, Title, Bell, User */}
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <Menu size={20} className="text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors" />
              <span className="text-lg font-bold text-cyan-400 tracking-wider uppercase">
                {isSupportPage ? "Support" : "Servicing"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Bell size={20} className="text-slate-300 hover:text-cyan-400 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-slate-800"></span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-1 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <Avatar className="ring-2 ring-cyan-500/30 hover:ring-cyan-500/50 transition-all w-8 h-8">
                      <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-slate-900 font-semibold text-xs">
                        {user?.email?.charAt(0).toUpperCase() || "CO"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-slate-100">{user?.email || "User"}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.persona || "Customer"} Dashboard</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
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
          </div>
          {/* Bottom Row: Vehicle Info */}
          <div className="h-12 border-t border-slate-700/50 bg-slate-900/30 flex items-center px-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">Mahindra XEV 9e</span>
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                  Elite Plus
                </Badge>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">MH-07-AB-1234</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Last service: <span className="text-slate-300 font-medium">45 days ago</span></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-6 gap-6">
          {/* Search Section */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search services, reminders..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
            </div>
      </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-slate-700/50 rounded-lg transition-all group">
              <Bell size={20} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-slate-800"></span>
        </button>

            {/* Book Service Button */}
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
              <Sparkles size={16} />
          Book Service
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-700/50">
          <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-sm font-semibold text-slate-200">
                    {user?.email?.split("@")[0] || "Christian Oweazim"}
                  </p>
                  <Crown size={14} className="text-yellow-500" />
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30 text-xs px-2 py-0.5">
                    Premium
                  </Badge>
                  <span className="text-xs text-slate-500">member</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative cursor-pointer">
                    <Avatar className="ring-2 ring-cyan-500/30 hover:ring-cyan-500/50 transition-all">
                      <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-slate-900 font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || "CO"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-slate-100">{user?.email}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.persona} Dashboard</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
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
          </div>
        </div>
      )}
    </header>
  )
}
