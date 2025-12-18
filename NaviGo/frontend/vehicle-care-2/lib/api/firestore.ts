/**
 * Firestore API Service
 * Handles reading data from Firestore collections
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { 
  getFirestore, 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { API_ENDPOINTS } from './config'

// Initialize Firebase if not already initialized
let app: FirebaseApp
let db: Firestore

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'navigo-27206',
      // Add other Firebase config if needed
    })
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
}

// Export db for use in other modules
export { db }

// Type definitions for Firestore documents
export interface AnomalyCase {
  case_id: string
  vehicle_id: string
  anomaly_type: string | null
  anomaly_detected?: boolean
  confidence?: number
  severity?: 'Low' | 'Medium' | 'High' | 'low' | 'medium' | 'high' | 'critical' | 'Critical'
  severity_score?: number | null
  status?: 'pending_diagnosis' | 'diagnosing' | 'diagnosed' | 'scheduled' | 'engaged' | 'completed' | 'open' | 'resolved' | 'closed'
  detected_at?: Timestamp | string
  created_at?: Timestamp | string
  telemetry_snapshot?: any
  telemetry_event_ids?: string[]
}

export interface DiagnosisCase {
  diagnosis_id: string
  case_id: string
  vehicle_id: string
  component: string
  failure_probability: number
  estimated_rul_days: number
  severity: 'Low' | 'Medium' | 'High'
  confidence: number
  created_at: Timestamp | string
}

export interface RCACase {
  rca_id: string
  vehicle_id: string
  case_id: string
  root_cause: string
  confidence: number
  recommended_action: string
  capa_type: 'Corrective' | 'Preventive'
  created_at: Timestamp | string
}

export interface SchedulingCase {
  scheduling_id: string
  vehicle_id: string
  case_id: string
  best_slot: string // ISO timestamp
  service_center: string
  slot_type: 'urgent' | 'normal' | 'delayed'
  fallback_slots: string[]
  status: 'pending' | 'confirmed' | 'declined' | 'completed'
  created_at: Timestamp | string
}

export interface EngagementCase {
  engagement_id: string
  vehicle_id: string
  case_id: string
  engagement_type: 'sms' | 'voice' | 'app'
  script: string
  customer_response?: string
  customer_decision?: 'confirmed' | 'declined' | 'no_response'
  created_at: Timestamp | string
}

export interface FeedbackCase {
  feedback_id: string
  case_id: string
  vehicle_id: string
  service_center: string
  service_date: string
  validation_label: 'Correct' | 'Incorrect' | 'Recurring' | 'False Positive'
  cei_score: number
  customer_satisfaction?: number
  notes?: string
  created_at: Timestamp | string
}

export interface ManufacturingCase {
  manufacturing_id: string
  case_id: string
  component: string
  root_cause: string
  recurrence_count: number
  severity: 'Low' | 'Medium' | 'High'
  capa_recommendation: string
  affected_vehicles: number
  created_at: Timestamp | string
}

/**
 * Generic function to get documents from a collection
 */
async function getCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  maxResults?: number
): Promise<T[]> {
  if (typeof window === 'undefined' || !db) {
    return []
  }

  try {
    const collectionRef = collection(db, collectionName)
    let q = query(collectionRef, ...constraints)
    
    if (maxResults) {
      q = query(q, limit(maxResults))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error)
    return []
  }
}

/**
 * Get a single document by ID
 */
async function getDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  if (typeof window === 'undefined' || !db) {
    return null
  }

  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as T
    }
    return null
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${documentId}:`, error)
    return null
  }
}

/**
 * Subscribe to real-time updates from a collection
 */
// Track active subscriptions to prevent duplicates
const activeSubscriptions = new Map<string, () => void>()

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (typeof window === 'undefined' || !db) {
    return () => {}
  }

  // Create a unique key for this subscription
  const subscriptionKey = `${collectionName}_${JSON.stringify(constraints)}`
  
  // If subscription already exists, return existing unsubscribe
  // This is expected when multiple components use the same hook with same parameters
  // or when React Strict Mode double-invokes effects in development
  if (activeSubscriptions.has(subscriptionKey)) {
    // Silently reuse existing subscription - this is correct behavior
    // No need to log as it's expected and handled correctly
    return activeSubscriptions.get(subscriptionKey)!
  }

  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
        callback(data)
      },
      (error) => {
        console.error(`Error in ${collectionName} subscription:`, error)
        
        // Handle QUIC errors gracefully
        if (error instanceof Error && (
          error.message.includes('QUIC') || 
          error.message.includes('ERR_QUIC') ||
          error.message.includes('too many')
        )) {
          console.warn(`[Firestore] QUIC error detected, cleaning up subscription: ${subscriptionKey}`)
          activeSubscriptions.delete(subscriptionKey)
          // Don't retry automatically - let the component handle it
          // This prevents infinite retry loops
        }
        
        if (onError) {
          onError(error)
        }
      },
      {
        // Add error handling options
        includeMetadataChanges: false,
      }
    )

    // Store unsubscribe function
    const cleanup = () => {
      unsubscribe()
      activeSubscriptions.delete(subscriptionKey)
    }
    
    activeSubscriptions.set(subscriptionKey, cleanup)
    return cleanup
  } catch (error) {
    console.error(`Error setting up ${collectionName} subscription:`, error)
    if (onError && error instanceof Error) {
      onError(error)
    }
    return () => {}
  }
}

// Anomaly Cases
export async function getAnomalyCases(
  vehicleId?: string,
  maxResults = 50
): Promise<AnomalyCase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by vehicle_id, then sort in memory
  const constraints: QueryConstraint[] = []
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  // Fetch more results to sort in memory
  const results = await getCollection<AnomalyCase>(
    API_ENDPOINTS.COLLECTIONS.ANOMALY_CASES,
    constraints,
    maxResults * 2 // Get more to ensure we have enough after sorting
  )
  
  // Sort by detected_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.detected_at 
      ? (typeof a.detected_at === 'string' ? new Date(a.detected_at).getTime() : a.detected_at.toDate().getTime())
      : 0
    const bTime = b.detected_at 
      ? (typeof b.detected_at === 'string' ? new Date(b.detected_at).getTime() : b.detected_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getAnomalyCase(caseId: string): Promise<AnomalyCase | null> {
  return getDocument<AnomalyCase>(API_ENDPOINTS.COLLECTIONS.ANOMALY_CASES, caseId)
}

// Diagnosis Cases
export async function getDiagnosisCases(
  caseId?: string,
  vehicleId?: string,
  maxResults = 50
): Promise<DiagnosisCase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by case_id/vehicle_id, then sort in memory
  const constraints: QueryConstraint[] = []
  if (caseId) {
    constraints.push(where('case_id', '==', caseId))
  }
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  
  // Fetch more results to ensure we have enough after sorting
  const results = await getCollection<DiagnosisCase>(
    API_ENDPOINTS.COLLECTIONS.DIAGNOSIS_CASES,
    constraints,
    maxResults * 2
  )
  
  // Sort by created_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.created_at 
      ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
      : 0
    const bTime = b.created_at 
      ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getDiagnosisCase(diagnosisId: string): Promise<DiagnosisCase | null> {
  return getDocument<DiagnosisCase>(API_ENDPOINTS.COLLECTIONS.DIAGNOSIS_CASES, diagnosisId)
}

// RCA Cases
export async function getRCACases(
  caseId?: string,
  vehicleId?: string,
  maxResults = 50
): Promise<RCACase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by case_id/vehicle_id, then sort in memory
  const constraints: QueryConstraint[] = []
  if (caseId) {
    constraints.push(where('case_id', '==', caseId))
  }
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  
  // Fetch more results to ensure we have enough after sorting
  const results = await getCollection<RCACase>(
    API_ENDPOINTS.COLLECTIONS.RCA_CASES,
    constraints,
    maxResults * 2
  )
  
  // Sort by created_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.created_at 
      ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
      : 0
    const bTime = b.created_at 
      ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getRCACase(rcaId: string): Promise<RCACase | null> {
  return getDocument<RCACase>(API_ENDPOINTS.COLLECTIONS.RCA_CASES, rcaId)
}

// Scheduling Cases
export async function getSchedulingCases(
  vehicleId?: string,
  status?: string,
  maxResults = 50
): Promise<SchedulingCase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by vehicle_id/status, then sort in memory
  const constraints: QueryConstraint[] = []
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  if (status) {
    constraints.push(where('status', '==', status))
  }
  
  // Fetch more results to ensure we have enough after sorting
  const results = await getCollection<SchedulingCase>(
    API_ENDPOINTS.COLLECTIONS.SCHEDULING_CASES,
    constraints,
    maxResults * 2
  )
  
  // Sort by created_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.created_at 
      ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
      : 0
    const bTime = b.created_at 
      ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getSchedulingCase(schedulingId: string): Promise<SchedulingCase | null> {
  return getDocument<SchedulingCase>(API_ENDPOINTS.COLLECTIONS.SCHEDULING_CASES, schedulingId)
}

// Engagement Cases
export async function getEngagementCases(
  vehicleId?: string,
  maxResults = 50
): Promise<EngagementCase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by vehicle_id, then sort in memory
  const constraints: QueryConstraint[] = []
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  
  // Fetch more results to ensure we have enough after sorting
  const results = await getCollection<EngagementCase>(
    API_ENDPOINTS.COLLECTIONS.ENGAGEMENT_CASES,
    constraints,
    maxResults * 2
  )
  
  // Sort by created_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.created_at 
      ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
      : 0
    const bTime = b.created_at 
      ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getEngagementCase(engagementId: string): Promise<EngagementCase | null> {
  return getDocument<EngagementCase>(API_ENDPOINTS.COLLECTIONS.ENGAGEMENT_CASES, engagementId)
}

// Feedback Cases
export async function getFeedbackCases(
  vehicleId?: string,
  caseId?: string,
  maxResults = 50
): Promise<FeedbackCase[]> {
  // Simplified query to avoid composite index requirement
  // Only filter by vehicle_id/case_id, then sort in memory
  const constraints: QueryConstraint[] = []
  if (vehicleId) {
    constraints.push(where('vehicle_id', '==', vehicleId))
  }
  if (caseId) {
    constraints.push(where('case_id', '==', caseId))
  }
  
  // Fetch more results to ensure we have enough after sorting
  const results = await getCollection<FeedbackCase>(
    API_ENDPOINTS.COLLECTIONS.FEEDBACK_CASES,
    constraints,
    maxResults * 2
  )
  
  // Sort by created_at in memory (descending)
  const sorted = results.sort((a, b) => {
    const aTime = a.created_at 
      ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
      : 0
    const bTime = b.created_at 
      ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
      : 0
    return bTime - aTime
  })
  
  return sorted.slice(0, maxResults)
}

export async function getFeedbackCase(feedbackId: string): Promise<FeedbackCase | null> {
  return getDocument<FeedbackCase>(API_ENDPOINTS.COLLECTIONS.FEEDBACK_CASES, feedbackId)
}

// Manufacturing Cases
export async function getManufacturingCases(
  component?: string,
  maxResults = 50
): Promise<ManufacturingCase[]> {
  const constraints: QueryConstraint[] = [orderBy('created_at', 'desc')]
  if (component) {
    constraints.unshift(where('component', '==', component))
  }
  return getCollection<ManufacturingCase>(
    API_ENDPOINTS.COLLECTIONS.MANUFACTURING_CASES,
    constraints,
    maxResults
  )
}

export async function getManufacturingCase(manufacturingId: string): Promise<ManufacturingCase | null> {
  return getDocument<ManufacturingCase>(API_ENDPOINTS.COLLECTIONS.MANUFACTURING_CASES, manufacturingId)
}

// Telemetry Events
export async function getTelemetryEvents(
  vehicleId: string,
  maxResults = 100
): Promise<any[]> {
  const constraints: QueryConstraint[] = [
    where('vehicle_id', '==', vehicleId),
    orderBy('timestamp_utc', 'desc'),
  ]
  return getCollection(
    API_ENDPOINTS.COLLECTIONS.TELEMETRY_EVENTS,
    constraints,
    maxResults
  )
}
