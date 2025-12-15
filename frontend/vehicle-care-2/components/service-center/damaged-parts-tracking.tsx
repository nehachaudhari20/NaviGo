"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, Send, CheckCircle2, Clock, Factory, TrendingUp, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

interface DamagedPart {
  id: string
  partName: string
  partNumber: string
  vehicleId: string
  vehicleModel: string
  failureType: string
  failureDate: string
  failurePattern: "recurring" | "isolated" | "batch_issue"
  defectCategory: "manufacturing" | "design" | "material" | "unknown"
  severity: "critical" | "high" | "medium"
  status: "pending" | "sent" | "analyzed" | "resolved"
  sentToManufacturer?: string
  manufacturerResponse?: string
  relatedFailures: number
  batchNumber?: string
  aiConfidence: number
}

export default function DamagedPartsTracking() {
  const [parts, setParts] = useState<DamagedPart[]>([
    {
      id: "DP-001",
      partName: "Brake Pad Set (Front)",
      partNumber: "BP-F-2024-001",
      vehicleId: "V-1234",
      vehicleModel: "Tata Nexon",
      failureType: "Premature Wear",
      failureDate: "2024-09-15",
      failurePattern: "recurring",
      defectCategory: "manufacturing",
      severity: "high",
      status: "pending",
      relatedFailures: 8,
      batchNumber: "BATCH-2024-Q2-045",
      aiConfidence: 94,
    },
    {
      id: "DP-002",
      partName: "Battery (48V)",
      partNumber: "BAT-48V-2024-002",
      vehicleId: "V-5678",
      vehicleModel: "Mahindra XUV",
      failureType: "Capacity Degradation",
      failureDate: "2024-09-12",
      failurePattern: "batch_issue",
      defectCategory: "material",
      severity: "critical",
      status: "sent",
      sentToManufacturer: "2024-09-13",
      relatedFailures: 15,
      batchNumber: "BATCH-2024-Q1-128",
      aiConfidence: 97,
    },
    {
      id: "DP-003",
      partName: "AC Compressor",
      partNumber: "AC-COMP-2024-003",
      vehicleId: "V-9012",
      vehicleModel: "Honda City",
      failureType: "Seal Failure",
      failureDate: "2024-09-10",
      failurePattern: "isolated",
      defectCategory: "design",
      severity: "medium",
      status: "analyzed",
      sentToManufacturer: "2024-09-11",
      manufacturerResponse: "Design improvement recommended",
      relatedFailures: 2,
      aiConfidence: 78,
    },
  ])

  const handleSendToManufacturer = (partId: string) => {
    setParts(prev => prev.map(part => 
      part.id === partId 
        ? { ...part, status: "sent" as const, sentToManufacturer: new Date().toISOString().split('T')[0] }
        : part
    ))
    // In real implementation, this would call an API to send to manufacturer
    console.log(`Sending part ${partId} to manufacturer for defect analysis`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Pending</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Sent</Badge>
      case "analyzed":
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Analyzed</Badge>
      case "resolved":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">Resolved</Badge>
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Medium</Badge>
      default:
        return null
    }
  }

  const getPatternBadge = (pattern: string) => {
    switch (pattern) {
      case "recurring":
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">Recurring</Badge>
      case "batch_issue":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">Batch Issue</Badge>
      case "isolated":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Isolated</Badge>
      default:
        return null
    }
  }

  const pendingParts = parts.filter(p => p.status === "pending")
  const autoSendParts = parts.filter(p => 
    p.status === "pending" && 
    (p.failurePattern === "recurring" || p.failurePattern === "batch_issue") &&
    p.aiConfidence >= 85
  )

  // Auto-send parts to manufacturer on component mount if conditions are met
  useEffect(() => {
    if (autoSendParts.length > 0) {
      // In production, this would be a scheduled job or API call
      console.log(`Auto-sending ${autoSendParts.length} parts to manufacturer based on failure patterns`)
      // Uncomment to enable auto-send:
      // autoSendParts.forEach(part => {
      //   setTimeout(() => handleSendToManufacturer(part.id), 1000)
      // })
    }
  }, [autoSendParts.length])

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Factory size={18} className="text-red-600" />
            Damaged Parts for Manufacturer Analysis
          </CardTitle>
          {pendingParts.length > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
              {pendingParts.length} Pending
            </Badge>
          )}
        </div>
        {autoSendParts.length > 0 && (
          <Button 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
            onClick={() => {
              autoSendParts.forEach(part => handleSendToManufacturer(part.id))
            }}
          >
            <Send size={12} className="mr-1" />
            Auto-Send {autoSendParts.length} Parts
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Auto-Send Alert */}
        {autoSendParts.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <Sparkles className="text-red-600 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-900 mb-1 flex items-center gap-2">
                  {autoSendParts.length} parts ready for automatic manufacturer analysis
                  <Badge className="bg-red-200 text-red-900 text-xs">Auto-Detected</Badge>
                </p>
                <p className="text-xs text-red-700 mb-2">
                  These parts show recurring or batch failure patterns with high AI confidence (≥85%).
                  They will be automatically sent to manufacturer for defect analysis.
                </p>
                <div className="flex items-center gap-2 text-xs text-red-800">
                  <span className="font-medium">Auto-Send Criteria:</span>
                  <span>Recurring/Batch Issue + AI Confidence ≥85% + High/Critical Severity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {parts.map((part) => (
            <div
              key={part.id}
              className={`p-4 border rounded-lg transition-all ${
                part.status === "pending"
                  ? "border-red-200 bg-gradient-to-r from-red-50/30 to-white hover:border-red-300"
                  : part.status === "sent"
                  ? "border-blue-200 bg-blue-50/30 hover:border-blue-300"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900">{part.partName}</h4>
                    {getStatusBadge(part.status)}
                    {getSeverityBadge(part.severity)}
                    {getPatternBadge(part.failurePattern)}
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs flex items-center gap-1">
                      <TrendingUp size={10} />
                      {part.aiConfidence}% AI
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-gray-600">Part Number:</span>
                      <span className="font-mono font-semibold text-gray-900 ml-1">{part.partNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold text-gray-900 ml-1">{part.vehicleModel}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failure Type:</span>
                      <span className="font-semibold text-gray-900 ml-1">{part.failureType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Defect Category:</span>
                      <span className="font-semibold text-gray-900 ml-1 capitalize">{part.defectCategory}</span>
                    </div>
                    {part.batchNumber && (
                      <div>
                        <span className="text-gray-600">Batch:</span>
                        <span className="font-mono font-semibold text-gray-900 ml-1">{part.batchNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Related Failures:</span>
                      <span className="font-semibold text-red-600 ml-1">{part.relatedFailures}</span>
                    </div>
                  </div>

                  {part.sentToManufacturer && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                      <Send size={12} />
                      <span>Sent to manufacturer on {part.sentToManufacturer}</span>
                    </div>
                  )}

                  {part.manufacturerResponse && (
                    <div className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                      <span className="font-semibold text-green-900">Manufacturer Response:</span>
                      <span className="text-green-700 ml-1">{part.manufacturerResponse}</span>
                    </div>
                  )}
                </div>
              </div>

              {part.status === "pending" && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock size={12} />
                    <span>Failed on {part.failureDate}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                    onClick={() => handleSendToManufacturer(part.id)}
                  >
                    <Send size={12} className="mr-1" />
                    Send to Manufacturer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
            <div className="text-lg font-bold text-red-600">{pendingParts.length}</div>
            <div className="text-xs text-red-700">Pending</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-lg font-bold text-blue-600">
              {parts.filter(p => p.status === "sent").length}
            </div>
            <div className="text-xs text-blue-700">Sent</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="text-lg font-bold text-green-600">
              {parts.filter(p => p.status === "analyzed" || p.status === "resolved").length}
            </div>
            <div className="text-xs text-green-700">Analyzed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
