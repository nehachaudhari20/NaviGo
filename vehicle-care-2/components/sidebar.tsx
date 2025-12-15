"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wrench, CreditCard, LifeBuoy, Settings, User, LogOut, ChevronDown, BarChart3 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Sidebar() {
  const [supportOpen, setSupportOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || (path === "/" && pathname === "/")

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col py-6 px-4">
      {/* Logo and User Avatar Section */}
      <div className="mb-8 pb-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold shadow-lg">
            D
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-sidebar-foreground">DriveAI</p>
            <p className="text-xs text-muted-foreground">Protect</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src="/christian-oweazim-profile.jpg" alt="User" />
            <AvatarFallback>CO</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Christian</p>
            <p className="text-xs text-muted-foreground truncate">Premium</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2 flex-1">
        {/* Dashboard */}
        <Link
          href="/"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Dashboard"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <LayoutDashboard size={18} />
          </div>
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        {/* Servicing */}
        <Link
          href="/servicing"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/servicing") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Servicing"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/servicing") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <Wrench size={18} />
          </div>
          <span className="text-sm font-medium">Servicing</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/account") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Account"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/account") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <CreditCard size={18} />
          </div>
          <span className="text-sm font-medium">Account</span>
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive("/support") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            title="Support"
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                isActive("/support") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
              }`}
            >
              <LifeBuoy size={18} />
            </div>
            <span className="text-sm font-medium flex-1 text-left">Support</span>
            <ChevronDown size={16} className={`transition-transform ${supportOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Support Submenu */}
          {supportOpen && (
            <div className="mt-2 ml-4 space-y-1 pl-4 border-l border-sidebar-border">
              <button className="w-full text-left text-xs text-muted-foreground hover:text-sidebar-foreground py-2 transition-colors">
                On-road help
              </button>
              <button className="w-full text-left text-xs text-muted-foreground hover:text-sidebar-foreground py-2 transition-colors">
                Car pickup
              </button>
              <button className="w-full text-left text-xs text-muted-foreground hover:text-sidebar-foreground py-2 transition-colors">
                Emergency
              </button>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/settings") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Settings"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/settings") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <Settings size={18} />
          </div>
          <span className="text-sm font-medium">Settings</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/profile") ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Profile"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isActive("/profile") ? "bg-primary text-white" : "bg-transparent text-sidebar-foreground"
            }`}
          >
            <User size={18} />
          </div>
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
        title="Logout"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-transparent text-sidebar-foreground">
          <LogOut size={18} />
        </div>
        <span className="text-sm font-medium">Logout</span>
      </button>
    </aside>
  )
}
