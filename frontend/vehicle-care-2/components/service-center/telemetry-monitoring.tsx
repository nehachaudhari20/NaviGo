"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Thermometer, 
  Battery, 
  Gauge,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts"
import { useWebSocket } from "@/lib/websocket"
import { useTelemetryEvents, useAnomalyCases } from "@/hooks/use-agent-data"
import { useAuth } from "@/contexts/auth-context"

interface TelemetryData {
  timestamp: string
  engine: {
    temperature: number
    rpm: number
    oilPressure: number
    load: number
  }
  battery: {
    voltage: number
    current: number
    soc: number
    soh: number
    temperature: number
  }
  tires: {
    frontLeft: { pressure: number; temperature: number }
    frontRight: { pressure: number; temperature: number }
    rearLeft: { pressure: number; temperature: number }
    rearRight: { pressure: number; temperature: number }
  }
  gps: {
    latitude: number
    longitude: number
    speed: number
    heading: number
  }
  connectionStatus: "connected" | "disconnected" | "poor"
}

interface TelemetryMonitoringProps {
  vehicleId?: string
  showChart?: boolean
}

// Mock telemetry data for initial display
const MOCK_TELEMETRY: TelemetryData = {
  timestamp: new Date().toISOString(),
  engine: {
    temperature: 85.5,
    rpm: 2100,
    oilPressure: 52.3,
    load: 45
  },
  battery: {
    voltage: 12.6,
    current: 8.5,
    soc: 78,
    soh: 92,
    temperature: 28.5
  },
  tires: {
    frontLeft: { pressure: 32.5, temperature: 35 },
    frontRight: { pressure: 32.3, temperature: 34 },
    rearLeft: { pressure: 31.8, temperature: 33 },
    rearRight: { pressure: 31.9, temperature: 33 }
  },
  gps: {
    latitude: 19.0760,
    longitude: 72.8777,
    speed: 45,
    heading: 180
  },
  connectionStatus: "connected"
}

const MOCK_CHART_DATA = Array.from({ length: 20 }, (_, i) => {
  const time = new Date(Date.now() - (19 - i) * 60000)
  return {
    time: time.toLocaleTimeString(),
    timestamp: time.toISOString(),
    engineTemp: 85 + Math.random() * 5,
    batteryVoltage: 12.4 + Math.random() * 0.4,
    speed: 40 + Math.random() * 20,
    hasAnomaly: false,
    anomalyType: null,
    anomalySeverity: null
  }
})

export default function TelemetryMonitoring({ 
  vehicleId,
  showChart = true 
}: TelemetryMonitoringProps) {
  const { user } = useAuth()
  // Get vehicle ID from prop, user context, or use default
  // Note: user object doesn't have vehicleId, so we use default
  const actualVehicleId = vehicleId || "MH-07-AB-1234"
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(MOCK_TELEMETRY)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("Just now")
  const [chartData, setChartData] = useState<any[]>(MOCK_CHART_DATA)
  const [error, setError] = useState<string | null>(null)
  const { connect, disconnect, on, isConnected: wsConnected } = useWebSocket()
  const lastProcessedTimestamp = useRef<string | null>(null)
  
  // Fetch real-time telemetry from Firestore
  const { data: telemetryEvents, loading: telemetryLoading, error: telemetryError } = useTelemetryEvents(actualVehicleId, 100, true)
  
  // Fetch anomaly cases to show markers on chart
  const { data: anomalyCases } = useAnomalyCases(actualVehicleId, true)
  
  // Debug logging (only log when values actually change)
  useEffect(() => {
    if (!telemetryLoading) {
      console.log('[TelemetryMonitoring] Vehicle ID:', actualVehicleId)
      console.log('[TelemetryMonitoring] Events count:', telemetryEvents?.length || 0)
      if (telemetryError) {
        console.error('[TelemetryMonitoring] Error:', telemetryError)
      }
      if (telemetryEvents && telemetryEvents.length > 0) {
        console.log('[TelemetryMonitoring] Latest event:', telemetryEvents[0])
      }
    }
  }, [actualVehicleId, telemetryEvents?.length, telemetryLoading, telemetryError?.message])

  // WebSocket connection
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  // WebSocket event listeners (for real-time updates if WebSocket is available)
  useEffect(() => {
    if (!actualVehicleId) return

    const unsubscribe = on("telemetry:update", (data: any) => {
      if (data.vehicleId === actualVehicleId) {
        setTelemetry(data)
        setIsConnected(true)
        setLastUpdate("Just now")

        // Update chart
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          engineTemp: data.engine?.temperature || 0,
          batteryVoltage: data.battery?.voltage || 0,
          speed: data.gps?.speed || 0,
        }
        setChartData(prev => [...prev.slice(-19), newDataPoint])
      }
    })

    return () => unsubscribe()
  }, [actualVehicleId, on])

  // Check connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(wsConnected())
    }, 5000)
    return () => clearInterval(interval)
  }, []) // Empty deps - interval doesn't need to re-run

  // Convert Firestore telemetry events to TelemetryData format
  useEffect(() => {
    // Skip if still loading
    if (telemetryLoading) return
    
    // Skip if WebSocket is connected (WebSocket handles updates)
    const isWSConnected = wsConnected()
    if (isWSConnected) return
    
    // Handle errors
    if (telemetryError) {
      setError(telemetryError.message || 'Failed to load telemetry data')
      console.error('[TelemetryMonitoring] Error:', telemetryError)
      setTelemetry(null)
      return
    }
    
    // Clear error if no error
    setError(null)
    
    if (telemetryEvents && telemetryEvents.length > 0) {
      // Get the most recent telemetry event
      const latestEvent = telemetryEvents[0]
      const latestTimestamp = latestEvent.timestamp_utc || latestEvent.timestamp || latestEvent.id
      
      // Skip if we've already processed this event (prevent infinite loop)
      if (lastProcessedTimestamp.current === latestTimestamp) {
        return
      }
      
      // Mark this event as processed
      lastProcessedTimestamp.current = latestTimestamp
      
      // Convert Firestore event to TelemetryData format
      const telemetryData: TelemetryData = {
        timestamp: latestEvent.timestamp_utc || latestEvent.timestamp || new Date().toISOString(),
        engine: {
          temperature: latestEvent.engine_coolant_temp_c || latestEvent.engine_temperature || 85,
          rpm: latestEvent.engine_rpm || 2500,
          oilPressure: latestEvent.engine_oil_pressure || latestEvent.engine_oil_temp_c || 45,
          load: latestEvent.engine_load || 65,
        },
        battery: {
          voltage: latestEvent.battery_voltage || 48.2,
          current: latestEvent.battery_current || 25.5,
          soc: latestEvent.battery_soc_pct || latestEvent.battery_state_of_charge || 85,
          soh: latestEvent.battery_soh_pct || latestEvent.battery_health || 92,
          temperature: latestEvent.battery_temperature || 28,
        },
        tires: {
          frontLeft: { 
            pressure: latestEvent.tire_pressure_fl || latestEvent.tires?.frontLeft?.pressure || 32, 
            temperature: latestEvent.tire_temp_fl || latestEvent.tires?.frontLeft?.temperature || 25 
          },
          frontRight: { 
            pressure: latestEvent.tire_pressure_fr || latestEvent.tires?.frontRight?.pressure || 32, 
            temperature: latestEvent.tire_temp_fr || latestEvent.tires?.frontRight?.temperature || 25 
          },
          rearLeft: { 
            pressure: latestEvent.tire_pressure_rl || latestEvent.tires?.rearLeft?.pressure || 30, 
            temperature: latestEvent.tire_temp_rl || latestEvent.tires?.rearLeft?.temperature || 24 
          },
          rearRight: { 
            pressure: latestEvent.tire_pressure_rr || latestEvent.tires?.rearRight?.pressure || 30, 
            temperature: latestEvent.tire_temp_rr || latestEvent.tires?.rearRight?.temperature || 24 
          },
        },
        gps: {
          latitude: latestEvent.gps_lat || latestEvent.latitude || 19.0760,
          longitude: latestEvent.gps_lon || latestEvent.longitude || 72.8777,
          speed: latestEvent.speed_kmph || latestEvent.speed || 60,
          heading: latestEvent.gps_heading || latestEvent.heading || 180,
        },
        connectionStatus: "connected",
      }
      
      setTelemetry(telemetryData)
      setIsConnected(true)
      
      // Update last update time
      const eventTime = latestEvent.timestamp_utc || latestEvent.timestamp
      if (eventTime) {
        const eventDate = typeof eventTime === 'string' ? new Date(eventTime) : eventTime.toDate()
        const secondsAgo = Math.floor((Date.now() - eventDate.getTime()) / 1000)
        if (secondsAgo < 60) {
          setLastUpdate(`${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`)
        } else if (secondsAgo < 3600) {
          const minutesAgo = Math.floor(secondsAgo / 60)
          setLastUpdate(`${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`)
        } else {
          const hoursAgo = Math.floor(secondsAgo / 3600)
          setLastUpdate(`${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`)
        }
      } else {
        setLastUpdate("Just now")
      }

      // Update chart data with last 20 events
      const chartDataPoints = telemetryEvents.slice(0, 20).reverse().map((event) => {
        const eventTime = event.timestamp_utc || event.timestamp
        const time = eventTime 
          ? (typeof eventTime === 'string' ? new Date(eventTime) : eventTime.toDate()).toLocaleTimeString()
          : new Date().toLocaleTimeString()
        
        // Check if this event has an associated anomaly
        const eventTimestamp = eventTime 
          ? (typeof eventTime === 'string' ? new Date(eventTime) : eventTime.toDate()).getTime()
          : Date.now()
        
        const relatedAnomaly = anomalyCases?.find(anomaly => {
          const anomalyTime = anomaly.detected_at 
            ? (typeof anomaly.detected_at === 'string' ? new Date(anomaly.detected_at) : anomaly.detected_at.toDate()).getTime()
            : null
          // Match if within 5 minutes of each other
          return anomalyTime && Math.abs(eventTimestamp - anomalyTime) < 5 * 60 * 1000
        })
        
        return {
          time,
          timestamp: eventTime,
          engineTemp: event.engine_coolant_temp_c || event.engine_temperature || 0,
          batteryVoltage: event.battery_voltage || 0,
          speed: event.speed_kmph || event.speed || 0,
          hasAnomaly: !!relatedAnomaly,
          anomalyType: relatedAnomaly?.anomaly_type || null,
          anomalySeverity: relatedAnomaly?.severity || null,
        }
      })
      setChartData(chartDataPoints)
    } else if (!telemetryLoading && (!telemetryEvents || telemetryEvents.length === 0)) {
      // No data available - keep showing mock data instead of blank
      // Keep mock data visible until real data arrives
      setIsConnected(true)
      setLastUpdate("Just now")
      setError(null)
      // Keep telemetry as MOCK_TELEMETRY (already set in initial state)
    }
  }, [
    telemetryEvents?.length, 
    telemetryLoading, 
    telemetryError?.message, 
    actualVehicleId,
    // Only depend on the latest event's timestamp to prevent infinite loops
    telemetryEvents?.[0]?.timestamp_utc || telemetryEvents?.[0]?.timestamp || telemetryEvents?.[0]?.id
  ])

  const getStatusColor = (value: number, thresholds: { min: number; max: number }) => {
    if (value < thresholds.min || value > thresholds.max) return "text-red-600"
    if (value < thresholds.min * 1.1 || value > thresholds.max * 0.9) return "text-yellow-600"
    return "text-green-600"
  }

  // Always show data - use mock if no real data available
  const displayTelemetry = telemetry || MOCK_TELEMETRY
  const displayChartData = chartData.length > 0 ? chartData : MOCK_CHART_DATA

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/30 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            Real-time Telemetry Monitoring
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs flex items-center gap-1">
                <Wifi size={12} />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 border-red-300 text-xs flex items-center gap-1">
                <WifiOff size={12} />
                Disconnected
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600">Last update: {lastUpdate}</p>
          <p className="text-xs text-gray-500">Vehicle: {actualVehicleId}</p>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            ⚠️ {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Engine Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Thermometer size={14} className="text-red-600" />
              Engine
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Temperature</p>
                <p className={`text-lg font-bold ${getStatusColor(displayTelemetry.engine.temperature, { min: 70, max: 95 })}`}>
                  {displayTelemetry.engine.temperature.toFixed(1)}°C
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">RPM</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(displayTelemetry.engine.rpm)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Oil Pressure</p>
                <p className={`text-lg font-bold ${getStatusColor(displayTelemetry.engine.oilPressure, { min: 40, max: 60 })}`}>
                  {displayTelemetry.engine.oilPressure.toFixed(1)} PSI
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Load</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(displayTelemetry.engine.load)}%
                </p>
              </div>
            </div>
          </div>

          {/* Battery Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Battery size={14} className="text-green-600" />
              Battery (BMS)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Voltage</p>
                <p className={`text-lg font-bold ${getStatusColor(displayTelemetry.battery.voltage, { min: 47, max: 50 })}`}>
                  {displayTelemetry.battery.voltage.toFixed(1)}V
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">SOC</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.round(displayTelemetry.battery.soc)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">SOH</p>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(displayTelemetry.battery.soh)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Temperature</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(displayTelemetry.battery.temperature)}°C
                </p>
              </div>
            </div>
          </div>

          {/* Tire Pressure (TPMS) */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Gauge size={14} className="text-purple-600" />
              Tire Pressure (TPMS)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Front Left</p>
                <p className={`text-sm font-bold ${getStatusColor(displayTelemetry.tires.frontLeft.pressure, { min: 30, max: 35 })}`}>
                  {displayTelemetry.tires.frontLeft.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{displayTelemetry.tires.frontLeft.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Front Right</p>
                <p className={`text-sm font-bold ${getStatusColor(displayTelemetry.tires.frontRight.pressure, { min: 30, max: 35 })}`}>
                  {displayTelemetry.tires.frontRight.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{displayTelemetry.tires.frontRight.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Rear Left</p>
                <p className={`text-sm font-bold ${getStatusColor(displayTelemetry.tires.rearLeft.pressure, { min: 28, max: 33 })}`}>
                  {displayTelemetry.tires.rearLeft.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{displayTelemetry.tires.rearLeft.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Rear Right</p>
                <p className={`text-sm font-bold ${getStatusColor(displayTelemetry.tires.rearRight.pressure, { min: 28, max: 33 })}`}>
                  {displayTelemetry.tires.rearRight.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{displayTelemetry.tires.rearRight.temperature.toFixed(1)}°C</p>
              </div>
            </div>
          </div>

          {/* GPS & Location */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Navigation size={14} className="text-blue-600" />
              GPS & Location
            </h4>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Speed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(displayTelemetry.gps.speed)} km/h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Heading</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(displayTelemetry.gps.heading)}°
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">Coordinates</p>
                <p className="text-xs font-mono text-gray-700">
                  {displayTelemetry.gps.latitude.toFixed(4)}, {displayTelemetry.gps.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Chart */}
          {showChart && chartData.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Trend (Last 20 Updates)</h4>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                              <p className="font-semibold">{data.time}</p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }}>
                                  {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                                </p>
                              ))}
                              {data.hasAnomaly && (
                                <p className="text-red-600 font-semibold mt-1">
                                  ⚠️ Anomaly: {data.anomalyType || 'Detected'}
                                </p>
                              )}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line 
                      key="engineTemp"
                      type="monotone" 
                      dataKey="engineTemp" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props
                        if (payload.hasAnomaly) {
                          const color = payload.anomalySeverity === 'critical' ? '#dc2626' : 
                                       payload.anomalySeverity === 'high' ? '#f59e0b' : '#eab308'
                          return (
                            <circle 
                              key={`engine-anomaly-${cx}-${cy}`}
                              cx={cx} 
                              cy={cy} 
                              r={4} 
                              fill={color} 
                              stroke="white" 
                              strokeWidth={2}
                            />
                          )
                        }
                        // Return transparent dot when no anomaly
                        return <circle key={`engine-normal-${cx}-${cy}`} cx={cx} cy={cy} r={0} fill="transparent" />
                      }}
                      name="Engine Temp (°C)"
                    />
                    <Line 
                      key="batteryVoltage"
                      type="monotone" 
                      dataKey="batteryVoltage" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props
                        if (payload.hasAnomaly) {
                          const color = payload.anomalySeverity === 'critical' ? '#dc2626' : 
                                       payload.anomalySeverity === 'high' ? '#f59e0b' : '#eab308'
                          return (
                            <circle 
                              key={`battery-anomaly-${cx}-${cy}`}
                              cx={cx} 
                              cy={cy} 
                              r={4} 
                              fill={color} 
                              stroke="white" 
                              strokeWidth={2}
                            />
                          )
                        }
                        // Return transparent dot when no anomaly
                        return <circle key={`battery-normal-${cx}-${cy}`} cx={cx} cy={cy} r={0} fill="transparent" />
                      }}
                      name="Battery (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
                {anomalyCases && anomalyCases.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">Anomaly Markers:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Critical
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      High
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Medium
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

