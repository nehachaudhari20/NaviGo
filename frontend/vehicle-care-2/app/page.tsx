"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import VehicleCard from "@/components/vehicle-card"
import ServiceHistory from "@/components/service-history"
import HealthIndicators from "@/components/health-indicators"
import NearbyProviders from "@/components/nearby-providers"
import AIPredictionsTransparent from "@/components/ai-predictions-transparent"
import CustomerValue from "@/components/customer-value"
import HealthSummary from "@/components/health-summary"
import TelemetryUpload from "@/components/telemetry-upload"

export default function DashboardPage() {
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
      
      // Redirect based on persona if not customer
      if (typeof window !== "undefined") {
        if (user?.persona === "service" && window.location.pathname !== "/service-center") {
          setRedirecting(true)
          window.location.href = "/service-center"
          return
        }
        if (user?.persona === "manufacturer" && window.location.pathname !== "/manufacturer") {
          setRedirecting(true)
          window.location.href = "/manufacturer"
          return
        }
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (redirecting || !isAuthenticated || user?.persona !== "customer") {
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
    <div className="flex h-screen bg-black text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            {/* Vehicle Overview & Maintenance Card */}
            <VehicleCard />

            {/* Telemetry Upload */}
            <TelemetryUpload />

            {/* AI Predictions with Transparency (Combined) */}
            <AIPredictionsTransparent />

            {/* Value Dashboard */}
            <CustomerValue />

            {/* Component Health Summary (Compact) */}
            <HealthSummary />

            {/* Intervention History - Extended Full Width */}
            <ServiceHistory />

            {/* Nearby Service Providers */}
            <NearbyProviders />
          </div>
        </main>
      </div>
    </div>
  )
}
