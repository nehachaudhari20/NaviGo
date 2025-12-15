"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingDown, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const qualityData = [
  { month: "Jan", predicted: 92, actual: 91 },
  { month: "Feb", predicted: 93, actual: 92 },
  { month: "Mar", predicted: 94, actual: 93 },
  { month: "Apr", predicted: 95, actual: 94 },
  { month: "May", predicted: 96, actual: 95 },
  { month: "Jun", predicted: 97, actual: 96 },
  { month: "Jul", predicted: 98, actual: 97 },
  { month: "Aug", predicted: 98, actual: 98 },
]

export default function AIQualityPredictions() {
  return (
    <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
              <Brain className="text-cyan-400" size={20} />
            </div>
            <CardTitle className="text-white text-lg">AI Quality Predictions</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {/* Current Prediction */}
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Next Batch Quality Score</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400" size={16} />
              <span className="text-lg font-bold text-white">98%</span>
            </div>
          </div>
          <Progress value={98} className="h-2" />
          <p className="text-xs text-gray-400 mt-2">AI Confidence: 94%</p>
        </div>

        {/* Prediction vs Actual Chart */}
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#374151" }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#374151" }}
                domain={[85, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 4 }}
                strokeDasharray="5 5"
                name="Predicted"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-cyan-500"></div>
              <span className="text-gray-400">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-gray-400">Actual</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Accuracy</p>
            <p className="text-lg font-bold text-green-400">96.2%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Trend</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="text-green-400" size={14} />
              <p className="text-lg font-bold text-green-400">+2.1%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

