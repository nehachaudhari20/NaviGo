"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, HelpCircle, Shield, TrendingUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TransparencyTrust() {
  const aiRecommendations = [
    {
      id: 1,
      title: "Brake Pad Replacement Recommended",
      confidence: 87,
      reasoning: "Based on 3 similar vehicles showing brake pad wear at 85%",
      dataSource: "Telematics data from last 30 days",
      timestamp: "2 hours ago",
      reviewed: true
    },
    {
      id: 2,
      title: "Battery Health Check Suggested",
      confidence: 92,
      reasoning: "Voltage readings indicate 78% capacity remaining",
      dataSource: "OBD-II sensor data",
      timestamp: "5 hours ago",
      reviewed: false
    }
  ]

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-600" />
            Transparency & Trust
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            4.6/5.0 Trust
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Every AI decision explained • Human oversight available • Your data protected
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trust Score */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Your Trust Score</span>
            <Shield className="h-4 w-4 opacity-75" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">4.6</span>
            <span className="text-sm opacity-75">/ 5.0</span>
          </div>
          <p className="text-xs mt-2 opacity-75">
            Based on your interactions and feedback
          </p>
        </div>

        {/* AI Recommendations with Explanations */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-700">Recent AI Recommendations</p>
          {aiRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className={
                        rec.confidence >= 85
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-orange-100 text-orange-700 border-orange-300'
                      }
                    >
                      {rec.confidence}% confident
                    </Badge>
                    {rec.reviewed && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Reviewed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Why this recommendation?</p>
                  <p className="text-xs text-gray-600">{rec.reasoning}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Data source:</p>
                  <p className="text-xs text-gray-600">{rec.dataSource}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Learn More
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Request Human Review
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Data Privacy */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 mb-1">Your Data is Protected</p>
              <p className="text-xs text-gray-600 mb-2">
                We use your vehicle data only for maintenance recommendations. You control what's shared.
              </p>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Manage Privacy Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Human Review Available */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 mb-1">Human Review Available</p>
              <p className="text-xs text-gray-600">
                Not comfortable with an AI recommendation? Request a human technician to review it.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
