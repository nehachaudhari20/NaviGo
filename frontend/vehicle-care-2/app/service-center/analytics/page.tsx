"use client"

import { useState } from "react"
import { Suspense } from "react"
import ServiceCenterSidebar from "@/components/service-center/sidebar"
import ServiceCenterHeader from "@/components/service-center/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Brain,
  Sparkles,
  AlertCircle,
  Target,
  Activity,
  Calendar,
  Download
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from "recharts"

const revenueData = [
  { month: "Jan", actual: 145000, predicted: 150000 },
  { month: "Feb", actual: 162000, predicted: 165000 },
  { month: "Mar", actual: 178000, predicted: 180000 },
  { month: "Apr", actual: 195000, predicted: 192000 },
  { month: "May", actual: 210000, predicted: 208000 },
  { month: "Jun", actual: 225000, predicted: 230000 },
  { month: "Jul", predicted: 245000 },
  { month: "Aug", predicted: 260000 },
  { month: "Sep", predicted: 250000 },
]

const serviceTypeData = [
  { name: "Full Service", value: 35, color: "#3b82f6" },
  { name: "Oil Change", value: 25, color: "#10b981" },
  { name: "Brake Service", value: 20, color: "#f59e0b" },
  { name: "AC Service", value: 12, color: "#ef4444" },
  { name: "Battery", value: 8, color: "#a855f7" },
]

const efficiencyTrend = [
  { week: "Week 1", efficiency: 82, aiOptimized: 85 },
  { week: "Week 2", efficiency: 85, aiOptimized: 88 },
  { week: "Week 3", efficiency: 87, aiOptimized: 90 },
  { week: "Week 4", efficiency: 89, aiOptimized: 92 },
  { week: "Week 5", efficiency: 91, aiOptimized: 94 },
  { week: "Week 6", efficiency: 92, aiOptimized: 95 },
]

const aiInsights = [
  {
    type: "revenue",
    title: "Revenue Forecast",
    message: "AI predicts 12% revenue growth next quarter",
    impact: "high",
    recommendation: "Increase capacity by 15% to capture growth",
  },
  {
    type: "efficiency",
    title: "Efficiency Optimization",
    message: "AI scheduling can improve efficiency by 8%",
    impact: "medium",
    recommendation: "Implement AI-powered scheduling for peak hours",
  },
  {
    type: "demand",
    title: "Demand Prediction",
    message: "Peak demand expected in August - prepare resources",
    impact: "high",
    recommendation: "Hire 2 temporary technicians for August",
  },
]

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month")

  return (
    <div className="flex h-screen bg-gray-50">
      <ServiceCenterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ServiceCenterHeader />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics & Insights</h1>
                  <p className="text-sm text-gray-600">AI-powered analytics and predictive insights</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export Report
                  </Button>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={timeRange === "week" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeRange("week")}
                      className="text-xs"
                    >
                      Week
                    </Button>
                    <Button
                      variant={timeRange === "month" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeRange("month")}
                      className="text-xs"
                    >
                      Month
                    </Button>
                    <Button
                      variant={timeRange === "quarter" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeRange("quarter")}
                      className="text-xs"
                    >
                      Quarter
                    </Button>
                    <Button
                      variant={timeRange === "year" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeRange("year")}
                      className="text-xs"
                    >
                      Year
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">₹2.25L</div>
                  <div className="text-xs text-gray-600 mb-2">This Month</div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp size={12} />
                    <span>+12% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
                  <div className="text-xs text-gray-600 mb-2">Completed</div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <TrendingUp size={12} />
                    <span>+8% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target size={18} className="text-purple-600" />
                    Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">92%</div>
                  <div className="text-xs text-gray-600 mb-2">Average</div>
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    <TrendingUp size={12} />
                    <span>+5% with AI optimization</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users size={18} className="text-orange-600" />
                    Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">856</div>
                  <div className="text-xs text-gray-600 mb-2">Active</div>
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <TrendingUp size={12} />
                    <span>+15% growth</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h2>
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  Intelligent Analysis
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => (
                  <Card
                    key={idx}
                    className={`border-2 ${
                      insight.impact === "high"
                        ? "border-red-200 bg-red-50/30"
                        : "border-purple-200 bg-purple-50/30"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-gray-900">{insight.title}</CardTitle>
                        <Badge
                          className={`text-xs ${
                            insight.impact === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{insight.message}</p>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-medium text-gray-900 mb-1">Recommendation:</p>
                        <p className="text-xs text-gray-600">{insight.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Forecast */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Brain size={18} className="text-purple-600" />
                      Revenue Forecast
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                      AI Predicted
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="#10b981"
                          fill="url(#revenueGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke="#a855f7"
                          fill="url(#predictedGradient)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-gray-600">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500 border-2 border-dashed"></div>
                      <span className="text-gray-600">AI Forecast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Type Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Service Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Efficiency Trend */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Efficiency Trend (AI Optimized vs Actual)
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                    +8% Improvement
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={efficiencyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="aiOptimized"
                        stroke="#a855f7"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="AI Optimized"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-600">Actual Efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500 border-2 border-dashed"></div>
                    <span className="text-gray-600">AI Optimized Potential</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  )
}
