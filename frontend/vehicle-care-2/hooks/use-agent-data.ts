/**
 * React Hooks for Agent Data
 * Provides easy-to-use hooks for fetching agent data from Firestore
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAnomalyCases,
  getDiagnosisCases,
  getRCACases,
  getSchedulingCases,
  getEngagementCases,
  getFeedbackCases,
  getManufacturingCases,
  getTelemetryEvents,
  subscribeToCollection,
  type AnomalyCase,
  type DiagnosisCase,
  type RCACase,
  type SchedulingCase,
  type EngagementCase,
  type FeedbackCase,
  type ManufacturingCase,
} from '@/lib/api/firestore'
import { where, orderBy, limit } from 'firebase/firestore'

// Anomaly Cases Hook
export function useAnomalyCases(vehicleId?: string, realtime = false) {
  const [data, setData] = useState<AnomalyCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getAnomalyCases(vehicleId)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch anomaly cases'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    if (realtime && vehicleId) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id, then sort in memory
      const constraints = [
        where('vehicle_id', '==', vehicleId),
        limit(100) // Get more results to sort in memory
      ]
      const unsubscribe = subscribeToCollection<AnomalyCase>(
        'anomaly_cases',
        constraints,
        (newData) => {
          // Sort by detected_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.detected_at 
              ? (typeof a.detected_at === 'string' ? new Date(a.detected_at).getTime() : a.detected_at.toDate().getTime())
              : 0
            const bTime = b.detected_at 
              ? (typeof b.detected_at === 'string' ? new Date(b.detected_at).getTime() : b.detected_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [vehicleId, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Diagnosis Cases Hook
export function useDiagnosisCases(caseId?: string, vehicleId?: string, realtime = false) {
  const [data, setData] = useState<DiagnosisCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getDiagnosisCases(caseId, vehicleId)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch diagnosis cases'))
    } finally {
      setLoading(false)
    }
  }, [caseId, vehicleId])

  useEffect(() => {
    if (realtime) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id/case_id, then sort in memory
      const constraints: any[] = []
      if (caseId) constraints.push(where('case_id', '==', caseId))
      if (vehicleId) constraints.push(where('vehicle_id', '==', vehicleId))
      constraints.push(limit(100)) // Get more results to sort in memory

      const unsubscribe = subscribeToCollection<DiagnosisCase>(
        'diagnosis_cases',
        constraints,
        (newData) => {
          // Sort by created_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.created_at 
              ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
              : 0
            const bTime = b.created_at 
              ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [caseId, vehicleId, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// RCA Cases Hook
export function useRCACases(caseId?: string, vehicleId?: string, realtime = false) {
  const [data, setData] = useState<RCACase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getRCACases(caseId, vehicleId)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch RCA cases'))
    } finally {
      setLoading(false)
    }
  }, [caseId, vehicleId])

  useEffect(() => {
    if (realtime) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id/case_id, then sort in memory
      const constraints: any[] = []
      if (caseId) constraints.push(where('case_id', '==', caseId))
      if (vehicleId) constraints.push(where('vehicle_id', '==', vehicleId))
      constraints.push(limit(100)) // Get more results to sort in memory

      const unsubscribe = subscribeToCollection<RCACase>(
        'rca_cases',
        constraints,
        (newData) => {
          // Sort by created_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.created_at 
              ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
              : 0
            const bTime = b.created_at 
              ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [caseId, vehicleId, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Scheduling Cases Hook
export function useSchedulingCases(vehicleId?: string, status?: string, realtime = false) {
  const [data, setData] = useState<SchedulingCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getSchedulingCases(vehicleId, status)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scheduling cases'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId, status])

  useEffect(() => {
    if (realtime) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id/status, then sort in memory
      const constraints: any[] = []
      if (vehicleId) constraints.push(where('vehicle_id', '==', vehicleId))
      if (status) constraints.push(where('status', '==', status))
      constraints.push(limit(100)) // Get more results to sort in memory

      const unsubscribe = subscribeToCollection<SchedulingCase>(
        'scheduling_cases',
        constraints,
        (newData) => {
          // Sort by created_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.created_at 
              ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
              : 0
            const bTime = b.created_at 
              ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [vehicleId, status, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Engagement Cases Hook
export function useEngagementCases(vehicleId?: string, realtime = false) {
  const [data, setData] = useState<EngagementCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getEngagementCases(vehicleId)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch engagement cases'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    if (realtime && vehicleId) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id, then sort in memory
      const constraints = [
        where('vehicle_id', '==', vehicleId),
        limit(100) // Get more results to sort in memory
      ]
      const unsubscribe = subscribeToCollection<EngagementCase>(
        'engagement_cases',
        constraints,
        (newData) => {
          // Sort by created_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.created_at 
              ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
              : 0
            const bTime = b.created_at 
              ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [vehicleId, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Feedback Cases Hook
export function useFeedbackCases(vehicleId?: string, caseId?: string, realtime = false) {
  const [data, setData] = useState<FeedbackCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getFeedbackCases(vehicleId, caseId)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch feedback cases'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId, caseId])

  useEffect(() => {
    if (realtime) {
      // Simplified query to avoid composite index requirement
      // Only filter by vehicle_id/case_id, then sort in memory
      const constraints: any[] = []
      if (vehicleId) constraints.push(where('vehicle_id', '==', vehicleId))
      if (caseId) constraints.push(where('case_id', '==', caseId))
      constraints.push(limit(100)) // Get more results to sort in memory

      const unsubscribe = subscribeToCollection<FeedbackCase>(
        'feedback_cases',
        constraints,
        (newData) => {
          // Sort by created_at in memory (descending)
          const sorted = [...newData].sort((a, b) => {
            const aTime = a.created_at 
              ? (typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : a.created_at.toDate().getTime())
              : 0
            const bTime = b.created_at 
              ? (typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : b.created_at.toDate().getTime())
              : 0
            return bTime - aTime
          })
          setData(sorted)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [vehicleId, caseId, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Manufacturing Cases Hook
export function useManufacturingCases(component?: string, realtime = false) {
  const [data, setData] = useState<ManufacturingCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const cases = await getManufacturingCases(component)
      setData(cases)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch manufacturing cases'))
    } finally {
      setLoading(false)
    }
  }, [component])

  useEffect(() => {
    if (realtime) {
      const constraints: any[] = [orderBy('created_at', 'desc')]
      if (component) constraints.unshift(where('component', '==', component))

      const unsubscribe = subscribeToCollection<ManufacturingCase>(
        'manufacturing_cases',
        constraints,
        (newData) => {
          setData(newData)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [component, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Telemetry Events Hook
export function useTelemetryEvents(vehicleId: string, maxResults = 100, realtime = false) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const events = await getTelemetryEvents(vehicleId, maxResults)
      setData(events)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch telemetry events'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId, maxResults])

  useEffect(() => {
    if (realtime && vehicleId) {
      const constraints = [
        where('vehicle_id', '==', vehicleId),
        orderBy('timestamp_utc', 'desc'),
        limit(maxResults),
      ]
      const unsubscribe = subscribeToCollection(
        'telemetry_events',
        constraints,
        (newData) => {
          setData(newData)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
      return unsubscribe
    } else {
      fetchData()
    }
  }, [vehicleId, maxResults, realtime, fetchData])

  return { data, loading, error, refetch: fetchData }
}
