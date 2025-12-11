"use client"

import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import VehicleCard from "@/components/vehicle-card"
import ServiceHistory from "@/components/service-history"
import UpcomingMaintenance from "@/components/upcoming-maintenance"
import HealthIndicators from "@/components/health-indicators"
import NearbyProviders from "@/components/nearby-providers"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <VehicleCard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ServiceHistory />
              <HealthIndicators />
            </div>

            <UpcomingMaintenance />

            <NearbyProviders />
          </div>
        </main>
      </div>
    </div>
  )
}
