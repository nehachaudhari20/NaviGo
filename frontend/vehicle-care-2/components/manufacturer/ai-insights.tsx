"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Zap, FileText, Search, Target, Building2, Activity } from "lucide-react"
import { useState } from "react"

// Mock data from service centers (RCA & CAPA)
const serviceCenterData = {
  rcaFindings: [
    {
      id: "RCA-001",
      component: "Brake Pads",
      rootCause: "Material degradation due to excessive heat cycles",
      frequency: 47,
      serviceCenters: ["Mumbai", "Delhi", "Bangalore"],
      severity: "critical",
      pattern: "Recurring across multiple batches",
    },
    {
      id: "RCA-002",
      component: "Battery Pack",
      rootCause: "Inconsistent cell quality from supplier batch",
      frequency: 32,
      serviceCenters: ["Delhi", "Chennai"],
      severity: "high",
      pattern: "Batch-specific issue",
    },
    {
      id: "RCA-003",
      component: "Transmission",
      rootCause: "Insufficient lubrication in specific operating conditions",
      frequency: 18,
      serviceCenters: ["Bangalore", "Hyderabad"],
      severity: "medium",
      pattern: "Environmental factor",
    },
  ],
  capaActions: [
    {
      id: "CAPA-001",
      component: "Brake Pads",
      correctiveAction: "Replace with high-temperature rated ceramic compound",
      preventiveAction: "Update supplier specifications and quality control",
      status: "in-progress",
      affectedVehicles: 234,
      serviceCenter: "Mumbai Service Center",
    },
    {
      id: "CAPA-002",
      component: "Battery Pack",
      correctiveAction: "Replace affected battery packs under warranty",
      preventiveAction: "Implement stricter incoming quality inspection",
      status: "open",
      affectedVehicles: 156,
      serviceCenter: "Delhi Service Center",
    },
  ],
  trends: {
    criticalRCAs: 2,
    pendingCAPAs: 1,
    resolvedThisMonth: 5,
    avgResolutionTime: "12 days",
  },
}

const generateAIInsights = () => {
  const insights = [
    {
      type: "rca",
      title: "Root Cause Pattern Detected",
      description: `"${serviceCenterData.rcaFindings[0].rootCause}" - Affecting ${serviceCenterData.rcaFindings[0].frequency} vehicles across ${serviceCenterData.rcaFindings[0].serviceCenters.length} service centers`,
      component: serviceCenterData.rcaFindings[0].component,
      confidence: 94,
      impact: "high",
      icon: Search,
      color: "red",
      details: {
        pattern: serviceCenterData.rcaFindings[0].pattern,
        serviceCenters: serviceCenterData.rcaFindings[0].serviceCenters.join(", "),
      },
    },
    {
      type: "capa",
      title: "CAPA Action Required",
      description: `${serviceCenterData.capaActions[0].correctiveAction} - ${serviceCenterData.capaActions[0].affectedVehicles} vehicles affected`,
      component: serviceCenterData.capaActions[0].component,
      confidence: 91,
      impact: "high",
      icon: Target,
      color: "orange",
      details: {
        status: serviceCenterData.capaActions[0].status,
        serviceCenter: serviceCenterData.capaActions[0].serviceCenter,
      },
    },
    {
      type: "trend",
      title: "RCA Resolution Trend",
      description: `${serviceCenterData.trends.resolvedThisMonth} issues resolved this month. Average resolution time: ${serviceCenterData.trends.avgResolutionTime}`,
      confidence: 88,
      impact: "medium",
      icon: TrendingUp,
      color: "green",
      details: {
        criticalPending: serviceCenterData.trends.criticalRCAs,
      },
    },
    {
      type: "prediction",
      title: "Quality Prediction",
      description: "AI predicts 15% reduction in defects for next batch based on CAPA implementation",
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
      icon: Activity,
      color: "blue",
    },
    {
      type: "alert",
      title: "Multiple Service Centers Affected",
      description: `${serviceCenterData.trends.criticalRCAs} critical RCA findings require immediate attention across service centers`,
      confidence: 95,
      impact: "high",
      icon: AlertTriangle,
      color: "yellow",
      details: {
        serviceCenters: serviceCenterData.rcaFindings.map(r => r.serviceCenters).flat().filter((v, i, a) => a.indexOf(v) === i).join(", "),
      },
    },
  ]
  return insights
}

export default function AIInsights() {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  const aiInsights = generateAIInsights()

  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
    green: "text-green-400 bg-green-500/20 border-green-500/30",
    yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    red: "text-red-400 bg-red-500/20 border-red-500/30",
    orange: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "rca":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">RCA</Badge>
      case "capa":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">CAPA</Badge>
      case "trend":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Trend</Badge>
      default:
        return null
    }
  }

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
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              <Building2 size={10} className="mr-1" />
              Service Centers
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3 max-h-[600px] overflow-y-auto">
        {aiInsights.map((insight, index) => {
          const Icon = insight.icon
          const isExpanded = expandedInsight === insight.type + index
          const hasDetails = insight.details || insight.component
          
          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
              onClick={() => hasDetails && setExpandedInsight(isExpanded ? null : insight.type + index)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${colorClasses[insight.color as keyof typeof colorClasses]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                      {getTypeBadge(insight.type)}
                    </div>
                    <Badge className="bg-white/10 text-gray-300 text-xs border-white/20">
                      {insight.confidence}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{insight.description}</p>
                  
                  {insight.component && (
                    <div className="mb-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        <FileText size={10} className="mr-1" />
                        {insight.component}
                      </Badge>
                    </div>
                  )}

                  {isExpanded && insight.details && (
                    <div className="mt-2 p-2 bg-white/5 rounded border border-white/10 space-y-1.5">
                      {insight.details.pattern && (
                        <div className="text-xs">
                          <span className="text-gray-400">Pattern: </span>
                          <span className="text-white font-medium">{insight.details.pattern}</span>
                        </div>
                      )}
                      {insight.details.serviceCenters && (
                        <div className="text-xs">
                          <span className="text-gray-400">Service Centers: </span>
                          <span className="text-white font-medium">{insight.details.serviceCenters}</span>
                        </div>
                      )}
                      {insight.details.status && (
                        <div className="text-xs">
                          <span className="text-gray-400">Status: </span>
                          <span className={`font-medium ${
                            insight.details.status === "in-progress" ? "text-yellow-400" :
                            insight.details.status === "open" ? "text-red-400" : "text-green-400"
                          }`}>
                            {insight.details.status}
                          </span>
                        </div>
                      )}
                      {insight.details.serviceCenter && (
                        <div className="text-xs">
                          <span className="text-gray-400">From: </span>
                          <span className="text-white font-medium">{insight.details.serviceCenter}</span>
                        </div>
                      )}
                      {insight.details.criticalPending && (
                        <div className="text-xs">
                          <span className="text-gray-400">Critical RCAs Pending: </span>
                          <span className="text-red-400 font-medium">{insight.details.criticalPending}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      insight.impact === "high" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {insight.impact === "high" ? "High Impact" : "Medium Impact"}
                    </span>
                    {hasDetails && (
                      <span className="text-xs text-gray-500">
                        {isExpanded ? "Click to collapse" : "Click for details"}
                      </span>
                    )}
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

