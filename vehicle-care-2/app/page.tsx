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

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="flex h-screen bg-black text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            {/* Vehicle Overview & Maintenance Card (Merged) */}
            <VehicleCard />

            {/* Health Indicators */}
            <HealthIndicators />

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
