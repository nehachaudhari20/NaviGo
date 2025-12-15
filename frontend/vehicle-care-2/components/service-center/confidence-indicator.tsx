"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConfidenceIndicatorProps {
  confidence: number
  breakdown?: {
    prediction: number
    historical: number
    dataQuality: number
    patternMatch: number
  }
  showBreakdown?: boolean
  size?: "sm" | "md" | "lg"
}

export default function ConfidenceIndicator({
  confidence,
  breakdown,
  showBreakdown = false,
  size = "md",
}: ConfidenceIndicatorProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700 border-green-300"
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-300"
    return "bg-red-100 text-red-700 border-red-300"
  }

  const getConfidenceIcon = (score: number) => {
    if (score >= 85) return <CheckCircle2 size={14} className="text-green-600" />
    if (score >= 70) return <Clock size={14} className="text-yellow-600" />
    return <AlertCircle size={14} className="text-red-600" />
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return "High - Autonomous Action"
    if (score >= 70) return "Medium - Review Recommended"
    return "Low - Human Review Required"
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-0.5"
      case "lg":
        return "text-sm px-4 py-1.5"
      default:
        return "text-xs px-3 py-1"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${getConfidenceColor(confidence)} ${getSizeClasses(size)} flex items-center gap-1.5 cursor-help`}
          >
            {getConfidenceIcon(confidence)}
            <span className="font-semibold">{confidence}%</span>
            <span className="hidden sm:inline">Confidence</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <div className="font-semibold text-sm mb-2">
              {getConfidenceLabel(confidence)}
            </div>
            {showBreakdown && breakdown && (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prediction Confidence:</span>
                  <span className="font-semibold">{breakdown.prediction}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Historical Accuracy:</span>
                  <span className="font-semibold">{breakdown.historical}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Quality:</span>
                  <span className="font-semibold">{breakdown.dataQuality}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pattern Match:</span>
                  <span className="font-semibold">{breakdown.patternMatch}%</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 mt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Overall:</span>
                    <span className="font-bold">{confidence}%</span>
                  </div>
                </div>
              </div>
            )}
            {confidence >= 85 && (
              <div className="text-xs text-green-600 mt-2 pt-2 border-t border-gray-200">
                ✓ This prediction will trigger autonomous action
              </div>
            )}
            {confidence < 85 && (
              <div className="text-xs text-yellow-600 mt-2 pt-2 border-t border-gray-200">
                ⚠ This prediction requires human review
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

