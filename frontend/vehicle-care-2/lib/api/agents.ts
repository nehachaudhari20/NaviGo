/**
 * Agents API Service
 * Handles all agent-related API calls
 */

import { API_BASE_URL, getHeaders, API_TIMEOUT } from './config'

// ============================================================================
// Types
// ============================================================================

export interface SubmitFeedbackRequest {
  booking_id: string
  vehicle_id: string
  technician_notes?: string
  customer_rating?: number
  prediction_accurate?: boolean
  accuracy_score?: number
  actual_issue?: string
  parts_used?: string[]
  post_service_telemetry?: any[]
}

export interface SubmitFeedbackResponse {
  status: 'success' | 'error'
  message_id?: string
  message?: string
  error?: string
}

export interface UpdateHumanReviewRequest {
  reviewId: string
  decision: 'approved' | 'rejected'
  notes?: string
}

export interface UpdateHumanReviewResponse {
  status: 'success' | 'error'
  message?: string
  error?: string
}

export interface TriggerCommunicationRequest {
  engagement_id: string
  case_id: string
  vehicle_id: string
  customer_phone: string
  customer_name?: string
  transcript_template?: string
  root_cause?: string
  recommended_action?: string
  best_slot?: string
}

export interface TriggerCommunicationResponse {
  status: 'success' | 'error'
  message_id?: string
  message?: string
  error?: string
}

export interface TriggerAgentRequest {
  agent_name: string
  case_id: string
  vehicle_id: string
  data?: Record<string, any>
}

export interface TriggerAgentResponse {
  status: 'success' | 'error'
  message_id?: string
  message?: string
  error?: string
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Submit service feedback
 */
export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<SubmitFeedbackResponse> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_BASE_URL}/submit_feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
      mode: 'cors',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Submit feedback error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update human review decision
 */
export async function updateHumanReview(
  data: UpdateHumanReviewRequest
): Promise<UpdateHumanReviewResponse> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_BASE_URL}/update_human_review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
      mode: 'cors',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Update human review error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Trigger communication agent (voice call or SMS)
 */
export async function triggerCommunication(
  data: TriggerCommunicationRequest
): Promise<TriggerCommunicationResponse> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_BASE_URL}/trigger_communication`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
      mode: 'cors',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Trigger communication error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Trigger any agent manually (for testing/debugging)
 */
export async function triggerAgent(
  data: TriggerAgentRequest
): Promise<TriggerAgentResponse> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${API_BASE_URL}/trigger_agent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      signal: controller.signal,
      mode: 'cors',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Trigger agent error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

