"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X } from "lucide-react"
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  Users, 
  BarChart3, 
  Package, 
  MessageCircle,
  Settings,
  User,
  Bell,
  LogOut,
  Plus,
  AlertTriangle,
  Zap,
  ChevronRight,
  ChevronDown,
  Brain
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ServiceCenterSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function ServiceCenterSidebar({ isMobileOpen = false, onMobileClose }: ServiceCenterSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [activeServicesOpen, setActiveServicesOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  const [stats, setStats] = useState({
    activeServices: 4,
    maxServices: 6,
    availableTechnicians: 7,
    totalTechnicians: 10,
    pendingBookings: 3,
    lowStockItems: 2,
    openTickets: 1,
    inProgress: 4,
    scheduled: 5,
    pendingPickup: 2,
    completedToday: 12,
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeServices: Math.floor(Math.random() * 3) + 3,
        availableTechnicians: Math.floor(Math.random() * 3) + 6,
      }))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

  const serviceUtilization = (stats.activeServices / stats.maxServices) * 100
  const technicianAvailability = (stats.availableTechnicians / stats.totalTechnicians) * 100

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 
        flex flex-col h-screen overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Brand/Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">DriveAI Protect</h1>
              <p className="text-xs text-gray-500">Service Center</p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Compact */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Services</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">{stats.activeServices}</span>
                <span className="text-xs text-gray-500">/{stats.maxServices}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                <div
                  className={`h-1 rounded-full transition-all ${
                    serviceUtilization >= 80 ? "bg-red-500" : serviceUtilization >= 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${serviceUtilization}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Technicians</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">{stats.availableTechnicians}</span>
                <span className="text-xs text-gray-500">/{stats.totalTechnicians}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all"
                  style={{ width: `${technicianAvailability}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Alerts Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            {stats.pendingBookings > 0 && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-yellow-600" />
                <span className="text-xs font-medium text-gray-700">{stats.pendingBookings}</span>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-center gap-1.5">
                <Package size={14} className="text-orange-600" />
                <span className="text-xs font-medium text-gray-700">{stats.lowStockItems}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            href="/service-center"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
            {isActive("/service-center") && <ChevronRight size={16} className="ml-auto" />}
          </Link>

          <Link
            href="/service-center/agentic-ai"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/agentic-ai") 
                ? "bg-purple-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Brain size={18} />
            <span className="text-sm font-medium">AI Control Center</span>
            {isActive("/service-center/agentic-ai") && <ChevronRight size={16} className="ml-auto" />}
          </Link>

          <Link
            href="/service-center/predictive-maintenance"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/predictive-maintenance") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Maintenance & Services</span>
            {isActive("/service-center/predictive-maintenance") && <ChevronRight size={16} className="ml-auto" />}
          </Link>

          <Link
            href="/service-center/autonomous-scheduling"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/autonomous-scheduling") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar size={18} />
            <span className="text-sm font-medium flex-1">Autonomous Scheduling</span>
            {isActive("/service-center/autonomous-scheduling") && <ChevronRight size={16} className="ml-auto" />}
          </Link>

          <Link
            href="/service-center/customer-engagement"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/customer-engagement") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">Customer Engagement</span>
            {isActive("/service-center/customer-engagement") && <ChevronRight size={16} className="ml-auto" />}
          </Link>

          <Link
            href="/service-center/technicians"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/technicians") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users size={18} />
            <span className="text-sm font-medium">Technicians</span>
          </Link>

          <Link
            href="/service-center/analytics"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/analytics") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Analytics</span>
          </Link>

          <Link
            href="/service-center/inventory"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive("/service-center/inventory") 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Package size={18} />
            <span className="text-sm font-medium flex-1">Inventory</span>
            {stats.lowStockItems > 0 && (
              <Badge 
                variant="outline" 
                className={`text-xs h-5 px-1.5 ${
                  isActive("/service-center/inventory") 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }`}
              >
                {stats.lowStockItems}
              </Badge>
            )}
          </Link>

        </nav>

        {/* Quick Action Button */}
        <div className="p-4 border-t border-gray-200">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" size="sm">
            <Plus size={16} className="mr-2" />
            New Booking
          </Button>
        </div>

        {/* User & Settings */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">SC</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Service Center</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/service-center/settings"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive("/service-center/settings") 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all"
              title="Logout"
            >
              <LogOut size={16} className="text-red-600" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

