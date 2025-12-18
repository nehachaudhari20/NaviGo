"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Settings, Zap, Battery, AlertCircle, TrendingUp, ChevronDown } from "lucide-react"
import { useState } from "react"

const healthData = [
  {
    id: "engine",
    name: "Engine",
    icon: Settings,
    healthScore: 84,
    riskLevel: "Low",
    trend: "stable",
  },
  {
    id: "transmission",
    name: "Transmission",
    icon: Zap,
    healthScore: 78,
    riskLevel: "Medium",
    trend: "declining",
  },
  {
    id: "battery",
    name: "Battery",
    icon: Battery,
    healthScore: 91,
    riskLevel: "Low",
    trend: "stable",
  },
  {
    id: "brakes",
    name: "Brakes",
    icon: AlertCircle,
    healthScore: 72,
    riskLevel: "Medium",
    trend: "declining",
  },
]

export default function HealthSummary() {
  const [expanded, setExpanded] = useState(false)

  const overallHealth = Math.round(
    healthData.reduce((sum, item) => sum + item.healthScore, 0) / healthData.length
  )

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/20" }
    if (score >= 60) return { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/20" }
    return { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/20" }
  }

  const overallStatus = getHealthStatus(overallHealth)

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={22} />
            Component Health Summary
          </CardTitle>
          <Badge className={`${overallStatus.bg} ${overallStatus.color} ${overallStatus.border} border`}>
            {overallHealth}% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Compact Overview - Always Visible */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {healthData.map((component) => {
            const Icon = component.icon
            const status = getHealthStatus(component.healthScore)
            return (
              <div
                key={component.id}
                className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} className="text-cyan-400" />
                  <Badge className={`${status.bg} ${status.color} ${status.border} text-xs border`}>
                    {component.riskLevel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-1">{component.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold ${status.color}`}>
                    {component.healthScore}
                  </span>
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <Progress value={component.healthScore} className="h-1.5 mt-2" />
              </div>
            )
          })}
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-3 pt-4 border-t border-slate-700/30">
            {healthData.map((component) => {
              const Icon = component.icon
              const status = getHealthStatus(component.healthScore)
              return (
                <div
                  key={component.id}
                  className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className="text-cyan-400" />
                      <h3 className="text-sm font-semibold text-slate-200">{component.name}</h3>
                    </div>
                    <Badge className={`${status.bg} ${status.color} ${status.border} text-xs border`}>
                      {component.riskLevel} Risk
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Health Score</span>
                        <span className={`text-xs font-semibold ${status.color}`}>
                          {component.healthScore}%
                        </span>
                      </div>
                      <Progress value={component.healthScore} className="h-2" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Trend: {component.trend}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          {expanded ? "Show Less" : "View Detailed Breakdown"}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </CardContent>
    </Card>
  )
}
