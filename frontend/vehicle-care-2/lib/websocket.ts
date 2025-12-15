"use client"

export type WebSocketEventType =
  | "telemetry:update"
  | "prediction:new"
  | "prediction:confidence-update"
  | "appointment:auto-scheduled"
  | "voice:call-started"
  | "voice:call-completed"
  | "service:feedback-received"
  | "learning:model-updated"
  | "capa:new"
  | "anomaly:detected"

export interface WebSocketEvent {
  type: WebSocketEventType
  data: any
  timestamp: string
}

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"
const isBrowser = typeof window !== "undefined"

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()
  private isConnecting = false
  private isEnabled = true
  private connectionUrl: string | null = null

  connect(url?: string) {
    // In development, disable WebSocket by default to avoid connection errors
    if (isDevelopment && !url) {
      console.log("WebSocket disabled in development mode. Use mock data or provide a WebSocket URL.")
      this.isEnabled = false
      return
    }

    const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || "wss://api.navigo.com/ws"
    
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    if (!isBrowser) {
      console.log("WebSocket: Not in browser environment, skipping connection")
      return
    }

    this.connectionUrl = wsUrl
    this.isConnecting = true

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected to:", wsUrl)
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.isEnabled = true
        
        // Subscribe to default channels
        this.subscribe("vehicle:telemetry")
        this.subscribe("predictions")
        this.subscribe("appointments")
        this.subscribe("customer:engagement")
        this.subscribe("learning")
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        // WebSocket error events don't provide detailed error info
        // Log connection state and URL instead
        const state = this.ws?.readyState
        const stateText = state === WebSocket.CONNECTING ? "CONNECTING" :
                         state === WebSocket.OPEN ? "OPEN" :
                         state === WebSocket.CLOSING ? "CLOSING" :
                         state === WebSocket.CLOSED ? "CLOSED" : "UNKNOWN"
        
        if (isDevelopment) {
          // In development, just log a warning instead of error
          console.warn(
            `WebSocket connection error (${stateText}). ` +
            `URL: ${wsUrl}. ` +
            `This is expected in development if no WebSocket server is running.`
          )
        } else {
          console.error(
            `WebSocket error (${stateText}): `,
            `URL: ${wsUrl}`,
            `ReadyState: ${state}`,
            error
          )
        }
        
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        const reason = event.reason || "Unknown reason"
        const code = event.code
        
        if (isDevelopment) {
          console.log(`WebSocket disconnected (code: ${code}, reason: ${reason})`)
        } else {
          console.log("WebSocket disconnected", { code, reason, wasClean: event.wasClean })
        }
        
        this.isConnecting = false
        
        // Only attempt reconnect if it wasn't a clean close and we haven't exceeded max attempts
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(wsUrl)
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn("WebSocket: Max reconnection attempts reached. Connection disabled.")
          this.isEnabled = false
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      this.isConnecting = false
      
      if (isDevelopment) {
        console.warn("WebSocket: Connection failed. This is expected in development without a WebSocket server.")
        this.isEnabled = false
      } else {
        this.attemptReconnect(wsUrl)
      }
    }
  }

  private attemptReconnect(url: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (isDevelopment) {
        console.warn("WebSocket: Max reconnection attempts reached. Disabling in development mode.")
      } else {
        console.error("WebSocket: Max reconnection attempts reached")
      }
      this.isEnabled = false
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    if (isDevelopment) {
      console.log(`WebSocket: Will attempt reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    } else {
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    }

    setTimeout(() => {
      if (this.isEnabled) {
        this.connect(url)
      }
    }, delay)
  }

  private handleMessage(message: WebSocketEvent) {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(message.data)
        } catch (error) {
          console.error("Error in WebSocket listener:", error)
        }
      })
    }
  }

  subscribe(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          channel,
        })
      )
    }
  }

  unsubscribe(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          channel,
        })
      )
    }
  }

  on(eventType: WebSocketEventType, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  off(eventType: WebSocketEventType, callback: (data: any) => void) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    if (!this.isEnabled) {
      return false
    }
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Check if WebSocket is enabled (not disabled due to errors)
  getEnabled(): boolean {
    return this.isEnabled
  }

  // Get connection status details
  getStatus() {
    return {
      connected: this.isConnected(),
      enabled: this.isEnabled,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws?.readyState,
      url: this.connectionUrl,
    }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager()

// React hook for WebSocket
export function useWebSocket() {
  return {
    connect: (url?: string) => wsManager.connect(url),
    disconnect: () => wsManager.disconnect(),
    subscribe: (channel: string) => wsManager.subscribe(channel),
    unsubscribe: (channel: string) => wsManager.unsubscribe(channel),
    on: (eventType: WebSocketEventType, callback: (data: any) => void) => wsManager.on(eventType, callback),
    off: (eventType: WebSocketEventType, callback: (data: any) => void) => wsManager.off(eventType, callback),
    isConnected: () => wsManager.isConnected(),
    isEnabled: () => wsManager.getEnabled(),
    getStatus: () => wsManager.getStatus(),
  }
}

