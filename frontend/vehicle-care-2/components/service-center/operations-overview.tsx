"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Wrench, AlertTriangle, TrendingUp } from "lucide-react"
import DailyServiceLoad from "@/components/service-center/daily-service-load"
import BookedAppointments from "@/components/service-center/booked-appointments"

export default function OperationsOverview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Daily Operations Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-1">
            <DailyServiceLoad />
          </div>
          <div className="lg:col-span-1">
            <BookedAppointments />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
