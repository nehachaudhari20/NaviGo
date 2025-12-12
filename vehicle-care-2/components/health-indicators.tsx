"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Settings, Zap, Battery, AlertCircle, Clock, TrendingUp } from "lucide-react"
import Image from "next/image"

const healthData = [
  {
    id: "engine",
    name: "Engine Health",
    icon: Settings,
    image: "/engine-health.png",
    riskLevel: "Low",
    riskColor: "green",
    healthScore: 84,
    lastAnomaly: "12 days ago",
    nextReview: "In 5 days",
    trend: "stable",
  },
  {
    id: "transmission",
    name: "Transmission & PTO",
    icon: Zap,
    image: "/transmission-pto.png",
    riskLevel: "Medium",
    riskColor: "yellow",
    healthScore: 78,
    lastAnomaly: "3 days ago",
    nextReview: "Tomorrow",
    trend: "declining",
  },
  {
    id: "battery",
    name: "Battery System",
    icon: Battery,
    image: "/battery-system.png",
    riskLevel: "Low",
    riskColor: "green",
    healthScore: 91,
    lastAnomaly: "25 days ago",
    nextReview: "In 8 days",
    trend: "stable",
  },
  {
    id: "brakes",
    name: "Tyres & Brakes",
    icon: AlertCircle,
    image: "/brake-system.png",
    riskLevel: "Medium",
    riskColor: "yellow",
    healthScore: 72,
    lastAnomaly: "8 days ago",
    nextReview: "In 3 days",
    trend: "declining",
  },
]

export default function HealthIndicators() {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <TrendingUp className="text-cyan-400" size={22} />
          Health Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.map((component) => {
            const Icon = component.icon
            const getHealthStatus = (score: number) => {
              if (score >= 80) return { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/20" }
              if (score >= 60) return { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/20" }
              return { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/20" }
            }
            const status = getHealthStatus(component.healthScore)

            return (
              <Card
                key={component.id}
                className="bg-slate-900/30 backdrop-blur-sm border-slate-700/30 hover:border-cyan-500/40 transition-all group overflow-hidden shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 flex-shrink-0">
                      <Image
                        src={component.image}
                        alt={component.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={18} className="text-cyan-400" />
                          <h3 className="text-sm font-semibold text-slate-200 truncate">{component.name}</h3>
                        </div>
                        <Badge
                          className={`${status.bg} ${status.color} ${status.border} text-xs border`}
                        >
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
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            <span>Last: {component.lastAnomaly}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <TrendingUp size={12} />
                            <span>Next: {component.nextReview}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
