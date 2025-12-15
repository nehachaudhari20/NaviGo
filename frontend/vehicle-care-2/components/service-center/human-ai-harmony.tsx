"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Brain, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function HumanAIHarmony() {
  const metrics = {
    humanOverrideRate: {
      value: 12,
      target: 15,
      status: "excellent",
      trend: "-3%"
    },
    customerTrustScore: {
      value: 4.6,
      target: 4.5,
      status: "excellent",
      trend: "+0.2"
    },
    handoffTime: {
      value: 22,
      target: 30,
      status: "excellent",
      trend: "-8s"
    },
    learningRate: {
      value: 6.2,
      target: 5,
      status: "excellent",
      trend: "+1.2%"
    },
    transparencyScore: {
      value: 93,
      target: 90,
      status: "excellent",
      trend: "+3%"
    },
    errorRecoveryTime: {
      value: 18,
      target: 24,
      status: "excellent",
      trend: "-6h"
    }
  }

  const collaborationPatterns = [
    {
      pattern: "AI Suggests, Human Decides",
      count: 45,
      successRate: 94,
      description: "Critical decisions with human review"
    },
    {
      pattern: "Human Guides, AI Executes",
      count: 128,
      successRate: 97,
      description: "Manager priorities optimized by AI"
    },
    {
      pattern: "AI Monitors, Human Intervenes",
      count: 12,
      successRate: 100,
      description: "Anomaly detection with human response"
    }
  ]

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Human-AI Harmony Metrics
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Excellent
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Measuring trust, transparency, and collaboration effectiveness
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Override Rate</span>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{metrics.humanOverrideRate.value}%</span>
              <span className="text-xs text-gray-500">/ {metrics.humanOverrideRate.target}%</span>
            </div>
            <Progress 
              value={(metrics.humanOverrideRate.value / metrics.humanOverrideRate.target) * 100} 
              className="h-1.5 mt-2"
            />
            <p className="text-xs text-green-600 mt-1">{metrics.humanOverrideRate.trend}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Trust Score</span>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{metrics.customerTrustScore.value}</span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
            <Progress 
              value={(metrics.customerTrustScore.value / 5.0) * 100} 
              className="h-1.5 mt-2"
            />
            <p className="text-xs text-green-600 mt-1">{metrics.customerTrustScore.trend}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Handoff Time</span>
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{metrics.handoffTime.value}s</span>
              <span className="text-xs text-gray-500">/ {metrics.handoffTime.target}s</span>
            </div>
            <Progress 
              value={(metrics.handoffTime.value / metrics.handoffTime.target) * 100} 
              className="h-1.5 mt-2"
            />
            <p className="text-xs text-green-600 mt-1">{metrics.handoffTime.trend}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Learning Rate</span>
              <Brain className="h-3 w-3 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{metrics.learningRate.value}%</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <Progress 
              value={(metrics.learningRate.value / 10) * 100} 
              className="h-1.5 mt-2"
            />
            <p className="text-xs text-green-600 mt-1">{metrics.learningRate.trend}</p>
          </div>
        </div>

        {/* Collaboration Patterns */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Collaboration Patterns</p>
          {collaborationPatterns.map((pattern, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">{pattern.pattern}</p>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {pattern.successRate}% success
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{pattern.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{pattern.count} instances this week</span>
                <Progress value={pattern.successRate} className="w-24 h-1.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Transparency & Trust */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Transparency Score</p>
              <p className="text-xs text-gray-600">
                {metrics.transparencyScore.value}% of customers understand AI decisions
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{metrics.transparencyScore.value}%</div>
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs mt-1">
                {metrics.transparencyScore.trend}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
