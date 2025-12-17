/**
 * API Service Index
 * Central export for all API services
 */

export * from './config'
export * from './telemetry'
export * from './firestore'
export * from './agents'
export * from './dashboard-data'

// Re-export commonly used types
export type {
  TelematicsEvent,
  TelemetryResponse,
  AnomalyCase,
  DiagnosisCase,
  RCACase,
  SchedulingCase,
  EngagementCase,
  FeedbackCase,
  ManufacturingCase,
} from './firestore'
