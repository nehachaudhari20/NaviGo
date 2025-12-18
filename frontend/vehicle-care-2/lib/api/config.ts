/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// Get API base URL from environment or use default
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
  'https://us-central1-navigo-27206.cloudfunctions.net'

// Cloud Function endpoints
export const API_ENDPOINTS = {
  // Direct HTTP endpoints
  INGEST_TELEMETRY: `${API_BASE_URL}/ingest_telemetry`,
  SUBMIT_FEEDBACK: `${API_BASE_URL}/submit_feedback`,
  UPDATE_HUMAN_REVIEW: `${API_BASE_URL}/update_human_review`,
  TRIGGER_COMMUNICATION: `${API_BASE_URL}/trigger_communication`,
  TRIGGER_AGENT: `${API_BASE_URL}/trigger_agent`,
  
  // Firestore collections (read via Firestore SDK)
  COLLECTIONS: {
    TELEMETRY_EVENTS: 'telemetry_events',
    ANOMALY_CASES: 'anomaly_cases',
    DIAGNOSIS_CASES: 'diagnosis_cases',
    RCA_CASES: 'rca_cases',
    SCHEDULING_CASES: 'scheduling_cases',
    ENGAGEMENT_CASES: 'engagement_cases',
    FEEDBACK_CASES: 'feedback_cases',
    MANUFACTURING_CASES: 'manufacturing_cases',
    BOOKINGS: 'bookings',
    VEHICLES: 'vehicles',
    HUMAN_REVIEWS: 'human_reviews',
    COMMUNICATION_CASES: 'communication_cases',
    PIPELINE_STATES: 'pipeline_states',
  },
} as const

// API request timeout (ms)
export const API_TIMEOUT = 30000

// Request headers
export const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})
