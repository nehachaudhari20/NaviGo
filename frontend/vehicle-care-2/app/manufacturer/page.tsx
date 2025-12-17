"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    // Redirect if not manufacturer persona
    if (user?.persona !== "manufacturer") {
      if (user?.persona === "customer") {
        router.push("/")
      } else if (user?.persona === "service") {
        router.push("/service-center")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.persona !== "manufacturer") {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
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
