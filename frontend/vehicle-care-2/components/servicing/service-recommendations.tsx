"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface Service {
  id: number
  name: string
  priority: string
  priorityColor: string
  priorityText: string
  borderColor: string
  km: string
  cost: string
  time: string
  confidence: string
  why: string
  benefit: string
}

interface ServiceRecommendationsProps {
  services: Service[]
}

export default function ServiceRecommendations({ services }: ServiceRecommendationsProps) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
          <Calendar className="text-cyan-400" size={24} />
          Recommended Services (Priority-Ordered by AI)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-slate-900/30 backdrop-blur-sm border-l-4 ${service.borderColor} rounded-lg p-5 grid md:grid-cols-[1fr_auto] gap-5 items-start hover:bg-slate-900/50 transition-all shadow-md`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${service.priorityColor} ${service.priorityText}`}>{service.priority}</Badge>
                <h3 className="text-lg font-semibold">{service.name}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">Distance Remaining</div>
                  <div className="font-semibold">{service.km}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">Cost</div>
                  <div className="font-semibold">{service.cost}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">Duration</div>
                  <div className="font-semibold">{service.time}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase mb-1">AI Confidence</div>
                  <div className="font-semibold">{service.confidence}</div>
                </div>
              </div>
              <div className={`p-4 rounded-lg text-sm leading-relaxed ${
                service.priority === "URGENT" ? "bg-red-500/10 text-red-200" : "bg-yellow-500/10 text-yellow-200"
              }`}>
                <strong>Why:</strong> {service.why}
                <br />
                <strong>Benefit:</strong> {service.benefit}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 whitespace-nowrap">Schedule Now</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

