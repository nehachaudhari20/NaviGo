"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ManufacturerSidebar from "@/components/manufacturer/sidebar"
import ManufacturerHeader from "@/components/manufacturer/header"
import KPICards from "@/components/manufacturer/kpi-cards"
import AIInsights from "@/components/manufacturer/ai-insights"
import AIQualityPredictions from "@/components/manufacturer/ai-quality-predictions"
import NotificationsPanel from "@/components/manufacturer/notifications-panel"
import ComplianceDashboard from "@/components/manufacturer/compliance-dashboard"

export default function ManufacturerPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Small delay to allow auth to initialize from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          setRedirecting(true)
          window.location.href = "/login"
        }
        return
      }
      
      // Redirect if not manufacturer persona
      if (user?.persona !== "manufacturer") {
        if (typeof window !== "undefined") {
          setRedirecting(true)
          if (user?.persona === "customer" && window.location.pathname !== "/") {
            window.location.href = "/"
          } else if (user?.persona === "service" && window.location.pathname !== "/service-center") {
            window.location.href = "/service-center"
          } else if (window.location.pathname !== "/login") {
            window.location.href = "/login"
          }
        }
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (redirecting || !isAuthenticated || user?.persona !== "manufacturer") {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white overflow-hidden">
      <ManufacturerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManufacturerHeader />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-black via-[#0a0a0a] to-black">
          <div className="p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Manufacturing Dashboard</h1>
              <p className="text-gray-400 text-sm">Overview of operations, AI insights, and compliance status</p>
            </div>

            {/* Top Row: KPI Cards */}
            <KPICards />

            {/* AI Features Row */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4">
                <AIInsights />
              </div>
              <div className="col-span-4">
                <AIQualityPredictions />
              </div>
              <div className="col-span-4">
                <NotificationsPanel />
              </div>
            </div>

            {/* Compliance Dashboard */}
            <div className="mb-6">
              <ComplianceDashboard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
