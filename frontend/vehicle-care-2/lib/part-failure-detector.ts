"use client"

/**
 * Automatic Part Failure Detection System
 * Identifies parts that should be sent to manufacturer based on failure patterns
 */

export interface PartFailureData {
  partId: string
  partName: string
  partNumber: string
  failureCount: number
  failureRate: number // percentage
  timeToFailure: number // average days
  batchNumber?: string
  affectedVehicles: number
  failureType: string
  defectCategory: "manufacturing" | "design" | "material" | "unknown"
  severity: "critical" | "high" | "medium" | "low"
}

export interface FailurePattern {
  type: "recurring" | "batch_issue" | "isolated"
  confidence: number
  recommendation: "send_to_manufacturer" | "monitor" | "no_action"
  priority: number // 0-100
}

/**
 * Analyzes part failure data to detect patterns
 */
export function detectFailurePattern(data: PartFailureData): FailurePattern {
  const { failureCount, failureRate, affectedVehicles, batchNumber } = data

  // Batch Issue Detection
  if (batchNumber && failureCount >= 5 && failureRate > 20) {
    return {
      type: "batch_issue",
      confidence: Math.min(95, 70 + (failureRate / 2)),
      recommendation: "send_to_manufacturer",
      priority: 90 + (failureRate / 10),
    }
  }

  // Recurring Failure Detection
  if (failureCount >= 3 && failureRate > 15 && affectedVehicles >= 3) {
    return {
      type: "recurring",
      confidence: Math.min(95, 65 + (failureCount * 5) + (failureRate / 2)),
      recommendation: "send_to_manufacturer",
      priority: 80 + (failureCount * 3),
    }
  }

  // Isolated Failure
  if (failureCount <= 2 && failureRate < 10) {
    return {
      type: "isolated",
      confidence: 50,
      recommendation: "monitor",
      priority: 30,
    }
  }

  // Default: Monitor
  return {
    type: "isolated",
    confidence: 60,
    recommendation: "monitor",
    priority: 50,
  }
}

/**
 * Determines if a part should be automatically sent to manufacturer
 */
export function shouldAutoSendToManufacturer(
  data: PartFailureData,
  pattern: FailurePattern
): boolean {
  // Auto-send criteria:
  // 1. High confidence (≥85%)
  // 2. Recurring or batch issue pattern
  // 3. High priority (≥80)
  // 4. Critical or high severity

  return (
    pattern.confidence >= 85 &&
    (pattern.type === "recurring" || pattern.type === "batch_issue") &&
    pattern.priority >= 80 &&
    (data.severity === "critical" || data.severity === "high")
  )
}

/**
 * Generates defect analysis request for manufacturer
 */
export function generateDefectAnalysisRequest(
  data: PartFailureData,
  pattern: FailurePattern
) {
  return {
    partId: data.partId,
    partName: data.partName,
    partNumber: data.partNumber,
    failurePattern: pattern.type,
    defectCategory: data.defectCategory,
    severity: data.severity,
    failureCount: data.failureCount,
    failureRate: data.failureRate,
    affectedVehicles: data.affectedVehicles,
    batchNumber: data.batchNumber,
    aiConfidence: pattern.confidence,
    priority: pattern.priority,
    recommendedAction: pattern.recommendation,
    timestamp: new Date().toISOString(),
  }
}
