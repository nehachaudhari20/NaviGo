"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

const pipelineStages = [
  { num: 1, title: "Vehicle Sensors", desc: "CAN-BUS, BMS, TPMS, ADAS" },
  { num: 2, title: "Data Ingestion", desc: "Normalization, Validation, Enrichment" },
  { num: 3, title: "Anomaly Detection", desc: "Isolation Forest ML Model" },
  { num: 4, title: "AI Diagnosis", desc: "LangGraph + GPT-4 Reasoning" },
  { num: 5, title: "Confidence Check", desc: "4-Factor Scoring (92-96%)" },
  { num: 6, title: "Smart Scheduling", desc: "OR-Tools CSP Optimization" },
]

export default function DataPipeline() {
  return (
    <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-cyan-400 text-center flex items-center justify-center gap-2">
          <Brain className="text-cyan-400" size={24} />
          AI Data Analysis Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          {pipelineStages.map((stage, idx) => (
            <div key={idx} className="relative">
              <div className="bg-slate-900/80 border-2 border-cyan-500 rounded-lg p-5 text-center hover:border-cyan-400 transition-all">
                <div className="inline-block bg-cyan-500 text-slate-900 w-8 h-8 rounded-full leading-8 font-bold mb-2">
                  {stage.num}
                </div>
                <div className="text-cyan-400 font-semibold text-sm mb-1">{stage.title}</div>
                <div className="text-slate-300 text-xs">{stage.desc}</div>
              </div>
              {idx < pipelineStages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-cyan-500 text-2xl z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

