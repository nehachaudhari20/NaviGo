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
  const { isAuthenticated, user, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return

    // Redirect if not authenticated
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }, 500)
      return () => clearTimeout(timer)
    }
    
    // Redirect based on persona if not customer
    if (user?.persona === "service" && window.location.pathname !== "/service-center") {
      const timer = setTimeout(() => {
        window.location.href = "/service-center"
      }, 500)
      return () => clearTimeout(timer)
    }
    if (user?.persona === "manufacturer" && window.location.pathname !== "/manufacturer") {
      const timer = setTimeout(() => {
        window.location.href = "/manufacturer"
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, isInitialized, router])

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isAuthenticated || user?.persona !== "customer") {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting...</p>
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
