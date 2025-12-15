"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MaintenanceOverview from "@/components/service-center/maintenance-overview"
import CostDetails from "@/components/service-center/cost-details"
import DeliveryOverview from "@/components/service-center/delivery-overview"
import { BarChart3, DollarSign, Truck } from "lucide-react"

export default function ServiceAnalyticsSummary() {
  return (
    <div className="space-y-4">
      <MaintenanceOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CostDetails />
        <DeliveryOverview />
      </div>
    </div>
  )
}
