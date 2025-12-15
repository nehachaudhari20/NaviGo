"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Brain, Calendar, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

// Simulated AI forecast data based on maintenance history and usage patterns
const forecastData = [
  { date: "Jan", actual: 45, forecast: 48, confidence: 92 },
  { date: "Feb", actual: 52, forecast: 50, confidence: 88 },
  { date: "Mar", actual: 58, forecast: 55, confidence: 90 },
  { date: "Apr", actual: 55, forecast: 58, confidence: 85 },
  { date: "May", actual: 62, forecast: 60, confidence: 87 },
  { date: "Jun", actual: 68, forecast: 65, confidence: 91 },
  { date: "Jul", forecast: 72, confidence: 89 },
  { date: "Aug", forecast: 75, confidence: 86 },
  { date: "Sep", forecast: 70, confidence: 88 },
  { date: "Oct", forecast: 68, confidence: 90 },
  { date: "Nov", forecast: 65, confidence: 87 },
  { date: "Dec", forecast: 70, confidence: 89 },
]

const insights = [
  {
    type: "peak",
    message: "Peak demand expected in August (75 services)",
    recommendation: "Increase technician capacity by 20%",
    priority: "high",
  },
  {
    type: "trend",
    message: "15% increase in service demand trend detected",
    recommendation: "Plan for extended hours in Q3",
    priority: "medium",
  },
  {
    type: "pattern",
    message: "Weekend services showing 30% growth",
    recommendation: "Consider weekend shift scheduling",
    priority: "medium",
  },
]

const weeklyForecast = [
  { day: "Mon", services: 12, confidence: 88 },
  { day: "Tue", services: 15, confidence: 92 },
  { day: "Wed", services: 18, confidence: 90 },
  { day: "Thu", services: 16, confidence: 87 },
  { day: "Fri", services: 20, confidence: 91 },
  { day: "Sat", services: 14, confidence: 85 },
  { day: "Sun", services: 8, confidence: 82 },
]

export default function AIDemandForecast() {
  const avgConfidence = Math.round(
    forecastData.reduce((sum, d) => sum + (d.confidence || 0), 0) / forecastData.length
  )

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain size={18} className="text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              AI Service Demand Forecast
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Powered by ML predictions</p>
          </div>
        </div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
          {avgConfidence}% Confidence
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Forecast Chart */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">12-Month Forecast</h4>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-gray-600">Forecast</span>
              </div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "11px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#a855f7" 
                  fill="url(#forecastGradient)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Forecast */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">This Week's Forecast</h4>
          <div className="grid grid-cols-7 gap-2">
            {weeklyForecast.map((day) => (
              <div
                key={day.day}
                className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100"
              >
                <p className="text-xs font-medium text-gray-600 mb-1">{day.day}</p>
                <p className="text-lg font-bold text-gray-900">{day.services}</p>
                <p className="text-xs text-gray-500 mt-0.5">{day.confidence}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Brain size={14} className="text-purple-600" />
            AI Insights & Recommendations
          </h4>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {insight.type === "peak" && <AlertCircle size={14} className="text-orange-600" />}
                  {insight.type === "trend" && <TrendingUp size={14} className="text-blue-600" />}
                  {insight.type === "pattern" && <Calendar size={14} className="text-purple-600" />}
                  <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                </div>
                <Badge 
                  className={`text-xs h-5 ${
                    insight.priority === "high" 
                      ? "bg-red-100 text-red-700 border-red-300" 
                      : "bg-yellow-100 text-yellow-700 border-yellow-300"
                  }`}
                >
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-6">{insight.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

