"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, ChevronRight, Brain, TrendingUp, Loader2 } from "lucide-react"
import { getPriorityVehicles, subscribeToPriorityVehicles, type DiagnosisCase } from "@/lib/api/dashboard-data"
import { getCustomerVehicle, type VehicleData } from "@/lib/api/dashboard-data"

interface PriorityVehicle {
  id: string
  vehicle: string
  regNumber: string
  priority: "critical" | "high" | "medium" | "low"
  issue: string
  estimatedTime: string
  urgency: number
  aiPredicted: boolean
  aiConfidence: number | null
  riskLevel: string
  vehicleData?: VehicleData
}

const mockPriorityVehicles = [
  {
    id: "VH-001",
    vehicle: "Tata Nexon",
    regNumber: "MH-12-AB-1234",
    priority: "critical",
    issue: "Brake Failure Risk",
    estimatedTime: "2 hours",
    urgency: 95,
    aiPredicted: true,
    aiConfidence: 92,
    riskLevel: "High",
  },
  {
    id: "VH-002",
    vehicle: "Hyundai i20",
    regNumber: "MH-12-CD-5678",
    priority: "high",
    issue: "Engine Overheating",
    estimatedTime: "3 hours",
    urgency: 85,
    aiPredicted: true,
    aiConfidence: 88,
    riskLevel: "Medium",
  },
  {
    id: "VH-003",
    vehicle: "Mahindra XUV",
    regNumber: "MH-12-EF-9012",
    priority: "high",
    issue: "Transmission Issue",
    estimatedTime: "4 hours",
    urgency: 80,
    aiPredicted: false,
    aiConfidence: null,
    riskLevel: "Medium",
  },
]

export default function PriorityVehicleQueue() {
  const [priorityVehicles, setPriorityVehicles] = useState<PriorityVehicle[]>(mockPriorityVehicles.map(v => ({ ...v, id: v.id })))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch initial data
    const loadData = async () => {
      try {
        setLoading(true)
        const cases = await getPriorityVehicles(10)
        
        // Fetch vehicle details for each case
        const vehiclesWithData = await Promise.all(
          cases.map(async (caseItem) => {
            const vehicleData = await getCustomerVehicle(caseItem.vehicle_id)
            return {
              id: caseItem.id,
              vehicle: vehicleData?.make && vehicleData?.model 
                ? `${vehicleData.make} ${vehicleData.model}` 
                : caseItem.vehicle_id,
              regNumber: vehicleData?.registration_number || caseItem.vehicle_id,
              priority: caseItem.severity || 'medium',
              issue: caseItem.predicted_failure || 'Unknown issue',
              estimatedTime: "2-4 hours", // Could be calculated from case data
              urgency: Math.round((caseItem.confidence || 0) * 1.2), // Convert confidence to urgency
              aiPredicted: true,
              aiConfidence: caseItem.confidence || null,
              riskLevel: caseItem.severity === 'critical' ? 'High' : caseItem.severity === 'high' ? 'Medium' : 'Low',
              vehicleData
            } as PriorityVehicle
          })
        )
        
        setPriorityVehicles(vehiclesWithData)
      } catch (error) {
        console.error('Error loading priority vehicles:', error)
        // Fallback to mock data on error
        setPriorityVehicles(mockPriorityVehicles.map(v => ({ ...v, id: v.id })))
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPriorityVehicles((cases) => {
      Promise.all(
        cases.map(async (caseItem) => {
          const vehicleData = await getCustomerVehicle(caseItem.vehicle_id)
          return {
            id: caseItem.id,
            vehicle: vehicleData?.make && vehicleData?.model 
              ? `${vehicleData.make} ${vehicleData.model}` 
              : caseItem.vehicle_id,
            regNumber: vehicleData?.registration_number || caseItem.vehicle_id,
            priority: caseItem.severity || 'medium',
            issue: caseItem.predicted_failure || 'Unknown issue',
            estimatedTime: "2-4 hours",
            urgency: Math.round((caseItem.confidence || 0) * 1.2),
            aiPredicted: true,
            aiConfidence: caseItem.confidence || null,
            riskLevel: caseItem.severity === 'critical' ? 'High' : caseItem.severity === 'high' ? 'Medium' : 'Low',
            vehicleData
          } as PriorityVehicle
        })
      ).then(setPriorityVehicles)
    })

    return () => unsubscribe()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200"
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            Priority Vehicle Queue
          </CardTitle>
          <Badge className="bg-red-100 text-red-700 border-red-300 text-xs flex items-center gap-1">
            <Brain size={10} />
            AI Detected
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          View All
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
            <span className="ml-2 text-sm text-gray-600">Loading priority vehicles...</span>
          </div>
        ) : priorityVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No priority vehicles at this time</p>
          </div>
        ) : (
        <div className="space-y-3">
          {priorityVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-3 border rounded-lg transition-all ${
                vehicle.aiPredicted
                  ? "border-red-200 bg-gradient-to-r from-red-50/30 to-white hover:border-red-300"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{vehicle.vehicle}</h4>
                    <Badge variant="outline" className={`text-xs h-5 ${getPriorityColor(vehicle.priority)}`}>
                      {vehicle.priority.toUpperCase()}
                    </Badge>
                    {vehicle.aiPredicted && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs h-5 flex items-center gap-1">
                        <Brain size={10} />
                        {vehicle.aiConfidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-1">{vehicle.regNumber}</p>
                  <p className="text-xs text-gray-700">{vehicle.issue}</p>
                  {vehicle.aiPredicted && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-red-600" />
                      <span className="text-xs text-red-600 font-medium">AI Risk: {vehicle.riskLevel}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={12} />
                  <span>{vehicle.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Urgency:</span>
                  <span className="text-xs font-semibold text-gray-900">{vehicle.urgency}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        {priorityVehicles.length > 0 && (
        <div className="mt-4 p-2.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-red-600" />
            <p className="text-xs text-gray-700">
                <span className="font-medium">AI Alert:</span> {priorityVehicles.length} vehicle{priorityVehicles.length !== 1 ? 's' : ''} flagged by predictive maintenance - schedule immediate inspection
            </p>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

