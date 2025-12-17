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
  const [initialLoading, setInitialLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  // Quick initial loading - show mock data after 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
      // Show mock data immediately
      setPriorityVehicles(mockPriorityVehicles.map(v => ({ ...v, id: v.id })))
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Fetch real data in background
    const loadData = async () => {
      try {
        setDataLoading(true)
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
        setDataLoading(false)
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


  return (
    <Card className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
      <CardHeader className="relative z-10 bg-gradient-to-r from-slate-900/40 to-slate-800/30 backdrop-blur-md border-b border-slate-700/30">
        <div className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              Priority Vehicle Queue
            </CardTitle>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs flex items-center gap-1">
              <Brain size={10} />
              AI Detected
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50">
            View All
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          Vehicles requiring immediate attention based on AI predictions
        </p>
      </CardHeader>
      <CardContent className="relative z-10">
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-red-400" size={24} />
            <span className="ml-2 text-sm text-slate-300">Loading priority vehicles...</span>
          </div>
        ) : priorityVehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle size={48} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No priority vehicles at this time</p>
          </div>
        ) : (
        <div className="space-y-3">
          {priorityVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-3 border rounded-lg transition-all ${
                vehicle.aiPredicted
                  ? "border-red-500/30 bg-gradient-to-r from-red-500/10 via-slate-800/50 to-slate-800/50 hover:border-red-500/50 hover:from-red-500/15"
                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-100 truncate">{vehicle.vehicle}</h4>
                    <Badge variant="outline" className={`text-xs h-5 ${
                      vehicle.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      vehicle.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      vehicle.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-slate-700/50 text-slate-300 border-slate-600/50'
                    }`}>
                      {vehicle.priority.toUpperCase()}
                    </Badge>
                    {vehicle.aiPredicted && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs h-5 flex items-center gap-1">
                        <Brain size={10} />
                        {vehicle.aiConfidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mb-1">{vehicle.regNumber}</p>
                  <p className="text-xs text-slate-300">{vehicle.issue}</p>
                  {vehicle.aiPredicted && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-red-400" />
                      <span className="text-xs text-red-400 font-medium">AI Risk: {vehicle.riskLevel}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>{vehicle.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Urgency:</span>
                  <span className="text-xs font-semibold text-slate-200">{vehicle.urgency}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        {priorityVehicles.length > 0 && (
        <div className="mt-4 p-2.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-red-400" />
            <p className="text-xs text-slate-300">
                <span className="font-medium text-slate-200">AI Alert:</span> {priorityVehicles.length} vehicle{priorityVehicles.length !== 1 ? 's' : ''} flagged by predictive maintenance - schedule immediate inspection
            </p>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

