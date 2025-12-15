"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react"

const aiInsights = [
  {
    type: "prediction",
    title: "Quality Prediction",
    description: "AI predicts 15% reduction in defects for next batch",
    confidence: 92,
    impact: "high",
    icon: Brain,
    color: "cyan",
  },
  {
    type: "optimization",
    title: "Production Optimization",
    description: "Recommended shift adjustment to reduce waste by 8%",
    confidence: 88,
    impact: "medium",
    icon: TrendingUp,
    color: "green",
  },
  {
    type: "alert",
    title: "Anomaly Detected",
    description: "Unusual pattern in Line 3 production metrics",
    confidence: 95,
    impact: "high",
    icon: AlertTriangle,
    color: "yellow",
  },
  {
    type: "recommendation",
    title: "Maintenance Schedule",
    description: "AI recommends preventive maintenance for Line 2",
    confidence: 85,
    impact: "medium",
    icon: CheckCircle2,
    color: "blue",
  },
]

export default function AIInsights() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
              <Brain className="text-cyan-400" size={20} />
            </div>
            <CardTitle className="text-white text-lg">AI Insights</CardTitle>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3">
        {aiInsights.map((insight, index) => {
          const Icon = insight.icon
          const colorClasses = {
            cyan: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
            green: "text-green-400 bg-green-500/20 border-green-500/30",
            yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
            blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
          }
          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${colorClasses[insight.color as keyof typeof colorClasses]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                    <Badge className="bg-white/10 text-gray-300 text-xs border-white/20">
                      {insight.confidence}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      insight.impact === "high" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {insight.impact === "high" ? "High Impact" : "Medium Impact"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

