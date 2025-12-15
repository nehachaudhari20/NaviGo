"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, Target, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ROIMetrics() {
  const metrics = {
    timeSavings: {
      value: 2250,
      target: 2500,
      unit: "hours/year",
      savings: "$67,500",
      trend: "+12%",
      trendUp: true
    },
    productivity: {
      value: 38,
      target: 40,
      unit: "% increase",
      revenue: "$125,000",
      trend: "+5%",
      trendUp: true
    },
    costReduction: {
      value: 52000,
      target: 60000,
      unit: "$/year",
      savings: "$52,000",
      trend: "+8%",
      trendUp: true
    },
    revenueGrowth: {
      value: 105000,
      target: 120000,
      unit: "$/year",
      growth: "$105,000",
      trend: "+15%",
      trendUp: true
    },
    totalROI: {
      value: 249500,
      target: 405000,
      unit: "$/year",
      percentage: 416,
      trend: "+18%",
      trendUp: true
    }
  }

  const dimensions = [
    {
      name: "Time Savings",
      icon: Clock,
      value: metrics.timeSavings.value,
      target: metrics.timeSavings.target,
      savings: metrics.timeSavings.savings,
      trend: metrics.timeSavings.trend,
      trendUp: metrics.timeSavings.trendUp,
      color: "bg-blue-500"
    },
    {
      name: "Productivity Gains",
      icon: Zap,
      value: metrics.productivity.value,
      target: metrics.productivity.target,
      savings: metrics.productivity.revenue,
      trend: metrics.productivity.trend,
      trendUp: metrics.productivity.trendUp,
      color: "bg-green-500"
    },
    {
      name: "Cost Reduction",
      icon: DollarSign,
      value: metrics.costReduction.value,
      target: metrics.costReduction.target,
      savings: `$${(metrics.costReduction.value / 1000).toFixed(0)}K`,
      trend: metrics.costReduction.trend,
      trendUp: metrics.costReduction.trendUp,
      color: "bg-purple-500"
    },
    {
      name: "Revenue Growth",
      icon: TrendingUp,
      value: metrics.revenueGrowth.value,
      target: metrics.revenueGrowth.target,
      savings: `$${(metrics.revenueGrowth.value / 1000).toFixed(0)}K`,
      trend: metrics.revenueGrowth.trend,
      trendUp: metrics.revenueGrowth.trendUp,
      color: "bg-orange-500"
    }
  ]

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            ROI Metrics Dashboard
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            {metrics.totalROI.percentage}% ROI
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Five-dimensional value measurement across time, productivity, cost, revenue, and strategy
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total ROI Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Total Annual ROI</span>
            <Badge className="bg-white/20 text-white border-white/30">
              {metrics.totalROI.trend}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ${(metrics.totalROI.value / 1000).toFixed(0)}K
            </span>
            <span className="text-sm opacity-75">/ year</span>
          </div>
          <Progress 
            value={(metrics.totalROI.value / metrics.totalROI.target) * 100} 
            className="mt-3 h-2 bg-white/20"
          />
          <p className="text-xs mt-2 opacity-75">
            Target: ${(metrics.totalROI.target / 1000).toFixed(0)}K | Payback: 3.2 months
          </p>
        </div>

        {/* Four Dimensions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {dimensions.map((dim, idx) => {
            const Icon = dim.icon
            const percentage = (dim.value / dim.target) * 100
            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">{dim.name}</span>
                  </div>
                  {dim.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">{dim.value}</span>
                    <span className="text-xs text-gray-500">/{dim.target}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-600">{dim.savings}</div>
                  <Progress value={percentage} className="h-1.5 mt-2" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{percentage.toFixed(0)}% of target</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${dim.trendUp ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'}`}
                    >
                      {dim.trend}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Strategic Value Indicator */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Strategic Differentiation</p>
              <p className="text-xs text-gray-600">
                Market leadership position • 4.8/5.0 customer satisfaction • Scalable platform
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
              Priceless
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
