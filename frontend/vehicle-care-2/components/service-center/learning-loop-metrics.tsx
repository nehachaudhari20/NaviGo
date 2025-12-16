"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown,
  Brain,
  Target,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface LearningMetric {
  date: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
}

interface ModelPerformance {
  modelName: string
  version: string
  accuracy: number
  improvement: number
  lastTrained: string
  status: "active" | "training" | "pending"
  feedbackCount: number
  learningRate: number
}

export default function LearningLoopMetrics() {
  const [metrics, setMetrics] = useState<LearningMetric[]>([])
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([])

  useEffect(() => {
    // Mock data - replace with API call
    const mockMetrics: LearningMetric[] = [
      { date: "Week 1", accuracy: 82, precision: 78, recall: 85, f1Score: 81 },
      { date: "Week 2", accuracy: 84, precision: 80, recall: 87, f1Score: 83 },
      { date: "Week 3", accuracy: 86, precision: 82, recall: 89, f1Score: 85 },
      { date: "Week 4", accuracy: 87, precision: 84, recall: 90, f1Score: 87 },
      { date: "Week 5", accuracy: 88, precision: 85, recall: 91, f1Score: 88 },
      { date: "Week 6", accuracy: 89, precision: 86, recall: 92, f1Score: 89 },
      { date: "Week 7", accuracy: 90, precision: 87, recall: 93, f1Score: 90 },
    ]

    const mockModels: ModelPerformance[] = [
      {
        modelName: "Failure Prediction Model",
        version: "v2.1.3",
        accuracy: 92.5,
        improvement: 5.2,
        lastTrained: "2 days ago",
        status: "active",
        feedbackCount: 1247,
        learningRate: 0.85,
      },
      {
        modelName: "Anomaly Detection Model",
        version: "v1.8.2",
        accuracy: 94.1,
        improvement: 3.1,
        lastTrained: "5 days ago",
        status: "active",
        feedbackCount: 892,
        learningRate: 0.78,
      },
      {
        modelName: "Quality Prediction Model",
        version: "v1.5.0",
        accuracy: 88.3,
        improvement: 7.5,
        lastTrained: "1 week ago",
        status: "active",
        feedbackCount: 456,
        learningRate: 0.72,
      },
    ]

    setMetrics(mockMetrics)
    setModelPerformance(mockModels)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300"
      case "training":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
    }
  }

  const avgAccuracy = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length 
    : 0
  const latestAccuracy = metrics.length > 0 ? metrics[metrics.length - 1].accuracy : 0
  const improvement = metrics.length > 1 
    ? latestAccuracy - metrics[0].accuracy 
    : 0

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="pb-3 bg-white/60">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                <Target size={18} className="text-blue-700" />
              </div>
              Current Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{latestAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-gray-700 font-medium">Latest Model Performance</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-semibold">
              <TrendingUp size={12} />
              <span>+{improvement.toFixed(1)}% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="pb-3 bg-white/60">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
                <Brain size={18} className="text-purple-700" />
              </div>
              Learning Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {modelPerformance.length > 0 
                ? (modelPerformance.reduce((sum, m) => sum + m.learningRate, 0) / modelPerformance.length * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-xs text-gray-700 font-medium">Average Across Models</div>
            <div className="mt-2 text-xs text-gray-600 font-medium">Improving weekly</div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="pb-3 bg-white/60">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                <CheckCircle2 size={18} className="text-green-700" />
              </div>
              Feedback Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {modelPerformance.reduce((sum, m) => sum + m.feedbackCount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-700 font-medium">Total Validations</div>
            <div className="mt-2 text-xs text-green-700 font-semibold">+234 this month</div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 shadow-lg overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="pb-3 bg-white/60">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg border border-orange-200">
                <RefreshCw size={18} className="text-orange-700" />
              </div>
              Models Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{modelPerformance.length}</div>
            <div className="text-xs text-gray-700 font-medium">In Production</div>
            <div className="mt-2 text-xs text-gray-600 font-medium">All models healthy</div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Trend Chart */}
      <Card className="relative bg-white border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
              <BarChart3 size={18} className="text-blue-700" />
            </div>
            Accuracy Trend (7 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[75, 95]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#1f2937",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#60a5fa"
                  fill="url(#accuracyGradient)"
                  strokeWidth={2}
                  name="Accuracy (%)"
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  name="Precision (%)"
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                  name="Recall (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-600"></div>
              <span className="text-gray-700 font-medium">Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600"></div>
              <span className="text-gray-700 font-medium">Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span className="text-gray-700 font-medium">Recall</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Table */}
      <Card className="relative bg-white border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
              <Brain size={18} className="text-purple-700" />
            </div>
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modelPerformance.map((model, idx) => {
              // Color coding for each model
              const modelColors = [
                { bg: "from-blue-50 to-cyan-50", border: "border-blue-300", icon: "text-blue-700", progress: "bg-blue-600", iconBg: "bg-blue-100" },
                { bg: "from-purple-50 to-pink-50", border: "border-purple-300", icon: "text-purple-700", progress: "bg-purple-600", iconBg: "bg-purple-100" },
                { bg: "from-cyan-50 to-teal-50", border: "border-cyan-300", icon: "text-cyan-700", progress: "bg-cyan-600", iconBg: "bg-cyan-100" },
              ]
              const colors = modelColors[idx % modelColors.length]
              
              return (
              <div
                key={idx}
                  className={`p-4 bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-lg hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-800">{model.modelName}</h4>
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                        {model.version}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                        {model.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">Last trained: {model.lastTrained}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{model.accuracy.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600 font-medium">Accuracy</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Improvement</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-green-600" />
                        <span className="text-sm font-semibold text-green-700">+{model.improvement.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Feedback</p>
                      <p className="text-sm font-semibold text-gray-800">{model.feedbackCount.toLocaleString()}</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Learning Rate</p>
                      <p className="text-sm font-semibold text-gray-800">{(model.learningRate * 100).toFixed(0)}%</p>
                  </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                      className={`${colors.progress} h-2.5 rounded-full transition-all`}
                    style={{ width: `${model.accuracy}%` }}
                  ></div>
                </div>
              </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Learning Events */}
      <Card className="relative bg-white border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg border border-orange-200">
              <RefreshCw size={18} className="text-orange-700" />
            </div>
            Recent Learning Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { event: "Model retrained with 234 new feedback samples", time: "2 days ago", type: "success" },
              { event: "Accuracy improved by 2.3% after feedback integration", time: "5 days ago", type: "success" },
              { event: "New training data collected from 45 service completions", time: "1 week ago", type: "info" },
            ].map((event, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <div className={`p-1.5 rounded-lg border-2 ${
                  event.type === "success" 
                    ? "bg-green-100 text-green-700 border-green-300" 
                    : "bg-blue-100 text-blue-700 border-blue-300"
                }`}>
                  {event.type === "success" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">{event.event}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

