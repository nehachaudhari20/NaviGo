/**
 * Connection Test Utility
 * Tests API endpoint connectivity
 */

import { API_ENDPOINTS, getHeaders } from './config'
import type { TelematicsEvent } from './telemetry'

export interface ConnectionTestResult {
  success: boolean
  message: string
  endpoint?: string
  error?: string
  statusCode?: number
}

/**
 * Test connection to ingest_telemetry endpoint
 */
export async function testConnection(vehicleId: string): Promise<ConnectionTestResult> {
  const endpoint = API_ENDPOINTS.INGEST_TELEMETRY
  
  try {
    // Create a minimal test event
    const testEvent: TelematicsEvent = {
      vehicle_id: vehicleId,
      timestamp_utc: new Date().toISOString(),
      gps_lat: 19.0760,
      gps_lon: 72.8777,
      speed_kmph: 0,
      odometer_km: 0,
    }

    console.log('Testing connection to:', endpoint)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(testEvent),
    })

    const statusCode = response.status
    const responseText = await response.text()
    
    let responseData: any = {}
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      // Not JSON
    }

    if (response.ok) {
      return {
        success: true,
        message: 'Connection successful! API endpoint is working.',
        endpoint,
        statusCode,
      }
    } else {
      let errorMessage = `HTTP ${statusCode}: ${response.statusText}`
      
      if (responseData.error) {
        errorMessage = responseData.error
      } else if (responseData.details) {
        errorMessage = `${responseData.error || 'Error'}: ${responseData.details}`
      }

      // Provide helpful messages for common errors
      if (statusCode === 403) {
        errorMessage = 'Access forbidden. The Cloud Function may require authentication or may not be publicly accessible.'
      } else if (statusCode === 404) {
        errorMessage = 'Endpoint not found. Check if the Cloud Function is deployed and the URL is correct.'
      } else if (statusCode === 500) {
        errorMessage = 'Server error. The backend function encountered an issue. Check Cloud Function logs.'
      } else if (statusCode === 400) {
        errorMessage = `Validation error: ${errorMessage}`
      }

      return {
        success: false,
        message: errorMessage,
        endpoint,
        error: errorMessage,
        statusCode,
      }
    }
  } catch (error) {
    let errorMessage = 'Unknown error'
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error - Cannot reach the API endpoint. Check your internet connection and verify the endpoint URL is correct.'
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
      endpoint,
      error: errorMessage,
    }
  }
}
