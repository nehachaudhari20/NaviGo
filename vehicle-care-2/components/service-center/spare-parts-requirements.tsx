"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertCircle, CheckCircle2, ChevronRight, Brain, TrendingUp } from "lucide-react"

const parts = [
  {
    id: "PART-001",
    name: "Brake Pad Set (Front)",
    requiredFor: "Tata Nexon",
    available: 1,
    required: 2,
    status: "low_stock",
    priority: "high",
    aiPredicted: true,
    aiConfidence: 91,
  },
  {
    id: "PART-002",
    name: "Battery (48V)",
    requiredFor: "Mahindra XUV",
    available: 0,
    required: 1,
    status: "out_of_stock",
    priority: "critical",
    aiPredicted: true,
    aiConfidence: 95,
  },
  {
    id: "PART-003",
    name: "AC Compressor",
    requiredFor: "Honda City",
    available: 1,
    required: 1,
    status: "low_stock",
    priority: "high",
    aiPredicted: false,
    aiConfidence: null,
  },
  {
    id: "PART-004",
    name: "Engine Oil Filter",
    requiredFor: "Multiple Vehicles",
    available: 12,
    required: 5,
    status: "in_stock",
    priority: "low",
    aiPredicted: false,
    aiConfidence: null,
  },
]

export default function SparePartsRequirements() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs h-5">Out of Stock</Badge>
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs h-5">Low Stock</Badge>
      case "in_stock":
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs h-5">In Stock</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            Spare Parts Requirements
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs flex items-center gap-1">
            <Brain size={10} />
            AI Alert
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          View All
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parts.map((part) => (
            <div
              key={part.id}
              className={`p-3 border rounded-lg transition-all ${
                part.aiPredicted
                  ? "border-orange-200 bg-gradient-to-r from-orange-50/30 to-white hover:border-orange-300"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{part.name}</h4>
                    {getStatusBadge(part.status)}
                    {part.aiPredicted && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs h-5 flex items-center gap-1">
                        <Brain size={10} />
                        {part.aiConfidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">For: {part.requiredFor}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">
                      Required: <span className="font-semibold text-gray-900">{part.required}</span>
                    </span>
                    <span className="text-gray-600">
                      Available: <span className={`font-semibold ${part.available < part.required ? "text-red-600" : "text-green-600"}`}>
                        {part.available}
                      </span>
                    </span>
                  </div>
                  {part.aiPredicted && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">AI Predicted Shortage</span>
                    </div>
                  )}
                </div>
                {part.status === "out_of_stock" && (
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-2.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-orange-600" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">AI Forecast:</span> Order brake pads and batteries now - predicted high demand in next 3 days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

