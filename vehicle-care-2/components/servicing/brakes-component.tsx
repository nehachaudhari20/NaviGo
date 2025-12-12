"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Brain } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface BrakesComponentProps {
  brakePadData: Array<{ day: string; FL: number; FR: number; RL: number; RR: number; threshold: number }>
}

export default function BrakesComponent({ brakePadData }: BrakesComponentProps) {
  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/30 shadow-2xl shadow-black/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">🛑 Brakes</h3>
            <p className="text-slate-400 text-sm mt-1">Regenerative + Hydraulic Blend System</p>
          </div>
          <Badge className="bg-red-500/20 text-red-500">72/100</Badge>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-2">Health Status</div>
          <div className="w-full h-8 bg-slate-900/30 backdrop-blur-sm rounded-full overflow-hidden border border-slate-700/30">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-end pr-3 text-white text-xs font-semibold" style={{ width: "72%" }}>
              72%
            </div>
          </div>
        </div>

        <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-4">
          <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            URGENT: Brake Pad Replacement Needed
          </div>
          <div className="text-red-200 text-sm">
            Front pads at 78% wear, deteriorating 0.75% per day. Estimated replacement in 29 days or 500 km (whichever comes first). Risk of brake failure: 12%. DO NOT DELAY.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Front Pad Wear", value: "78%", status: "critical", desc: "🔴 URGENT" },
            { label: "Rear Pad Wear", value: "62%", status: "warning", desc: "⚠️ Monitor" },
            { label: "Hydraulic Pressure", value: "240 bar", status: "ok", desc: "✓ Normal" },
            { label: "Failure Risk", value: "12%", status: "critical", desc: "🔴 Medium-High" },
          ].map((metric, i) => (
            <div key={i} className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
              <div className="text-slate-400 text-xs uppercase mb-1">{metric.label}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className={`text-xs mt-1 ${
                metric.status === "ok" ? "text-green-500" :
                metric.status === "warning" ? "text-yellow-500" :
                "text-red-500"
              }`}>
                {metric.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 shadow-md">
          <div className="text-center text-slate-300 font-semibold text-sm mb-4">Brake Pad Wear Forecast (All Wheels)</div>
          <ChartContainer
            config={{
              FL: { label: "FL (Front Left) - URGENT", color: "hsl(0, 84%, 60%)" },
              FR: { label: "FR (Front Right) - URGENT", color: "hsl(25, 95%, 53%)" },
              RL: { label: "RL (Rear Left)", color: "hsl(199, 89%, 48%)" },
              RR: { label: "RR (Rear Right)", color: "hsl(262, 83%, 58%)" },
              threshold: { label: "Replacement Threshold", color: "hsl(43, 96%, 56%)" },
            }}
            className="h-[300px]"
          >
            <LineChart data={brakePadData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: "#94a3b8" }} />
              <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="FL" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
              <Line type="monotone" dataKey="FR" stroke="hsl(25, 95%, 53%)" strokeWidth={2} />
              <Line type="monotone" dataKey="RL" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
              <Line type="monotone" dataKey="RR" stroke="hsl(262, 83%, 58%)" strokeWidth={2} />
              <Line type="monotone" dataKey="threshold" stroke="hsl(43, 96%, 56%)" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm p-4 rounded-lg border-l-4 border-cyan-500 shadow-md">
          <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Brain size={16} />
            AI Analysis
          </div>
          <div className="text-slate-300 text-sm leading-relaxed">
            Front brake pads critical. Deteriorating 0.75%/day due to urban driving and hard braking patterns. Increase regen braking on downhill slopes to extend pad life by 25-30%. Schedule replacement within 500 km. Cost: ₹5,200. Benefit: Avoid ₹45,000 emergency repair. Confidence: 94%
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900">Schedule Pad Replacement NOW</Button>
          <Button variant="outline" className="border-slate-600">Optimization Tips</Button>
        </div>
      </CardContent>
    </Card>
  )
}

