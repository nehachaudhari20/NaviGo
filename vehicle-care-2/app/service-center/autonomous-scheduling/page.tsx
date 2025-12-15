"use client"

import { useState } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Sparkles,
  Settings,
  ChevronRight
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AIScheduledAppointment {
  id: string
  vehicle: string
  customer: string
  service: string
  aiRecommendedSlot: string
  aiScore: number
  status: "pending" | "approved" | "rejected" | "conflict"
  technician: string
  capacityUtilization: number
  reason: string
}

interface CapacityData {
  time: string
  scheduled: number
  available: number
  aiRecommended: number
}

const aiAppointments: AIScheduledAppointment[] = [
  {
    id: "APT-AI-001",
    vehicle: "Tata Nexon",
    customer: "Rajesh Kumar",
    service: "Brake Pad Replacement",
    aiRecommendedSlot: "Tomorrow 2:00 PM",
    aiScore: 95,
    status: "pending",
    technician: "Priya S.",
    capacityUtilization: 75,
    reason: "Optimal technician match + customer preference",
  },
  {
    id: "APT-AI-002",
    vehicle: "Hyundai i20",
    customer: "Anita Sharma",
    service: "Engine Service",
    aiRecommendedSlot: "Today 4:00 PM",
    aiScore: 88,
    status: "approved",
    technician: "Dev M.",
    capacityUtilization: 82,
    reason: "Urgent service + available capacity",
  },
  {
    id: "APT-AI-003",
    vehicle: "Mahindra XUV",
    customer: "Vikram Singh",
    service: "Battery Replacement",
    aiRecommendedSlot: "Day After 10:00 AM",
    aiScore: 92,
    status: "pending",
    technician: "Kumar R.",
    capacityUtilization: 68,
    reason: "Best time slot + low demand period",
  },
  {
    id: "APT-AI-004",
    vehicle: "Honda City",
    customer: "Arjun Reddy",
    service: "Full Service",
    aiRecommendedSlot: "Tomorrow 11:00 AM",
    aiScore: 85,
    status: "conflict",
    technician: "Priya S.",
    capacityUtilization: 95,
    reason: "Capacity conflict - needs adjustment",
  },
]

const capacityData: CapacityData[] = [
  { time: "8AM", scheduled: 2, available: 4, aiRecommended: 3 },
  { time: "9AM", scheduled: 3, available: 3, aiRecommended: 4 },
  { time: "10AM", scheduled: 4, available: 2, aiRecommended: 5 },
  { time: "11AM", scheduled: 5, available: 1, aiRecommended: 5 },
  { time: "12PM", scheduled: 3, available: 3, aiRecommended: 4 },
  { time: "1PM", scheduled: 2, available: 4, aiRecommended: 3 },
  { time: "2PM", scheduled: 4, available: 2, aiRecommended: 5 },
  { time: "3PM", scheduled: 3, available: 3, aiRecommended: 4 },
  { time: "4PM", scheduled: 2, available: 4, aiRecommended: 3 },
  { time: "5PM", scheduled: 1, available: 5, aiRecommended: 2 },
]

function AutonomousSchedulingContent() {
  const [appointments, setAppointments] = useState<AIScheduledAppointment[]>(aiAppointments)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const handleApprove = (id: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: "approved" as const } : apt
    ))
  }

  const handleReject = (id: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: "rejected" as const } : apt
    ))
  }

  const handleResolveConflict = (id: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: "approved" as const, capacityUtilization: 85 } : apt
    ))
  }

  const pendingCount = appointments.filter(a => a.status === "pending").length
  const conflictCount = appointments.filter(a => a.status === "conflict").length
  const approvedCount = appointments.filter(a => a.status === "approved").length
  const avgAIScore = appointments.reduce((sum, a) => sum + a.aiScore, 0) / appointments.length

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Autonomous Scheduling Hub</h1>
                  <p className="text-sm text-gray-600">AI-powered appointment scheduling with capacity optimization</p>
                </div>
                <Button>
                  <Settings size={16} className="mr-2" />
                  AI Settings
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{appointments.length}</div>
                  <div className="text-xs text-gray-600">Total Scheduled</div>
                  <div className="mt-2 text-xs text-blue-600 font-medium">Avg Score: {avgAIScore.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock size={18} className="text-yellow-600" />
                    Pending Approval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{pendingCount}</div>
                  <div className="text-xs text-gray-600">Awaiting Review</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-600" />
                    Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{conflictCount}</div>
                  <div className="text-xs text-gray-600">Need Resolution</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-1">{approvedCount}</div>
                  <div className="text-xs text-gray-600">Confirmed Today</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI-Scheduled Appointments */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">AI-Scheduled Appointments</CardTitle>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                      {pendingCount} Pending
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-4 border rounded-lg ${
                            apt.status === "conflict"
                              ? "border-orange-200 bg-orange-50/30"
                              : apt.status === "approved"
                              ? "border-green-200 bg-green-50/30"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">{apt.vehicle}</h4>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs flex items-center gap-1">
                                  <Sparkles size={10} />
                                  {apt.aiScore}%
                                </Badge>
                                {apt.status === "pending" && (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                    Pending
                                  </Badge>
                                )}
                                {apt.status === "approved" && (
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                    Approved
                                  </Badge>
                                )}
                                {apt.status === "conflict" && (
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                    Conflict
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{apt.customer} • {apt.service}</p>
                              <div className="flex items-center gap-4 text-xs mb-2">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Calendar size={12} />
                                  {apt.aiRecommendedSlot}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Users size={12} />
                                  {apt.technician}
                                </span>
                              </div>
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600">Capacity Utilization</span>
                                  <span className="text-xs font-semibold text-gray-900">{apt.capacityUtilization}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      apt.capacityUtilization > 90
                                        ? "bg-red-600"
                                        : apt.capacityUtilization > 75
                                        ? "bg-yellow-600"
                                        : "bg-green-600"
                                    }`}
                                    style={{ width: `${apt.capacityUtilization}%` }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 italic">"{apt.reason}"</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                            {apt.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(apt.id)}
                                >
                                  <CheckCircle2 size={14} className="mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleReject(apt.id)}
                                >
                                  <XCircle size={14} className="mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {apt.status === "conflict" && (
                              <>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleResolveConflict(apt.id)}
                                >
                                  <Settings size={14} className="mr-2" />
                                  Resolve Conflict
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  Suggest Alternative
                                </Button>
                              </>
                            )}
                            {apt.status === "approved" && (
                              <Button size="sm" variant="outline" className="w-full" disabled>
                                <CheckCircle2 size={14} className="mr-2" />
                                Approved
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capacity vs Demand */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Capacity vs Demand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={capacityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="scheduled" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="available" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="aiRecommended" fill="#a855f7" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-gray-600">Scheduled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-gray-600">AI Recommended</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp size={18} className="text-purple-600" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-gray-900 mb-1">Capacity Optimization</p>
                        <p className="text-xs text-gray-600">
                          Shift 2 appointments from 11AM to 9AM to reduce peak load by 15%
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-gray-900 mb-1">Demand Forecast</p>
                        <p className="text-xs text-gray-600">
                          Expected high demand tomorrow 2-4 PM - prepare additional capacity
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-gray-900 mb-1">Technician Matching</p>
                        <p className="text-xs text-gray-600">
                          Reassign 3 services to optimize specialist utilization
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AutonomousSchedulingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <AutonomousSchedulingContent />
    </Suspense>
  )
}

