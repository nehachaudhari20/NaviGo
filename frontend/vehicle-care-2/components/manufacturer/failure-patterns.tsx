"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Filter,
  Download,
  Lightbulb,
  Target
} from "lucide-react"
import { useState, useEffect } from "react"
import { useManufacturingCases } from "@/hooks/use-agent-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts"

interface FailurePattern {
  component: string
  failureRate: number
  avgTimeToFailure: number // days
  batchComparison: {
    batch1: number
    batch2: number
    batch3: number
  }
  designFlaws: string[]
  recommendations: string[]
  trend: "improving" | "stable" | "worsening"
}

const mockFailurePatterns: FailurePattern[] = [
  {
    component: "Brake Pads",
    failureRate: 12.5,
    avgTimeToFailure: 18,
    batchComparison: {
      batch1: 15.2,
      batch2: 12.5,
      batch3: 10.1,
    },
    designFlaws: [
      "Material composition insufficient for high-temperature cycles",
      "Thickness tolerance too wide",
      "Attachment mechanism prone to vibration"
    ],
    recommendations: [
      "Switch to ceramic-metallic compound for better heat resistance",
      "Tighten thickness tolerance to ±0.1mm",
      "Redesign attachment with damping material",
      "Implement batch-level quality testing"
    ],
    trend: "improving",
  },
  {
    component: "Battery Pack",
    failureRate: 8.3,
    avgTimeToFailure: 450,
    batchComparison: {
      batch1: 10.5,
      batch2: 8.3,
      batch3: 6.8,
    },
    designFlaws: [
      "Cell-to-cell variation in capacity",
      "Thermal management insufficient in extreme conditions",
      "BMS calibration drift over time"
    ],
    recommendations: [
      "Implement stricter cell matching criteria",
      "Enhance thermal management system",
      "Update BMS firmware with improved calibration",
      "Add predictive maintenance alerts"
    ],
    trend: "improving",
  },
  {
    component: "Transmission",
    failureRate: 5.2,
    avgTimeToFailure: 1200,
    batchComparison: {
      batch1: 4.8,
      batch2: 5.2,
      batch3: 5.5,
    },
    designFlaws: [
      "Lubrication system inadequate for stop-and-go traffic",
      "Gear material wear pattern inconsistent"
    ],
    recommendations: [
      "Upgrade to synthetic transmission fluid",
      "Modify gear tooth profile for better load distribution",
      "Extend service interval recommendations"
    ],
    trend: "worsening",
  },
]

// Chart data will be computed from real patterns

export default function FailurePatterns() {
  const [selectedComponent, setSelectedComponent] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview")
  
  // Fetch real manufacturing cases data
  const { data: manufacturingCases, loading } = useManufacturingCases(undefined, true)
  
  // Transform manufacturing cases to failure patterns
  const realPatterns: FailurePattern[] = manufacturingCases && manufacturingCases.length > 0
    ? manufacturingCases.map((caseItem: any) => {
        const component = caseItem.component || 'Unknown Component'
        const defectPattern = caseItem.defect_pattern || caseItem.issue || caseItem.root_cause || 'Unknown pattern'
        // Manufacturing agent stores capa_recommendation (singular), but interface may have plural
        const capaRecommendation = caseItem.capa_recommendation || caseItem.capa_recommendations || ''
        const capaRecommendations = capaRecommendation
          ? (typeof capaRecommendation === 'string' 
              ? [capaRecommendation] 
              : Array.isArray(capaRecommendation) ? capaRecommendation : [])
          : []
        
        // Calculate failure rate from recurrence_cluster_size or affected_vehicles
        const clusterSize = caseItem.recurrence_cluster_size || caseItem.affected_vehicles || 1
        const failureRate = Math.min(100, (clusterSize / 10) * 5) // Estimate: 5% per 10 vehicles
        
        // Determine trend based on recurrence or severity
        const recurrenceCount = caseItem.recurrence_count || 0
        const severity = caseItem.severity?.toLowerCase() || ''
        const trend: "improving" | "stable" | "worsening" = 
          recurrenceCount >= 3 || severity === 'high' ? "worsening" :
          recurrenceCount === 2 || severity === 'medium' ? "stable" : "improving"
        
        return {
          component,
          failureRate,
          avgTimeToFailure: 30, // Could be calculated from RUL data
          batchComparison: {
            batch1: failureRate * 1.2,
            batch2: failureRate,
            batch3: failureRate * 0.8,
          },
          designFlaws: defectPattern ? [defectPattern] : [],
          recommendations: capaRecommendations.length > 0 
            ? capaRecommendations 
            : ['No recommendations available'],
          trend
        }
      })
    : []

  // Use real data if available, otherwise fall back to mock
  const allPatterns = realPatterns.length > 0 ? realPatterns : mockFailurePatterns
  
  const filteredPatterns = selectedComponent === "all"
    ? allPatterns
    : allPatterns.filter(p => p.component === selectedComponent)
  
  // Compute chart data from filtered patterns
  const timeToFailureData = filteredPatterns.map(pattern => ({
    component: pattern.component,
    days: pattern.avgTimeToFailure,
    failureRate: pattern.failureRate,
  }))
  
  const batchComparisonData = filteredPatterns.map(pattern => ({
    component: pattern.component,
    "Batch 1": pattern.batchComparison.batch1,
    "Batch 2": pattern.batchComparison.batch2,
    "Batch 3": pattern.batchComparison.batch3,
  }))

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-400"
      case "worsening":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingDown size={14} className="text-green-400" />
      case "worsening":
        return <TrendingUp size={14} className="text-red-400" />
      default:
        return <AlertTriangle size={14} className="text-yellow-400" />
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
              <BarChart3 size={16} className="text-cyan-400" />
              Avg Failure Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">
              {filteredPatterns.length > 0
                ? (filteredPatterns.reduce((sum, p) => sum + p.failureRate, 0) / filteredPatterns.length).toFixed(1)
                : "0.0"}%
            </div>
            <div className="text-xs text-gray-400">Across All Components</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Target size={16} className="text-green-400" />
              Improving
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {filteredPatterns.filter(p => p.trend === "improving").length}
            </div>
            <div className="text-xs text-gray-400">Components</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Worsening
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {filteredPatterns.filter(p => p.trend === "worsening").length}
            </div>
            <div className="text-xs text-gray-400">Components</div>
          </CardContent>
        </Card>

        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Lightbulb size={16} className="text-yellow-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white mb-1">
              {filteredPatterns.reduce((sum, p) => sum + p.recommendations.length, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Actions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-300" />
            <Select value={selectedComponent} onValueChange={setSelectedComponent}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/10">
                <SelectItem value="all">All Components</SelectItem>
                {filteredPatterns.map((pattern) => (
                  <SelectItem key={pattern.component} value={pattern.component}>
                    {pattern.component}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === "overview" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("overview")}
                className={viewMode === "overview" ? "bg-cyan-600 hover:bg-cyan-700" : "border-white/20 text-gray-300 hover:bg-white/10"}
              >
                Overview
              </Button>
              <Button
                variant={viewMode === "detailed" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("detailed")}
                className={viewMode === "detailed" ? "bg-cyan-600 hover:bg-cyan-700" : "border-white/20 text-gray-300 hover:bg-white/10"}
              >
                Detailed
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <Download size={14} className="mr-1.5" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Rate Trend */}
        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
            <CardTitle className="text-base font-semibold text-white">Failure Rate by Component</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredPatterns}>
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
                  <Bar dataKey="failureRate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time to Failure Analysis */}
        <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
          <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
            <CardTitle className="text-base font-semibold text-white">Time to Failure Analysis</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={timeToFailureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    dataKey="days" 
                    name="Days" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    label={{ value: "Days to Failure", position: "insideBottom", offset: -5, style: { fill: "#9ca3af" } }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="failureRate" 
                    name="Failure Rate" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    label={{ value: "Failure Rate %", angle: -90, position: "insideLeft", style: { fill: "#9ca3af" } }}
                  />
                  <ZAxis type="number" dataKey="failureRate" range={[50, 300]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter name="Components" data={timeToFailureData} fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Comparison */}
      <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
        <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
          <CardTitle className="text-base font-semibold text-white">Batch Comparison</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchComparisonData}>
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
                <Bar dataKey="Batch 1" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Batch 2" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Batch 3" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-gray-400">Batch 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-gray-400">Batch 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-400">Batch 3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Pattern Analysis */}
      {viewMode === "detailed" && (
        <div className="space-y-4">
          {filteredPatterns.map((pattern, idx) => (
            <Card
              key={idx}
              className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
              <CardHeader className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white">{pattern.component}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                      {pattern.failureRate}% Failure Rate
                    </Badge>
                    <div className={`flex items-center gap-1 ${getTrendColor(pattern.trend)}`}>
                      {getTrendIcon(pattern.trend)}
                      <span className="text-xs capitalize">{pattern.trend}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Average Time to Failure</p>
                    <p className="text-lg font-bold text-white">{pattern.avgTimeToFailure} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Failure Rate Trend</p>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(pattern.trend)}
                      <span className={`text-sm font-semibold ${getTrendColor(pattern.trend)} capitalize`}>
                        {pattern.trend}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    Design Flaws Identified
                  </p>
                  <ul className="space-y-1">
                    {pattern.designFlaws.map((flaw, fIdx) => (
                      <li key={fIdx} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                    <Lightbulb size={14} className="text-yellow-400" />
                    Improvement Recommendations
                  </p>
                  <ul className="space-y-1">
                    {pattern.recommendations.map((rec, rIdx) => (
                      <li key={rIdx} className="text-xs text-gray-300 bg-white/5 rounded p-2 border border-white/10 flex items-start gap-2">
                        <Lightbulb size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

