"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Simulated AI-optimized appointment slots
const availableSlots = [
  { time: "09:00 AM", technician: "Priya S.", availability: "high", aiScore: 95, reason: "Optimal workload" },
  { time: "10:30 AM", technician: "Dev M.", availability: "medium", aiScore: 82, reason: "Good match" },
  { time: "11:00 AM", technician: "Kumar R.", availability: "high", aiScore: 88, reason: "Specialization match" },
  { time: "02:00 PM", technician: "Priya S.", availability: "high", aiScore: 92, reason: "Peak efficiency" },
  { time: "03:30 PM", technician: "Dev M.", availability: "high", aiScore: 90, reason: "Optimal timing" },
]

const pendingAppointments = [
  {
    id: "APT-AI-001",
    customer: "Rajesh Kumar",
    vehicle: "Tata Nexon",
    service: "Full Service",
    preferredDate: "2024-07-15",
    preferredTime: "Morning",
    status: "pending",
    aiRecommendation: "Best match: 09:00 AM with Priya S.",
    phone: "+91 98765 43210",
  },
  {
    id: "APT-AI-002",
    customer: "Anita Sharma",
    vehicle: "Hyundai i10",
    service: "Brake Service",
    preferredDate: "2024-07-16",
    preferredTime: "Afternoon",
    status: "pending",
    aiRecommendation: "Best match: 02:00 PM with Dev M.",
    phone: "+91 98765 43211",
  },
]

export default function AIAppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedService, setSelectedService] = useState("")

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles size={18} className="text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              AI Appointment Scheduler
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Smart scheduling with availability coordination</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
          AI Optimized
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Quick Schedule Form */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-blue-600" />
            Schedule New Appointment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="date"
              placeholder="Select date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm"
            />
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Service</SelectItem>
                <SelectItem value="oil">Oil Change</SelectItem>
                <SelectItem value="brake">Brake Service</SelectItem>
                <SelectItem value="ac">AC Service</SelectItem>
                <SelectItem value="battery">Battery Replacement</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
              <Sparkles size={14} className="mr-2" />
              Find Best Slot
            </Button>
          </div>
        </div>

        {/* AI-Recommended Slots */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600" />
            AI-Recommended Time Slots
          </h4>
          <div className="space-y-2">
            {availableSlots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{slot.time}</span>
                      <Badge 
                        className={`text-xs h-5 ${
                          slot.availability === "high" 
                            ? "bg-green-100 text-green-700 border-green-300" 
                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        }`}
                      >
                        {slot.availability}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {slot.technician}
                      </span>
                      <span className="text-gray-500">{slot.reason}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Sparkles size={12} className="text-purple-600" />
                      <span className="text-xs font-semibold text-gray-900">{slot.aiScore}%</span>
                    </div>
                    <p className="text-xs text-gray-500">AI Score</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Appointments Needing Coordination */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-600" />
            Pending Appointments (AI Recommendations)
          </h4>
          <div className="space-y-3">
            {pendingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-gray-900">{apt.customer}</h5>
                      <Badge variant="outline" className="text-xs h-5 bg-yellow-50 text-yellow-700 border-yellow-300">
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{apt.vehicle} • {apt.service}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {apt.preferredDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {apt.preferredTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 mb-1">AI Recommendation:</p>
                      <p className="text-sm text-gray-700">{apt.aiRecommendation}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-8 flex-1">
                    <CheckCircle2 size={12} className="mr-1" />
                    Accept & Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 flex-1">
                    <XCircle size={12} className="mr-1" />
                    Suggest Alternative
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8">
                    <Phone size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

