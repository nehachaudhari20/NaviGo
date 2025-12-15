"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PriorityVehicleQueue from "@/components/service-center/priority-vehicle-queue"
import TechnicianAssignment from "@/components/service-center/technician-assignment"
import HumanReviewQueue from "@/components/service-center/human-review-queue"
import { AlertTriangle, Users, CheckCircle2 } from "lucide-react"

export default function PriorityManagement() {
  return (
    <div className="space-y-4">
      {/* Priority Queue & Technician Assignment - Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityVehicleQueue />
        <TechnicianAssignment />
      </div>
      
      {/* Human Review Queue - Compact */}
      <HumanReviewQueue />
    </div>
  )
}
