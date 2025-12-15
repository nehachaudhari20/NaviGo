"use client"

import { useState } from "react"
import { Clock, User, Phone, MapPin, AlertCircle, CheckCircle2, Pause, Play, MoreVertical, Calendar, Timer, TrendingUp, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Service {
  id: string
  serviceId: string
  vehicle: string
  regNumber: string
  customer: string
  phone: string
  serviceType: string
  status: "in-progress" | "scheduled" | "pending-pickup" | "on-hold" | "completed"
  priority: "critical" | "high" | "medium" | "low"
  technician: {
    id: string
    name: string
    avatar?: string
  }
  progress: number
  estimatedTime: string
  startTime: string
  location: string
  notes?: string
}

const mockServices: Service[] = [
  {
    id: "1",
    serviceId: "SRV-2024-001",
    vehicle: "Tata Nexon",
    regNumber: "MH-12-AB-1234",
    customer: "Rajesh Kumar",
    phone: "+91 98765 43210",
    serviceType: "Full Service + Brake Repair",
    status: "in-progress",
    priority: "high",
    technician: {
      id: "tech-1",
      name: "Priya Sharma",
      avatar: "/placeholder-user.jpg"
    },
    progress: 65,
    estimatedTime: "2 hours",
    startTime: "09:00 AM",
    location: "Bay 3",
    notes: "Customer requested urgent completion"
  },
  {
    id: "2",
    serviceId: "SRV-2024-002",
    vehicle: "Hyundai i10",
    regNumber: "MH-12-CD-5678",
    customer: "Anita Sharma",
    phone: "+91 98765 43211",
    serviceType: "Oil Change + AC Service",
    status: "in-progress",
    priority: "medium",
    technician: {
      id: "tech-2",
      name: "Dev Mehta",
      avatar: "/placeholder-user.jpg"
    },
    progress: 40,
    estimatedTime: "1.5 hours",
    startTime: "10:30 AM",
    location: "Bay 2"
  },
  {
    id: "3",
    serviceId: "SRV-2024-003",
    vehicle: "Mahindra XUV",
    regNumber: "MH-12-EF-9012",
    customer: "Vikram Singh",
    phone: "+91 98765 43212",
    serviceType: "Battery Replacement",
    status: "scheduled",
    priority: "critical",
    technician: {
      id: "tech-3",
      name: "Kumar Reddy",
      avatar: "/placeholder-user.jpg"
    },
    progress: 0,
    estimatedTime: "1 hour",
    startTime: "11:00 AM",
    location: "Bay 1"
  },
  {
    id: "4",
    serviceId: "SRV-2024-004",
    vehicle: "Maruti Swift",
    regNumber: "MH-12-GH-3456",
    customer: "Meera Patel",
    phone: "+91 98765 43213",
    serviceType: "AC Service + Filter Replacement",
    status: "pending-pickup",
    priority: "low",
    technician: {
      id: "tech-1",
      name: "Priya Sharma",
      avatar: "/placeholder-user.jpg"
    },
    progress: 100,
    estimatedTime: "1.5 hours",
    startTime: "08:00 AM",
    location: "Bay 4"
  },
  {
    id: "5",
    serviceId: "SRV-2024-005",
    vehicle: "Honda City",
    regNumber: "MH-12-IJ-7890",
    customer: "Arjun Reddy",
    phone: "+91 98765 43214",
    serviceType: "Transmission Service",
    status: "on-hold",
    priority: "high",
    technician: {
      id: "tech-4",
      name: "Raj Patel",
      avatar: "/placeholder-user.jpg"
    },
    progress: 30,
    estimatedTime: "3 hours",
    startTime: "09:30 AM",
    location: "Bay 5",
    notes: "Waiting for parts delivery"
  },
]

interface ActiveServicesListProps {
  filters: {
    status: string
    technician: string
    priority: string
  }
}

export default function ActiveServicesList({ filters }: ActiveServicesListProps) {
  const [services, setServices] = useState<Service[]>(mockServices)

  const getStatusBadge = (status: Service["status"]) => {
    const statusConfig = {
      "in-progress": { label: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
      "scheduled": { label: "Scheduled", className: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
      "pending-pickup": { label: "Ready for Pickup", className: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
      "on-hold": { label: "On Hold", className: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
      "completed": { label: "Completed", className: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500" },
    }
    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={`text-xs font-medium ${config.className} flex items-center gap-1.5`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: Service["priority"]) => {
    const priorityConfig = {
      critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" },
      high: { label: "High", className: "bg-orange-50 text-orange-700 border-orange-200" },
      medium: { label: "Medium", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      low: { label: "Low", className: "bg-gray-50 text-gray-700 border-gray-200" },
    }
    const config = priorityConfig[priority]
    return (
      <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  const handleStatusChange = (serviceId: string, newStatus: Service["status"]) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, status: newStatus } : s
    ))
  }

  const filteredServices = services.filter(service => {
    if (filters.status !== "all" && service.status !== filters.status) return false
    if (filters.technician !== "all" && service.technician.id !== filters.technician) return false
    if (filters.priority !== "all" && service.priority !== filters.priority) return false
    return true
  })

  const statusCounts = {
    "in-progress": services.filter(s => s.status === "in-progress").length,
    "scheduled": services.filter(s => s.status === "scheduled").length,
    "pending-pickup": services.filter(s => s.status === "pending-pickup").length,
    "on-hold": services.filter(s => s.status === "on-hold").length,
  }

  return (
    <div className="space-y-6">
      {/* Status Summary - Enhanced */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-700">In Progress</div>
              <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-700" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">{statusCounts["in-progress"]}</div>
            <div className="text-xs text-blue-600">Active services</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-700">Scheduled</div>
              <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center">
                <Calendar size={16} className="text-purple-700" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-900 mb-1">{statusCounts["scheduled"]}</div>
            <div className="text-xs text-purple-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-green-700">Ready for Pickup</div>
              <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-700" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-900 mb-1">{statusCounts["pending-pickup"]}</div>
            <div className="text-xs text-green-600">Awaiting customer</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-yellow-700">On Hold</div>
              <div className="w-8 h-8 rounded-lg bg-yellow-200 flex items-center justify-center">
                <Pause size={16} className="text-yellow-700" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-900 mb-1">{statusCounts["on-hold"]}</div>
            <div className="text-xs text-yellow-600">Paused services</div>
          </CardContent>
        </Card>
      </div>

      {/* Services List - Enhanced */}
      <div className="space-y-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-all duration-200 border-gray-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Left Section - Main Content */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Wrench size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{service.vehicle}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-mono font-medium">{service.serviceId}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono">{service.regNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(service.status)}
                        {getPriorityBadge(service.priority)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
                          <MoreVertical size={18} className="text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                          <User size={14} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Wrench size={14} className="mr-2" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <User size={14} className="mr-2" />
                          Reassign Technician
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {service.status === "in-progress" && (
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleStatusChange(service.id, "on-hold")}
                          >
                            <Pause size={14} className="mr-2" />
                            Pause Service
                          </DropdownMenuItem>
                        )}
                        {service.status === "on-hold" && (
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleStatusChange(service.id, "in-progress")}
                          >
                            <Play size={14} className="mr-2" />
                            Resume Service
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer text-green-600">
                          <CheckCircle2 size={14} className="mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{service.serviceType}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{service.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <User size={14} className="text-gray-400" />
                          <span className="font-medium">{service.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{service.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  {service.status === "in-progress" && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Timer size={16} className="text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">Service Progress</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700">{service.progress}%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${service.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span>Started: {service.startTime}</span>
                        <span>Est. completion: {service.estimatedTime}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes Alert */}
                  {service.notes && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">Important Note</p>
                        <p className="text-sm text-amber-800">{service.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Section - Technician & Actions */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50/50 p-6 space-y-5">
                  {/* Technician Card */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Assigned Technician</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                        <AvatarImage src={service.technician.avatar} alt={service.technician.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {service.technician.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{service.technician.name}</p>
                        <p className="text-xs text-gray-500">Engine Specialist</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Available</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Time Information</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          <span>Start Time</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{service.startTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Timer size={14} className="text-gray-400" />
                          <span>Estimated</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{service.estimatedTime}</span>
                      </div>
                      {service.status === "in-progress" && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Elapsed Time</span>
                            <span className="text-sm font-semibold text-blue-600">1h 20m</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {service.status === "in-progress" && (
                      <Button 
                        variant="outline" 
                        className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        onClick={() => handleStatusChange(service.id, "on-hold")}
                      >
                        <Pause size={16} className="mr-2" />
                        Pause Service
                      </Button>
                    )}
                    {service.status === "on-hold" && (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                        onClick={() => handleStatusChange(service.id, "in-progress")}
                      >
                        <Play size={16} className="mr-2" />
                        Resume Service
                      </Button>
                    )}
                    {service.status === "pending-pickup" && (
                      <Button className="w-full bg-green-600 hover:bg-green-700 shadow-sm">
                        <CheckCircle2 size={16} className="mr-2" />
                        Ready for Pickup
                      </Button>
                    )}
                    <Button variant="outline" className="w-full border-gray-200">
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Wrench size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No services found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters to see more results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

