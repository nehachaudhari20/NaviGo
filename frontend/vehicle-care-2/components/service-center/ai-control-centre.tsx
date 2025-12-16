"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Factory,
  BarChart3,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Database,
  Cpu,
  Gauge,
  LineChart,
  Palette,
  X,
  User,
  Shield,
  AlertCircle,
  UserCheck
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Connection Point Component - Fixed on edges for edge-to-edge connections
function ConnectionPoint({ 
  side, 
  nodeId, 
  nodePosition,
  nodeWidth,
  nodeHeight,
  onDrag,
  onConnect,
  onConnectEnd
}: { 
  side: "top" | "right" | "bottom" | "left"
  nodeId: string
  nodePosition: { x: number; y: number }
  nodeWidth: number
  nodeHeight: number
  onDrag?: (nodeId: string, side: string, x: number, y: number) => void
  onConnect?: (fromNode: string, fromSide: string, x: number, y: number) => void
  onConnectEnd?: (toNode: string, toSide: string) => void
}) {
  const pointRef = useRef<HTMLDivElement>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Calculate position on edge
  const getEdgePosition = () => {
    const centerX = nodeWidth / 2
    const centerY = nodeHeight / 2
    
    switch (side) {
      case "top":
        return { x: centerX, y: 0 }
      case "right":
        return { x: nodeWidth, y: centerY }
      case "bottom":
        return { x: centerX, y: nodeHeight }
      case "left":
        return { x: 0, y: centerY }
    }
  }

  const edgePos = getEdgePosition()

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey && onConnect) {
      // Shift+Click to start connection
      setIsConnecting(true)
      const container = pointRef.current?.closest('.relative')
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const globalX = nodePosition.x + edgePos.x
      const globalY = nodePosition.y + edgePos.y
      onConnect(nodeId, side, globalX, globalY)
    } else if (onDrag) {
      setIsDragging(true)
    }
  }

  useEffect(() => {
    if (!isDragging && !isConnecting) return

    const handleMouseMove = (e: MouseEvent) => {
      // Visual feedback during connection
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isConnecting && onConnectEnd) {
        // Check if dropped on another connection point
        const target = document.elementFromPoint(e.clientX, e.clientY)
        const targetPoint = target?.closest('[data-connection-point]')
        if (targetPoint) {
          const targetNodeId = targetPoint.getAttribute('data-node-id')
          const targetSide = targetPoint.getAttribute('data-side')
          if (targetNodeId && targetSide && targetNodeId !== nodeId) {
            // Complete connection
            onConnectEnd(targetNodeId, targetSide as any)
          }
        }
      }
      setIsDragging(false)
      setIsConnecting(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isConnecting, nodeId, side, onConnectEnd])

  return (
    <div
      ref={pointRef}
      data-connection-point
      data-node-id={nodeId}
      data-side={side}
      className={`absolute w-2.5 h-2.5 bg-blue-500 border-2 border-slate-200 rounded-full cursor-crosshair z-40 hover:scale-125 transition-transform shadow-sm ${
        isDragging || isConnecting ? "scale-125 bg-blue-600 ring-2 ring-blue-400" : ""
      }`}
      style={{
        left: `${edgePos.x - 4}px`,
        top: `${edgePos.y - 4}px`,
      }}
      onMouseDown={handleMouseDown}
      title={`Shift+Click to connect from ${side} edge`}
    />
  )
}

// Workflow Node Component (Rectangular) - Draggable with Connection Points
function WorkflowNode({ 
  title,
  subtitle,
  Icon, 
  colors,
  isSelected, 
  onSelect,
  hasAddButton = false,
  nodeId,
  position,
  onPositionChange,
  connectionPoints,
  onConnectionPointDrag,
  onConnectionStart,
  onConnectionEnd
}: { 
  title: string
  subtitle?: string
  Icon: any
  colors?: { bg: string; border: string; text: string; iconBg: string; iconBorder: string }
  isSelected: boolean
  onSelect: () => void
  hasAddButton?: boolean
  nodeId: string
  position: { x: number; y: number }
  onPositionChange: (id: string, x: number, y: number) => void
  connectionPoints?: Record<string, { x: number; y: number }>
  onConnectionPointDrag?: (nodeId: string, side: string, x: number, y: number) => void
  onConnectionStart?: (fromNode: string, fromSide: string, x: number, y: number) => void
  onConnectionEnd?: (toNode: string, toSide: string) => void
}) {
  const defaultColors = { bg: "bg-white/10", border: "border-white/20", text: "text-white", iconBg: "bg-white/10", iconBorder: "border-white/20" }
  const nodeColors = colors || defaultColors
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on connection point
    if ((e.target as HTMLElement).closest('[data-connection-point]')) return
    if (e.button !== 0) return
    setIsDragging(true)
    const rect = nodeRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      })
    }
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = nodeRef.current?.closest('.relative')
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y
      onPositionChange(nodeId, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, nodeId, onPositionChange])

  const handleConnectionDrag = (side: string, x: number, y: number) => {
    if (onConnectionPointDrag) {
      onConnectionPointDrag(nodeId, side, x, y)
    }
  }

  const handleConnectionStart = (fromNode: string, fromSide: string, x: number, y: number) => {
    if (onConnectionStart) {
      onConnectionStart(fromNode, fromSide, x, y)
    }
  }

  const handleConnectionEnd = (toNode: string, toSide: string) => {
    if (onConnectionEnd) {
      onConnectionEnd(toNode, toSide)
    }
  }

  return (
    <div
      ref={nodeRef}
      className={`absolute group cursor-move transition-all ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-30" : "z-20"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isDragging && !(e.target as HTMLElement).closest('.absolute.w-3')) {
          onSelect()
        }
      }}
    >
      <Card className={`relative bg-gradient-to-br ${nodeColors.bg || "from-slate-100 to-slate-200"} border-2 ${nodeColors.border || "border-slate-300"} transition-all shadow-md w-22 min-h-[56px] rounded-lg ${
        isSelected 
          ? "border-blue-600 shadow-xl ring-2 ring-blue-500/40 scale-105" 
          : "hover:border-slate-400 hover:shadow-lg"
      } ${isDragging ? "opacity-90" : ""}`}>
        
        {/* Connection Points on all 4 sides - Fixed on edges */}
        {isSelected && (
          <>
            <ConnectionPoint side="top" nodeId={nodeId} nodePosition={position} nodeWidth={88} nodeHeight={56} onDrag={handleConnectionDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
            <ConnectionPoint side="right" nodeId={nodeId} nodePosition={position} nodeWidth={88} nodeHeight={56} onDrag={handleConnectionDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
            <ConnectionPoint side="bottom" nodeId={nodeId} nodePosition={position} nodeWidth={88} nodeHeight={56} onDrag={handleConnectionDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
            <ConnectionPoint side="left" nodeId={nodeId} nodePosition={position} nodeWidth={88} nodeHeight={56} onDrag={handleConnectionDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
          </>
        )}
        
        <CardContent className="relative z-10 p-2 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <div className={`p-1 rounded-md ${nodeColors.iconBg || "bg-slate-200"} ${nodeColors.iconBorder || "border-slate-300"} border shadow-sm`}>
              <Icon size={10} className={nodeColors.text || "text-slate-700"} />
            </div>
            {hasAddButton && (
              <button 
                className="p-0.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 text-[8px] w-3 h-3 flex items-center justify-center transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                +
              </button>
            )}
          </div>
          <h4 className="text-[9px] font-semibold text-slate-800 mb-0.5 leading-tight line-clamp-2">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[7px] text-slate-600 leading-tight line-clamp-1">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Circular Dependency Node Component - Draggable
function DependencyNode({ 
  title,
  subtitle,
  Icon, 
  isSelected, 
  onSelect,
  nodeId,
  position,
  onPositionChange
}: { 
  title: string
  subtitle?: string
  Icon: any
  isSelected: boolean
  onSelect: () => void
  nodeId: string
  position: { x: number; y: number }
  onPositionChange: (id: string, x: number, y: number) => void
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    const rect = nodeRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      })
    }
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = nodeRef.current?.closest('.relative')
      if (!container) return
      const containerRect = container.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y
      onPositionChange(nodeId, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, nodeId, onPositionChange])

  return (
    <div
      ref={nodeRef}
      className={`absolute group cursor-move transition-all ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-30" : "z-20"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isDragging) {
          onSelect()
        }
      }}
    >
      <div className={`relative bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 transition-all shadow-md w-20 h-20 rounded-full flex flex-col items-center justify-center ${
        isSelected 
          ? "border-cyan-500 shadow-cyan-500/50 ring-2 ring-cyan-400/30" 
          : "hover:border-slate-400 hover:shadow-lg"
      } ${isDragging ? "opacity-90 scale-110" : ""}`}>
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-1 rounded-full bg-white border-2 border-slate-300 mb-0.5 shadow-sm">
            <Icon size={12} className="text-slate-700" />
          </div>
          <h4 className="text-[9px] font-semibold text-slate-800 text-center mb-0.5 px-0.5 leading-tight line-clamp-2">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[7px] text-slate-600 text-center px-0.5 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Connection Line Component with Curved Path - Edge to Edge
function ConnectionLine({ 
  from, 
  to, 
  fromSide = "right",
  toSide = "left",
  label, 
  isDashed = true,
  controlPoint1,
  controlPoint2,
  fromNodeId,
  toNodeId
}: { 
  from: { x: number; y: number }
  to: { x: number; y: number }
  fromSide?: "top" | "right" | "bottom" | "left"
  toSide?: "top" | "right" | "bottom" | "left"
  label?: string
  isDashed?: boolean
  controlPoint1?: { x: number; y: number }
  controlPoint2?: { x: number; y: number }
  fromNodeId?: string
  toNodeId?: string
}) {
  // Calculate connection points on edges - center position is top-left, need to add half dimensions
  const getConnectionPoint = (center: { x: number; y: number }, side: string, nodeWidth: number = 88, nodeHeight: number = 56) => {
    // center is the top-left position, so we need to add half dimensions to get actual center
    const actualCenterX = center.x + nodeWidth / 2
    const actualCenterY = center.y + nodeHeight / 2
    
    switch (side) {
      case "top":
        return { x: actualCenterX, y: center.y }
      case "right":
        return { x: center.x + nodeWidth, y: actualCenterY }
      case "bottom":
        return { x: actualCenterX, y: center.y + nodeHeight }
      case "left":
        return { x: center.x, y: actualCenterY }
      default:
        return { x: actualCenterX, y: actualCenterY }
    }
  }

  // Use appropriate dimensions based on node type
  const getNodeDimensions = (nodeId?: string) => {
    if (nodeId === "masterAgent") {
      return { width: 112, height: 72 }
    }
    return { width: 88, height: 56 }
  }
  
  const fromDims = getNodeDimensions(fromNodeId)
  const toDims = getNodeDimensions(toNodeId)
  
  const startPoint = getConnectionPoint(from, fromSide, fromDims.width, fromDims.height)
  const endPoint = getConnectionPoint(to, toSide, toDims.width, toDims.height)
  
  // Use provided control points or calculate straight/very minimal curve
  const dx = endPoint.x - startPoint.x
  const dy = endPoint.y - startPoint.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // For straight lines, use minimal curve only for perpendicular connections
  const isPerpendicular = Math.abs(dx) < 10 || Math.abs(dy) < 10
  
  const cp1 = controlPoint1 || (isPerpendicular ? {
    x: startPoint.x + dx * 0.1,
    y: startPoint.y + dy * 0.1
  } : {
    x: startPoint.x + dx * 0.05,
    y: startPoint.y
  })
  
  const cp2 = controlPoint2 || (isPerpendicular ? {
    x: endPoint.x - dx * 0.1,
    y: endPoint.y - dy * 0.1
  } : {
    x: endPoint.x - dx * 0.05,
    y: endPoint.y
  })

  // Use straight line for horizontal/vertical, minimal curve for diagonal
  const path = distance < 50 || (!isPerpendicular && Math.abs(dx) > Math.abs(dy) * 2) || (!isPerpendicular && Math.abs(dy) > Math.abs(dx) * 2)
    ? `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
    : `M ${startPoint.x} ${startPoint.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endPoint.x} ${endPoint.y}`
  
  const midX = (startPoint.x + endPoint.x) / 2
  const midY = (startPoint.y + endPoint.y) / 2
  
  const arrowColor = isDashed ? "#94a3b8" : "#3b82f6"
  const markerId = `arrowhead-${isDashed ? 'dashed' : 'solid'}`
  
  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="2.5"
          orient="auto"
        >
          <polygon
            points="0 0, 8 2.5, 0 5"
            fill={arrowColor}
          />
        </marker>
      </defs>
      <path
        d={path}
        stroke={arrowColor}
        strokeWidth={isDashed ? "1.5" : "2"}
        fill="none"
        strokeDasharray={isDashed ? "4,4" : "0"}
        markerEnd={`url(#${markerId})`}
        className="transition-all"
      />
      {label && (
        <text
          x={midX}
          y={midY - 4}
          fill="#475569"
          fontSize="9"
          textAnchor="middle"
          className="font-medium"
        >
          {label}
        </text>
      )}
    </g>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-300 border-green-400/30"
    case "processing":
      return "bg-blue-500/20 text-blue-300 border-blue-400/30"
    case "complete":
      return "bg-purple-500/20 text-purple-300 border-purple-400/30"
    case "idle":
      return "bg-gray-500/20 text-gray-300 border-gray-400/30"
    case "error":
      return "bg-red-500/20 text-red-300 border-red-400/30"
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-400/30"
  }
}

function getColorClasses(color: string, cellId: string, colorOverrides: Record<string, string>) {
  const effectiveColor = colorOverrides[cellId] || color
  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; iconBorder: string }> = {
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", iconBg: "bg-cyan-500/20", iconBorder: "border-cyan-500/30" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", iconBg: "bg-blue-500/20", iconBorder: "border-blue-500/30" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", iconBg: "bg-orange-500/20", iconBorder: "border-orange-500/30" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", iconBg: "bg-purple-500/20", iconBorder: "border-purple-500/30" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", iconBg: "bg-red-500/20", iconBorder: "border-red-500/30" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", iconBg: "bg-green-500/20", iconBorder: "border-green-500/30" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", iconBg: "bg-yellow-500/20", iconBorder: "border-yellow-500/30" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", iconBg: "bg-indigo-500/20", iconBorder: "border-indigo-500/30" },
    pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", iconBg: "bg-pink-500/20", iconBorder: "border-pink-500/30" },
    teal: { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400", iconBg: "bg-teal-500/20", iconBorder: "border-teal-500/30" },
  }
  return colorMap[effectiveColor] || { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-400", iconBg: "bg-gray-500/20", iconBorder: "border-gray-500/30" }
}

interface GridCell {
  id: string
  title: string
  status: "active" | "idle" | "processing" | "complete" | "error"
  value: string | number
  trend?: "up" | "down" | "stable"
  connections: string[] // IDs of connected cells
  icon: any
  color: string
  description: string
  metrics?: {
    label: string
    value: string | number
  }[]
}

interface AgentFlow {
  from: string
  to: string
  status: "active" | "pending" | "complete"
  data?: string
}

const gridCells: GridCell[] = [
  // Row 1: Data Sources & Ingestion
  {
    id: "telemetry",
    title: "Real-time Telemetry",
    status: "active",
    value: "1,247 events/min",
    trend: "up",
    connections: ["data-analysis"],
    icon: Activity,
    color: "cyan",
    description: "Ingesting vehicle sensor data",
    metrics: [
      { label: "Vehicles", value: "2,450" },
      { label: "Latency", value: "12ms" }
    ]
  },
  {
    id: "data-analysis",
    title: "Data Analysis Agent",
    status: "active",
    value: "Processing",
    trend: "stable",
    connections: ["predictive-modeling", "anomaly-detection"],
    icon: BarChart3,
    color: "blue",
    description: "Analyzing patterns in telemetry",
    metrics: [
      { label: "Tasks", value: "1,247" },
      { label: "Success", value: "98.5%" }
    ]
  },
  {
    id: "anomaly-detection",
    title: "Anomaly Detection",
    status: "active",
    value: "23 anomalies",
    trend: "up",
    connections: ["diagnosis-agent"],
    icon: AlertTriangle,
    color: "orange",
    description: "Identifying unusual patterns",
    metrics: [
      { label: "Critical", value: "5" },
      { label: "High", value: "8" }
    ]
  },
  {
    id: "diagnosis-agent",
    title: "Diagnosis Agent",
    status: "active",
    value: "12 predictions",
    trend: "stable",
    connections: ["rca-agent", "predictive-modeling"],
    icon: Brain,
    color: "purple",
    description: "Predicting component failures",
    metrics: [
      { label: "Accuracy", value: "96.2%" },
      { label: "RUL Avg", value: "15 days" }
    ]
  },
  {
    id: "rca-agent",
    title: "RCA Agent",
    status: "active",
    value: "8 analyses",
    trend: "stable",
    connections: ["scheduling-agent", "manufacturing-feedback"],
    icon: Target,
    color: "red",
    description: "Root cause analysis",
    metrics: [
      { label: "Confidence", value: "87%" },
      { label: "Completed", value: "8" }
    ]
  },
  {
    id: "predictive-modeling",
    title: "Predictive Modeling",
    status: "active",
    value: "95% accuracy",
    trend: "up",
    connections: ["demand-forecasting", "scheduling-agent"],
    icon: LineChart,
    color: "green",
    description: "ML models for failure prediction",
    metrics: [
      { label: "Models", value: "12" },
      { label: "Training", value: "Active" }
    ]
  },
  {
    id: "demand-forecasting",
    title: "Service Demand Forecast",
    status: "active",
    value: "+15% next week",
    trend: "up",
    connections: ["scheduling-agent", "resource-planning"],
    icon: TrendingUp,
    color: "yellow",
    description: "Forecasting service demand",
    metrics: [
      { label: "Next 7d", value: "145 slots" },
      { label: "Next 30d", value: "620 slots" }
    ]
  },
  {
    id: "resource-planning",
    title: "Resource Planning",
    status: "active",
    value: "Optimized",
    trend: "stable",
    connections: ["scheduling-agent"],
    icon: Gauge,
    color: "indigo",
    description: "Optimizing technician allocation",
    metrics: [
      { label: "Utilization", value: "78%" },
      { label: "Capacity", value: "85%" }
    ]
  },
  // Row 2: Scheduling & Engagement
  {
    id: "scheduling-agent",
    title: "Scheduling Agent",
    status: "active",
    value: "45 appointments",
    trend: "up",
    connections: ["customer-engagement", "appointment-optimization"],
    icon: Calendar,
    color: "pink",
    description: "Optimizing appointment slots",
    metrics: [
      { label: "Today", value: "12" },
      { label: "This Week", value: "45" }
    ]
  },
  {
    id: "appointment-optimization",
    title: "Appointment Optimization",
    status: "active",
    value: "97% efficiency",
    trend: "up",
    connections: ["customer-engagement"],
    icon: Zap,
    color: "teal",
    description: "AI-powered slot optimization",
    metrics: [
      { label: "Fill Rate", value: "94%" },
      { label: "Wait Time", value: "2.3 days" }
    ]
  },
  {
    id: "customer-engagement",
    title: "Customer Engagement",
    status: "active",
    value: "8 calls active",
    trend: "up",
    connections: ["communication-agent", "feedback-agent"],
    icon: MessageSquare,
    color: "green",
    description: "Engaging customers proactively",
    metrics: [
      { label: "Calls", value: "8" },
      { label: "SMS", value: "23" }
    ]
  },
  {
    id: "communication-agent",
    title: "Communication Agent",
    status: "active",
    value: "Voice & SMS",
    trend: "stable",
    connections: ["feedback-agent"],
    icon: Users,
    color: "blue",
    description: "Multi-channel communication",
    metrics: [
      { label: "Response Rate", value: "87%" },
      { label: "Satisfaction", value: "4.2/5" }
    ]
  },
  {
    id: "feedback-agent",
    title: "Feedback Agent",
    status: "active",
    value: "12 validations",
    trend: "stable",
    connections: ["manufacturing-feedback", "learning-loop"],
    icon: CheckCircle2,
    color: "green",
    description: "Validating service outcomes",
    metrics: [
      { label: "CEI Score", value: "4.1" },
      { label: "Accuracy", value: "95.5%" }
    ]
  },
  {
    id: "manufacturing-feedback",
    title: "Manufacturing Feedback",
    status: "active",
    value: "5 CAPA insights",
    trend: "up",
    connections: ["design-improvement", "learning-loop"],
    icon: Factory,
    color: "orange",
    description: "Feeding back to production",
    metrics: [
      { label: "CAPA Items", value: "5" },
      { label: "Fleet Impact", value: "12%" }
    ]
  },
  {
    id: "design-improvement",
    title: "Design Improvement",
    status: "active",
    value: "3 improvements",
    trend: "up",
    connections: ["learning-loop"],
    icon: Target,
    color: "purple",
    description: "Design changes implemented",
    metrics: [
      { label: "Defect Reduction", value: "80%" },
      { label: "ROI", value: "$2.4M" }
    ]
  },
  {
    id: "learning-loop",
    title: "Learning Loop",
    status: "active",
    value: "Continuous",
    trend: "up",
    connections: ["predictive-modeling"],
    icon: Network,
    color: "cyan",
    description: "Model retraining & improvement",
    metrics: [
      { label: "Retrains", value: "24" },
      { label: "Improvement", value: "+3.2%" }
    ]
  }
]

const agentFlows: AgentFlow[] = [
  { from: "telemetry", to: "data-analysis", status: "active", data: "1,247 events/min" },
  { from: "data-analysis", to: "predictive-modeling", status: "active", data: "Patterns" },
  { from: "data-analysis", to: "anomaly-detection", status: "active", data: "23 anomalies" },
  { from: "anomaly-detection", to: "diagnosis-agent", status: "active", data: "Critical: 5" },
  { from: "diagnosis-agent", to: "rca-agent", status: "active", data: "12 predictions" },
  { from: "rca-agent", to: "scheduling-agent", status: "active", data: "8 analyses" },
  { from: "predictive-modeling", to: "demand-forecasting", status: "active", data: "95% accuracy" },
  { from: "demand-forecasting", to: "scheduling-agent", status: "active", data: "+15% forecast" },
  { from: "scheduling-agent", to: "customer-engagement", status: "active", data: "45 appointments" },
  { from: "customer-engagement", to: "communication-agent", status: "active", data: "8 calls" },
  { from: "communication-agent", to: "feedback-agent", status: "active", data: "87% response" },
  { from: "feedback-agent", to: "manufacturing-feedback", status: "active", data: "12 validations" },
  { from: "manufacturing-feedback", to: "design-improvement", status: "active", data: "5 CAPA" },
  { from: "design-improvement", to: "learning-loop", status: "active", data: "80% reduction" },
  { from: "learning-loop", to: "predictive-modeling", status: "active", data: "+3.2% improvement" }
]

export default function AIControlCentre() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [masterAgentStatus, setMasterAgentStatus] = useState<"running" | "paused">("running")
  const [cells, setCells] = useState<GridCell[]>(gridCells)
  const [flows, setFlows] = useState<AgentFlow[]>(agentFlows)
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({})
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  
  // Node positions - Professional workflow layout (left-to-right, top-to-bottom flow)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({
    // Row 1: Entry point
    telemetry: { x: 100, y: 80 },
    
    // Row 2: Analysis pipeline (left to right)
    dataAnalysis: { x: 100, y: 200 },
    diagnosis: { x: 250, y: 200 },
    rca: { x: 400, y: 200 },
    
    // Row 3: Master Agent (center, orchestrating)
    masterAgent: { x: 550, y: 200 },
    
    // Row 4: Scheduling and Engagement (right side)
    scheduling: { x: 700, y: 200 },
    engagement: { x: 850, y: 200 },
    
    // Row 5: Communication channels (below engagement)
    communication: { x: 850, y: 320 },
    sms: { x: 1000, y: 320 },
    
    // Row 6: Human loop (below analysis)
    humanOverride: { x: 100, y: 320 },
    humanReview: { x: 250, y: 320 },
    humanFeedback: { x: 400, y: 320 },
    
    // Row 7: Feedback and Manufacturing (bottom)
    feedback: { x: 700, y: 440 },
    manufacturing: { x: 400, y: 440 }
  })

  // Professional NaviGo workflow connections - showing proper data flow
  const [manualConnections, setManualConnections] = useState<Array<{
    from: string
    to: string
    fromSide: "top" | "right" | "bottom" | "left"
    toSide: "top" | "right" | "bottom" | "left"
    cp1?: { x: number; y: number }
    cp2?: { x: number; y: number }
    label?: string
    isDashed?: boolean
  }>>([
    // Main data flow pipeline (solid blue arrows - left to right)
    { from: "telemetry", to: "dataAnalysis", fromSide: "bottom", toSide: "top", isDashed: false },
    { from: "dataAnalysis", to: "diagnosis", fromSide: "right", toSide: "left", isDashed: false },
    { from: "diagnosis", to: "rca", fromSide: "right", toSide: "left", isDashed: false },
    { from: "rca", to: "masterAgent", fromSide: "right", toSide: "left", isDashed: false },
    { from: "masterAgent", to: "scheduling", fromSide: "right", toSide: "left", isDashed: false },
    { from: "scheduling", to: "engagement", fromSide: "right", toSide: "left", isDashed: false },
    { from: "engagement", to: "communication", fromSide: "bottom", toSide: "top", isDashed: false },
    { from: "communication", to: "sms", fromSide: "right", toSide: "left", isDashed: false },
    { from: "communication", to: "feedback", fromSide: "bottom", toSide: "top", isDashed: false },
    { from: "sms", to: "feedback", fromSide: "bottom", toSide: "top", isDashed: false },
    { from: "feedback", to: "manufacturing", fromSide: "left", toSide: "right", isDashed: false },
    
    // Master Agent orchestration (dashed gray - control flow)
    { from: "masterAgent", to: "dataAnalysis", fromSide: "bottom", toSide: "top", isDashed: true },
    { from: "masterAgent", to: "diagnosis", fromSide: "bottom", toSide: "top", isDashed: true },
    { from: "masterAgent", to: "rca", fromSide: "bottom", toSide: "top", isDashed: true },
    
    // Human loop connections (dashed gray - human intervention)
    { from: "diagnosis", to: "humanReview", fromSide: "bottom", toSide: "top", isDashed: true },
    { from: "humanReview", to: "rca", fromSide: "right", toSide: "left", isDashed: true },
    { from: "dataAnalysis", to: "humanOverride", fromSide: "bottom", toSide: "top", isDashed: true },
    { from: "humanOverride", to: "masterAgent", fromSide: "right", toSide: "left", isDashed: true },
    { from: "feedback", to: "humanFeedback", fromSide: "bottom", toSide: "top", isDashed: true },
    { from: "humanFeedback", to: "manufacturing", fromSide: "right", toSide: "left", isDashed: true },
  ])

  // Connection control points for curved arrows
  const [connectionControls, setConnectionControls] = useState<Record<string, { cp1?: { x: number; y: number }, cp2?: { x: number; y: number }, fromSide?: string, toSide?: string }>>({})

  const handlePositionChange = (nodeId: string, x: number, y: number) => {
    setNodePositions(prev => ({
      ...prev,
      [nodeId]: { x, y }
    }))
  }

  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; side: string; x: number; y: number } | null>(null)

  const handleConnectionPointDrag = (nodeId: string, side: string, x: number, y: number) => {
    // Update control points for manual connections involving this node
    setManualConnections(prev => prev.map(conn => {
      if (conn.from === nodeId && conn.fromSide === side) {
        return { ...conn, cp1: { x, y } }
      } else if (conn.to === nodeId && conn.toSide === side) {
        return { ...conn, cp2: { x, y } }
      }
      return conn
    }))
  }

  const handleConnectionStart = (fromNode: string, fromSide: string, x: number, y: number) => {
    setConnectingFrom({ nodeId: fromNode, side: fromSide as any, x, y })
  }

  const handleConnectionEnd = (toNode: string, toSide: string) => {
    if (connectingFrom && connectingFrom.nodeId !== toNode) {
      // Add new connection
      setManualConnections(prev => [...prev, {
        from: connectingFrom.nodeId,
        to: toNode,
        fromSide: connectingFrom.side as any,
        toSide: toSide as any,
        isDashed: false
      }])
    }
    setConnectingFrom(null)
  }

  // Function to add a new connection (can be called from UI button or drag from connection point)
  const addConnection = (from: string, to: string, fromSide: "top" | "right" | "bottom" | "left" = "right", toSide: "top" | "right" | "bottom" | "left" = "left") => {
    setManualConnections(prev => [...prev, {
      from,
      to,
      fromSide,
      toSide,
      isDashed: false
    }])
  }

  useEffect(() => {
    if (masterAgentStatus === "running") {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setCells(prev => prev.map(cell => {
          if (cell.status === "active") {
            // Randomly update some metrics
            if (Math.random() > 0.7) {
              return {
                ...cell,
                value: typeof cell.value === "number" 
                  ? cell.value + Math.floor(Math.random() * 3)
                  : cell.value
              }
            }
          }
          return cell
        }))

        // Update flow status
        setFlows(prev => prev.map(flow => {
          if (flow.status === "active" && Math.random() > 0.8) {
            return { ...flow, status: "complete" }
          }
          if (flow.status === "complete" && Math.random() > 0.9) {
            return { ...flow, status: "active" }
          }
          return flow
        }))
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [masterAgentStatus])

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && !(event.target as Element).closest('.color-picker-container')) {
        setShowColorPicker(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColorPicker])


  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={12} className="text-green-400" />
      case "down":
        return <TrendingDown size={12} className="text-red-400" />
      default:
        return <Activity size={12} className="text-gray-400" />
    }
  }

  const selectedCellData = cells.find(c => c.id === selectedCell)
  const connectedCells = selectedCellData 
    ? cells.filter(c => selectedCellData.connections.includes(c.id))
    : []

  return (
    <div className="space-y-6">
      {/* Master Agent Header */}
      <Card className="relative bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 border-2 border-slate-500 shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                <Brain className="text-purple-700" size={28} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white mb-1">
                  Master Agent Control Centre
                </CardTitle>
                <p className="text-sm text-gray-200">
                  Real-time orchestration of AI agents, data analysis, and feedback loops
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${masterAgentStatus === "running" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"} border-2 text-sm px-4 py-1.5 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${masterAgentStatus === "running" ? "bg-green-600 animate-pulse" : "bg-gray-600"}`}></div>
                {masterAgentStatus === "running" ? "Orchestrating" : "Paused"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMasterAgentStatus(masterAgentStatus === "running" ? "paused" : "running")}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
              >
                {masterAgentStatus === "running" ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-md">
              <div className="text-xs text-gray-600 mb-1 font-medium">Active Agents</div>
              <div className="text-2xl font-bold text-gray-900">{cells.filter(c => c.status === "active").length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-md">
              <div className="text-xs text-gray-600 mb-1 font-medium">Data Flow</div>
              <div className="text-2xl font-bold text-cyan-700">{flows.filter(f => f.status === "active").length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-md">
              <div className="text-xs text-gray-600 mb-1 font-medium">System Health</div>
              <div className="text-2xl font-bold text-green-700">98.5%</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-md">
              <div className="text-xs text-gray-600 mb-1 font-medium">Loop Efficiency</div>
              <div className="text-2xl font-bold text-purple-700">94.2%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Diagram Layout */}
      <div className="relative">
        <Card className="relative bg-white border border-slate-300 shadow-md overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `linear-gradient(rgba(71,85,105,0.08) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(71,85,105,0.08) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
          <CardHeader className="relative z-10 bg-white border-b border-slate-300">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Network size={20} className="text-indigo-700" />
              Agent Coordination Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-8">
            {/* Workflow Diagram Container - NaviGo Agents */}
            <div className="relative min-h-[600px] w-full" style={{ minWidth: '1200px' }}>
              {/* SVG for manual connection lines - user will create these */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                {manualConnections.map((conn, idx) => {
                  const fromPos = nodePositions[conn.from]
                  const toPos = nodePositions[conn.to]
                  if (!fromPos || !toPos) return null
                  
                  return (
                    <ConnectionLine
                      key={`${conn.from}-${conn.to}-${idx}`}
                      from={fromPos}
                      to={toPos}
                      fromSide={conn.fromSide}
                      toSide={conn.toSide}
                      controlPoint1={conn.cp1}
                      controlPoint2={conn.cp2}
                      label={conn.label}
                      isDashed={conn.isDashed}
                      fromNodeId={conn.from}
                      toNodeId={conn.to}
                    />
                  )
                })}
              </svg>

              {/* NaviGo Agents - All draggable with connection points */}
              
              {/* Telemetry Ingestion */}
              <WorkflowNode
                title="Telemetry Ingestion"
                subtitle="data collection"
                Icon={Activity}
                colors={{ bg: "from-cyan-100 to-blue-100", border: "border-cyan-400", text: "text-cyan-700", iconBg: "bg-cyan-200", iconBorder: "border-cyan-400" }}
                isSelected={selectedCell === "telemetry"}
                onSelect={() => setSelectedCell(selectedCell === "telemetry" ? null : "telemetry")}
                nodeId="telemetry"
                position={nodePositions.telemetry}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Master Agent */}
              <div
                className={`absolute group cursor-move transition-all ${
                  selectedCell === "master-agent" ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-black/50 z-30" : "z-20"
                }`}
                style={{ left: `${nodePositions.masterAgent.x}px`, top: `${nodePositions.masterAgent.y}px` }}
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).closest('.absolute.w-3')) return
                  if (e.button !== 0) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const container = e.currentTarget.closest('.relative')
                  if (!container) return
                  const containerRect = container.getBoundingClientRect()
                  const offsetX = e.clientX - rect.left
                  const offsetY = e.clientY - rect.top
                  
                  const handleMove = (moveEvent: MouseEvent) => {
                    const newX = moveEvent.clientX - containerRect.left - offsetX
                    const newY = moveEvent.clientY - containerRect.top - offsetY
                    handlePositionChange("masterAgent", newX, newY)
                  }
                  
                  const handleUp = () => {
                    window.removeEventListener('mousemove', handleMove)
                    window.removeEventListener('mouseup', handleUp)
                  }
                  
                  window.addEventListener('mousemove', handleMove)
                  window.addEventListener('mouseup', handleUp)
                  e.preventDefault()
                }}
                onClick={() => setSelectedCell(selectedCell === "master-agent" ? null : "master-agent")}
              >
                <Card className="relative bg-gradient-to-br from-indigo-200 via-purple-200 to-indigo-200 border-2 border-indigo-500 shadow-lg w-28 min-h-[72px] rounded-lg overflow-hidden">
                  
                  {/* Connection Points */}
                  {selectedCell === "master-agent" && (
                    <>
                      <ConnectionPoint side="top" nodeId="masterAgent" nodePosition={nodePositions.masterAgent} nodeWidth={112} nodeHeight={72} onDrag={handleConnectionPointDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
                      <ConnectionPoint side="right" nodeId="masterAgent" nodePosition={nodePositions.masterAgent} nodeWidth={112} nodeHeight={72} onDrag={handleConnectionPointDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
                      <ConnectionPoint side="bottom" nodeId="masterAgent" nodePosition={nodePositions.masterAgent} nodeWidth={112} nodeHeight={72} onDrag={handleConnectionPointDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
                      <ConnectionPoint side="left" nodeId="masterAgent" nodePosition={nodePositions.masterAgent} nodeWidth={112} nodeHeight={72} onDrag={handleConnectionPointDrag} onConnect={handleConnectionStart} onConnectEnd={handleConnectionEnd} />
                    </>
                  )}
                  
                  <CardContent className="relative z-10 p-2 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <div className="p-1 rounded bg-indigo-300 border border-indigo-400 shadow-sm">
                        <Brain size={11} className="text-indigo-800" />
                      </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-slate-800 mb-0.5">Master Agent</h3>
                    <p className="text-[8px] text-slate-700">Orchestrator</p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Analysis Agent */}
              <WorkflowNode
                title="Data Analysis Agent"
                subtitle="anomaly detection"
                Icon={BarChart3}
                colors={{ bg: "from-blue-100 to-indigo-100", border: "border-blue-400", text: "text-blue-700", iconBg: "bg-blue-200", iconBorder: "border-blue-400" }}
                isSelected={selectedCell === "dataAnalysis"}
                onSelect={() => setSelectedCell(selectedCell === "dataAnalysis" ? null : "dataAnalysis")}
                nodeId="dataAnalysis"
                position={nodePositions.dataAnalysis}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Diagnosis Agent */}
              <WorkflowNode
                title="Diagnosis Agent"
                subtitle="failure prediction"
                Icon={Brain}
                colors={{ bg: "from-purple-100 to-violet-100", border: "border-purple-400", text: "text-purple-700", iconBg: "bg-purple-200", iconBorder: "border-purple-400" }}
                isSelected={selectedCell === "diagnosis"}
                onSelect={() => setSelectedCell(selectedCell === "diagnosis" ? null : "diagnosis")}
                nodeId="diagnosis"
                position={nodePositions.diagnosis}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* RCA Agent */}
              <WorkflowNode
                title="RCA Agent"
                subtitle="root cause analysis"
                Icon={Target}
                colors={{ bg: "from-red-100 to-rose-100", border: "border-red-400", text: "text-red-700", iconBg: "bg-red-200", iconBorder: "border-red-400" }}
                isSelected={selectedCell === "rca"}
                onSelect={() => setSelectedCell(selectedCell === "rca" ? null : "rca")}
                nodeId="rca"
                position={nodePositions.rca}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Scheduling Agent */}
              <WorkflowNode
                title="Scheduling Agent"
                subtitle="appointment optimization"
                Icon={Calendar}
                colors={{ bg: "from-green-100 to-emerald-100", border: "border-green-400", text: "text-green-700", iconBg: "bg-green-200", iconBorder: "border-green-400" }}
                isSelected={selectedCell === "scheduling"}
                onSelect={() => setSelectedCell(selectedCell === "scheduling" ? null : "scheduling")}
                nodeId="scheduling"
                position={nodePositions.scheduling}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Engagement Agent */}
              <WorkflowNode
                title="Engagement Agent"
                subtitle="customer interaction"
                Icon={MessageSquare}
                colors={{ bg: "from-yellow-100 to-amber-100", border: "border-yellow-400", text: "text-yellow-700", iconBg: "bg-yellow-200", iconBorder: "border-yellow-400" }}
                isSelected={selectedCell === "engagement"}
                onSelect={() => setSelectedCell(selectedCell === "engagement" ? null : "engagement")}
                nodeId="engagement"
                position={nodePositions.engagement}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Communication Agent */}
              <WorkflowNode
                title="Communication Agent"
                subtitle="voice calling"
                Icon={Users}
                colors={{ bg: "from-indigo-100 to-blue-100", border: "border-indigo-400", text: "text-indigo-700", iconBg: "bg-indigo-200", iconBorder: "border-indigo-400" }}
                isSelected={selectedCell === "communication"}
                onSelect={() => setSelectedCell(selectedCell === "communication" ? null : "communication")}
                nodeId="communication"
                position={nodePositions.communication}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* SMS Agent */}
              <WorkflowNode
                title="SMS Agent"
                subtitle="text messaging"
                Icon={MessageSquare}
                colors={{ bg: "from-pink-100 to-rose-100", border: "border-pink-400", text: "text-pink-700", iconBg: "bg-pink-200", iconBorder: "border-pink-400" }}
                isSelected={selectedCell === "sms"}
                onSelect={() => setSelectedCell(selectedCell === "sms" ? null : "sms")}
                nodeId="sms"
                position={nodePositions.sms}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Feedback Agent */}
              <WorkflowNode
                title="Feedback Agent"
                subtitle="service validation"
                Icon={CheckCircle2}
                colors={{ bg: "from-teal-100 to-cyan-100", border: "border-teal-400", text: "text-teal-700", iconBg: "bg-teal-200", iconBorder: "border-teal-400" }}
                isSelected={selectedCell === "feedback"}
                onSelect={() => setSelectedCell(selectedCell === "feedback" ? null : "feedback")}
                nodeId="feedback"
                position={nodePositions.feedback}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Manufacturing Agent */}
              <WorkflowNode
                title="Manufacturing Agent"
                subtitle="quality insights"
                Icon={Factory}
                colors={{ bg: "from-orange-100 to-amber-100", border: "border-orange-400", text: "text-orange-700", iconBg: "bg-orange-200", iconBorder: "border-orange-400" }}
                isSelected={selectedCell === "manufacturing"}
                onSelect={() => setSelectedCell(selectedCell === "manufacturing" ? null : "manufacturing")}
                nodeId="manufacturing"
                position={nodePositions.manufacturing}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Human Loop Nodes */}
              
              {/* Human Review */}
              <WorkflowNode
                title="Human Review"
                subtitle="expert validation"
                Icon={UserCheck}
                colors={{ bg: "from-violet-100 to-purple-100", border: "border-violet-400", text: "text-violet-700", iconBg: "bg-violet-200", iconBorder: "border-violet-400" }}
                isSelected={selectedCell === "humanReview"}
                onSelect={() => setSelectedCell(selectedCell === "humanReview" ? null : "humanReview")}
                nodeId="humanReview"
                position={nodePositions.humanReview}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Human Override */}
              <WorkflowNode
                title="Human Override"
                subtitle="manual control"
                Icon={Shield}
                colors={{ bg: "from-amber-100 to-yellow-100", border: "border-amber-400", text: "text-amber-700", iconBg: "bg-amber-200", iconBorder: "border-amber-400" }}
                isSelected={selectedCell === "humanOverride"}
                onSelect={() => setSelectedCell(selectedCell === "humanOverride" ? null : "humanOverride")}
                nodeId="humanOverride"
                position={nodePositions.humanOverride}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />

              {/* Human Feedback */}
              <WorkflowNode
                title="Human Feedback"
                subtitle="user input"
                Icon={User}
                colors={{ bg: "from-emerald-100 to-green-100", border: "border-emerald-400", text: "text-emerald-700", iconBg: "bg-emerald-200", iconBorder: "border-emerald-400" }}
                isSelected={selectedCell === "humanFeedback"}
                onSelect={() => setSelectedCell(selectedCell === "humanFeedback" ? null : "humanFeedback")}
                nodeId="humanFeedback"
                position={nodePositions.humanFeedback}
                onPositionChange={handlePositionChange}
                onConnectionPointDrag={handleConnectionPointDrag}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
              />
            </div>

            {/* Flow Visualization */}
            <div className="mt-6 pt-6 border-t border-slate-400">
              <div className="text-sm font-semibold text-slate-900 mb-3">Active Data Flows</div>
              <div className="grid grid-cols-4 gap-2">
                {flows.filter(f => f.status === "active").slice(0, 8).map((flow, idx) => {
                  const fromCell = cells.find(c => c.id === flow.from)
                  const toCell = cells.find(c => c.id === flow.to)
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border-2 border-slate-300 text-xs shadow-sm"
                    >
                      <span className="text-slate-800 truncate font-medium">{fromCell?.title || flow.from}</span>
                      <ArrowRight size={14} className="text-blue-600 flex-shrink-0" />
                      <span className="text-slate-900 truncate font-semibold">{toCell?.title || flow.to}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Cell Details */}
      {selectedCellData && (
        <Card className="relative bg-white border-2 border-cyan-300 shadow-lg overflow-hidden">
          <CardHeader className="bg-cyan-50 border-b-2 border-cyan-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedCellData.color === "cyan" ? "bg-cyan-500/20 border-cyan-500/30" :
                          selectedCellData.color === "blue" ? "bg-blue-500/20 border-blue-500/30" :
                          selectedCellData.color === "orange" ? "bg-orange-500/20 border-orange-500/30" :
                          selectedCellData.color === "purple" ? "bg-purple-500/20 border-purple-500/30" :
                          selectedCellData.color === "red" ? "bg-red-500/20 border-red-500/30" :
                          selectedCellData.color === "green" ? "bg-green-500/20 border-green-500/30" :
                          selectedCellData.color === "yellow" ? "bg-yellow-500/20 border-yellow-500/30" :
                          selectedCellData.color === "indigo" ? "bg-indigo-500/20 border-indigo-500/30" :
                          selectedCellData.color === "pink" ? "bg-pink-500/20 border-pink-500/30" :
                          selectedCellData.color === "teal" ? "bg-teal-500/20 border-teal-500/30" :
                          "bg-gray-500/20 border-gray-500/30"
                        }`}>
                          <selectedCellData.icon size={20} className={
                            selectedCellData.color === "cyan" ? "text-cyan-400" :
                            selectedCellData.color === "blue" ? "text-blue-400" :
                            selectedCellData.color === "orange" ? "text-orange-400" :
                            selectedCellData.color === "purple" ? "text-purple-400" :
                            selectedCellData.color === "red" ? "text-red-400" :
                            selectedCellData.color === "green" ? "text-green-400" :
                            selectedCellData.color === "yellow" ? "text-yellow-400" :
                            selectedCellData.color === "indigo" ? "text-indigo-400" :
                            selectedCellData.color === "pink" ? "text-pink-400" :
                            selectedCellData.color === "teal" ? "text-teal-400" :
                            "text-gray-400"
                          } />
                        </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">{selectedCellData.title}</CardTitle>
                  <p className="text-sm text-gray-400">{selectedCellData.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCell(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 gap-6">
              {/* Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                    <span className="text-xs text-gray-400">Current Value</span>
                    <span className="text-sm font-bold text-cyan-400">{selectedCellData.value}</span>
                  </div>
                  {selectedCellData.metrics?.map((metric, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                      <span className="text-xs text-gray-400">{metric.label}</span>
                      <span className="text-sm font-semibold text-white">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Connected Agents</h4>
                <div className="space-y-2">
                  {connectedCells.map((cell) => {
                    const Icon = cell.icon
                    return (
                      <div
                        key={cell.id}
                        className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all"
                        onClick={() => setSelectedCell(cell.id)}
                      >
                        <div className={`p-1.5 rounded-lg ${
                          cell.color === "cyan" ? "bg-cyan-500/20 border-cyan-500/30" :
                          cell.color === "blue" ? "bg-blue-500/20 border-blue-500/30" :
                          cell.color === "orange" ? "bg-orange-500/20 border-orange-500/30" :
                          cell.color === "purple" ? "bg-purple-500/20 border-purple-500/30" :
                          cell.color === "red" ? "bg-red-500/20 border-red-500/30" :
                          cell.color === "green" ? "bg-green-500/20 border-green-500/30" :
                          cell.color === "yellow" ? "bg-yellow-500/20 border-yellow-500/30" :
                          cell.color === "indigo" ? "bg-indigo-500/20 border-indigo-500/30" :
                          cell.color === "pink" ? "bg-pink-500/20 border-pink-500/30" :
                          cell.color === "teal" ? "bg-teal-500/20 border-teal-500/30" :
                          "bg-gray-500/20 border-gray-500/30"
                        }`}>
                          <Icon size={14} className={
                            cell.color === "cyan" ? "text-cyan-400" :
                            cell.color === "blue" ? "text-blue-400" :
                            cell.color === "orange" ? "text-orange-400" :
                            cell.color === "purple" ? "text-purple-400" :
                            cell.color === "red" ? "text-red-400" :
                            cell.color === "green" ? "text-green-400" :
                            cell.color === "yellow" ? "text-yellow-400" :
                            cell.color === "indigo" ? "text-indigo-400" :
                            cell.color === "pink" ? "text-pink-400" :
                            cell.color === "teal" ? "text-teal-400" :
                            "text-gray-400"
                          } />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white">{cell.title}</div>
                          <div className="text-[10px] text-gray-400">{cell.description}</div>
                        </div>
                        <ArrowRight size={12} className="text-cyan-400" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

