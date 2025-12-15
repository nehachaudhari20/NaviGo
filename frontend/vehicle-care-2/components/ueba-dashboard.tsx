"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Activity, Users, MessageSquare, Shield } from "lucide-react"
import { uebaService } from "@/lib/analytics"

interface AnalyticsSummary {
  totalInteractions: number
  anomaliesDetected: number
  avgRiskScore: number
  recentLogins: number
  highRiskEvents: number
}

export default function UEBADashboard() {
  const [metrics, setMetrics] = useState<AnalyticsSummary>({
    totalInteractions: 0,
    anomaliesDetected: 0,
    avgRiskScore: 0,
    recentLogins: 0,
    highRiskEvents: 0,
  })

  const [recentEvents, setRecentEvents] = useState<any[]>([])

  useEffect(() => {
    // Load initial data
    updateMetrics()

    // Refresh metrics every 30 seconds
    const interval = setInterval(updateMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  const updateMetrics = () => {
    const summary = uebaService.getAnalyticsSummary()
    setMetrics(summary)
    
    const events = uebaService.getRecentEvents().slice(-10).reverse()
    setRecentEvents(events)
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400 bg-red-500/20"
    if (score >= 40) return "text-orange-400 bg-orange-500/20"
    return "text-green-400 bg-green-500/20"
  }

  const getRiskLabel = (score: number) => {
    if (score >= 70) return "High"
    if (score >= 40) return "Medium"
    return "Low"
  }

  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <MessageSquare className="text-cyan-400" size={18} />
              Chat Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{metrics.totalInteractions}</div>
            <p className="text-xs text-slate-400 mt-1">Total agent interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Users className="text-blue-400" size={18} />
              User Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{metrics.recentLogins}</div>
            <p className="text-xs text-slate-400 mt-1">Recent authentication events</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <AlertTriangle className="text-orange-400" size={18} />
              Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{metrics.anomaliesDetected}</div>
            <p className="text-xs text-slate-400 mt-1">Behavioral anomalies detected</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <TrendingUp className="text-green-400" size={18} />
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {metrics.avgRiskScore.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Overall risk assessment</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Shield className="text-red-400" size={18} />
              High Risk Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{metrics.highRiskEvents}</div>
            <p className="text-xs text-slate-400 mt-1">Events requiring attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Activity className="text-purple-400" size={18} />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Active
            </Badge>
            <p className="text-xs text-slate-400 mt-2">UEBA monitoring active</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            Recent Agent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <Activity className="mx-auto mb-2 opacity-50" size={32} />
              <p>No events recorded yet</p>
              <p className="text-xs mt-1">Activity will appear here as users interact with the system</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                        {formatEventType(event.eventType)}
                      </Badge>
                      {event.entityType && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {event.entityType}
                        </Badge>
                      )}
                      {event.riskScore !== undefined && event.riskScore > 0 && (
                        <Badge className={getRiskColor(event.riskScore)}>
                          Risk: {getRiskLabel(event.riskScore)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mt-2">
                      User: {event.userId}
                    </p>
                    {event.metadata?.intent && (
                      <p className="text-xs text-slate-400 mt-1">
                        Intent: {event.metadata.intent}
                      </p>
                    )}
                    {event.metadata?.responseTime && (
                      <p className="text-xs text-slate-400">
                        Response Time: {event.metadata.responseTime}ms
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Analysis Chart Placeholder */}
      <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={20} />
            Behavioral Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Chat Interactions</span>
                <span className="text-sm font-semibold text-cyan-400">
                  {((metrics.totalInteractions / Math.max(metrics.totalInteractions + metrics.recentLogins, 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full"
                  style={{ 
                    width: `${(metrics.totalInteractions / Math.max(metrics.totalInteractions + metrics.recentLogins, 1)) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Risk Level</span>
                <span className={`text-sm font-semibold ${getRiskColor(metrics.avgRiskScore).split(' ')[0]}`}>
                  {getRiskLabel(metrics.avgRiskScore)}
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.avgRiskScore >= 70 
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : metrics.avgRiskScore >= 40
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${metrics.avgRiskScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">System Health</span>
                <span className="text-sm font-semibold text-green-400">Excellent</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  style={{ width: '94%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
