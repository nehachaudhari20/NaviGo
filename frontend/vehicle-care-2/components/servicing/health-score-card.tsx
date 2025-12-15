"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"

interface HealthScoreCardProps {
  overall: number
  mechanical: number
  electrical: number
  tyres: number
  trend: "up" | "down" | "stable"
  trendValue: number
}

export default function HealthScoreCard({ overall, mechanical, electrical, tyres, trend, trendValue }: HealthScoreCardProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "green", bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" }
    if (score >= 80) return { label: "Good", color: "green", bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" }
    if (score >= 70) return { label: "Fair", color: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" }
    if (score >= 60) return { label: "Poor", color: "orange", bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" }
    return { label: "Critical", color: "red", bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" }
  }

  const getHealthColor = (score: number) => {
    if (score >= 85) return "from-green-500 to-emerald-500"
    if (score >= 75) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-red-600"
  }

  const overallStatus = getHealthStatus(overall)

  return (
    <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Activity className="text-cyan-400" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                Vehicle Health Score
                <Badge className={`${overallStatus.bg} ${overallStatus.text} ${overallStatus.border} border text-xs font-semibold`}>
                  {overallStatus.label}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">Real-time health assessment based on AI analysis</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Overall Health Score - Large Display */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Overall Health Score</p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${getHealthColor(overall)} bg-clip-text text-transparent`}>
                    {overall}
                  </span>
                  <span className="text-2xl text-slate-400">/100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  {trend === "up" ? (
                    <TrendingUp className="text-green-400" size={20} />
                  ) : trend === "down" ? (
                    <TrendingDown className="text-red-400" size={20} />
                  ) : (
                    <Activity className="text-slate-400" size={20} />
                  )}
                  <span className={`text-sm font-semibold ${
                    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-slate-400"
                  }`}>
                    {trend === "up" ? "+" : trend === "down" ? "-" : ""}{trendValue} from last week
                  </span>
                </div>
                <p className="text-xs text-slate-500">7-day trend</p>
              </div>
            </div>
            <div className="w-full h-4 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className={`h-full bg-gradient-to-r ${getHealthColor(overall)} transition-all duration-500 shadow-lg`}
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Mechanical", value: mechanical, icon: "⚙️" },
            { label: "Electrical", value: electrical, icon: "⚡" },
            { label: "Tyres", value: tyres, icon: "🛞" },
            { label: "Overall", value: overall, icon: "📊" },
          ].map((category) => {
            const status = getHealthStatus(category.value)
            return (
              <div key={category.label} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">{category.label}</span>
                  </div>
                  <Badge className={`${status.bg} ${status.text} ${status.border} border text-xs font-semibold px-2 py-0.5`}>
                    {status.label}
                  </Badge>
                </div>
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${status.text}`}>{category.value}</span>
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getHealthColor(category.value)} transition-all duration-500`}
                    style={{ width: `${category.value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Health Insights */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border-l-4 border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="text-green-400" size={18} />
                <span className="text-sm font-semibold text-green-400">Strengths</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Electrical systems operating optimally (91/100)</li>
                <li>• Mechanical components in good condition (84/100)</li>
                <li>• Overall health above industry average</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-400" size={18} />
                <span className="text-sm font-semibold text-yellow-400">Areas for Attention</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Tyre health below optimal (78/100)</li>
                <li>• Monitor brake system wear patterns</li>
                <li>• Schedule preventive maintenance soon</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

