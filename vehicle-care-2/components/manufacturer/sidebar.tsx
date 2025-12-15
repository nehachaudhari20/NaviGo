"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Factory, 
  Package, 
  ShieldCheck, 
  Car,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Settings
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export default function ManufacturerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isActive = (path: string) => {
    if (path === "/manufacturer") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] border-r border-gray-800/50 flex flex-col h-screen overflow-y-auto shadow-2xl">
      {/* Logo and Brand Section */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-cyan-500/30 animate-pulse">
              <Factory className="w-7 h-7" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-white">NaviGo</p>
            <p className="text-xs text-gray-400">Manufacturing Hub</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:bg-gray-900/70 transition-all cursor-pointer group">
          <Avatar className="size-11 ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/50 transition-all">
            <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "M"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.email?.split("@")[0] || "Manufacturer"}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 text-xs px-2 py-0.5">
                Manufacturer
              </Badge>
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-gray-900/30 border border-gray-800/30">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-400">Production</span>
            </div>
            <p className="text-sm font-bold text-white">94%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/30 border border-gray-800/30">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-400">Alerts</span>
            </div>
            <p className="text-sm font-bold text-white">3</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* Dashboard */}
        <Link
          href="/manufacturer"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/manufacturer") && pathname === "/manufacturer"
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-gray-300 hover:bg-gray-900/50 hover:text-white"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            isActive("/manufacturer") && pathname === "/manufacturer"
              ? "bg-cyan-500/20" 
              : "bg-gray-800/50 group-hover:bg-cyan-500/10"
          }`}>
            <LayoutDashboard size={18} className={isActive("/manufacturer") && pathname === "/manufacturer" ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-400"} />
          </div>
          <span className="font-medium text-sm">Dashboard</span>
          {isActive("/manufacturer") && pathname === "/manufacturer" && (
            <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Production */}
        <Link
          href="/manufacturer/production"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/manufacturer/production")
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-gray-300 hover:bg-gray-900/50 hover:text-white"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            isActive("/manufacturer/production")
              ? "bg-cyan-500/20" 
              : "bg-gray-800/50 group-hover:bg-cyan-500/10"
          }`}>
            <Factory size={18} className={isActive("/manufacturer/production") ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-400"} />
          </div>
          <span className="font-medium text-sm">Production</span>
          {isActive("/manufacturer/production") && (
            <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Inventory */}
        <Link
          href="/manufacturer/inventory"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/manufacturer/inventory")
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-gray-300 hover:bg-gray-900/50 hover:text-white"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            isActive("/manufacturer/inventory")
              ? "bg-cyan-500/20" 
              : "bg-gray-800/50 group-hover:bg-cyan-500/10"
          }`}>
            <Package size={18} className={isActive("/manufacturer/inventory") ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-400"} />
          </div>
          <span className="font-medium text-sm">Inventory</span>
          {isActive("/manufacturer/inventory") && (
            <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>

        {/* Quality & Analysis */}
        <Link
          href="/manufacturer/quality"
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("/manufacturer/quality")
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
              : "text-gray-300 hover:bg-gray-900/50 hover:text-white"
          }`}
        >
          <div className={`p-2 rounded-lg ${
            isActive("/manufacturer/quality")
              ? "bg-cyan-500/20" 
              : "bg-gray-800/50 group-hover:bg-cyan-500/10"
          }`}>
            <ShieldCheck size={18} className={isActive("/manufacturer/quality") ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-400"} />
          </div>
          <span className="font-medium text-sm">Quality & Analysis</span>
          {isActive("/manufacturer/quality") && (
            <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          )}
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800/50 space-y-2">
        {/* Settings */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-900/50 hover:text-white transition-all group">
          <div className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-cyan-500/10">
            <Settings size={18} className="text-gray-400 group-hover:text-cyan-400" />
          </div>
          <span className="font-medium text-sm">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group border border-red-500/20"
        >
          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
            <LogOut size={18} className="text-red-400" />
          </div>
          <span className="font-medium text-sm">Logout</span>
        </button>

        {/* Bottom Branding */}
        <div className="pt-2 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 transform rotate-45 rounded-sm shadow-lg shadow-cyan-500/20"></div>
        </div>
      </div>
    </aside>
  )
}

