"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  AlertTriangle, 
  Clock, 
  Calendar,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Eye,
  HelpCircle,
  Shield,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ConfidenceIndicator from "@/components/service-center/confidence-indicator"
import { getCustomerPredictions, type DiagnosisCase } from "@/lib/api/dashboard-data"
import { useDiagnosisCases, useAnomalyCases } from "@/hooks/use-agent-data"

interface AIPrediction {
  id: string
  component: string
  issueType: string
  predictedDate: string
  timeToFailure: string
  severity: "critical" | "high" | "medium" | "low"
  confidence: number
  recommendedAction: string
  urgency: string
  reasoning?: string
  dataSource?: string
}

const MOCK_PREDICTIONS: AIPrediction[] = [
  {
    id: "PRED-001",
    component: "Brake Pads",
    issueType: "Excessive Wear Detected",
    predictedDate: "2024-09-18",
    timeToFailure: "2-3 days",
    severity: "critical",
    confidence: 95,
    recommendedAction: "Schedule brake pad replacement within 48 hours",
    urgency: "High Priority",
    reasoning: "Based on 3 similar vehicles showing brake pad wear at 85%",
    dataSource: "Telematics data from last 30 days"
  },
  {
    id: "PRED-002",
    component: "Battery",
    issueType: "Voltage Drop Pattern",
    predictedDate: "2024-10-05",
    timeToFailure: "30-35 days",
    severity: "medium",
    confidence: 78,
    recommendedAction: "Schedule battery health check",
    urgency: "Medium Priority",
    reasoning: "Battery voltage showing gradual decline over past 2 weeks",
    dataSource: "BMS telemetry data"
  },
  {
    id: "PRED-003",
    component: "Tire Pressure",
    issueType: "Slow Leak Detected",
    predictedDate: "2024-09-25",
    timeToFailure: "5-7 days",
    severity: "high",
    confidence: 82,
    recommendedAction: "Inspect and repair tire leak",
    urgency: "High Priority",
    reasoning: "Front right tire showing consistent pressure drop",
    dataSource: "TPMS sensor data"
  }
]

export default function AIPredictionsTransparent() {
  const router = useRouter()
  const { user } = useAuth()
  const vehicleId = user?.vehicleId || "MH-07-AB-1234"
  const [predictions, setPredictions] = useState<AIPrediction[]>(MOCK_PREDICTIONS)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // Use real-time subscription to diagnosis cases and anomaly cases
  const { data: diagnosisCases, loading: diagnosisLoading } = useDiagnosisCases(undefined, vehicleId, true)
  const { data: anomalyCases, loading: anomalyLoading } = useAnomalyCases(vehicleId, true)
  const dataLoading = diagnosisLoading || anomalyLoading

  // Quick initial loading - show mock data after 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
      // Show mock data immediately
      setPredictions(MOCK_PREDICTIONS)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Combine diagnosis cases and anomaly cases
    const allCases: any[] = []
    
    // Add diagnosis cases (active status)
    if (diagnosisCases && diagnosisCases.length > 0) {
      const activeDiagnosis = diagnosisCases.filter(c => c.status === 'active')
      allCases.push(...activeDiagnosis.map(c => ({ ...c, source: 'diagnosis' })))
    }
    
    // Add anomaly cases (pending_diagnosis or diagnosing status)
    if (anomalyCases && anomalyCases.length > 0) {
      const pendingAnomalies = anomalyCases.filter(c => 
        c.status === 'pending_diagnosis' || c.status === 'diagnosing'
      )
      allCases.push(...pendingAnomalies.map(c => ({ ...c, source: 'anomaly' })))
    }
    
    if (allCases.length === 0) {
      setPredictions(MOCK_PREDICTIONS)
      return
    }
    
    // Transform to AIPrediction format
    const transformed = allCases.map((caseItem) => {
      const createdDate = caseItem.created_at 
        ? (typeof caseItem.created_at === 'string' ? new Date(caseItem.created_at) : caseItem.created_at.toDate())
        : new Date()
      
      // Calculate predicted date based on RUL if available
      const estimatedRulDays = (caseItem as any).estimated_rul_days || 7
      const predictedDate = new Date(createdDate.getTime() + estimatedRulDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Handle both diagnosis cases and anomaly cases
      const isAnomaly = caseItem.source === 'anomaly'
      const anomalyType = isAnomaly ? caseItem.anomaly_type : null
      const severityScore = isAnomaly ? caseItem.severity_score : null
      
      // Map anomaly type to component
      const componentMap: Record<string, string> = {
        'thermal_overheat': 'Engine Coolant System',
        'oil_overheat': 'Engine Oil System',
        'battery_degradation': 'Battery',
        'low_charge': 'Battery',
        'rpm_spike': 'Engine',
        'rpm_stall': 'Engine',
        'dtc_fault': 'Diagnostic System',
        'speed_anomaly': 'Transmission',
        'gps_anomaly': 'GPS System'
      }
      
      const component = caseItem.component || (anomalyType ? componentMap[anomalyType] : 'Component')
      const issueType = caseItem.predicted_failure || 
                       (anomalyType ? `${component} anomaly detected` : 
                        caseItem.component ? `${caseItem.component} failure` : "Issue detected")
      
      // Calculate confidence from severity_score for anomalies
      let confidence = 0
      if (isAnomaly && severityScore !== null) {
        // Convert severity_score (0-1) to confidence percentage
        // Lower severity = higher confidence (inverted)
        confidence = Math.round((1 - severityScore) * 100)
      } else {
        confidence = caseItem.confidence || caseItem.confidence_score || caseItem.failure_probability 
          ? Math.round((caseItem.confidence || caseItem.confidence_score || caseItem.failure_probability) * 100) 
          : 0
      }
      
      // Map severity_score to severity level for anomalies
      let severity: "critical" | "high" | "medium" | "low" = 'medium'
      if (isAnomaly && severityScore !== null) {
        if (severityScore >= 0.7) severity = 'critical'
        else if (severityScore >= 0.4) severity = 'high'
        else if (severityScore >= 0.1) severity = 'medium'
        else severity = 'low'
      } else {
        severity = (caseItem.severity?.toLowerCase() || 'medium') as "critical" | "high" | "medium" | "low"
      }
      
      return {
        id: caseItem.case_id || caseItem.id || caseItem.diagnosis_id || caseItem.anomaly_id,
        component,
        issueType,
        predictedDate,
        timeToFailure: caseItem.estimated_rul_days 
          ? `${caseItem.estimated_rul_days} day${caseItem.estimated_rul_days !== 1 ? 's' : ''}`
          : severity === 'critical' ? "2-3 days" : severity === 'high' ? "5-7 days" : "30-35 days",
        severity,
        confidence,
        recommendedAction: `Schedule ${component} inspection`,
        urgency: severity === 'critical' ? "High Priority" : severity === 'high' ? "Medium Priority" : "Low Priority",
        reasoning: isAnomaly 
          ? `Anomaly detected: ${anomalyType || 'unknown'} (${confidence}% confidence)`
          : `Based on ${confidence}% confidence prediction`,
        dataSource: isAnomaly ? "Real-time telemetry analysis" : "Telematics and diagnostic data"
      } as AIPrediction
    })
    
    setPredictions(transformed)
  }, [diagnosisCases, anomalyCases])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-700 border-blue-300"
    }
  }

  const handleScheduleService = (prediction: AIPrediction) => {
    if (prediction.confidence >= 85) {
      router.push(`/support?action=view-appointment&predictionId=${prediction.id}`)
    } else {
      router.push(`/support?action=schedule&predictionId=${prediction.id}`)
    }
  }

  return (
    <Card className="border-cyan-500/30 bg-slate-800/40 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Brain size={20} className="text-cyan-500" />
            AI Predictions & Transparency
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              4.6/5.0 Trust
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
              {predictions.length} Active
            </Badge>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          AI-powered predictions with full transparency • Every decision explained
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-slate-300">Loading predictions...</span>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Brain size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-sm">No active predictions at this time</p>
          </div>
        ) : (
          <>
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className="p-4 rounded-xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-sm shadow-md hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-slate-100">{prediction.component}</h4>
                  <Badge className={`text-xs ${getSeverityColor(prediction.severity)}`}>
                    {prediction.severity.toUpperCase()}
                  </Badge>
                  <ConfidenceIndicator 
                    confidence={prediction.confidence}
                    size="sm"
                  />
                  {prediction.confidence >= 85 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex items-center gap-1">
                      <Sparkles size={10} />
                      Auto-Scheduled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-2">{prediction.issueType}</p>
                <p className="text-xs text-slate-400 mb-3">{prediction.recommendedAction}</p>
              </div>
            </div>

            {/* Transparency Section */}
            {(prediction.reasoning || prediction.dataSource) && (
              <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-start gap-2 mb-2">
                  <Eye className="h-4 w-4 text-cyan-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-300 mb-1">Why this recommendation?</p>
                    {prediction.reasoning && (
                      <p className="text-xs text-slate-400 mb-2">{prediction.reasoning}</p>
                    )}
                    {prediction.dataSource && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-1">Data source:</p>
                        <p className="text-xs text-slate-400">{prediction.dataSource}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={12} className="text-cyan-400" />
                  <p className="text-xs text-slate-400">Time to Failure</p>
                </div>
                <p className="text-sm font-bold text-slate-100">{prediction.timeToFailure}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={12} className="text-cyan-400" />
                  <p className="text-xs text-slate-400">Predicted Date</p>
                </div>
                <p className="text-sm font-bold text-slate-100">
                  {new Date(prediction.predictedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-yellow-400" />
                <span className="text-xs text-slate-400">{prediction.urgency}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  <HelpCircle size={12} className="mr-1" />
                  Learn More
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs"
                  onClick={() => handleScheduleService(prediction)}
                >
                  {prediction.confidence >= 85 ? (
                    <>
                      <CheckCircle2 size={12} className="mr-1.5" />
                      View Appointment
                    </>
                  ) : (
                    <>
                      <Calendar size={12} className="mr-1.5" />
                      Schedule Service
                    </>
                  )}
                  <ChevronRight size={12} className="ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Trust & Privacy Footer */}
        <div className="pt-3 border-t border-slate-700/30 space-y-2">
          <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <Shield className="h-4 w-4 text-green-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-300">Your Data is Protected</p>
              <p className="text-xs text-slate-500">We use your vehicle data only for maintenance recommendations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 text-xs"
            onClick={() => router.push("/servicing")}
          >
            View All Predictions
            <ChevronRight size={12} className="ml-1.5" />
          </Button>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
