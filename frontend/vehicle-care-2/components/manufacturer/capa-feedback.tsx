"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Building2,
  Filter,
  Download,
  ExternalLink
} from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface CAPAFeedback {
  id: string
  component: string
  issueType: string
  serviceCenter: string
  frequency: number
  severity: "critical" | "high" | "medium" | "low"
  rootCause: string
  correctiveAction: string
  preventiveAction: string
  status: "open" | "in-progress" | "resolved" | "closed"
  reportedDate: string
  affectedVehicles: number
  batchNumber?: string
  supplier?: string
}

const mockCAPAFeedback: CAPAFeedback[] = [
  {
    id: "CAPA-001",
    component: "Brake Pads",
    issueType: "Premature Wear",
    serviceCenter: "Mumbai Service Center",
    frequency: 47,
    severity: "critical",
    rootCause: "Material degradation due to excessive heat cycles",
    correctiveAction: "Replace with high-temperature rated ceramic compound",
    preventiveAction: "Update supplier specifications and quality control",
    status: "in-progress",
    reportedDate: "2024-09-10",
    affectedVehicles: 234,
    batchNumber: "BP-2024-Q2-045",
    supplier: "BrakeTech Industries",
  },
  {
    id: "CAPA-002",
    component: "Battery Pack",
    issueType: "Cell Degradation",
    serviceCenter: "Delhi Service Center",
    frequency: 32,
    severity: "high",
    rootCause: "Inconsistent cell quality from supplier batch",
    correctiveAction: "Replace affected battery packs under warranty",
    preventiveAction: "Implement stricter incoming quality inspection",
    status: "open",
    reportedDate: "2024-09-12",
    affectedVehicles: 156,
    batchNumber: "BAT-2024-Q3-012",
    supplier: "PowerCell Solutions",
  },
  {
    id: "CAPA-003",
    component: "Transmission",
    issueType: "Gear Slippage",
    serviceCenter: "Bangalore Service Center",
    frequency: 18,
    severity: "medium",
    rootCause: "Insufficient lubrication in specific operating conditions",
    correctiveAction: "Service affected transmissions with updated fluid",
    preventiveAction: "Update maintenance schedule and fluid specifications",
    status: "resolved",
    reportedDate: "2024-09-05",
    affectedVehicles: 89,
    supplier: "TransGlobal Systems",
  },
]

const severityColors = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#eab308",
  low: "#3b82f6",
}

const statusColors = {
  open: "#ef4444",
  "in-progress": "#f59e0b",
  resolved: "#10b981",
  closed: "#6b7280",
}

export default function CAPAFeedback() {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all")
  const [selectedCAPA, setSelectedCAPA] = useState<CAPAFeedback | null>(null)

  const filteredCAPA = mockCAPAFeedback.filter(item => {
    const severityMatch = filter === "all" || item.severity === filter
    const statusMatch = statusFilter === "all" || item.status === statusFilter
    return severityMatch && statusMatch
  })

  const severityData = [
    { name: "Critical", value: mockCAPAFeedback.filter(c => c.severity === "critical").length, color: severityColors.critical },
    { name: "High", value: mockCAPAFeedback.filter(c => c.severity === "high").length, color: severityColors.high },
    { name: "Medium", value: mockCAPAFeedback.filter(c => c.severity === "medium").length, color: severityColors.medium },
    { name: "Low", value: mockCAPAFeedback.filter(c => c.severity === "low").length, color: severityColors.low },
  ]

  const frequencyData = mockCAPAFeedback.map(capa => ({
    component: capa.component,
    frequency: capa.frequency,
    severity: capa.severity,
  }))

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-700 border-blue-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 border-red-300"
      case "in-progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "resolved":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Total CAPA Items
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">{mockCAPAFeedback.length}</div>
            <div className="text-xs text-gray-400">Active Issues</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-400" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {mockCAPAFeedback.filter(c => c.severity === "critical").length}
            </div>
            <div className="text-xs text-gray-400">Require Immediate Action</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {mockCAPAFeedback.filter(c => c.status === "resolved").length}
            </div>
            <div className="text-xs text-gray-400">This Month</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />
              Affected Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">
              {mockCAPAFeedback.reduce((sum, c) => sum + c.affectedVehicles, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Impact</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CAPA List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
            <CardContent className="relative z-10 p-4">
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-gray-300" />
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/10">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/10">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <Download size={14} className="mr-1.5" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CAPA Items */}
          <div className="space-y-3">
            {filteredCAPA.map((capa) => (
              <Card
                key={capa.id}
                className={`relative bg-white/5 backdrop-blur-2xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden cursor-pointer transition-all hover:border-cyan-500/30 ${
                  selectedCAPA?.id === capa.id ? "border-cyan-500/50 ring-2 ring-cyan-500/20" : "border-white/10"
                }`}
                onClick={() => setSelectedCAPA(capa)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
                <CardContent className="relative z-10 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">{capa.component}</h4>
                        <Badge className={`text-xs ${getSeverityColor(capa.severity)}`}>
                          {capa.severity.toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(capa.status)}`}>
                          {capa.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{capa.issueType}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {capa.serviceCenter}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {capa.frequency} occurrences
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {capa.affectedVehicles} vehicles
                        </span>
                      </div>
                      {capa.batchNumber && (
                        <div className="text-xs text-gray-500 font-mono bg-white/5 rounded px-2 py-1 inline-block">
                          Batch: {capa.batchNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Root Cause:</p>
                    <p className="text-xs text-gray-300">{capa.rootCause}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CAPA Details & Charts */}
        <div className="space-y-4">
          {selectedCAPA ? (
            <>
              <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
                <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
                  <CardTitle className="text-base font-semibold text-white">CAPA Details</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Component</p>
                    <p className="text-sm font-semibold text-white">{selectedCAPA.component}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Issue Type</p>
                    <p className="text-sm text-gray-300">{selectedCAPA.issueType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Corrective Action</p>
                    <p className="text-sm text-gray-300 bg-white/5 rounded p-2 border border-white/10">
                      {selectedCAPA.correctiveAction}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Preventive Action</p>
                    <p className="text-sm text-gray-300 bg-white/5 rounded p-2 border border-white/10">
                      {selectedCAPA.preventiveAction}
                    </p>
                  </div>
                  {selectedCAPA.supplier && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Supplier</p>
                      <p className="text-sm text-gray-300">{selectedCAPA.supplier}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/10">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      <ExternalLink size={14} className="mr-1.5" />
                      View Full CAPA Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
                <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
                  <CardTitle className="text-base font-semibold text-white">Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
              <CardContent className="relative z-10 flex flex-col items-center justify-center h-[300px] text-center">
                <FileText size={48} className="text-gray-500 mb-4" />
                <p className="text-sm text-gray-400">Select a CAPA item to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Frequency Chart */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
        <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
          <CardTitle className="text-base font-semibold text-white">Issue Frequency by Component</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="component" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="frequency" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

