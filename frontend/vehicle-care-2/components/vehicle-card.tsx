"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Wrench, TrendingUp, DollarSign, Clock, MapPin, AlertCircle, Droplet, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { getCustomerVehicle, subscribeToVehicle, type VehicleData } from "@/lib/api/dashboard-data"
import { getCustomerServiceHistory, type Booking } from "@/lib/api/dashboard-data"
import { useAnomalyCases, useDiagnosisCases } from "@/hooks/use-agent-data"

// Mock vehicle data for initial display
const MOCK_VEHICLE: VehicleData = {
  id: "mock-vehicle",
  vehicle_id: "MH-07-AB-1234",
  make: "Mahindra",
  model: "XUV700",
  year: 2023,
  registration_number: "MH-07-AB-1234",
  health_score: 87,
  status: "Excellent",
  mileage: 23450,
  last_service_date: "2024-08-27"
}

const MOCK_BOOKINGS: Booking[] = [{
  id: "mock-booking-1",
  booking_id: "BK-001",
  vehicle_id: "MH-07-AB-1234",
  scheduled_date: "2024-08-27",
  service_type: "Oil change & filter replacement",
  status: "completed"
}]

export default function VehicleCard() {
  const { user } = useAuth()
  const vehicleId = user?.vehicleId || "MH-07-AB-1234"
  const [vehicle, setVehicle] = useState<VehicleData | null>(MOCK_VEHICLE)
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const [loading, setLoading] = useState(false)
  
  // Get real-time anomaly and diagnosis cases to calculate health score
  const { data: anomalyCases } = useAnomalyCases(vehicleId, true)
  const { data: diagnosisCases } = useDiagnosisCases(undefined, vehicleId, true)

  useEffect(() => {
    // Fetch initial data
    const loadData = async () => {
      try {
        setLoading(true)
        const [vehicleData, serviceHistory] = await Promise.all([
          getCustomerVehicle(vehicleId),
          getCustomerServiceHistory(vehicleId, 1)
        ])
        
        setVehicle(vehicleData)
        setBookings(serviceHistory)
      } catch (error) {
        console.error('Error loading vehicle data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToVehicle(vehicleId, (vehicleData) => {
      setVehicle(vehicleData)
    })

    return () => unsubscribe()
  }, [vehicleId])
  
  // Calculate health score based on anomalies and diagnosis cases
  const calculateHealthScore = (baseScore: number | undefined): number => {
    if (!baseScore) baseScore = 100
    
    // Get active critical/high severity cases
    const activeCriticalCases = diagnosisCases?.filter(
      c => c.status === 'active' && (c.severity === 'critical' || c.severity === 'high')
    ).length || 0
    
    const activeAnomalies = anomalyCases?.filter(
      a => a.status === 'open' || a.status === 'pending_diagnosis'
    ).length || 0
    
    // Reduce health score based on issues
    let healthScore = baseScore
    healthScore -= activeCriticalCases * 15 // -15 per critical/high case
    healthScore -= activeAnomalies * 5 // -5 per active anomaly
    healthScore = Math.max(0, Math.min(100, healthScore)) // Clamp between 0-100
    
    return Math.round(healthScore)
  }

  // Calculate health score once
  const computedHealthScore = vehicle ? calculateHealthScore(vehicle.health_score) : 87
  
  // Fallback data if vehicle not loaded
  const vehicleDisplay = vehicle ? {
    id: vehicle.id,
    name: vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : vehicle.vehicle_id,
    variant: vehicle.model || "Standard",
    year: vehicle.year || new Date().getFullYear(),
    license: vehicle.registration_number || vehicle.vehicle_id,
    image: "/mahindra-xev9e.png",
    status: vehicle.status || (computedHealthScore >= 80 ? "Excellent" : computedHealthScore >= 60 ? "Good" : "Fair"),
    healthScore: computedHealthScore,
    mileage: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "23,450 km",
    lastService: bookings[0] ? {
      date: bookings[0].scheduled_date ? new Date(bookings[0].scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A",
      type: bookings[0].service_type || "Regular maintenance",
    } : {
      date: "27 Aug 2024",
      type: "Oil change & filter replacement",
    },
    nextService: {
      date: "27 Feb 2025",
      type: "Regular maintenance check",
    },
    totalServices: bookings.length,
    annualCost: "₹3,567",
    monthlyCost: "₹270",
    upcoming: {
      title: "Oil Change",
      description: "Replacing the old engine oil and filter helps to keep the engine running smoothly and extend its lifespan. This routine maintenance ensures optimal engine performance, reduces wear and tear, and maintains your vehicle's warranty coverage.",
      daysRemaining: 5,
      dueDate: "Sep 15, 2024",
      recommendedDate: "Sep 10, 2024",
      estimatedCost: "₹800",
      provider: "AutoCare Center",
      progress: 85,
      priority: "High",
      duration: "30 mins",
    },
  } : {
    id: "mahindra-xev9e",
    name: "Mahindra XEV 9e",
    variant: "Elite Plus",
    year: 2024,
    license: "MH-07-AB-1234",
    image: "/mahindra-xev9e.png",
    status: "Excellent",
    healthScore: 87,
    mileage: "23,450 km",
    lastService: {
      date: "27 Aug 2024",
      type: "Oil change & filter replacement",
    },
    nextService: {
      date: "27 Feb 2025",
      type: "Regular maintenance check",
    },
    totalServices: 16,
    annualCost: "₹3,567",
    monthlyCost: "₹270",
    upcoming: {
      title: "Oil Change",
      description: "Replacing the old engine oil and filter helps to keep the engine running smoothly and extend its lifespan. This routine maintenance ensures optimal engine performance, reduces wear and tear, and maintains your vehicle's warranty coverage.",
      daysRemaining: 5,
      dueDate: "Sep 15, 2024",
      recommendedDate: "Sep 10, 2024",
      estimatedCost: "₹800",
      provider: "AutoCare Center",
      progress: 85,
      priority: "High",
      duration: "30 mins",
    },
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20 overflow-hidden">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="ml-3 text-slate-300">Loading vehicle data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20 overflow-hidden">
      {/* Header Section */}
      <CardHeader className="bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30">
      <div className="flex items-center justify-between">
        <div>
            <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
              <Wrench className="text-cyan-400" size={24} />
              {vehicleDisplay.name} - Maintenance Overview
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              {vehicleDisplay.year} • {vehicleDisplay.variant} • License: {vehicleDisplay.license} • {vehicleDisplay.mileage}
          </p>
        </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 px-4 py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Status: {vehicleDisplay.status}</span>
              </div>
            </Badge>
        <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Health Score</div>
              <div className="text-2xl font-bold text-cyan-400">{vehicleDisplay.healthScore}/100</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Vehicle Image */}
        <div className="lg:col-span-1">
            <div className="relative bg-gradient-to-br from-slate-900/40 to-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30 overflow-hidden group hover:border-cyan-500/40 transition-all h-full shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center min-h-[280px]">
            <img
              src={vehicleDisplay.image || "/placeholder.svg"}
              alt={vehicleDisplay.name}
                  className="w-full h-auto object-contain rounded-lg shadow-2xl shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-300 font-medium">All Systems Operational</span>
        </div>
            </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Service Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 transition-all shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <Calendar className="text-cyan-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Last Service</p>
                      <p className="text-lg font-bold text-slate-100 mb-1">{vehicleDisplay.lastService.date}</p>
                      <p className="text-xs text-slate-400">{vehicleDisplay.lastService.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 transition-all shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Clock className="text-yellow-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Services</p>
                      <p className="text-lg font-bold text-slate-100 mb-1">{vehicleDisplay.totalServices}</p>
                      <p className="text-xs text-slate-400">All preventive services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Grid */}
            <Card className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 shadow-md">
              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30 shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Wrench className="text-cyan-400" size={18} />
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Total Services</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{vehicleDisplay.totalServices}</p>
                    <div className="mt-2">
                      <Progress value={75} className="h-1.5" />
                    </div>
                  </div>

                  <div className="text-center p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30 shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="text-green-400" size={18} />
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Annual Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{vehicleDisplay.annualCost}</p>
                    <div className="mt-2">
                      <Progress value={60} className="h-1.5" />
                    </div>
                  </div>

                  <div className="text-center p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30 shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="text-yellow-400" size={18} />
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Monthly Avg</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{vehicleDisplay.monthlyCost}</p>
                    <div className="mt-2">
                      <Progress value={45} className="h-1.5" />
                    </div>
            </div>
            </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Maintenance Card - Extended Full Width Below Image */}
            <Card className="bg-gradient-to-br from-cyan-500/15 via-slate-900/30 to-slate-800/40 backdrop-blur-xl border-cyan-500/40 shadow-2xl shadow-cyan-500/20 overflow-hidden">
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <AlertCircle className="text-cyan-400" size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-4">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                            Upcoming Maintenance
                          </Badge>
                        </div>
                        
                        {/* Professional Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Scheduled Service Reminder */}
                          <div className="bg-slate-800/40 rounded-lg p-4 border-l-4 border-blue-500/60">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <Clock className="text-blue-400" size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Scheduled Service Reminder</p>
                                <p className="text-xs text-slate-500 mt-0.5">Automated notification system</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1">Status</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-slate-200">Active Reminder</span>
                              </div>
                            </div>
                          </div>

                          {/* Recommended Maintenance Date */}
                          <div className="bg-slate-800/40 rounded-lg p-4 border-l-4 border-green-500/60">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                                <Calendar className="text-green-400" size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recommended Maintenance Date</p>
                                <p className="text-xs text-slate-500 mt-0.5">AI-optimized scheduling</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-400 mb-1">Date</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-400">{vehicleDisplay.upcoming.recommendedDate}</span>
                                <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs font-medium px-2 py-0.5">
                                  Recommended
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex-shrink-0">
                        <Droplet className="text-amber-400" size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                          {vehicleDisplay.upcoming.title}
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs font-semibold">
                            {vehicleDisplay.upcoming.priority} Priority
                          </Badge>
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {vehicleDisplay.upcoming.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section with Enhanced Visual */}
                <div className="mb-6 p-4 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-700/30 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-cyan-400" size={16} />
                      <span className="text-sm text-slate-400 uppercase tracking-wide font-medium">Time Remaining</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-cyan-400">{vehicleDisplay.upcoming.daysRemaining}</span>
                      <span className="text-sm text-slate-400 font-medium">days</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 transition-all duration-500 shadow-lg shadow-cyan-500/30"
                      style={{ width: `${vehicleDisplay.upcoming.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Due: {vehicleDisplay.upcoming.dueDate}</span>
                    <span>{vehicleDisplay.upcoming.progress}% complete</span>
                  </div>
                </div>

                {/* Enhanced Service Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all group shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-500/20 rounded-lg">
                        <DollarSign className="text-green-400" size={16} />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Estimated Cost</p>
                    </div>
                    <p className="text-xl font-bold text-slate-100 group-hover:text-green-400 transition-colors">{vehicleDisplay.upcoming.estimatedCost}</p>
                    <p className="text-xs text-slate-500 mt-1">Inclusive of taxes</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <MapPin className="text-blue-400" size={16} />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Service Provider</p>
                    </div>
                    <p className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{vehicleDisplay.upcoming.provider}</p>
                    <p className="text-xs text-slate-500 mt-1">Authorized center</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 backdrop-blur-sm p-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                        <Calendar className="text-yellow-400" size={16} />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Due Date</p>
                    </div>
                    <p className="text-base font-bold text-slate-100 group-hover:text-yellow-400 transition-colors">{vehicleDisplay.upcoming.dueDate}</p>
                    <p className="text-xs text-slate-500 mt-1">Schedule before</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <Clock className="text-purple-400" size={16} />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Duration</p>
                    </div>
                    <p className="text-base font-bold text-slate-100 group-hover:text-purple-400 transition-colors">{vehicleDisplay.upcoming.duration}</p>
                    <p className="text-xs text-slate-500 mt-1">Estimated time</p>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-6 p-4 bg-slate-900/40 rounded-xl border-l-4 border-cyan-500/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <TrendingUp className="text-cyan-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 mb-1">Service Benefits</p>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                          Extends engine lifespan by 2+ years
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                          Improves fuel efficiency by 5-8%
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                          Prevents costly emergency repairs
                        </li>
                      </ul>
        </div>
      </div>
    </div>

                {/* Action Buttons - Enhanced */}
                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-bold shadow-lg shadow-cyan-500/30 py-6 text-base">
                    Schedule Service Now
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/50 px-6 py-6 font-semibold">
                    View Full Details
                  </Button>
                </div>
              </CardContent>
            </Card>
      </CardContent>
    </Card>
  )
}
