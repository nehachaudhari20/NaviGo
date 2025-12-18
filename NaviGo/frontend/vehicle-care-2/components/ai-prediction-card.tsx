"use client"

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
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import ConfidenceIndicator from "@/components/service-center/confidence-indicator"

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
}

interface AIPredictionCardProps {
  predictions?: AIPrediction[]
}

export default function AIPredictionCard({ predictions }: AIPredictionCardProps) {
  const router = useRouter()

  // Mock data if not provided
  const mockPredictions: AIPrediction[] = predictions || [
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
    },
    {
      id: "PRED-002",
      component: "Battery",
      issueType: "Degradation Pattern",
      predictedDate: "2024-10-15",
      timeToFailure: "30-35 days",
      severity: "medium",
      confidence: 82,
      recommendedAction: "Schedule battery health check in next 2 weeks",
      urgency: "Medium Priority",
    },
  ]

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
      // High confidence - show auto-scheduled notification
      router.push(`/support?action=view-appointment&predictionId=${prediction.id}`)
    } else {
      // Low confidence - manual scheduling
      router.push(`/support?action=schedule&predictionId=${prediction.id}`)
    }
  }

  return (
    <Card className="border-cyan-500/30 bg-slate-800/40 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Brain size={20} className="text-cyan-500" />
            AI Predictions & Recommendations
          </CardTitle>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
            {mockPredictions.length} Active
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          AI-powered predictions based on your vehicle's telematics data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockPredictions.map((prediction) => (
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
        ))}

        {mockPredictions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-400">No active predictions</p>
            <p className="text-xs text-slate-500 mt-1">Your vehicle is in good health!</p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-700/30">
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
      </CardContent>
    </Card>
  )
}

