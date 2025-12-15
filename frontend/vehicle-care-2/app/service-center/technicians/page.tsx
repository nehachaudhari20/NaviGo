"use client"

import { useState } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Clock,
  Zap,
  Brain,
  Sparkles,
  Search,
  Filter,
  Award,
  Activity,
  Target,
  BarChart3
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

interface Technician {
  id: string
  name: string
  specialization: string[]
  status: "available" | "busy" | "on-break"
  currentLoad: number
  maxLoad: number
  efficiency: number
  avgCompletionTime: string
  servicesCompleted: number
  rating: number
  aiScore: number
  aiRecommendation: string
  skills: {
    engine: number
    brake: number
    electrical: number
    ac: number
    transmission: number
  }
  nextAvailable: string
}

const technicians: Technician[] = [
  {
    id: "TECH-001",
    name: "Priya Sharma",
    specialization: ["Engine & Transmission", "Full Service"],
    status: "available",
    currentLoad: 4,
    maxLoad: 6,
    efficiency: 92,
    avgCompletionTime: "2.5 hours",
    servicesCompleted: 1247,
    rating: 4.8,
    aiScore: 95,
    aiRecommendation: "Best match for engine services - 95% efficiency",
    skills: {
      engine: 95,
      brake: 85,
      electrical: 75,
      ac: 80,
      transmission: 90,
    },
    nextAvailable: "Now",
  },
  {
    id: "TECH-002",
    name: "Dev Mehta",
    specialization: ["Brake & Suspension", "AC Service"],
    status: "busy",
    currentLoad: 5,
    maxLoad: 6,
    efficiency: 88,
    avgCompletionTime: "2.8 hours",
    servicesCompleted: 892,
    rating: 4.7,
    aiScore: 88,
    aiRecommendation: "Optimal for brake services - high expertise",
    skills: {
      engine: 70,
      brake: 95,
      electrical: 80,
      ac: 90,
      transmission: 75,
    },
    nextAvailable: "2 hours",
  },
  {
    id: "TECH-003",
    name: "Kumar Reddy",
    specialization: ["Electrical & AC", "Battery"],
    status: "available",
    currentLoad: 3,
    maxLoad: 6,
    efficiency: 95,
    avgCompletionTime: "2.2 hours",
    servicesCompleted: 678,
    rating: 4.9,
    aiScore: 92,
    aiRecommendation: "Top performer for electrical work",
    skills: {
      engine: 75,
      brake: 80,
      electrical: 98,
      ac: 95,
      transmission: 70,
    },
    nextAvailable: "Now",
  },
  {
    id: "TECH-004",
    name: "Sarah Patel",
    specialization: ["Full Service", "Oil Change"],
    status: "available",
    currentLoad: 2,
    maxLoad: 6,
    efficiency: 90,
    avgCompletionTime: "2.4 hours",
    servicesCompleted: 456,
    rating: 4.6,
    aiScore: 85,
    aiRecommendation: "Good for routine maintenance",
    skills: {
      engine: 85,
      brake: 85,
      electrical: 75,
      ac: 80,
      transmission: 80,
    },
    nextAvailable: "Now",
  },
  {
    id: "TECH-005",
    name: "Rajesh Kumar",
    specialization: ["Transmission", "Engine"],
    status: "on-break",
    currentLoad: 3,
    maxLoad: 6,
    efficiency: 87,
    avgCompletionTime: "2.6 hours",
    servicesCompleted: 789,
    rating: 4.7,
    aiScore: 82,
    aiRecommendation: "Expert in transmission repairs",
    skills: {
      engine: 90,
      brake: 75,
      electrical: 70,
      ac: 75,
      transmission: 95,
    },
    nextAvailable: "30 minutes",
  },
]

const performanceData = [
  { month: "Jan", avgEfficiency: 85, services: 120 },
  { month: "Feb", avgEfficiency: 87, services: 135 },
  { month: "Mar", avgEfficiency: 89, services: 142 },
  { month: "Apr", avgEfficiency: 91, services: 158 },
  { month: "May", avgEfficiency: 90, services: 165 },
  { month: "Jun", avgEfficiency: 92, services: 178 },
]

function TechniciansContent() {
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)
  const [filter, setFilter] = useState<"all" | "available" | "busy" | "on-break">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"efficiency" | "load" | "rating">("efficiency")

  const filteredTechnicians = technicians.filter(tech => {
    const matchesFilter = filter === "all" || tech.status === filter
    const matchesSearch = searchQuery === "" || 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
    if (sortBy === "efficiency") return b.efficiency - a.efficiency
    if (sortBy === "load") return (b.currentLoad / b.maxLoad) - (a.currentLoad / a.maxLoad)
    return b.rating - a.rating
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-300"
      case "busy":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "on-break":
        return "bg-gray-100 text-gray-700 border-gray-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "available") {
      return <CheckCircle2 size={14} className="text-green-600" />
    }
    return <AlertCircle size={14} className="text-orange-600" />
  }

  const avgEfficiency = Math.round(technicians.reduce((sum, t) => sum + t.efficiency, 0) / technicians.length)
  const totalServices = technicians.reduce((sum, t) => sum + t.servicesCompleted, 0)
  const availableCount = technicians.filter(t => t.status === "available").length

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Technicians</h1>
                  <p className="text-sm text-gray-600">AI-powered technician management and optimization</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Users size={16} className="mr-2" />
                  Add Technician
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    Total Technicians
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{technicians.length}</div>
                  <div className="text-xs text-gray-600">Active Team Members</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-1">{availableCount}</div>
                  <div className="text-xs text-gray-600">Ready for Assignment</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target size={18} className="text-purple-600" />
                    Avg Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{avgEfficiency}%</div>
                  <div className="text-xs text-gray-600">Team Performance</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Activity size={18} className="text-orange-600" />
                    Total Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{totalServices.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Completed This Month</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Performance Chart */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Brain size={18} className="text-purple-600" />
                    AI Performance Analytics
                  </CardTitle>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    AI Optimized
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="avgEfficiency" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="services" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
                  placeholder="Search technicians by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="on-break">On Break</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efficiency">Sort by Efficiency</SelectItem>
                    <SelectItem value="load">Sort by Load</SelectItem>
                    <SelectItem value="rating">Sort by Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technicians List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Technician Roster</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      {sortedTechnicians.length} Technicians
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sortedTechnicians.map((tech) => {
                        const loadPercentage = (tech.currentLoad / tech.maxLoad) * 100
                        return (
                          <div
                            key={tech.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTech?.id === tech.id
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedTech(tech)}
                          >
                            <div className="flex items-start gap-4 mb-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src="/placeholder-user.jpg" alt={tech.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {tech.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-sm font-semibold text-gray-900">{tech.name}</h4>
                                  {getStatusIcon(tech.status)}
                                  <Badge className={`text-xs ${getStatusColor(tech.status)}`}>
                                    {tech.status}
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs flex items-center gap-1">
                                    <Sparkles size={10} />
                                    AI {tech.aiScore}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{tech.specialization.join(", ")}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Award size={12} />
                                    {tech.rating} ⭐
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {tech.avgCompletionTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity size={12} />
                                    {tech.servicesCompleted} services
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Workload</span>
                                    <span className="text-xs font-semibold text-gray-900">
                                      {tech.currentLoad}/{tech.maxLoad} ({Math.round(loadPercentage)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        loadPercentage > 80
                                          ? "bg-red-600"
                                          : loadPercentage > 60
                                          ? "bg-yellow-600"
                                          : "bg-green-600"
                                      }`}
                                      style={{ width: `${loadPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                  <div className="flex items-start gap-2">
                                    <Brain size={14} className="text-purple-600 mt-0.5" />
                                    <p className="text-xs text-gray-700">{tech.aiRecommendation}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">{tech.efficiency}%</div>
                                <div className="text-xs text-gray-500">Efficiency</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technician Details */}
              <div className="space-y-6">
                {selectedTech ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Technician Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src="/placeholder-user.jpg" alt={selectedTech.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                                {selectedTech.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{selectedTech.name}</h4>
                              <p className="text-xs text-gray-600">{selectedTech.specialization.join(", ")}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Efficiency</p>
                              <p className="text-lg font-bold text-purple-600">{selectedTech.efficiency}%</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Rating</p>
                              <p className="text-lg font-bold text-yellow-600">{selectedTech.rating} ⭐</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Services</p>
                              <p className="text-lg font-bold text-gray-900">{selectedTech.servicesCompleted}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-0.5">Avg Time</p>
                              <p className="text-lg font-bold text-gray-900">{selectedTech.avgCompletionTime}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-2">AI Performance Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${selectedTech.aiScore}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{selectedTech.aiScore}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Skill Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={[
                              { skill: "Engine", value: selectedTech.skills.engine },
                              { skill: "Brake", value: selectedTech.skills.brake },
                              { skill: "Electrical", value: selectedTech.skills.electrical },
                              { skill: "AC", value: selectedTech.skills.ac },
                              { skill: "Transmission", value: selectedTech.skills.transmission },
                            ]}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="skill" fontSize={12} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar
                                name="Skills"
                                dataKey="value"
                                stroke="#a855f7"
                                fill="#a855f7"
                                fillOpacity={0.6}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <Brain size={18} className="text-purple-600" />
                          AI Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">Optimal Assignment</p>
                            <p className="text-xs text-gray-600">
                              Assign engine and transmission services for maximum efficiency
                            </p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">Workload Optimization</p>
                            <p className="text-xs text-gray-600">
                              Can handle 2 more services without efficiency drop
                            </p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-gray-900 mb-1">Training Suggestion</p>
                            <p className="text-xs text-gray-600">
                              Consider AC specialization training to expand capabilities
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                      <Users size={48} className="text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">Select a technician to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function TechniciansPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <TechniciansContent />
    </Suspense>
  )
}
