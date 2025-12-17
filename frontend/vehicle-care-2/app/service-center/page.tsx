"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BarChart3, Wrench, FileText } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import PerformanceSummary from "@/components/service-center/performance-summary"
import BusinessIntelligence from "@/components/service-center/business-intelligence"
import OperationsOverview from "@/components/service-center/operations-overview"
import PriorityManagement from "@/components/service-center/priority-management"
import InventoryMonitoring from "@/components/service-center/inventory-monitoring"
import TelemetryMonitoring from "@/components/service-center/telemetry-monitoring"
import FeedbackValidation from "@/components/service-center/feedback-validation"
import ServiceAnalyticsSummary from "@/components/service-center/analytics-summary"
import DeliveryOverview from "@/components/service-center/delivery-overview"
import CostDetails from "@/components/service-center/cost-details"

function DashboardContent() {
  const { isAuthenticated, user, isInitialized } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return

    // Redirect if not authenticated
    if (!isAuthenticated) {
      window.location.href = "/login"
      return
    }
    
    // Redirect if not service center persona
    if (user?.persona !== "service") {
      if (user?.persona === "customer") {
        window.location.href = "/"
      } else if (user?.persona === "manufacturer") {
        window.location.href = "/manufacturer"
      } else {
        window.location.href = "/login"
      }
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
  if (!isAuthenticated || user?.persona !== "service") {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Center</h1>
              <p className="text-sm text-gray-600">Overview of your service center operations and performance</p>
            </div>

            {/* Functional Tabs */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 bg-gray-100 p-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 size={16} />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="services" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Wrench size={16} />
                  Services
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <FileText size={16} />
                  Reports
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab Content */}
              <TabsContent value="dashboard" className="space-y-6 mt-0">
                {/* Performance Summary */}
                <PerformanceSummary />

                {/* Business Intelligence (ROI, Compliance, Human-AI) - Tabbed */}
                <BusinessIntelligence />

                {/* Priority Management (Queue, Technicians, Human Review) */}
                <PriorityManagement />

                {/* Telemetry Monitoring */}
                <TelemetryMonitoring showChart={true} />

                {/* Inventory & Fleet Monitoring */}
                <InventoryMonitoring />
              </TabsContent>

              {/* Services Tab Content - Active Services & Appointments */}
              <TabsContent value="services" className="space-y-6 mt-0">
                {/* Daily Operations Overview (Service Load + Appointments) */}
                <OperationsOverview />

                {/* Priority Vehicle Queue & Technician Assignment */}
                <PriorityManagement />

                {/* Telemetry Monitoring for Active Services */}
                <TelemetryMonitoring showChart={true} />
              </TabsContent>

              {/* Reports Tab Content - Completed Services, Analytics & Feedback */}
              <TabsContent value="reports" className="space-y-6 mt-0">
                {/* Service Analytics Summary */}
                <ServiceAnalyticsSummary />

                {/* Delivery Overview */}
                <DeliveryOverview />

                {/* Cost Details */}
                <CostDetails />

                {/* Feedback & Validation */}
                <FeedbackValidation />
              </TabsContent>
            </Tabs>
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

