"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ManufacturerSidebar from "@/components/manufacturer/sidebar"
import ManufacturerHeader from "@/components/manufacturer/header"
import KPICards from "@/components/manufacturer/kpi-cards"
import CurrentStock from "@/components/manufacturer/current-stock"
import DefectRates from "@/components/manufacturer/defect-rates"
import ProductionLineStatus from "@/components/manufacturer/production-line-status"
import WasteOfCost from "@/components/manufacturer/waste-of-cost"
import PendingOrders from "@/components/manufacturer/pending-orders"
import TopProduct from "@/components/manufacturer/top-product"
import AIInsights from "@/components/manufacturer/ai-insights"
import AIQualityPredictions from "@/components/manufacturer/ai-quality-predictions"
import NotificationsPanel from "@/components/manufacturer/notifications-panel"

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
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white overflow-hidden">
      <ManufacturerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManufacturerHeader />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-black via-[#0a0a0a] to-black">
          <div className="p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto">
            {/* Page Header */}
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white mb-2">Manufacturing Dashboard</h1>
              <p className="text-gray-400 text-sm">Monitor production, inventory, and operations in real-time</p>
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

            {/* Middle Row: Current Stock, Defect Rates, Production Line Status */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-5">
                <CurrentStock />
              </div>
              <div className="col-span-3">
                <DefectRates />
              </div>
              <div className="col-span-4">
                <ProductionLineStatus />
              </div>
            </div>

            {/* Bottom Row: Waste of Cost, Pending Orders, Top Product */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-5">
                <WasteOfCost />
              </div>
              <div className="col-span-5">
                <PendingOrders />
              </div>
              <div className="col-span-2">
                <TopProduct />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
