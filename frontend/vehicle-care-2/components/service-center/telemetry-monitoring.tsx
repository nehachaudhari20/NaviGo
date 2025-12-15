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
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useWebSocket } from "@/lib/websocket"

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

export default function TelemetryMonitoring({ 
  vehicleId,
  showChart = true 
}: TelemetryMonitoringProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("Just now")
  const [chartData, setChartData] = useState<any[]>([])
  const { connect, disconnect, on, isConnected: wsConnected } = useWebSocket()

  // WebSocket connection
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  // WebSocket event listeners
  useEffect(() => {
    if (!vehicleId) return

    const unsubscribe = on("telemetry:update", (data: any) => {
      if (data.vehicleId === vehicleId) {
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
  }, [vehicleId, on])

  // Check connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(wsConnected())
    }, 5000)
    return () => clearInterval(interval)
  }, [wsConnected])

  // Mock data - replace with API call (fallback)
  useEffect(() => {
    const fetchTelemetry = () => {
      if (wsConnected()) return // Use WebSocket if connected
      const mockData: TelemetryData = {
        timestamp: new Date().toISOString(),
        engine: {
          temperature: 85 + Math.random() * 5,
          rpm: 2500 + Math.random() * 500,
          oilPressure: 45 + Math.random() * 5,
          load: 65 + Math.random() * 10,
        },
        battery: {
          voltage: 48.2 + Math.random() * 0.5,
          current: 25.5 + Math.random() * 5,
          soc: 85 + Math.random() * 5,
          soh: 92 + Math.random() * 2,
          temperature: 28 + Math.random() * 3,
        },
        tires: {
          frontLeft: { pressure: 32 + Math.random() * 1, temperature: 25 + Math.random() * 2 },
          frontRight: { pressure: 32 + Math.random() * 1, temperature: 25 + Math.random() * 2 },
          rearLeft: { pressure: 30 + Math.random() * 1, temperature: 24 + Math.random() * 2 },
          rearRight: { pressure: 30 + Math.random() * 1, temperature: 24 + Math.random() * 2 },
        },
        gps: {
          latitude: 19.0760,
          longitude: 72.8777,
          speed: 60 + Math.random() * 10,
          heading: 180 + Math.random() * 20,
        },
        connectionStatus: "connected",
      }
      setTelemetry(mockData)
      setIsConnected(true)
      setLastUpdate("Just now")

      // Update chart data
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        engineTemp: mockData.engine.temperature,
        batteryVoltage: mockData.battery.voltage,
        speed: mockData.gps.speed,
      }
      setChartData(prev => [...prev.slice(-19), newDataPoint])
    }

    // Initial fetch
    fetchTelemetry()

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchTelemetry, 5000)

    return () => clearInterval(interval)
  }, [vehicleId])

  if (!telemetry) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="animate-spin text-gray-400" size={24} />
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (value: number, thresholds: { min: number; max: number }) => {
    if (value < thresholds.min || value > thresholds.max) return "text-red-600"
    if (value < thresholds.min * 1.1 || value > thresholds.max * 0.9) return "text-yellow-600"
    return "text-green-600"
  }

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
        <p className="text-xs text-gray-600 mt-1">Last update: {lastUpdate}</p>
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
                <p className={`text-lg font-bold ${getStatusColor(telemetry.engine.temperature, { min: 70, max: 95 })}`}>
                  {telemetry.engine.temperature.toFixed(1)}°C
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">RPM</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(telemetry.engine.rpm)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Oil Pressure</p>
                <p className={`text-lg font-bold ${getStatusColor(telemetry.engine.oilPressure, { min: 40, max: 60 })}`}>
                  {telemetry.engine.oilPressure.toFixed(1)} PSI
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Load</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(telemetry.engine.load)}%
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
                <p className={`text-lg font-bold ${getStatusColor(telemetry.battery.voltage, { min: 47, max: 50 })}`}>
                  {telemetry.battery.voltage.toFixed(1)}V
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">SOC</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.round(telemetry.battery.soc)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">SOH</p>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(telemetry.battery.soh)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Temperature</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(telemetry.battery.temperature)}°C
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
                <p className={`text-sm font-bold ${getStatusColor(telemetry.tires.frontLeft.pressure, { min: 30, max: 35 })}`}>
                  {telemetry.tires.frontLeft.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{telemetry.tires.frontLeft.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Front Right</p>
                <p className={`text-sm font-bold ${getStatusColor(telemetry.tires.frontRight.pressure, { min: 30, max: 35 })}`}>
                  {telemetry.tires.frontRight.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{telemetry.tires.frontRight.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Rear Left</p>
                <p className={`text-sm font-bold ${getStatusColor(telemetry.tires.rearLeft.pressure, { min: 28, max: 33 })}`}>
                  {telemetry.tires.rearLeft.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{telemetry.tires.rearLeft.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-600 mb-0.5">Rear Right</p>
                <p className={`text-sm font-bold ${getStatusColor(telemetry.tires.rearRight.pressure, { min: 28, max: 33 })}`}>
                  {telemetry.tires.rearRight.pressure.toFixed(1)} PSI
                </p>
                <p className="text-xs text-gray-500">{telemetry.tires.rearRight.temperature.toFixed(1)}°C</p>
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
                    {Math.round(telemetry.gps.speed)} km/h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Heading</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(telemetry.gps.heading)}°
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">Coordinates</p>
                <p className="text-xs font-mono text-gray-700">
                  {telemetry.gps.latitude.toFixed(4)}, {telemetry.gps.longitude.toFixed(4)}
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
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="engineTemp" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                      name="Engine Temp (°C)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="batteryVoltage" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                      name="Battery (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

