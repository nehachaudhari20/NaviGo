"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, TrendingUp, Shield, Zap } from "lucide-react"

export default function CustomerValue() {
  const valueMetrics = [
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

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Your Value Dashboard
          </CardTitle>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
            Active
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          See how AI-powered maintenance is saving you time and money
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {valueMetrics.map((metric, idx) => {
            const Icon = metric.icon
            const colorClasses = {
              blue: "text-blue-600 bg-blue-100",
              green: "text-green-600 bg-green-100",
              purple: "text-purple-600 bg-purple-100",
              orange: "text-orange-600 bg-orange-100"
            }
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
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
        <div className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-xs font-medium opacity-90 mb-2">Total Value This Year</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">$2,400+</span>
            <span className="text-sm opacity-75">saved in time & costs</span>
          </div>
          <p className="text-xs mt-2 opacity-75">
            Plus improved vehicle reliability and peace of mind
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
