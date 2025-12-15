"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, TrendingDown, Activity, ChevronRight, Brain } from "lucide-react"

const anomalies = [
  {
    id: "ANOM-001",
    vehicle: "Tata Nexon",
    regNumber: "MH-12-AB-1234",
    anomaly: "Engine Temperature Elevated",
    severity: "critical",
    detected: "2 hours ago",
    trend: "increasing",
    value: "94°C",
    normal: "82°C",
    aiDetected: true,
    aiConfidence: 94,
  },
  {
    id: "ANOM-002",
    vehicle: "Hyundai i20",
    regNumber: "MH-12-CD-5678",
    anomaly: "Brake Pad Wear Critical",
    severity: "high",
    detected: "5 hours ago",
    trend: "stable",
    value: "78%",
    normal: "<50%",
    aiDetected: true,
    aiConfidence: 89,
  },
  {
    id: "ANOM-003",
    vehicle: "Mahindra XUV",
    regNumber: "MH-12-EF-9012",
    anomaly: "Battery Voltage Drop",
    severity: "medium",
    detected: "1 day ago",
    trend: "decreasing",
    value: "11.8V",
    normal: "12.6V",
    aiDetected: false,
    aiConfidence: null,
  },
]

export default function FleetAnomalyList() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs h-5">CRITICAL</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs h-5">HIGH</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs h-5">MEDIUM</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs h-5">LOW</Badge>
      default:
        return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp size={14} className="text-red-600" />
      case "decreasing":
        return <TrendingDown size={14} className="text-blue-600" />
      case "stable":
        return <Activity size={14} className="text-gray-600" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            Fleet-Level Anomaly List
          </CardTitle>
          <Badge className="bg-red-100 text-red-700 border-red-300 text-xs flex items-center gap-1">
            <Brain size={10} />
            AI Detected
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          View All
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-3 border rounded-lg transition-all ${
                anomaly.aiDetected
                  ? "border-red-200 bg-gradient-to-r from-red-50/30 to-white hover:border-red-300"
                  : "border-gray-100 hover:border-red-200 hover:bg-red-50/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{anomaly.vehicle}</h4>
                    {getSeverityBadge(anomaly.severity)}
                    {anomaly.aiDetected && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs h-5 flex items-center gap-1">
                        <Brain size={10} />
                        {anomaly.aiConfidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-1">{anomaly.regNumber}</p>
                  <p className="text-sm text-gray-700 font-medium">{anomaly.anomaly}</p>
                  {anomaly.aiDetected && (
                    <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                      <Brain size={10} />
                      AI Pattern Detection: Early warning system triggered
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {getTrendIcon(anomaly.trend)}
                  <span>{anomaly.detected}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-0.5">Current</p>
                  <p className="text-sm font-semibold text-gray-900">{anomaly.value}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-0.5">Normal</p>
                  <p className="text-sm font-semibold text-gray-700">{anomaly.normal}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-2.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-red-600" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">AI Analysis:</span> 2 critical anomalies detected by predictive maintenance - immediate action recommended
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

