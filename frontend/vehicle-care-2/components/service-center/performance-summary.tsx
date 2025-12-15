"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Target } from "lucide-react"
import PerformanceMetrics from "@/components/service-center/performance-metrics"

export default function PerformanceSummary() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  )
}
