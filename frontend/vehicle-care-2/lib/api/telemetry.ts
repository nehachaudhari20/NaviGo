/**
 * Telemetry API Service
 * Handles vehicle telemetry data ingestion
 */

import { API_ENDPOINTS, getHeaders, API_TIMEOUT } from './config'

// Backend schema-compatible interface
export interface TelematicsEvent {
  vehicle_id: string
  timestamp_utc: string // ISO 8601 format datetime
  gps_lat: number
  gps_lon: number
  speed_kmph: number
  odometer_km: number
  engine_rpm?: number
  engine_coolant_temp_c?: number
  engine_oil_temp_c?: number
  fuel_level_pct?: number
  battery_soc_pct?: number
  battery_soh_pct?: number
  dtc_codes?: string[]
}

// Legacy interface for backward compatibility (maps to new format)
export interface LegacyTelematicsEvent {
  vehicle_id: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  engine?: {
    rpm?: number
    temperature?: number
    oil_pressure?: number
  }
  battery?: {
    voltage?: number
    current?: number
    temperature?: number
    state_of_charge?: number
  }
  transmission?: {
    gear?: number
    fluid_temperature?: number
  }
  brakes?: {
    pad_wear?: number
    fluid_level?: number
  }
  tires?: {
    pressure?: number[]
    temperature?: number[]
  }
  diagnostics?: {
    fault_codes?: string[]
    warning_lights?: string[]
  }
}

export interface TelemetryResponse {
  status: 'success' | 'error'
  message?: string
  event_id?: string
  error?: string
}

/**
 * Ingest telemetry data to backend
 */
export async function ingestTelemetry(
  event: TelematicsEvent
): Promise<TelemetryResponse> {
  try {
    // Validate required fields
    if (!event.vehicle_id || !event.timestamp_utc || !event.gps_lat || !event.gps_lon) {
      return {
        status: 'error',
        error: 'Missing required fields: vehicle_id, timestamp_utc, gps_lat, gps_lon are required',
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    console.log('Sending telemetry to:', API_ENDPOINTS.INGEST_TELEMETRY)
    console.log('Event data:', { 
      vehicle_id: event.vehicle_id, 
      timestamp_utc: event.timestamp_utc,
      gps_lat: event.gps_lat,
      gps_lon: event.gps_lon,
    })

    const response = await fetch(API_ENDPOINTS.INGEST_TELEMETRY, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
    })

    clearTimeout(timeoutId)

    console.log('Response status:', response.status, response.statusText)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        console.error('Error response:', errorData)
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text()
          if (errorText) errorMessage = errorText
        } catch (e2) {
          // Ignore
        }
      }
      
      // Handle specific error codes
      if (response.status === 403) {
        errorMessage = 'Access forbidden. Check API permissions and authentication.'
      } else if (response.status === 404) {
        errorMessage = 'Endpoint not found. Check if the Cloud Function is deployed.'
      } else if (response.status === 500) {
        errorMessage = 'Server error. The backend function may have encountered an issue.'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Success response:', data)
    
    return {
      status: 'success',
      message: data.message || 'Telemetry ingested successfully',
      event_id: data.event_id,
    }
  } catch (error) {
    console.error('Telemetry ingestion error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          status: 'error',
          error: 'Request timeout - The server took too long to respond',
        }
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          status: 'error',
          error: 'Network error - Check your internet connection and API endpoint URL',
        }
      }
      return {
        status: 'error',
        error: error.message,
      }
    }
    return {
      status: 'error',
      error: 'Unknown error occurred',
    }
  }
}

/**
 * Batch ingest multiple telemetry events
 */
export async function ingestTelemetryBatch(
  events: TelematicsEvent[]
): Promise<TelemetryResponse[]> {
  return Promise.all(events.map(event => ingestTelemetry(event)))
}
