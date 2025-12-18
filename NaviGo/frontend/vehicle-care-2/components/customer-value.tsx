"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, TrendingUp, Shield, Zap, Loader2 } from "lucide-react"

interface ValueMetric {
  icon: typeof Clock
  title: string
  value: string
  period: string
  description: string
  color: "blue" | "green" | "purple" | "orange"
}

const MOCK_VALUE_METRICS: ValueMetric[] = [
  {
    icon: Clock,
    title: "Time Saved",
    value: "15 hours",
    period: "this year",
    description: "Through predictive maintenance",
    color: "blue"
  },
  {
    icon: DollarSign,
    title: "Cost Avoided",
    value: "$2,400",
    period: "this year",
    description: "Prevented emergency repairs",
    color: "green"
  },
  {
    icon: TrendingUp,
    title: "Vehicle Health",
    value: "+12%",
    period: "improvement",
    description: "Better than industry average",
    color: "purple"
  },
  {
    icon: Shield,
    title: "Peace of Mind",
    value: "24/7",
    period: "monitoring",
    description: "AI watches your vehicle health",
    color: "orange"
  }
]

export default function CustomerValue() {
  const [loading, setLoading] = useState(true)
  const [valueMetrics, setValueMetrics] = useState<ValueMetric[]>(MOCK_VALUE_METRICS)
  
  // Quick loading - show mock data after 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      // TODO: Fetch real data from Firestore/API here
      // For now, use mock data
      setValueMetrics(MOCK_VALUE_METRICS)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  // TODO: Fetch real value metrics from Firestore
  // Calculate based on:
  // - Service history (time saved)
  // - Prevented repairs (cost avoided)
  // - Health score trends (vehicle health)
  // - Active monitoring status (peace of mind)

  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100"
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Your Value Dashboard
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            Active
          </Badge>
        </div>
        <p className="text-sm text-gray-700 mt-2 font-medium">
          See how AI-powered maintenance is saving you time and money
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {valueMetrics.map((metric, idx) => {
                const Icon = metric.icon
            return (
              <div
                key={idx}
                className="bg-white border border-blue-100 rounded-lg p-3 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${colorClasses[metric.color]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{metric.title}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-xs text-gray-500">{metric.period}</span>
                  </div>
                  <p className="text-xs text-gray-600">{metric.description}</p>
                </div>
              </div>
            )
              })}
            </div>

        {/* Summary */}
        <div className="mt-4 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-lg p-4 text-white border border-indigo-500/30">
          <p className="text-xs font-medium opacity-90 mb-2">Total Value This Year</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">$2,400+</span>
            <span className="text-sm opacity-75">saved in time & costs</span>
          </div>
          <p className="text-xs mt-2 opacity-75">
            Plus improved vehicle reliability and peace of mind
          </p>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
