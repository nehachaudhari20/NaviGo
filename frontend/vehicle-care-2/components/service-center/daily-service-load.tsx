"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts"

const hourlyData = [
  { hour: "8AM", scheduled: 3, inProgress: 2, completed: 1, aiForecast: 4 },
  { hour: "9AM", scheduled: 5, inProgress: 3, completed: 2, aiForecast: 6 },
  { hour: "10AM", scheduled: 7, inProgress: 4, completed: 3, aiForecast: 8 },
  { hour: "11AM", scheduled: 6, inProgress: 5, completed: 4, aiForecast: 7 },
  { hour: "12PM", scheduled: 4, inProgress: 3, completed: 3, aiForecast: 5 },
  { hour: "1PM", scheduled: 8, inProgress: 6, completed: 5, aiForecast: 9 },
  { hour: "2PM", scheduled: 6, inProgress: 4, completed: 4, aiForecast: 7 },
  { hour: "3PM", scheduled: 5, inProgress: 3, completed: 3, aiForecast: 6 },
  { hour: "4PM", scheduled: 4, inProgress: 2, completed: 2, aiForecast: 5 },
  { hour: "5PM", scheduled: 3, inProgress: 1, completed: 1, aiForecast: 4 },
]

const stats = {
  total: 51,
  inProgress: 33,
  completed: 28,
  pending: 18,
  utilization: 85,
  aiForecast: 58,
  forecastConfidence: 89,
}

export default function DailyServiceLoad() {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={18} className="text-blue-600" />
          Daily Service Load
        </CardTitle>
        <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs flex items-center gap-1">
          <Brain size={10} />
          AI Forecast
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Stats Overview - Compact */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600 mt-0.5">Total</p>
          </div>
          <div className="text-center p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-xl font-bold text-yellow-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-600 mt-0.5">Active</p>
          </div>
          <div className="text-center p-2.5 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-600 mt-0.5">Done</p>
          </div>
          <div className="text-center p-2.5 bg-purple-50 rounded-lg border border-purple-100 relative">
            <p className="text-xl font-bold text-purple-600">{stats.aiForecast}</p>
            <p className="text-xs text-gray-600 mt-0.5">AI Forecast</p>
            <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] h-4 px-1">
              {stats.forecastConfidence}%
            </Badge>
          </div>
        </div>

        {/* AI Insight */}
        <div className="mb-4 p-2.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-purple-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">AI Prediction</p>
              <p className="text-xs text-gray-600">Expected peak at 1PM (9 services) - 12% above average</p>
            </div>
            <TrendingUp size={14} className="text-purple-600" />
          </div>
        </div>

        {/* Utilization */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700">Capacity Utilization</span>
            <span className="text-xs font-semibold text-blue-600">{stats.utilization}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.utilization}%` }}
            ></div>
          </div>
        </div>

        {/* Hourly Chart - Compact with AI Forecast */}
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="hour" 
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
              <Bar dataKey="scheduled" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="inProgress" stackId="a" fill="#fbbf24" radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="aiForecast" 
                stroke="#a855f7" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

