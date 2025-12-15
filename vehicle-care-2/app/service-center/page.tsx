"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BarChart3, CheckSquare, Truck, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import PerformanceMetrics from "@/components/service-center/performance-metrics"
import MaintenanceOverview from "@/components/service-center/maintenance-overview"
import CostDetails from "@/components/service-center/cost-details"
import DeliveryOverview from "@/components/service-center/delivery-overview"
import DailyServiceLoad from "@/components/service-center/daily-service-load"
import BookedAppointments from "@/components/service-center/booked-appointments"
import PriorityVehicleQueue from "@/components/service-center/priority-vehicle-queue"
import TechnicianAssignment from "@/components/service-center/technician-assignment"
import SparePartsRequirements from "@/components/service-center/spare-parts-requirements"
import FleetAnomalyList from "@/components/service-center/fleet-anomaly-list"

function DashboardContent() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    // Redirect if not service center persona
    if (user?.persona !== "service") {
      if (user?.persona === "customer") {
        router.push("/")
      } else if (user?.persona === "manufacturer") {
        router.push("/manufacturer")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.persona !== "service") {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-sm text-gray-600">Overview of your service center operations and performance</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              <button className="px-4 py-2.5 text-sm font-semibold text-gray-900 border-b-2 border-blue-600 flex items-center gap-2">
                <BarChart3 size={16} />
                Dashboard
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <CheckSquare size={16} />
                Order
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Truck size={16} />
                Delivery
              </button>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PerformanceMetrics 
                title="Service Center Performance"
                value="$156,098"
                change="2.9%"
                trend="up"
                type="revenue"
              />
              <PerformanceMetrics 
                title="Technician Performance"
                value="$156,098"
                change="2.9%"
                trend="down"
                type="technician"
              />
            </div>

            {/* Daily Operations - Compact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DailyServiceLoad />
              <BookedAppointments />
            </div>

            {/* Priority Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PriorityVehicleQueue />
              <TechnicianAssignment />
            </div>

            {/* Inventory & Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SparePartsRequirements />
              <FleetAnomalyList />
            </div>

            {/* Maintenance & Analytics */}
            <div className="space-y-6">
              <MaintenanceOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CostDetails />
                <DeliveryOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ServiceCenterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50">
        <ServiceCenterSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ServiceCenterHeader />
          <main className="flex-1 overflow-auto p-6">
            <div className="animate-pulse">Loading...</div>
          </main>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

