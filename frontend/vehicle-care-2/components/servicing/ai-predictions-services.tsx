"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, AlertTriangle, TrendingUp, Clock, CheckCircle2, Calendar, ArrowRight, Sparkles } from "lucide-react"
import ConfidenceIndicator from "@/components/service-center/confidence-indicator"

interface AIPredictionService {
  id: number
  component: string
  issue: string
  serviceName: string
  severity: "critical" | "high" | "medium" | "low"
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  confidence: number
  predictedDate: string
  impact: string
  recommendation: string
  status: "active" | "resolved" | "monitoring"
  // Service details
  km?: string
  cost?: string
  time?: string
  why?: string
  benefit?: string
}

interface AIPredictionsServicesProps {
  predictions: AIPredictionService[]
}

export default function AIPredictionsServices({ predictions }: AIPredictionsServicesProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { 
          color: "red", 
          bg: "bg-red-500/20", 
          border: "border-red-500/30", 
          text: "text-red-400", 
          label: "Critical",
          priorityBg: "bg-red-500/20",
          priorityText: "text-red-600"
        }
      case "high":
        return { 
          color: "orange", 
          bg: "bg-orange-500/20", 
          border: "border-orange-500/30", 
          text: "text-orange-400", 
          label: "High",
          priorityBg: "bg-yellow-500/20",
          priorityText: "text-yellow-600"
        }
      case "medium":
        return { 
          color: "yellow", 
          bg: "bg-yellow-500/20", 
          border: "border-yellow-500/30", 
          text: "text-yellow-400", 
          label: "Medium",
          priorityBg: "bg-blue-500/20",
          priorityText: "text-blue-600"
        }
      default:
        return { 
          color: "blue", 
          bg: "bg-blue-500/20", 
          border: "border-blue-500/30", 
          text: "text-blue-400", 
          label: "Low",
          priorityBg: "bg-blue-500/20",
          priorityText: "text-blue-600"
        }
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

  const activePredictions = predictions.filter(p => p.status === "active")
  const criticalCount = activePredictions.filter(p => p.severity === "critical" || p.priority === "URGENT").length
  const highCount = activePredictions.filter(p => p.severity === "high" || p.priority === "HIGH").length
  const avgConfidence = Math.round(
    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
  )

  // Sort by priority: URGENT > HIGH > MEDIUM > LOW
  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  const sortedPredictions = [...predictions].sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    if (priorityDiff !== 0) return priorityDiff
    return b.confidence - a.confidence // Higher confidence first
  })

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
                AI-Predicted Issues & Recommended Services
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-semibold">
                  {activePredictions.length} Active
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Priority-ordered by AI • Machine learning predictions based on telemetry data
              </p>
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
            <div className="text-xs text-red-400 uppercase tracking-wide mb-1">URGENT / Critical</div>
            <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-xs text-slate-500 mt-1">Requires immediate attention</div>
          </div>
          <div className="bg-orange-500/10 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 shadow-md">
            <div className="text-xs text-orange-400 uppercase tracking-wide mb-1">HIGH Priority</div>
            <div className="text-2xl font-bold text-orange-400">{highCount}</div>
            <div className="text-xs text-slate-500 mt-1">Schedule within 7 days</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20 shadow-md">
            <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-blue-400">{avgConfidence}%</div>
            <div className="text-xs text-slate-500 mt-1">AI prediction accuracy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedPredictions.map((prediction) => {
            const severityConfig = getSeverityConfig(prediction.severity)
            const statusConfig = getStatusConfig(prediction.status)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={prediction.id}
                className={`bg-slate-900/30 backdrop-blur-sm rounded-lg p-5 border-l-4 ${severityConfig.border} hover:bg-slate-900/50 transition-all shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className={`p-2 ${severityConfig.bg} rounded-lg border ${severityConfig.border}`}>
                        <AlertTriangle className={severityConfig.text} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`${severityConfig.priorityBg} ${severityConfig.priorityText} border ${severityConfig.border} text-xs font-semibold`}>
                            {prediction.priority}
                          </Badge>
                          <h3 className="text-lg font-semibold text-slate-100">{prediction.serviceName || prediction.component}</h3>
                          <Badge className={`${severityConfig.bg} ${severityConfig.text} ${severityConfig.border} border text-xs font-semibold`}>
                            {severityConfig.label}
                          </Badge>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs font-semibold border border-slate-700/50`}>
                            <StatusIcon size={12} className="mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {prediction.confidence >= 85 && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex items-center gap-1">
                              <Sparkles size={10} />
                              Auto-Scheduled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-1">{prediction.issue}</p>
                        {prediction.recommendation && (
                          <p className="text-xs text-slate-400">{prediction.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ConfidenceIndicator 
                        confidence={prediction.confidence}
                        size="sm"
                      />
                    </div>
                    <div className="text-xs text-slate-400">{prediction.confidence}% confidence</div>
                  </div>
                </div>

                {/* Service Details Grid */}
                {(prediction.km || prediction.cost || prediction.time) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                    {prediction.km && (
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Distance Remaining</div>
                        <div className="text-sm font-semibold text-slate-200">{prediction.km}</div>
                      </div>
                    )}
                    {prediction.cost && (
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Cost</div>
                        <div className="text-sm font-semibold text-slate-200">{prediction.cost}</div>
                      </div>
                    )}
                    {prediction.time && (
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Duration</div>
                        <div className="text-sm font-semibold text-slate-200">{prediction.time}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Predicted Date</div>
                      <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Clock size={14} />
                        {prediction.predictedDate}
                      </div>
                    </div>
                  </div>
                )}

                {/* Why & Benefit Section */}
                {(prediction.why || prediction.benefit) && (
                  <div className={`mt-4 p-4 rounded-lg text-sm leading-relaxed ${
                    prediction.priority === "URGENT" ? "bg-red-500/10 text-red-200" : "bg-yellow-500/10 text-yellow-200"
                  }`}>
                    {prediction.why && (
                      <>
                        <strong>Why:</strong> {prediction.why}
                        {prediction.benefit && <br />}
                      </>
                    )}
                    {prediction.benefit && (
                      <>
                        <strong>Benefit:</strong> {prediction.benefit}
                      </>
                    )}
                  </div>
                )}

                {/* Impact & Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Impact</div>
                    <div className="text-sm text-slate-300">{prediction.impact}</div>
                  </div>
                  {prediction.recommendation && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Recommendation</div>
                      <div className="text-sm text-slate-300">{prediction.recommendation}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {prediction.status === "active" && (
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className={`${
                        prediction.priority === "URGENT" 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-cyan-500 hover:bg-cyan-600"
                      } text-slate-900 font-semibold`}
                    >
                      {prediction.confidence >= 85 ? (
                        <>
                          <CheckCircle2 size={14} className="mr-1.5" />
                          View Appointment
                        </>
                      ) : (
                        <>
                          <Calendar size={14} className="mr-1.5" />
                          Schedule Service
                        </>
                      )}
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
