/**
 * Dashboard Data API Service
 * Fetches real-time data from Firestore for all dashboards
 */

import { API_ENDPOINTS } from './config'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from './firestore'

// ============================================================================
// Types
// ============================================================================

export interface VehicleData {
  id: string
  vehicle_id: string
  owner_name?: string
  owner_phone?: string
  registration_number?: string
  make?: string
  model?: string
  year?: number
  health_score?: number
  last_service_date?: string
  mileage?: number
  status?: string
}

export interface DiagnosisCase {
  id: string
  case_id: string
  diagnosis_id?: string  // Added for diagnosis agent
  vehicle_id: string
  anomaly_id?: string
  predicted_failure?: string
  confidence?: number
  confidence_score?: number  // Alternative field name
  failure_probability?: number  // From diagnosis agent
  estimated_rul_days?: number  // From diagnosis agent
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'Critical' | 'High' | 'Medium' | 'Low'
  component?: string
  created_at?: Timestamp
  status?: string
}

export interface SchedulingCase {
  id: string
  case_id: string
  vehicle_id: string
  diagnosis_id?: string
  engagement_id?: string
  recommended_slot?: string
  status?: string
  created_at?: Timestamp
}

export interface EngagementCase {
  id: string
  case_id: string
  vehicle_id: string
  scheduling_id?: string
  script_generated?: string
  communication_method?: 'voice' | 'sms'
  status?: string
  created_at?: Timestamp
}

export interface Booking {
  id: string
  booking_id: string
  vehicle_id: string
  service_center_id?: string
  scheduled_date?: string
  scheduled_time?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  service_type?: string
  created_at?: Timestamp
}

export interface HumanReview {
  id: string
  review_id: string
  vehicle_id: string
  prediction_id?: string
  confidence?: number
  severity?: 'critical' | 'high' | 'medium' | 'low'
  review_status?: 'pending' | 'approved' | 'rejected'
  created_at?: Timestamp
}

export interface FeedbackCase {
  id: string
  case_id: string
  booking_id: string
  vehicle_id: string
  accuracy_score?: number
  prediction_accurate?: boolean
  created_at?: Timestamp
}

export interface ManufacturingCase {
  id: string
  case_id: string
  vehicle_id: string
  defect_pattern?: string
  capa_recommendations?: string
  created_at?: Timestamp
}

// ============================================================================
// Customer Dashboard Data
// ============================================================================

/**
 * Get vehicle data for customer
 */
export async function getCustomerVehicle(vehicleId: string): Promise<VehicleData | null> {
  try {
    const vehicleRef = doc(db, API_ENDPOINTS.COLLECTIONS.VEHICLES, vehicleId)
    const vehicleSnap = await getDoc(vehicleRef)
    
    if (!vehicleSnap.exists()) {
      return null
    }
    
    return {
      id: vehicleSnap.id,
      ...vehicleSnap.data()
    } as VehicleData
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return null
  }
}

/**
 * Get service history for customer
 * Note: Simplified query to avoid composite index requirement
 * Sorts in memory after fetching
 */
export async function getCustomerServiceHistory(vehicleId: string, limitCount: number = 10): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, API_ENDPOINTS.COLLECTIONS.BOOKINGS)
    // Simplified query - only filter by vehicle_id, then sort in memory
    const q = query(
      bookingsRef,
      where('vehicle_id', '==', vehicleId),
      limit(limitCount * 3) // Get more to ensure we have enough after sorting
    )
    
    const querySnapshot = await getDocs(q)
    const allBookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[]
    
    // Sort by created_at in memory (descending)
    const sorted = allBookings.sort((a, b) => {
      const aTime = a.created_at 
        ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
        : 0
      const bTime = b.created_at 
        ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
        : 0
      return bTime - aTime
    })
    
    return sorted.slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching service history:', error)
    return []
  }
}

/**
 * Get active predictions for customer
 * Note: Simplified query to avoid composite index requirement
 * Sorts in memory after fetching
 */
export async function getCustomerPredictions(vehicleId: string): Promise<DiagnosisCase[]> {
  try {
    const diagnosisRef = collection(db, API_ENDPOINTS.COLLECTIONS.DIAGNOSIS_CASES)
    // Simplified query - filter by vehicle_id and status, then sort in memory
    const q = query(
      diagnosisRef,
      where('vehicle_id', '==', vehicleId),
      where('status', '==', 'active'),
      limit(20) // Get more to ensure we have enough after sorting
    )
    
    const querySnapshot = await getDocs(q)
    const allCases = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DiagnosisCase[]
    
    // Sort by created_at in memory (descending)
    const sorted = allCases.sort((a, b) => {
      const aTime = a.created_at 
        ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
        : 0
      const bTime = b.created_at 
        ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
        : 0
      return bTime - aTime
    })
    
    return sorted.slice(0, 5)
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return []
  }
}

// ============================================================================
// Service Center Dashboard Data
// ============================================================================

/**
 * Get priority vehicle queue
 * Includes both diagnosis cases and anomaly cases
 * Note: Simplified query to avoid composite index requirement
 */
export async function getPriorityVehicles(limitCount: number = 10): Promise<DiagnosisCase[]> {
  try {
    const allCases: any[] = []
    
    // 1. Get diagnosis cases (active status)
    const diagnosisRef = collection(db, API_ENDPOINTS.COLLECTIONS.DIAGNOSIS_CASES)
    const diagnosisQuery = query(
      diagnosisRef,
      where('status', '==', 'active'),
      limit(limitCount * 3)
    )
    const diagnosisSnapshot = await getDocs(diagnosisQuery)
    const diagnosisCases = diagnosisSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      source: 'diagnosis'
    })) as any[]
    allCases.push(...diagnosisCases)
    
    // 2. Get anomaly cases (pending_diagnosis or diagnosing status with high severity)
    const anomalyRef = collection(db, API_ENDPOINTS.COLLECTIONS.ANOMALY_CASES)
    const anomalyQuery = query(
      anomalyRef,
      where('status', 'in', ['pending_diagnosis', 'diagnosing']),
      limit(limitCount * 3)
    )
    const anomalySnapshot = await getDocs(anomalyQuery)
    const anomalyCases = anomalySnapshot.docs.map(doc => {
      const data = doc.data()
      // Convert anomaly case to diagnosis-like format
      const severityScore = data.severity_score || 0
      let severity: string = 'medium'
      if (severityScore >= 0.7) severity = 'critical'
      else if (severityScore >= 0.4) severity = 'high'
      else if (severityScore >= 0.1) severity = 'medium'
      else severity = 'low'
      
      return {
        id: doc.id,
        case_id: data.case_id || doc.id,
        vehicle_id: data.vehicle_id,
        severity,
        confidence: Math.round((1 - severityScore) * 100), // Convert severity_score to confidence
        predicted_failure: data.anomaly_type || 'Anomaly detected',
        component: data.anomaly_type || 'Unknown',
        status: data.status,
        created_at: data.created_at || data.detected_at,
        source: 'anomaly',
        anomaly_type: data.anomaly_type,
        severity_score: severityScore
      }
    }) as any[]
    allCases.push(...anomalyCases)
    
    // 3. Filter and sort in memory
    const priorityCases = allCases
      .filter(c => {
        // Include critical/high severity cases
        const severity = c.severity?.toLowerCase() || 'medium'
        return severity === 'critical' || severity === 'high'
      })
      .sort((a, b) => {
        // Sort by severity first (critical > high), then by confidence
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const aSeverity = a.severity?.toLowerCase() || 'medium'
        const bSeverity = b.severity?.toLowerCase() || 'medium'
        const severityDiff = (severityOrder[aSeverity as keyof typeof severityOrder] || 99) - 
                            (severityOrder[bSeverity as keyof typeof severityOrder] || 99)
        if (severityDiff !== 0) return severityDiff
        return (b.confidence || 0) - (a.confidence || 0) // Higher confidence first
      })
      .slice(0, limitCount)
    
    return priorityCases as DiagnosisCase[]
  } catch (error) {
    console.error('Error fetching priority vehicles:', error)
    // If error is about index, return empty array (index will be created automatically)
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Firestore index required. The index will be created automatically. Please wait a few minutes.')
    }
    return []
  }
}

/**
 * Get human review queue
 */
export async function getHumanReviewQueue(limitCount: number = 20): Promise<HumanReview[]> {
  try {
    const reviewsRef = collection(db, API_ENDPOINTS.COLLECTIONS.HUMAN_REVIEWS)
    const q = query(
      reviewsRef,
      where('review_status', '==', 'pending'),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HumanReview[]
  } catch (error) {
    console.error('Error fetching human reviews:', error)
    return []
  }
}

/**
 * Get active bookings
 */
export async function getActiveBookings(limitCount: number = 20): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, API_ENDPOINTS.COLLECTIONS.BOOKINGS)
    const q = query(
      bookingsRef,
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('scheduled_date', 'asc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[]
  } catch (error) {
    console.error('Error fetching active bookings:', error)
    return []
  }
}

/**
 * Get engagement cases
 */
export async function getEngagementCases(limitCount: number = 20): Promise<EngagementCase[]> {
  try {
    const engagementRef = collection(db, API_ENDPOINTS.COLLECTIONS.ENGAGEMENT_CASES)
    const q = query(
      engagementRef,
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EngagementCase[]
  } catch (error) {
    console.error('Error fetching engagement cases:', error)
    return []
  }
}

// ============================================================================
// Manufacturer Dashboard Data
// ============================================================================

/**
 * Get manufacturing cases
 */
export async function getManufacturingCases(limitCount: number = 20): Promise<ManufacturingCase[]> {
  try {
    const manufacturingRef = collection(db, API_ENDPOINTS.COLLECTIONS.MANUFACTURING_CASES)
    const q = query(
      manufacturingRef,
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ManufacturingCase[]
  } catch (error) {
    console.error('Error fetching manufacturing cases:', error)
    return []
  }
}

/**
 * Get feedback cases for manufacturing insights
 */
export async function getFeedbackCases(limitCount: number = 50): Promise<FeedbackCase[]> {
  try {
    const feedbackRef = collection(db, API_ENDPOINTS.COLLECTIONS.FEEDBACK_CASES)
    const q = query(
      feedbackRef,
      orderBy('created_at', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FeedbackCase[]
  } catch (error) {
    console.error('Error fetching feedback cases:', error)
    return []
  }
}

// ============================================================================
// Real-time Listeners
// ============================================================================

/**
 * Subscribe to vehicle updates
 */
// Track vehicle subscriptions to prevent duplicates
const vehicleSubscriptions = new Map<string, () => void>()

export function subscribeToVehicle(
  vehicleId: string,
  callback: (vehicle: VehicleData | null) => void
): () => void {
  // If subscription already exists for this vehicle, return existing unsubscribe
  if (vehicleSubscriptions.has(vehicleId)) {
    console.warn(`[Firestore] Duplicate vehicle subscription detected for ${vehicleId}, reusing existing`)
    return vehicleSubscriptions.get(vehicleId)!
  }
  
  const vehicleRef = doc(db, API_ENDPOINTS.COLLECTIONS.VEHICLES, vehicleId)
  
  const unsubscribe = onSnapshot(vehicleRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data()
      } as VehicleData)
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('Error in vehicle subscription:', error)
    
    // Handle QUIC errors
    if (error instanceof Error && (
      error.message.includes('QUIC') || 
      error.message.includes('ERR_QUIC')
    )) {
      console.warn(`[Firestore] QUIC error in vehicle subscription, cleaning up: ${vehicleId}`)
      vehicleSubscriptions.delete(vehicleId)
    }
    
    callback(null)
  })
  
  const cleanup = () => {
    unsubscribe()
    vehicleSubscriptions.delete(vehicleId)
  }
  
  vehicleSubscriptions.set(vehicleId, cleanup)
  return cleanup
}

// Track priority vehicles subscription
let priorityVehiclesSubscription: (() => void) | null = null

/**
 * Subscribe to priority vehicles
 */
export function subscribeToPriorityVehicles(
  callback: (vehicles: DiagnosisCase[]) => void
): () => void {
  // If subscription already exists, return existing unsubscribe
  if (priorityVehiclesSubscription) {
    console.warn('[Firestore] Duplicate priority vehicles subscription detected, reusing existing')
    return priorityVehiclesSubscription
  }
  
  const diagnosisRef = collection(db, API_ENDPOINTS.COLLECTIONS.DIAGNOSIS_CASES)
  // Simplified query to avoid composite index requirement
  // Filter and sort in memory instead
  const q = query(
    diagnosisRef,
    where('status', '==', 'active'),
    limit(50) // Get more to filter in memory
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const allCases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DiagnosisCase[]
    
    // Filter and sort in memory
    const priorityCases = allCases
      .filter(c => c.severity === 'critical' || c.severity === 'high')
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 99) - 
                            (severityOrder[b.severity as keyof typeof severityOrder] || 99)
        if (severityDiff !== 0) return severityDiff
        return (a.confidence || 0) - (b.confidence || 0)
      })
      .slice(0, 30)
    
    callback(priorityCases)
  }, (error) => {
    console.error('Error in priority vehicles subscription:', error)
    
    // Handle QUIC errors
    if (error instanceof Error && (
      error.message.includes('QUIC') || 
      error.message.includes('ERR_QUIC')
    )) {
      console.warn('[Firestore] QUIC error in priority vehicles subscription, cleaning up')
      priorityVehiclesSubscription = null
    }
    
    // If error is about index, return empty array (index will be created automatically)
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Firestore index required. The index will be created automatically. Please wait a few minutes.')
    }
    callback([])
  })
  
  const cleanup = () => {
    unsubscribe()
    priorityVehiclesSubscription = null
  }
  
  priorityVehiclesSubscription = cleanup
  return cleanup
}

// Track human reviews subscription
let humanReviewsSubscription: (() => void) | null = null

/**
 * Subscribe to human review queue
 */
export function subscribeToHumanReviews(
  callback: (reviews: HumanReview[]) => void
): () => void {
  // If subscription already exists, return existing unsubscribe
  if (humanReviewsSubscription) {
    console.warn('[Firestore] Duplicate human reviews subscription detected, reusing existing')
    return humanReviewsSubscription
  }
  
  const reviewsRef = collection(db, API_ENDPOINTS.COLLECTIONS.HUMAN_REVIEWS)
  const q = query(
    reviewsRef,
    where('review_status', '==', 'pending'),
    orderBy('created_at', 'desc'),
    limit(20)
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HumanReview[]
    callback(reviews)
  }, (error) => {
    console.error('Error in human reviews subscription:', error)
    
    // Handle QUIC errors
    if (error instanceof Error && (
      error.message.includes('QUIC') || 
      error.message.includes('ERR_QUIC')
    )) {
      console.warn('[Firestore] QUIC error in human reviews subscription, cleaning up')
      humanReviewsSubscription = null
    }
    
    callback([])
  })
  
  const cleanup = () => {
    unsubscribe()
    humanReviewsSubscription = null
  }
  
  humanReviewsSubscription = cleanup
  return cleanup
}

