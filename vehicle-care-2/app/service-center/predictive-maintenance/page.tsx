"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ActiveServicesList from "@/components/service-center/active-services-list"
import ServiceFilters from "@/components/service-center/service-filters"
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Wrench,
  Car,
  ChevronRight,
  Search,
  Plus,
  BarChart3,
  Zap,
  Shield,
  Bell,
  Calendar,
  Users
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts"

interface Vehicle {
  id: string
  vehicle: string
  regNumber: string
  owner: string
  healthScore: number
  status: "critical" | "warning" | "normal"
  predictedFailure: string
  confidence: number
  timeToFailure: string
  priority: number
  lastUpdate: string
  faultCodes: {
    code: string
    description: string
    severity: "critical" | "warning" | "info"
    detected: string
  }[]
  telematics: {
    engineTemp: number
    brakeWear: number
    batteryVoltage: number
    mileage: number
  }
  serviceHistory: {
    lastService: string
    nextService: string
    servicesCount: number
  }
}

const mockVehicles: Vehicle[] = [
  {
    id: "VH-001",
    vehicle: "Tata Nexon",
    regNumber: "MH-12-AB-1234",
    owner: "Rajesh Kumar",
    healthScore: 45,
    status: "critical",
    predictedFailure: "Brake Pad Failure",
    confidence: 95,
    timeToFailure: "2-3 days",
    priority: 1,
    lastUpdate: "Just now",
    faultCodes: [
      {
        code: "P0301",
        description: "Cylinder 1 Misfire Detected",
        severity: "critical",
        detected: "2 hours ago",
      },
      {
        code: "C1201",
        description: "Brake Pad Wear Sensor - Front Left",
        severity: "critical",
        detected: "1 hour ago",
      },
      {
        code: "B1318",
        description: "Low Brake Fluid Level",
        severity: "warning",
        detected: "30 minutes ago",
      },
    ],
    telematics: {
      engineTemp: 94,
      brakeWear: 92,
      batteryVoltage: 11.8,
      mileage: 45230,
    },
    serviceHistory: {
      lastService: "3 months ago",
      nextService: "Overdue",
      servicesCount: 12,
    },
  },
  {
    id: "VH-002",
    vehicle: "Hyundai i20",
    regNumber: "MH-12-CD-5678",
    owner: "Anita Sharma",
    healthScore: 62,
    status: "warning",
    predictedFailure: "Engine Overheating Risk",
    confidence: 87,
    timeToFailure: "5-7 days",
    priority: 2,
    lastUpdate: "30s ago",
    faultCodes: [
      {
        code: "P0128",
        description: "Coolant Thermostat Malfunction",
        severity: "warning",
        detected: "1 hour ago",
      },
      {
        code: "P0117",
        description: "Engine Coolant Temperature Sensor Circuit Low",
        severity: "warning",
        detected: "45 minutes ago",
      },
    ],
    telematics: {
      engineTemp: 88,
      brakeWear: 65,
      batteryVoltage: 12.2,
      mileage: 38920,
    },
    serviceHistory: {
      lastService: "2 months ago",
      nextService: "In 15 days",
      servicesCount: 8,
    },
  },
  {
    id: "VH-003",
    vehicle: "Mahindra XUV",
    regNumber: "MH-12-EF-9012",
    owner: "Vikram Singh",
    healthScore: 78,
    status: "warning",
    predictedFailure: "Battery Degradation",
    confidence: 82,
    timeToFailure: "10-12 days",
    priority: 3,
    lastUpdate: "1m ago",
    faultCodes: [
      {
        code: "P0562",
        description: "System Voltage Low",
        severity: "warning",
        detected: "2 hours ago",
      },
      {
        code: "U0140",
        description: "Lost Communication with Body Control Module",
        severity: "warning",
        detected: "1 hour ago",
      },
    ],
    telematics: {
      engineTemp: 82,
      brakeWear: 45,
      batteryVoltage: 11.9,
      mileage: 52340,
    },
    serviceHistory: {
      lastService: "1 month ago",
      nextService: "In 30 days",
      servicesCount: 15,
    },
  },
  {
    id: "VH-004",
    vehicle: "Maruti Swift",
    regNumber: "MH-12-GH-3456",
    owner: "Meera Patel",
    healthScore: 88,
    status: "normal",
    predictedFailure: "Routine Maintenance Due",
    confidence: 75,
    timeToFailure: "20-25 days",
    priority: 4,
    lastUpdate: "2m ago",
    faultCodes: [],
    telematics: {
      engineTemp: 78,
      brakeWear: 35,
      batteryVoltage: 12.5,
      mileage: 31200,
    },
    serviceHistory: {
      lastService: "1 month ago",
      nextService: "In 45 days",
      servicesCount: 6,
    },
  },
  {
    id: "VH-005",
    vehicle: "Honda City",
    regNumber: "MH-12-IJ-7890",
    owner: "Arjun Reddy",
    healthScore: 55,
    status: "critical",
    predictedFailure: "Transmission Issue",
    confidence: 91,
    timeToFailure: "3-4 days",
    priority: 2,
    lastUpdate: "45s ago",
    faultCodes: [
      {
        code: "P0700",
        description: "Transmission Control System Malfunction",
        severity: "critical",
        detected: "3 hours ago",
      },
      {
        code: "P0730",
        description: "Incorrect Gear Ratio",
        severity: "critical",
        detected: "2 hours ago",
      },
      {
        code: "P0741",
        description: "Torque Converter Clutch Circuit Performance",
        severity: "warning",
        detected: "1 hour ago",
      },
    ],
    telematics: {
      engineTemp: 90,
      brakeWear: 78,
      batteryVoltage: 12.0,
      mileage: 67890,
    },
    serviceHistory: {
      lastService: "4 months ago",
      nextService: "Overdue",
      servicesCount: 18,
    },
  },
  {
    id: "VH-006",
    vehicle: "Toyota Innova",
    regNumber: "MH-12-KL-2345",
    owner: "Priya Desai",
    healthScore: 85,
    status: "normal",
    predictedFailure: "AC Compressor Wear",
    confidence: 68,
    timeToFailure: "30-35 days",
    priority: 5,
    lastUpdate: "3m ago",
    faultCodes: [
      {
        code: "B1470",
        description: "AC Compressor Clutch Circuit",
        severity: "info",
        detected: "1 day ago",
      },
    ],
    telematics: {
      engineTemp: 80,
      brakeWear: 40,
      batteryVoltage: 12.4,
      mileage: 45670,
    },
    serviceHistory: {
      lastService: "2 months ago",
      nextService: "In 60 days",
      servicesCount: 10,
    },
  },
  {
    id: "VH-007",
    vehicle: "Ford EcoSport",
    regNumber: "MH-12-MN-6789",
    owner: "Rahul Verma",
    healthScore: 70,
    status: "warning",
    predictedFailure: "Suspension Deterioration",
    confidence: 79,
    timeToFailure: "12-15 days",
    priority: 3,
    lastUpdate: "1m ago",
    faultCodes: [
      {
        code: "C1710",
        description: "Left Front Suspension Position Sensor",
        severity: "warning",
        detected: "4 hours ago",
      },
      {
        code: "C1711",
        description: "Right Front Suspension Position Sensor",
        severity: "warning",
        detected: "3 hours ago",
      },
    ],
    telematics: {
      engineTemp: 85,
      brakeWear: 55,
      batteryVoltage: 12.1,
      mileage: 56780,
    },
    serviceHistory: {
      lastService: "2 months ago",
      nextService: "In 20 days",
      servicesCount: 9,
    },
  },
  {
    id: "VH-008",
    vehicle: "Nissan Micra",
    regNumber: "MH-12-OP-0123",
    owner: "Sneha Joshi",
    healthScore: 92,
    status: "normal",
    predictedFailure: "None - All Systems Normal",
    confidence: 95,
    timeToFailure: "N/A",
    priority: 6,
    lastUpdate: "4m ago",
    faultCodes: [],
    telematics: {
      engineTemp: 75,
      brakeWear: 25,
      batteryVoltage: 12.6,
      mileage: 23450,
    },
    serviceHistory: {
      lastService: "1 month ago",
      nextService: "In 90 days",
      servicesCount: 4,
    },
  },
  {
    id: "VH-009",
    vehicle: "Volkswagen Polo",
    regNumber: "MH-12-QR-4567",
    owner: "Karan Malhotra",
    healthScore: 58,
    status: "warning",
    predictedFailure: "Oil Leak Detected",
    confidence: 84,
    timeToFailure: "6-8 days",
    priority: 3,
    lastUpdate: "2m ago",
    faultCodes: [
      {
        code: "P0521",
        description: "Engine Oil Pressure Sensor Circuit Range/Performance",
        severity: "warning",
        detected: "5 hours ago",
      },
      {
        code: "P0522",
        description: "Engine Oil Pressure Sensor Circuit Low",
        severity: "warning",
        detected: "3 hours ago",
      },
    ],
    telematics: {
      engineTemp: 87,
      brakeWear: 60,
      batteryVoltage: 12.0,
      mileage: 71230,
    },
    serviceHistory: {
      lastService: "3 months ago",
      nextService: "In 10 days",
      servicesCount: 14,
    },
  },
  {
    id: "VH-010",
    vehicle: "Renault Kwid",
    regNumber: "MH-12-ST-8901",
    owner: "Divya Nair",
    healthScore: 80,
    status: "normal",
    predictedFailure: "Tire Wear Pattern",
    confidence: 72,
    timeToFailure: "18-22 days",
    priority: 4,
    lastUpdate: "3m ago",
    faultCodes: [
      {
        code: "C1201",
        description: "Tire Pressure Monitoring System - Low Pressure",
        severity: "info",
        detected: "2 days ago",
      },
    ],
    telematics: {
      engineTemp: 79,
      brakeWear: 42,
      batteryVoltage: 12.3,
      mileage: 34560,
    },
    serviceHistory: {
      lastService: "1 month ago",
      nextService: "In 50 days",
      servicesCount: 7,
    },
  },
]

const trendData = [
  { month: "Jan", critical: 2, warning: 3, normal: 5 },
  { month: "Feb", critical: 1, warning: 4, normal: 5 },
  { month: "Mar", critical: 3, warning: 2, normal: 5 },
  { month: "Apr", critical: 2, warning: 3, normal: 5 },
  { month: "May", critical: 1, warning: 4, normal: 5 },
  { month: "Jun", critical: 2, warning: 3, normal: 5 },
]

function PredictiveMaintenanceContent() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "normal">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"predictive" | "services">("predictive")
  const [serviceFilters, setServiceFilters] = useState({
    status: "all",
    technician: "all",
    priority: "all",
  })

  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "services") {
      setActiveTab("services")
    }
    const statusParam = searchParams?.get("status")
    if (statusParam && tab === "services") {
      setServiceFilters(prev => ({ ...prev, status: statusParam }))
    }
  }, [searchParams])

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        lastUpdate: "Just now",
        telematics: {
          ...v.telematics,
          engineTemp: Math.max(70, Math.min(100, v.telematics.engineTemp + (Math.random() - 0.5) * 2)),
        },
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredVehicles = vehicles.filter(v => {
    const matchesFilter = filter === "all" || v.status === filter
    const matchesSearch = searchQuery === "" || 
      v.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedVehicles = [...filteredVehicles].sort((a, b) => a.priority - b.priority)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300"
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "normal":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getHealthColor = (score: number) => {
    if (score < 60) return "text-red-600"
    if (score < 80) return "text-yellow-600"
    return "text-green-600"
  }

  const historicalData = selectedVehicle ? [
    { date: "Day 1", health: 85 },
    { date: "Day 2", health: 82 },
    { date: "Day 3", health: 78 },
    { date: "Day 4", health: 75 },
    { date: "Day 5", health: 70 },
    { date: "Day 6", health: 65 },
    { date: "Day 7", health: selectedVehicle.healthScore },
  ] : []

  const criticalCount = vehicles.filter(v => v.status === "critical").length
  const warningCount = vehicles.filter(v => v.status === "warning").length
  const normalCount = vehicles.filter(v => v.status === "normal").length
  const avgHealthScore = Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length)

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Maintenance & Services</h1>
                  <p className="text-sm text-gray-600">Predictive maintenance monitoring and service management</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Bell size={16} className="mr-2" />
                    Alerts
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus size={16} className="mr-2" />
                    New Service
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("predictive")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === "predictive"
                    ? "text-gray-900 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <BarChart3 size={16} />
                Predictive Maintenance
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === "services"
                    ? "text-gray-900 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <Wrench size={16} />
                Active Services
              </button>
            </div>

            {activeTab === "predictive" ? (
              <>
                {/* Enhanced Stats Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-600" />
                        Critical Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 mb-1">{criticalCount}</div>
                      <div className="text-xs text-gray-600">Require Immediate Action</div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <TrendingUp size={12} />
                        <span>+2 from last week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Activity size={18} className="text-yellow-600" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-yellow-600 mb-1">{warningCount}</div>
                      <div className="text-xs text-gray-600">Need Monitoring</div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                        <TrendingDown size={12} />
                        <span>-1 from last week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield size={18} className="text-green-600" />
                        Healthy Vehicles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-1">{normalCount}</div>
                      <div className="text-xs text-gray-600">All Systems Normal</div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp size={12} />
                        <span>+3 from last week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Zap size={18} className="text-blue-600" />
                        Avg Health Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{avgHealthScore}</div>
                      <div className="text-xs text-gray-600">Fleet Average</div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <TrendingUp size={12} />
                        <span>+5 points improvement</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trend Analysis */}
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">6-Month Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                          <Bar dataKey="warning" stackId="a" fill="#f59e0b" />
                          <Bar dataKey="normal" stackId="a" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters and Search */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search vehicles, registration, owner..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("all")}
                    >
                      All ({vehicles.length})
                    </Button>
                    <Button
                      variant={filter === "critical" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("critical")}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Critical ({criticalCount})
                    </Button>
                    <Button
                      variant={filter === "warning" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("warning")}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                      Warning ({warningCount})
                    </Button>
                    <Button
                      variant={filter === "normal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("normal")}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Normal ({normalCount})
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Priority Queue */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900">Priority Vehicle Queue</CardTitle>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          {sortedVehicles.length} Vehicles
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {sortedVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedVehicle?.id === vehicle.id
                                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedVehicle(vehicle)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="text-sm font-semibold text-gray-900">{vehicle.vehicle}</h4>
                                    <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                                      {vehicle.status.toUpperCase()}
                                    </Badge>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                      Priority {vehicle.priority}
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                      {vehicle.confidence}% Confidence
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mb-2">{vehicle.regNumber}</p>
                                  <p className="text-sm text-gray-700 font-medium mb-2">{vehicle.predictedFailure}</p>
                                  {vehicle.faultCodes && vehicle.faultCodes.length > 0 && (
                                    <div className="mb-2 p-2 bg-red-50 rounded border border-red-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle size={12} className="text-red-600" />
                                        <span className="text-xs font-semibold text-red-700">Fault Codes ({vehicle.faultCodes.length})</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {vehicle.faultCodes.slice(0, 3).map((code, idx) => (
                                          <Badge
                                            key={idx}
                                            className={`text-xs font-mono ${
                                              code.severity === "critical"
                                                ? "bg-red-100 text-red-700 border-red-300"
                                                : code.severity === "warning"
                                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                : "bg-blue-100 text-blue-700 border-blue-300"
                                            }`}
                                            title={code.description}
                                          >
                                            {code.code}
                                          </Badge>
                                        ))}
                                        {vehicle.faultCodes.length > 3 && (
                                          <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                            +{vehicle.faultCodes.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                    <span className="flex items-center gap-1">
                                      <Users size={12} />
                                      {vehicle.owner}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {vehicle.lastUpdate}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-3xl font-bold ${getHealthColor(vehicle.healthScore)}`}>
                                    {vehicle.healthScore}
                                  </div>
                                  <div className="text-xs text-gray-500">Health</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs mb-3 pt-3 border-t border-gray-200">
                                <div>
                                  <p className="text-gray-600">Time to Failure</p>
                                  <p className="font-semibold text-gray-900">{vehicle.timeToFailure}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Last Service</p>
                                  <p className="font-semibold text-gray-900">{vehicle.serviceHistory.lastService}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Next Service</p>
                                  <p className={`font-semibold ${vehicle.serviceHistory.nextService === "Overdue" ? "text-red-600" : "text-gray-900"}`}>
                                    {vehicle.serviceHistory.nextService}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <Button size="sm" variant="outline" className="text-xs">
                                  Schedule Service
                                  <Calendar size={12} className="ml-1" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  View Details
                                  <ChevronRight size={12} className="ml-1" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vehicle Details & Telematics */}
                  <div className="space-y-6">
                    {selectedVehicle ? (
                      <>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Vehicle Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Vehicle</p>
                                <p className="text-sm font-semibold text-gray-900">{selectedVehicle.vehicle}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Registration</p>
                                <p className="text-sm font-mono text-gray-900">{selectedVehicle.regNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Owner</p>
                                <p className="text-sm font-medium text-gray-900">{selectedVehicle.owner}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Predicted Failure</p>
                                <p className="text-sm font-medium text-red-600">{selectedVehicle.predictedFailure}</p>
                              </div>
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-600">Health Score</span>
                                  <span className={`text-sm font-bold ${getHealthColor(selectedVehicle.healthScore)}`}>
                                    {selectedVehicle.healthScore}/100
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      selectedVehicle.healthScore < 60
                                        ? "bg-red-600"
                                        : selectedVehicle.healthScore < 80
                                        ? "bg-yellow-600"
                                        : "bg-green-600"
                                    }`}
                                    style={{ width: `${selectedVehicle.healthScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Real-time Telematics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">Engine Temperature</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {selectedVehicle.telematics.engineTemp.toFixed(1)}°C
                                  </p>
                                </div>
                                {selectedVehicle.telematics.engineTemp > 90 && (
                                  <AlertTriangle size={20} className="text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">Brake Wear</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {selectedVehicle.telematics.brakeWear}%
                                  </p>
                                </div>
                                {selectedVehicle.telematics.brakeWear > 80 && (
                                  <AlertTriangle size={20} className="text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">Battery Voltage</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {selectedVehicle.telematics.batteryVoltage}V
                                  </p>
                                </div>
                                {selectedVehicle.telematics.batteryVoltage < 12.0 && (
                                  <AlertTriangle size={20} className="text-yellow-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600 mb-0.5">Mileage</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {selectedVehicle.telematics.mileage.toLocaleString()} km
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {selectedVehicle.faultCodes && selectedVehicle.faultCodes.length > 0 && (
                          <Card className="border-red-200 bg-red-50/30">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-600" />
                                Fault Codes (DTC)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {selectedVehicle.faultCodes.map((code, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg border ${
                                      code.severity === "critical"
                                        ? "bg-red-100 border-red-300"
                                        : code.severity === "warning"
                                        ? "bg-yellow-100 border-yellow-300"
                                        : "bg-blue-100 border-blue-300"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono font-bold text-gray-900">{code.code}</span>
                                        <Badge
                                          className={`text-xs ${
                                            code.severity === "critical"
                                              ? "bg-red-200 text-red-800 border-red-400"
                                              : code.severity === "warning"
                                              ? "bg-yellow-200 text-yellow-800 border-yellow-400"
                                              : "bg-blue-200 text-blue-800 border-blue-400"
                                          }`}
                                        >
                                          {code.severity.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-gray-600">{code.detected}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-1">{code.description}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Service History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-xs text-gray-600">Total Services</span>
                                <span className="text-sm font-semibold text-gray-900">{selectedVehicle.serviceHistory.servicesCount}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-xs text-gray-600">Last Service</span>
                                <span className="text-sm font-semibold text-gray-900">{selectedVehicle.serviceHistory.lastService}</span>
                              </div>
                              <div className={`flex items-center justify-between p-2 rounded ${
                                selectedVehicle.serviceHistory.nextService === "Overdue" 
                                  ? "bg-red-50 border border-red-200" 
                                  : "bg-gray-50"
                              }`}>
                                <span className="text-xs text-gray-600">Next Service</span>
                                <span className={`text-sm font-semibold ${
                                  selectedVehicle.serviceHistory.nextService === "Overdue" 
                                    ? "text-red-600" 
                                    : "text-gray-900"
                                }`}>
                                  {selectedVehicle.serviceHistory.nextService}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Health Trend (7 Days)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historicalData}>
                                  <defs>
                                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                                  <YAxis stroke="#6b7280" fontSize={10} />
                                  <Tooltip />
                                  <Area
                                    type="monotone"
                                    dataKey="health"
                                    stroke="#ef4444"
                                    fill="url(#healthGradient)"
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                          <Car size={48} className="text-gray-300 mb-4" />
                          <p className="text-sm text-gray-500">Select a vehicle to view details</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Active Services Tab */}
                <ServiceFilters filters={serviceFilters} onFiltersChange={setServiceFilters} />
                <ActiveServicesList filters={serviceFilters} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function PredictiveMaintenancePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <PredictiveMaintenanceContent />
    </Suspense>
  )
}
