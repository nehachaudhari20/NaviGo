"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react"
import { ingestTelemetryBatch, type TelematicsEvent } from "@/lib/api/telemetry"
import { testConnection } from "@/lib/api/connection-test"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CSVRow {
  // Required fields
  timestamp_utc?: string
  timestamp?: string // Alternative field name
  gps_lat?: string
  latitude?: string // Alternative field name
  gps_lon?: string
  longitude?: string // Alternative field name
  speed_kmph?: string
  speed?: string // Alternative field name
  odometer_km?: string
  odometer?: string // Alternative field name
  
  // Engine fields
  engine_rpm?: string
  engine_coolant_temp_c?: string
  engine_temperature?: string // Alternative
  engine_oil_temp_c?: string
  engine_oil_pressure?: string // Alternative
  fuel_level_pct?: string
  fuel_level?: string // Alternative
  
  // Battery fields
  battery_soc_pct?: string
  battery_state_of_charge?: string // Alternative
  battery_soh_pct?: string
  battery_health?: string // Alternative
  
  // Diagnostics
  dtc_codes?: string
  fault_codes?: string // Alternative
}

export default function TelemetryUpload() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get vehicle ID from user context or use default
  const vehicleId = user?.vehicleId || "MH-07-AB-1234" // Default for demo

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    
    // Parse rows
    const rows: CSVRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row)
    }
    return rows
  }

  const convertToTelemetryEvent = (row: CSVRow, index: number): TelematicsEvent | null => {
    try {
      // Parse timestamp - support multiple formats
      const timestampStr = row.timestamp_utc || row.timestamp || new Date().toISOString()
      let timestamp: string
      const date = new Date(timestampStr)
      if (isNaN(date.getTime())) {
        timestamp = new Date().toISOString()
      } else {
        timestamp = date.toISOString()
      }

      // Parse GPS coordinates (support both field names)
      const lat = parseFloat(row.gps_lat || row.latitude || '0')
      const lon = parseFloat(row.gps_lon || row.longitude || '0')
      if (isNaN(lat) || isNaN(lon)) {
        // GPS is required, use default if missing
        console.warn(`Row ${index + 2}: Missing GPS coordinates, using defaults`)
      }

      // Parse speed and odometer (required fields)
      const speed = parseFloat(row.speed_kmph || row.speed || '0')
      const odometer = parseFloat(row.odometer_km || row.odometer || '0')

      // Build event matching backend schema
      const event: TelematicsEvent = {
        vehicle_id: vehicleId,
        timestamp_utc: timestamp,
        gps_lat: isNaN(lat) ? 0 : lat,
        gps_lon: isNaN(lon) ? 0 : lon,
        speed_kmph: isNaN(speed) ? 0 : speed,
        odometer_km: isNaN(odometer) ? 0 : odometer,
      }

      // Engine fields
      if (row.engine_rpm) {
        const rpm = parseInt(row.engine_rpm)
        if (!isNaN(rpm)) event.engine_rpm = rpm
      }
      if (row.engine_coolant_temp_c || row.engine_temperature) {
        const temp = parseFloat(row.engine_coolant_temp_c || row.engine_temperature || '')
        if (!isNaN(temp)) event.engine_coolant_temp_c = temp
      }
      if (row.engine_oil_temp_c || row.engine_oil_pressure) {
        const temp = parseFloat(row.engine_oil_temp_c || row.engine_oil_pressure || '')
        if (!isNaN(temp)) event.engine_oil_temp_c = temp
      }
      if (row.fuel_level_pct || row.fuel_level) {
        const level = parseFloat(row.fuel_level_pct || row.fuel_level || '')
        if (!isNaN(level)) event.fuel_level_pct = level
      }

      // Battery fields
      if (row.battery_soc_pct || row.battery_state_of_charge) {
        const soc = parseFloat(row.battery_soc_pct || row.battery_state_of_charge || '')
        if (!isNaN(soc)) event.battery_soc_pct = soc
      }
      if (row.battery_soh_pct || row.battery_health) {
        const soh = parseFloat(row.battery_soh_pct || row.battery_health || '')
        if (!isNaN(soh)) event.battery_soh_pct = soh
      }

      // DTC codes
      const dtcStr = row.dtc_codes || row.fault_codes || ''
      if (dtcStr) {
        event.dtc_codes = dtcStr
          .split(/[;,\s]+/)
          .map(code => code.trim())
          .filter(code => code.length > 0)
      }

      return event
    } catch (error) {
      console.error(`Error converting row ${index}:`, error)
      return null
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')
      const isJSON = selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')
      
      if (isCSV || isJSON) {
        setFile(selectedFile)
        setResults(null)
      } else {
        alert('Please select a CSV or JSON file')
      }
    }
  }

  const parseJSON = (jsonText: string): TelematicsEvent[] => {
    try {
      const data = JSON.parse(jsonText)
      
      // Handle both array and single object
      const items = Array.isArray(data) ? data : [data]
      
      const events: TelematicsEvent[] = []
      items.forEach((item, index) => {
        // Remove event_id if present (backend will generate it)
        const { event_id, ...eventData } = item
        
        // Ensure required fields exist
        if (!eventData.vehicle_id) {
          eventData.vehicle_id = vehicleId
        }
        
        // Validate required fields
        if (!eventData.timestamp_utc || !eventData.gps_lat || !eventData.gps_lon) {
          console.warn(`Item ${index + 1}: Missing required fields`)
          return
        }
        
        // Ensure dtc_codes is an array
        if (eventData.dtc_codes && !Array.isArray(eventData.dtc_codes)) {
          eventData.dtc_codes = []
        }
        
        events.push(eventData as TelematicsEvent)
      })
      
      return events
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setResults(null)

    try {
      const text = await file.text()
      const isJSON = file.name.endsWith('.json') || file.type === 'application/json'
      
      let events: TelematicsEvent[] = []
      const errors: string[] = []

      if (isJSON) {
        // Parse JSON file
        try {
          events = parseJSON(text)
          if (events.length === 0) {
            throw new Error('JSON file contains no valid telemetry events')
          }
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to parse JSON file')
        }
      } else {
        // Parse CSV file
        const rows = parseCSV(text)
        
        if (rows.length === 0) {
          throw new Error('CSV file is empty or invalid')
        }

        // Convert CSV rows to telemetry events
        rows.forEach((row, index) => {
          const event = convertToTelemetryEvent(row, index)
          if (event) {
            events.push(event)
          } else {
            errors.push(`Row ${index + 2}: Failed to parse`)
          }
        })

        if (events.length === 0) {
          throw new Error('No valid telemetry events found in CSV')
        }
      }

      // Upload in batches of 5 to avoid overwhelming the API and reduce rate limiting
      const batchSize = 5
      const batches: TelematicsEvent[][] = []
      for (let i = 0; i < events.length; i += batchSize) {
        batches.push(events.slice(i, i + batchSize))
      }

      let successCount = 0
      let failedCount = 0
      const uploadErrors: string[] = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        try {
          // Add small delay between batches to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          const responses = await ingestTelemetryBatch(batch)
          responses.forEach((response, idx) => {
            if (response.status === 'success') {
              successCount++
            } else {
              failedCount++
              const eventNum = i * batchSize + idx + 1
              uploadErrors.push(`Event ${eventNum}: ${response.error || 'Unknown error'}`)
            }
          })
        } catch (error) {
          failedCount += batch.length
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          uploadErrors.push(`Batch ${i + 1}: ${errorMsg}`)
          console.error(`Batch ${i + 1} error:`, error)
        }

        setProgress(((i + 1) / batches.length) * 100)
      }

      setResults({
        total: events.length,
        success: successCount,
        failed: failedCount,
        errors: [...errors, ...uploadErrors],
      })
    } catch (error) {
      setResults({
        total: 0,
        success: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResults(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload Telemetry Data
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Upload CSV or JSON file with vehicle telemetry data for AI analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="csv-upload" className="text-slate-300">
            CSV File
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
              disabled={uploading}
            />
            {file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={uploading}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-slate-500">({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}
        </div>

        {/* Vehicle ID Display */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Vehicle ID</div>
          <div className="text-sm font-mono text-cyan-400">{vehicleId}</div>
        </div>

        {/* Connection Test Button */}
        <Button
          type="button"
          variant="outline"
          onClick={async (e) => {
            const button = e.currentTarget
            const originalText = button.textContent
            button.disabled = true
            if (button.textContent) button.textContent = 'Testing...'
            
            try {
              const result = await testConnection(vehicleId)
              if (result.success) {
                alert(`✅ ${result.message}\n\nEndpoint: ${result.endpoint}`)
              } else {
                alert(`❌ ${result.message}\n\n${result.endpoint ? `Endpoint: ${result.endpoint}\n` : ''}${result.statusCode ? `Status: ${result.statusCode}\n` : ''}${result.error ? `Error: ${result.error}` : ''}`)
              }
            } catch (error) {
              alert(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            } finally {
              button.disabled = false
              if (originalText) button.textContent = originalText
            }
          }}
          disabled={uploading}
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Test Connection
        </Button>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Telemetry Data
            </>
          )}
        </Button>

        {/* Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Uploading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {results && (
          <Alert className={results.failed === 0 ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"}>
            <div className="flex items-start gap-2">
              {results.failed === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertTitle className="text-white">
                  Upload {results.failed === 0 ? 'Complete' : 'Completed with Errors'}
                </AlertTitle>
                <AlertDescription className="text-slate-300 mt-2">
                  <div className="space-y-1">
                    <div>Total Events: {results.total}</div>
                    <div className="text-green-400">Successful: {results.success}</div>
                    {results.failed > 0 && (
                      <div className="text-yellow-400">Failed: {results.failed}</div>
                    )}
                    {results.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-slate-400">
                          View Errors ({results.errors.length})
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400 max-h-32 overflow-y-auto">
                          {results.errors.slice(0, 10).map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                          {results.errors.length > 10 && (
                            <li>... and {results.errors.length - 10} more errors</li>
                          )}
                        </ul>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Info about 403 warnings */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="text-blue-300 text-sm">About 403 Warnings</AlertTitle>
            <AlertDescription className="text-slate-400 text-xs mt-1">
              If you see 403 warnings for <code className="text-blue-300">telemetry-firestore-trigger</code> in Cloud Logs, 
              these are expected. That function is a Firestore trigger (not an HTTP endpoint) and is invoked automatically 
              by Google Cloud when telemetry is written to Firestore. The upload itself is working correctly.
            </AlertDescription>
          </div>
        </Alert>

        {/* File Format Help */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
            File Format Guide
          </summary>
          <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-4">
            {/* CSV Format */}
            <div>
              <strong className="text-cyan-400">CSV Format:</strong>
              <p className="mt-1 mb-2">Your CSV should include the following columns:</p>
              <div className="space-y-2">
                <div>
                  <strong className="text-yellow-400">Required Columns:</strong>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs mt-1">
                    <div>timestamp_utc (or timestamp)</div>
                    <div>gps_lat (or latitude)</div>
                    <div>gps_lon (or longitude)</div>
                    <div>speed_kmph (or speed)</div>
                    <div>odometer_km (or odometer)</div>
                  </div>
                </div>
                <div>
                  <strong className="text-yellow-400">Optional Columns:</strong>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs mt-1">
                    <div>engine_rpm</div>
                    <div>engine_coolant_temp_c</div>
                    <div>engine_oil_temp_c</div>
                    <div>fuel_level_pct</div>
                    <div>battery_soc_pct</div>
                    <div>battery_soh_pct</div>
                    <div>dtc_codes (comma/semicolon-separated)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Format */}
            <div>
              <strong className="text-cyan-400">JSON Format:</strong>
              <p className="mt-1 mb-2">JSON file should be an array of telemetry events:</p>
              <pre className="bg-slate-900/50 p-2 rounded text-xs overflow-x-auto mt-1">
{`[
  {
    "vehicle_id": "MH-07-AB-1234",
    "timestamp_utc": "2024-12-16T10:30:45.123Z",
    "gps_lat": 19.0760,
    "gps_lon": 72.8777,
    "speed_kmph": 60.5,
    "odometer_km": 45230.5,
    "engine_rpm": 2500,
    "engine_coolant_temp_c": 85.0,
    "battery_soc_pct": 85.0,
    "dtc_codes": ["P0128"]
  }
]`}
              </pre>
              <p className="mt-2 text-slate-500">
                Note: <code className="text-cyan-400">event_id</code> will be auto-generated if not provided
              </p>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
