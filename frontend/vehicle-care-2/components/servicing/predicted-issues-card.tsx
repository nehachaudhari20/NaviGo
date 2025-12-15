"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, AlertTriangle, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"

interface PredictedIssue {
  id: number
  component: string
  issue: string
  severity: "critical" | "high" | "medium" | "low"
  confidence: number
  predictedDate: string
  impact: string
  recommendation: string
  status: "active" | "resolved" | "monitoring"
}

interface PredictedIssuesCardProps {
  issues: PredictedIssue[]
}

export default function PredictedIssuesCard({ issues }: PredictedIssuesCardProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { color: "red", bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", label: "Critical" }
      case "high":
        return { color: "orange", bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", label: "High" }
      case "medium":
        return { color: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400", label: "Medium" }
      default:
        return { color: "blue", bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", label: "Low" }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "resolved":
        return { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Resolved" }
      case "monitoring":
        return { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Monitoring" }
      default:
        return { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", label: "Active" }
    }
  }

  const activeIssues = issues.filter(i => i.status === "active")
  const criticalCount = activeIssues.filter(i => i.severity === "critical").length
  const highCount = activeIssues.filter(i => i.severity === "high").length

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader className="bg-gradient-to-r from-slate-900/30 to-slate-800/20 backdrop-blur-md border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Brain className="text-purple-400" size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                AI-Predicted Issues
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-semibold">
                  {activeIssues.length} Active
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">Machine learning predictions based on telemetry data</p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-purple-500/50">
            View All
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/30">
          <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-4 border border-red-500/20 shadow-md">
            <div className="text-xs text-red-400 uppercase tracking-wide mb-1">Critical Issues</div>
            <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-xs text-slate-500 mt-1">Requires immediate attention</div>
          </div>
          <div className="bg-orange-500/10 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 shadow-md">
            <div className="text-xs text-orange-400 uppercase tracking-wide mb-1">High Priority</div>
            <div className="text-2xl font-bold text-orange-400">{highCount}</div>
            <div className="text-xs text-slate-500 mt-1">Schedule within 7 days</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20 shadow-md">
            <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(issues.reduce((sum, i) => sum + i.confidence, 0) / issues.length)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">AI prediction accuracy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {issues.map((issue) => {
            const severityConfig = getSeverityConfig(issue.severity)
            const statusConfig = getStatusConfig(issue.status)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={issue.id}
                className={`bg-slate-900/30 backdrop-blur-sm rounded-lg p-5 border-l-4 ${severityConfig.border} hover:bg-slate-900/50 transition-all shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 ${severityConfig.bg} rounded-lg border ${severityConfig.border}`}>
                        <AlertTriangle className={severityConfig.text} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-100">{issue.component}</h3>
                          <Badge className={`${severityConfig.bg} ${severityConfig.text} ${severityConfig.border} border text-xs font-semibold`}>
                            {severityConfig.label}
                          </Badge>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs font-semibold border border-slate-700/50`}>
                            <StatusIcon size={12} className="mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300">{issue.issue}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Confidence</div>
                    <div className="text-lg font-bold text-cyan-400">{issue.confidence}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Predicted Date</div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Clock size={14} />
                      {issue.predictedDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Impact</div>
                    <div className="text-sm text-slate-300">{issue.impact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Recommendation</div>
                    <div className="text-sm text-slate-300">{issue.recommendation}</div>
                  </div>
                </div>

                {issue.status === "active" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold">
                      Schedule Service
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

