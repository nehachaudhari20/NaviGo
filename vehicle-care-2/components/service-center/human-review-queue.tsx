"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  ChevronRight,
  Filter
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ReviewItem {
  id: string
  vehicle: string
  regNumber: string
  owner: string
  component: string
  issueType: string
  confidence: number
  severity: "critical" | "high" | "medium" | "low"
  predictedDate: string
  timeToFailure: string
  createdAt: string
  predictionId: string
}

const mockReviewItems: ReviewItem[] = [
  {
    id: "REV-001",
    vehicle: "Tata Nexon",
    regNumber: "MH-12-AB-1234",
    owner: "Rajesh Kumar",
    component: "Brake Pads",
    issueType: "Excessive Wear",
    confidence: 78,
    severity: "critical",
    predictedDate: "2024-09-18",
    timeToFailure: "2-3 days",
    createdAt: "2 hours ago",
    predictionId: "PRED-001",
  },
  {
    id: "REV-002",
    vehicle: "Hyundai i20",
    regNumber: "MH-12-CD-5678",
    owner: "Anita Sharma",
    component: "Engine",
    issueType: "Overheating Risk",
    confidence: 72,
    severity: "high",
    predictedDate: "2024-09-20",
    timeToFailure: "5-7 days",
    createdAt: "4 hours ago",
    predictionId: "PRED-002",
  },
  {
    id: "REV-003",
    vehicle: "Mahindra XUV",
    regNumber: "MH-12-EF-9012",
    owner: "Vikram Singh",
    component: "Battery",
    issueType: "Degradation",
    confidence: 68,
    severity: "medium",
    predictedDate: "2024-09-25",
    timeToFailure: "10-12 days",
    createdAt: "6 hours ago",
    predictionId: "PRED-003",
  },
  {
    id: "REV-004",
    vehicle: "Honda City",
    regNumber: "MH-12-GH-3456",
    owner: "Arjun Reddy",
    component: "Transmission",
    issueType: "Gear Slippage",
    confidence: 65,
    severity: "high",
    predictedDate: "2024-09-19",
    timeToFailure: "3-4 days",
    createdAt: "8 hours ago",
    predictionId: "PRED-004",
  },
]

export default function HumanReviewQueue() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const filteredItems = mockReviewItems.filter(item => {
    if (filter === "all") return true
    return item.severity === filter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    // Sort by severity first, then by confidence (lower first)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return a.confidence - b.confidence
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-700 border-blue-300"
    }
  }

  const handleReview = (item: ReviewItem) => {
    router.push(`/service-center/predictive-maintenance?predictionId=${item.predictionId}`)
  }

  const handleApprove = (id: string) => {
    // TODO: API call to approve prediction
    console.log("Approve:", id)
  }

  const handleReject = (id: string) => {
    // TODO: API call to reject prediction
    console.log("Reject:", id)
  }

  const handleRequestMoreInfo = (id: string) => {
    // TODO: API call to request more info
    console.log("Request more info:", id)
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Human Review Queue
            </CardTitle>
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              {sortedItems.length} Pending
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("critical")}
              className="text-xs border-red-300 text-red-700 hover:bg-red-50"
            >
              Critical
            </Button>
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("high")}
              className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              High
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Predictions with confidence &lt;85% requiring human review
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sortedItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 size={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No items requiring review</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-all ${
                  selectedItem === item.id
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-900">{item.vehicle}</h4>
                      <Badge className={`text-xs ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                        {item.confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mb-2">{item.regNumber}</p>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {item.component}: {item.issueType}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.timeToFailure}
                      </span>
                      <span>{item.owner}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReview(item)
                    }}
                  >
                    <Eye size={12} className="mr-1.5" />
                    Review Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(item.id)
                    }}
                  >
                    <CheckCircle2 size={12} className="mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReject(item.id)
                    }}
                  >
                    <XCircle size={12} className="mr-1.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

