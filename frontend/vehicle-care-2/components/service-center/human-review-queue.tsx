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
  Filter,
  Loader2
} from "lucide-react"
import { useEffect } from "react"
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
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(mockReviewItems)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch initial data
    const loadData = async () => {
      try {
        setLoading(true)
        const { getHumanReviewQueue, subscribeToHumanReviews, getCustomerVehicle } = await import('@/lib/api/dashboard-data')
        const reviews = await getHumanReviewQueue(20)
        
        // Transform to ReviewItem format
        const items = await Promise.all(
          reviews.map(async (review) => {
            const vehicleData = await getCustomerVehicle(review.vehicle_id)
            const createdAt = review.created_at?.toDate() || new Date()
            const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
            
            return {
              id: review.review_id || review.id,
              vehicle: vehicleData?.make && vehicleData?.model 
                ? `${vehicleData.make} ${vehicleData.model}` 
                : review.vehicle_id,
              regNumber: vehicleData?.registration_number || review.vehicle_id,
              owner: vehicleData?.owner_name || 'Unknown',
              component: 'Component', // Could be extracted from prediction data
              issueType: 'Prediction Review',
              confidence: review.confidence || 0,
              severity: review.severity || 'medium',
              predictedDate: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              timeToFailure: '7-10 days',
              createdAt: hoursAgo > 0 ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago` : 'Just now',
              predictionId: review.prediction_id || review.id
            } as ReviewItem
          })
        )
        
        // Only update if we got real data, otherwise keep mock data
        if (items.length > 0) {
          setReviewItems(items)
        }
      } catch (error) {
        console.error('Error loading human reviews:', error)
        // Keep mock data on error
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to real-time updates
    const { subscribeToHumanReviews } = require('@/lib/api/dashboard-data')
    const unsubscribe = subscribeToHumanReviews(async (reviews) => {
      const { getCustomerVehicle } = await import('@/lib/api/dashboard-data')
      const items = await Promise.all(
        reviews.map(async (review) => {
          const vehicleData = await getCustomerVehicle(review.vehicle_id)
          const createdAt = review.created_at?.toDate() || new Date()
          const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
          
          return {
            id: review.review_id || review.id,
            vehicle: vehicleData?.make && vehicleData?.model 
              ? `${vehicleData.make} ${vehicleData.model}` 
              : review.vehicle_id,
            regNumber: vehicleData?.registration_number || review.vehicle_id,
            owner: vehicleData?.owner_name || 'Unknown',
            component: 'Component',
            issueType: 'Prediction Review',
            confidence: review.confidence || 0,
            severity: review.severity || 'medium',
            predictedDate: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeToFailure: '7-10 days',
            createdAt: hoursAgo > 0 ? `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago` : 'Just now',
            predictionId: review.prediction_id || review.id
          } as ReviewItem
        })
      )
      // Only update if we got real data, otherwise keep mock data
      if (items.length > 0) {
        setReviewItems(items)
      }
    })

    return () => unsubscribe()
  }, [])

  const filteredItems = reviewItems.filter(item => {
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

  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessing(id)
    setError(null)
    
    try {
      const { updateHumanReview } = await import('@/lib/api/agents')
      
      const result = await updateHumanReview({
        reviewId: id,
        decision: 'approved',
        notes: 'Approved by service center staff'
      })
      
      if (result.status === 'success') {
        // Remove from list or update status
        console.log('Review approved:', id)
        // You can update the UI here or refetch data
        window.location.reload() // Simple refresh for now
      } else {
        setError(result.error || 'Failed to approve review')
      }
    } catch (err) {
      console.error('Approve review error:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve review')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    setError(null)
    
    try {
      const { updateHumanReview } = await import('@/lib/api/agents')
      
      const result = await updateHumanReview({
        reviewId: id,
        decision: 'rejected',
        notes: 'Rejected by service center staff'
      })
      
      if (result.status === 'success') {
        console.log('Review rejected:', id)
        window.location.reload() // Simple refresh for now
      } else {
        setError(result.error || 'Failed to reject review')
      }
    } catch (err) {
      console.error('Reject review error:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject review')
    } finally {
      setProcessing(null)
    }
  }

  const handleRequestMoreInfo = async (id: string) => {
    // This could trigger a notification or create a task
    console.log("Request more info:", id)
    // TODO: Implement request more info endpoint if needed
    alert('More information requested. This will be implemented in a future update.')
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
            <span className="ml-2 text-sm text-gray-600">Loading review queue...</span>
          </div>
        ) : (
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
                    disabled={processing === item.id}
                  >
                    {processing === item.id ? (
                      <>
                        <Loader2 size={12} className="mr-1.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                    <CheckCircle2 size={12} className="mr-1.5" />
                    Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReject(item.id)
                    }}
                    disabled={processing === item.id}
                  >
                    {processing === item.id ? (
                      <>
                        <Loader2 size={12} className="mr-1.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                    <XCircle size={12} className="mr-1.5" />
                    Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

