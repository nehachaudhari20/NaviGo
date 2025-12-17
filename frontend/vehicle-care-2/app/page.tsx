"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    // Redirect based on persona if not customer
    if (user?.persona === "service") {
      router.push("/service-center")
      return
    }
    if (user?.persona === "manufacturer") {
      router.push("/manufacturer")
      return
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.persona !== "customer") {
    return null
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
