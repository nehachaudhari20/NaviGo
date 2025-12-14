"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CheckCircle2, AlertCircle, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const technicians = [
  {
    id: "TECH-001",
    name: "Priya Sharma",
    specialization: "Engine & Transmission",
    currentLoad: 4,
    maxLoad: 6,
    status: "available",
    efficiency: 92,
    aiOptimized: true,
    aiRecommendation: "Best match for engine services",
    nextAvailable: "30 min",
  },
  {
    id: "TECH-002",
    name: "Dev Mehta",
    specialization: "Brake & Suspension",
    currentLoad: 5,
    maxLoad: 6,
    status: "busy",
    efficiency: 88,
    aiOptimized: false,
    aiRecommendation: null,
    nextAvailable: "2 hours",
  },
  {
    id: "TECH-003",
    name: "Kumar Reddy",
    specialization: "Electrical & AC",
    currentLoad: 3,
    maxLoad: 6,
    status: "available",
    efficiency: 95,
    aiOptimized: true,
    aiRecommendation: "Optimal for AC & electrical work",
    nextAvailable: "Now",
  },
]

export default function TechnicianAssignment() {
  const getStatusIcon = (status: string) => {
    if (status === "available") {
      return <CheckCircle2 size={14} className="text-green-600" />
    }
    return <AlertCircle size={14} className="text-orange-600" />
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Technician Assignment
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs flex items-center gap-1">
            <Sparkles size={10} />
            AI Optimized
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          View All
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {technicians.map((tech) => {
            const loadPercentage = (tech.currentLoad / tech.maxLoad) * 100
            return (
              <div
                key={tech.id}
                className={`p-3 border rounded-lg transition-all ${
                  tech.aiOptimized
                    ? "border-blue-200 bg-gradient-to-r from-blue-50/30 to-white hover:border-blue-300"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder-user.jpg" alt={tech.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{tech.name}</h4>
                      {getStatusIcon(tech.status)}
                      <Badge 
                        variant="outline" 
                        className={`text-xs h-5 ${
                          tech.status === "available" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        {tech.status}
                      </Badge>
                      {tech.aiOptimized && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs h-5 flex items-center gap-1">
                          <Sparkles size={10} />
                          AI Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{tech.specialization}</p>
                    {tech.aiOptimized && tech.aiRecommendation && (
                      <p className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
                        <TrendingUp size={10} />
                        {tech.aiRecommendation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-600">Workload: </span>
                    <span className="font-semibold text-gray-900">{tech.currentLoad}/{tech.maxLoad}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency: </span>
                    <span className="font-semibold text-green-600">{tech.efficiency}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available: </span>
                    <span className="font-semibold text-blue-600">{tech.nextAvailable}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600" />
            <p className="text-xs text-gray-700">
              <span className="font-medium">AI Suggestion:</span> Reassign 2 pending services to available technicians for 15% faster completion
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

