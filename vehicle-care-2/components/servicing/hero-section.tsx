"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Settings, Zap, CircleDot, BarChart3, CheckCircle2, AlertCircle } from "lucide-react"

interface HeroSectionProps {
  vehicleInfo: {
    name: string
    variant: string
    color: string
    registration: string
    mileage: string
    serviceHistory: number
    lastService: string
    warranty: string
    image: string
  }
  healthStatus: {
    overall: number
    mechanical: number
    electrical: number
    tyres: number
  }
}

export default function HeroSection({ vehicleInfo, healthStatus }: HeroSectionProps) {
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

  const overallStatus = getHealthStatus(healthStatus.overall)

  const categories = [
    { label: "Mechanical", value: healthStatus.mechanical, icon: Settings, bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20", hoverBorder: "hover:border-cyan-500/40", textColor: "text-cyan-400" },
    { label: "Electrical", value: healthStatus.electrical, icon: Zap, bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20", hoverBorder: "hover:border-yellow-500/40", textColor: "text-yellow-400" },
    { label: "Tyres", value: healthStatus.tyres, icon: CircleDot, bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", hoverBorder: "hover:border-blue-500/40", textColor: "text-blue-400" },
    { label: "Overall", value: healthStatus.overall, icon: BarChart3, bgColor: "bg-green-500/10", borderColor: "border-green-500/20", hoverBorder: "hover:border-green-500/40", textColor: "text-green-400" },
  ]

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Car Image */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 text-center border border-slate-700/30 shadow-lg">
            <img
              src={vehicleInfo.image || "/placeholder.svg"}
              alt={vehicleInfo.name}
              className="w-full h-auto rounded-lg shadow-lg shadow-cyan-500/20"
            />
            <p className="mt-4 text-slate-400 text-xs">Pearl White | Elite Plus Variant</p>
          </div>

          {/* Vehicle Health Score Card - Professional Design */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/30">
            <CardHeader className="bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <Activity className="text-cyan-400" size={22} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      Vehicle Health Score
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Real-time health assessment based on AI analysis</p>
                  </div>
                </div>
                <Badge className={`${overallStatus.bg} ${overallStatus.text} ${overallStatus.border} border px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm`}>
                  {overallStatus.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Overall Score - Professional Display */}
              <div className="mb-6">
                <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30 overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Overall Health Score</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-bold bg-gradient-to-r ${getHealthColor(healthStatus.overall)} bg-clip-text text-transparent`}>
                            {healthStatus.overall}
                          </span>
                          <span className="text-2xl text-slate-400 font-medium">/100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <TrendingUp className="text-green-400" size={18} />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">+3</div>
                            <p className="text-xs text-slate-500 font-medium">7-day trend</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${getHealthColor(healthStatus.overall)} transition-all duration-700 shadow-lg`}
                        style={{ width: `${healthStatus.overall}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>Last updated: 2 hours ago</span>
                      <span>Next analysis: In 22 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown - Professional Grid */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Component Health Breakdown</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const status = getHealthStatus(category.value)
                    const IconComponent = category.icon
                    return (
                      <div
                        key={category.label}
                        className="group bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/20 hover:border-cyan-500/40 transition-all hover:bg-slate-800/50 shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 ${category.bgColor} rounded-lg border ${category.borderColor} ${category.hoverBorder} transition-colors`}>
                              <IconComponent className={category.textColor} size={16} />
                            </div>
                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{category.label}</span>
                          </div>
                          <Badge className={`${status.bg} ${status.text} ${status.border} border text-xs font-semibold px-2 py-0.5`}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold ${status.text}`}>{category.value}</span>
                            <span className="text-sm text-slate-500">/100</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
                          <div
                            className={`h-full bg-gradient-to-r ${getHealthColor(category.value)} transition-all duration-500`}
                            style={{ width: `${category.value}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Health Status Summary */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                  {healthStatus.overall >= 80 ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-semibold">All systems operational</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <AlertCircle size={16} />
                      <span className="text-xs font-semibold">Some components need attention</span>
                    </div>
                  )}
                  <div className="flex-1 h-px bg-slate-700/50"></div>
                  <span className="text-xs text-slate-500 font-medium">AI Confidence: 98.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
