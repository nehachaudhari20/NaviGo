"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const isServicingPage = pathname?.includes("/servicing")

  return (
    <header className="glass-card-sm border-b flex flex-col rounded-none">
      {isServicingPage ? (
        <div className="flex flex-col w-full">
          {/* Top Row: Menu, Title, Bell */}
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <Menu size={20} className="text-muted-foreground cursor-pointer hover:text-foreground transition" />
              <span className="text-lg font-semibold text-foreground tracking-wide">SERVICING</span>
            </div>
            <button className="relative">
              <Bell size={20} className="text-foreground hover:text-primary transition" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
          {/* Bottom Row: Vehicle Info */}
          <div className="h-12 border-t border-border/50 flex items-center px-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Mahindra XEV 9e</span>
              <span className="text-border">|</span>
              <span>MH-07-AB-1234</span>
              <span className="text-border">|</span>
              <span>Last service: 45 days ago</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-1">
            <Search size={20} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services, reminders..."
              className="bg-transparent border-0 text-foreground placeholder-muted-foreground focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={20} className="text-foreground hover:text-primary transition" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium text-sm">
              Book Service
            </button>

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Christian Oweazim</p>
                <p className="text-xs text-muted-foreground">Premium member</p>
              </div>
              <Avatar>
                <AvatarImage src="/christian-oweazim-profile.jpg" alt="Christian Oweazim" />
                <AvatarFallback>CO</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
