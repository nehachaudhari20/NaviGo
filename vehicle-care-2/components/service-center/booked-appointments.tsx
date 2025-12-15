"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react"

const appointments = [
  {
    id: "APT-001",
    vehicle: "Tata Nexon",
    customer: "Rajesh Kumar",
    time: "09:00 AM",
    service: "Oil Change",
    status: "confirmed",
    phone: "+91 98765 43210",
    technician: "Priya S.",
    aiOptimized: true,
    aiScore: 95,
  },
  {
    id: "APT-002",
    vehicle: "Hyundai i10",
    customer: "Anita Sharma",
    time: "10:30 AM",
    service: "Brake Service",
    status: "confirmed",
    phone: "+91 98765 43211",
    technician: "Dev M.",
    aiOptimized: true,
    aiScore: 88,
  },
  {
    id: "APT-003",
    vehicle: "Mahindra XUV",
    customer: "Vikram Singh",
    time: "11:00 AM",
    service: "Battery Replacement",
    status: "pending",
    phone: "+91 98765 43212",
    technician: "Kumar R.",
    aiOptimized: false,
    aiScore: null,
  },
  {
    id: "APT-004",
    vehicle: "Maruti Swift",
    customer: "Meera Patel",
    time: "02:00 PM",
    service: "AC Service",
    status: "confirmed",
    phone: "+91 98765 43213",
    technician: "Priya S.",
    aiOptimized: true,
    aiScore: 92,
  },
]

export default function BookedAppointments() {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Booked Appointments
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs flex items-center gap-1">
            <Sparkles size={10} />
            AI Scheduled
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          View All
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.slice(0, 4).map((apt) => (
            <div
              key={apt.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                apt.aiOptimized 
                  ? "border-blue-200 bg-gradient-to-r from-blue-50/50 to-white hover:border-blue-300" 
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{apt.vehicle}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs h-5 ${
                      apt.status === "confirmed" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {apt.status}
                  </Badge>
                  {apt.aiOptimized && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs h-5 flex items-center gap-1">
                      <Sparkles size={10} />
                      {apt.aiScore}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {apt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {apt.technician}
                  </span>
                  {apt.aiOptimized && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <CheckCircle2 size={12} />
                      AI Optimized
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{apt.service}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">AI Recommendation:</span> Schedule 2 more appointments in afternoon slots for optimal capacity
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

