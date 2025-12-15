"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, BarChart3 } from "lucide-react"

interface AnalyticsSummaryProps {
  analytics: {
    anomalies: number
    accuracy: string
    dataPoints: string
    latency: string
    savings: string
    falsePositive: string
  }
}

export default function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
          <BarChart3 className="text-cyan-400" size={20} />
          AI Analytics Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Anomalies Detected", value: analytics.anomalies },
            { label: "Avg Prediction Accuracy", value: analytics.accuracy },
            { label: "Data Points Processed", value: analytics.dataPoints },
            { label: "Processing Latency", value: analytics.latency },
            { label: "Potential Savings", value: analytics.savings },
            { label: "False Positive Rate", value: analytics.falsePositive },
          ].map((metric, i) => (
            <div key={i} className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
              <div className="text-slate-400 text-xs uppercase mb-1">{metric.label}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-green-500/10 border-l-4 border-green-500 rounded-lg p-4">
          <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
            <CheckCircle size={16} />
            Preventive Success Story
          </div>
          <div className="text-slate-300 text-sm leading-relaxed">
            You've completed 5 preventive services over 7 months. This proactive approach has prevented 2 emergency breakdowns (estimated ₹67,200+ in emergency costs). Your ROI: 1,058% - every ₹1 spent on preventive service saves ₹10.58 in potential emergency repairs.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

