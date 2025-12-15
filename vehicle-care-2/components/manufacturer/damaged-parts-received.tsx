"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, CheckCircle2, Clock, Factory, TrendingUp, FileText } from "lucide-react"
import { useState } from "react"

interface ReceivedDamagedPart {
  id: string
  partName: string
  partNumber: string
  serviceCenterId: string
  serviceCenterName: string
  vehicleModel: string
  failureType: string
  failureDate: string
  receivedDate: string
  failurePattern: "recurring" | "isolated" | "batch_issue"
  defectCategory: "manufacturing" | "design" | "material" | "unknown"
  severity: "critical" | "high" | "medium"
  status: "received" | "analyzing" | "capa_created" | "resolved"
  relatedFailures: number
  batchNumber?: string
  aiConfidence: number
  priority: number
}

export default function DamagedPartsReceived() {
  const [parts, setParts] = useState<ReceivedDamagedPart[]>([
    {
      id: "DP-001",
      partName: "Brake Pad Set (Front)",
      partNumber: "BP-F-2024-001",
      serviceCenterId: "SC-001",
      serviceCenterName: "AutoCare Center Mumbai",
      vehicleModel: "Tata Nexon",
      failureType: "Premature Wear",
      failureDate: "2024-09-15",
      receivedDate: "2024-09-16",
      failurePattern: "recurring",
      defectCategory: "manufacturing",
      severity: "high",
      status: "analyzing",
      relatedFailures: 8,
      batchNumber: "BATCH-2024-Q2-045",
      aiConfidence: 94,
      priority: 85,
    },
    {
      id: "DP-002",
      partName: "Battery (48V)",
      partNumber: "BAT-48V-2024-002",
      serviceCenterId: "SC-002",
      serviceCenterName: "Service Hub Delhi",
      vehicleModel: "Mahindra XUV",
      failureType: "Capacity Degradation",
      failureDate: "2024-09-12",
      receivedDate: "2024-09-13",
      failurePattern: "batch_issue",
      defectCategory: "material",
      severity: "critical",
      status: "capa_created",
      relatedFailures: 15,
      batchNumber: "BATCH-2024-Q1-128",
      aiConfidence: 97,
      priority: 95,
    },
    {
      id: "DP-003",
      partName: "AC Compressor",
      partNumber: "AC-COMP-2024-003",
      serviceCenterId: "SC-003",
      serviceCenterName: "QuickFix Bangalore",
      vehicleModel: "Honda City",
      failureType: "Seal Failure",
      failureDate: "2024-09-10",
      receivedDate: "2024-09-11",
      failurePattern: "isolated",
      defectCategory: "design",
      severity: "medium",
      status: "resolved",
      relatedFailures: 2,
      aiConfidence: 78,
      priority: 60,
    },
  ])

  const handleCreateCAPA = (partId: string) => {
    setParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, status: "capa_created" as const }
        : part
    ))
    console.log(`Creating CAPA for part ${partId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Received</Badge>
      case "analyzing":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Analyzing</Badge>
      case "capa_created":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">CAPA Created</Badge>
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Resolved</Badge>
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
      default:
        return null
    }
  }

  const getPatternBadge = (pattern: string) => {
    switch (pattern) {
      case "recurring":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Recurring</Badge>
      case "batch_issue":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Batch Issue</Badge>
      case "isolated":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Isolated</Badge>
      default:
        return null
    }
  }

  // Sort by priority (highest first)
  const sortedParts = [...parts].sort((a, b) => b.priority - a.priority)
  const criticalParts = parts.filter(p => p.severity === "critical" && p.status !== "resolved")

  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Factory size={18} className="text-red-400" />
            Damaged Parts Received from Service Centers
          </CardTitle>
          {criticalParts.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {criticalParts.length} Critical
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-gray-300 hover:text-white hover:bg-white/10">
          View All
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Critical Alert */}
        {criticalParts.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-400 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-300 mb-1">
                  {criticalParts.length} critical parts require immediate analysis
                </p>
                <p className="text-xs text-red-400/80">
                  These parts show batch issues or recurring failures affecting multiple vehicles.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sortedParts.map((part) => (
            <div
              key={part.id}
              className={`p-4 border rounded-lg transition-all backdrop-blur-sm ${
                part.severity === "critical"
                  ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-500/5 hover:border-red-500/50"
                  : part.severity === "high"
                  ? "border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-500/5 hover:border-orange-500/50"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white">{part.partName}</h4>
                    {getStatusBadge(part.status)}
                    {getSeverityBadge(part.severity)}
                    {getPatternBadge(part.failurePattern)}
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs flex items-center gap-1">
                      <TrendingUp size={10} />
                      {part.aiConfidence}% AI
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-gray-400">Part Number:</span>
                      <span className="font-mono font-semibold text-white ml-1">{part.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Service Center:</span>
                      <span className="font-semibold text-white ml-1">{part.serviceCenterName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Vehicle Model:</span>
                      <span className="font-semibold text-white ml-1">{part.vehicleModel}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Failure Type:</span>
                      <span className="font-semibold text-white ml-1">{part.failureType}</span>
                    </div>
                    {part.batchNumber && (
                      <div>
                        <span className="text-gray-400">Batch:</span>
                        <span className="font-mono font-semibold text-white ml-1">{part.batchNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Related Failures:</span>
                      <span className="font-semibold text-red-400 ml-1">{part.relatedFailures}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Received:</span>
                      <span className="font-semibold text-white ml-1">{part.receivedDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Defect Category:</span>
                      <span className="font-semibold text-white ml-1 capitalize">{part.defectCategory}</span>
                    </div>
                  </div>
                </div>
              </div>

              {part.status === "analyzing" && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>Under analysis</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                    onClick={() => handleCreateCAPA(part.id)}
                  >
                    <FileText size={12} className="mr-1" />
                    Create CAPA
                  </Button>
                </div>
              )}

              {part.status === "capa_created" && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/20 p-2 rounded border border-purple-500/30">
                    <CheckCircle2 size={12} />
                    <span>CAPA created - Design improvement in progress</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
          <div className="text-center p-2 bg-blue-500/20 rounded border border-blue-500/30">
            <div className="text-lg font-bold text-blue-400">
              {parts.filter(p => p.status === "received").length}
            </div>
            <div className="text-xs text-blue-300">Received</div>
          </div>
          <div className="text-center p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
            <div className="text-lg font-bold text-yellow-400">
              {parts.filter(p => p.status === "analyzing").length}
            </div>
            <div className="text-xs text-yellow-300">Analyzing</div>
          </div>
          <div className="text-center p-2 bg-purple-500/20 rounded border border-purple-500/30">
            <div className="text-lg font-bold text-purple-400">
              {parts.filter(p => p.status === "capa_created").length}
            </div>
            <div className="text-xs text-purple-300">CAPA Created</div>
          </div>
          <div className="text-center p-2 bg-green-500/20 rounded border border-green-500/30">
            <div className="text-lg font-bold text-green-400">
              {parts.filter(p => p.status === "resolved").length}
            </div>
            <div className="text-xs text-green-300">Resolved</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
