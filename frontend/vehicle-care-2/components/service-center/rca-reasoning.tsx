"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  AlertTriangle, 
  Lightbulb, 
  FileText,
  TrendingUp,
  CheckCircle2,
  ExternalLink
} from "lucide-react"
import { useState } from "react"

interface RCAReasoningProps {
  predictionId: string
  rcaAnalysis?: {
    rootCause: string
    contributingFactors: string[]
    likelihood: number
    similarCases: number
    confidence: number
  }
  capaRecommendations?: {
    correctiveActions: string[]
    preventiveActions: string[]
    serviceProcedures: string[]
    priority: "high" | "medium" | "low"
  }
  component: string
  issueType: string
  severity: string
}

export default function RCAReasoning({
  predictionId,
  rcaAnalysis,
  capaRecommendations,
  component,
  issueType,
  severity,
}: RCAReasoningProps) {
  const [activeTab, setActiveTab] = useState<"rca" | "capa">("rca")

  // Mock data if not provided
  const rca = rcaAnalysis || {
    rootCause: "Brake pad material degradation due to excessive heat cycles and aggressive driving patterns. The friction material is wearing at an accelerated rate beyond normal specifications.",
    contributingFactors: [
      "High-frequency braking in urban traffic conditions",
      "Elevated operating temperatures exceeding 200°C",
      "Insufficient cooling intervals between braking events",
      "Potential misalignment causing uneven pad wear"
    ],
    likelihood: 92,
    similarCases: 47,
    confidence: 88,
  }

  const capa = capaRecommendations || {
    correctiveActions: [
      "Replace front brake pads with high-temperature rated ceramic compound",
      "Inspect and resurface brake rotors if necessary",
      "Check brake caliper alignment and adjust if needed",
      "Flush and replace brake fluid to ensure optimal performance"
    ],
    preventiveActions: [
      "Recommend driver education on braking techniques",
      "Schedule follow-up inspection after 5,000 km",
      "Consider upgrading to performance brake pads for high-usage vehicles",
      "Implement predictive maintenance alerts at 70% pad wear"
    ],
    serviceProcedures: [
      "Follow OEM service manual Section 4.2.1 for brake pad replacement",
      "Use torque specifications: Caliper bolts 35 Nm, Pad retaining clips 15 Nm",
      "Perform brake system bleed after pad replacement",
      "Test drive and verify brake performance before vehicle release"
    ],
    priority: "high" as const,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-700 border-blue-300"
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            RCA Reasoning & CAPA
          </CardTitle>
          <Badge className={`text-xs ${getPriorityColor(capa.priority)}`}>
            {capa.priority.toUpperCase()} Priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("rca")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "rca"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Root Cause Analysis
          </button>
          <button
            onClick={() => setActiveTab("capa")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "capa"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            CAPA Recommendations
          </button>
        </div>

        {activeTab === "rca" ? (
          <div className="space-y-4">
            {/* Root Cause */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <h4 className="text-sm font-semibold text-gray-900">Root Cause</h4>
              </div>
              <p className="text-sm text-gray-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {rca.rootCause}
              </p>
            </div>

            {/* Contributing Factors */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-orange-600" />
                <h4 className="text-sm font-semibold text-gray-900">Contributing Factors</h4>
              </div>
              <ul className="space-y-2">
                {rca.contributingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Analysis Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Likelihood</p>
                <p className="text-lg font-bold text-gray-900">{rca.likelihood}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Similar Cases</p>
                <p className="text-lg font-bold text-gray-900">{rca.similarCases}</p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-600">Analysis Confidence</span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                {rca.confidence}%
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Corrective Actions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">Corrective Actions</h4>
              </div>
              <ul className="space-y-2">
                {capa.correctiveActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-2.5">
                    <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Actions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">Preventive Actions</h4>
              </div>
              <ul className="space-y-2">
                {capa.preventiveActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                    <Lightbulb size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Procedures */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">Service Procedures</h4>
              </div>
              <ul className="space-y-2">
                {capa.serviceProcedures.map((procedure, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-purple-50 border border-purple-200 rounded-lg p-2.5">
                    <FileText size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{procedure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                <ExternalLink size={14} className="mr-1.5" />
                View Full CAPA
              </Button>
              <Button size="sm" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700">
                Apply Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

