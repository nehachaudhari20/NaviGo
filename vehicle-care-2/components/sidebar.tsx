"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Wrench, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Shield,
  TrendingUp,
  Bell,
  BarChart3
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export default function Sidebar() {
  const [supportOpen, setSupportOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path || (path === "/" && pathname === "/")

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-screen overflow-y-auto shadow-2xl">
      {/* Logo and Brand Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">NaviGo</p>
            <p className="text-xs text-slate-400">AI-Powered Vehicle Care</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-all cursor-pointer group">
          <Avatar className="size-10 ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/50 transition-all">
            <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
              CO
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Christian</p>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 text-xs px-2 py-0.5">
                Premium
              </Badge>
              <Shield className="w-3 h-3 text-green-400" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-400">Health</span>
            </div>
            <p className="text-sm font-bold text-white">87%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Alerts</span>
            </div>
            <p className="text-sm font-bold text-white">2</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* Dashboard */}
        <Link
          href="/"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/") 
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          }`}
          title="Dashboard"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              isActive("/") 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
            }`}
          >
            <LayoutDashboard size={18} />
          </div>
          <span className="text-sm font-medium flex-1">Dashboard</span>
          {isActive("/") && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Servicing */}
        <Link
          href="/servicing"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/servicing") 
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          }`}
          title="Servicing"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              isActive("/servicing") 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
            }`}
          >
            <Wrench size={18} />
          </div>
          <span className="text-sm font-medium flex-1">Servicing</span>
          {isActive("/servicing") && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/account") 
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          }`}
          title="Account"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              isActive("/account") 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
            }`}
          >
            <CreditCard size={18} />
          </div>
          <span className="text-sm font-medium flex-1">Account</span>
          {isActive("/account") && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Analytics */}
        <Link
          href="/analytics"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/analytics") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Analytics"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/analytics") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <BarChart3 size={18} />
          </div>
          <span className="text-sm font-medium">Analytics</span>
        </Link>

        {/* Support with Submenu */}
        <div>
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/support") 
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
            title="Support"
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                isActive("/support") 
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                  : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
              }`}
            >
              <LifeBuoy size={18} />
            </div>
            <span className="text-sm font-medium flex-1 text-left">Support</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${supportOpen ? "rotate-180" : ""} ${
                isActive("/support") ? "text-cyan-400" : "text-slate-400"
              }`} 
            />
          </button>

          {/* Support Submenu */}
          {supportOpen && (
            <div className="mt-2 ml-4 space-y-1 pl-4 border-l-2 border-slate-700/50">
              <button className="w-full text-left text-xs text-slate-400 hover:text-cyan-400 py-2 px-3 rounded-lg hover:bg-slate-800/30 transition-all">
                On-road help
              </button>
              <button className="w-full text-left text-xs text-slate-400 hover:text-cyan-400 py-2 px-3 rounded-lg hover:bg-slate-800/30 transition-all">
                Car pickup
              </button>
              <button className="w-full text-left text-xs text-slate-400 hover:text-cyan-400 py-2 px-3 rounded-lg hover:bg-slate-800/30 transition-all">
                Emergency
              </button>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/settings") 
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          }`}
          title="Settings"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              isActive("/settings") 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
            }`}
          >
            <Settings size={18} />
          </div>
          <span className="text-sm font-medium flex-1">Settings</span>
          {isActive("/settings") && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/profile") 
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
          }`}
          title="Profile"
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
              isActive("/profile") 
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30" 
                : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-400"
            }`}
          >
            <User size={18} />
          </div>
          <span className="text-sm font-medium flex-1">Profile</span>
          {isActive("/profile") && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700/50">
        {/* AI Badge */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">AI-Powered</span>
          </div>
          <p className="text-xs text-slate-400">24/7 monitoring active</p>
        </div>

      {/* Logout Button */}
      <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all group"
        title="Logout"
      >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
          <LogOut size={18} />
        </div>
        <span className="text-sm font-medium">Logout</span>
      </button>
      </div>
    </aside>
  )
}
