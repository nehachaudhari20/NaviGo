interface UEBAEvent {
  userId: string
  sessionId: string
  timestamp: Date
  eventType: 'chat_interaction' | 'user_login' | 'user_logout' | 'page_view' | 'anomaly_detected'
  metadata: Record<string, any>
  entityType?: 'chatbot' | 'user' | 'system'
  riskScore?: number
}

interface ChatInteractionData {
  message: string
  responseTime: number
  sentiment?: string
  intent?: string
  userId: string
}

interface UserBehaviorData {
  action: string
  userId: string
  metadata?: Record<string, any>
}

class UEBAService {
  private sessionId: string
  private eventBuffer: UEBAEvent[] = []
  private readonly BUFFER_SIZE = 10
  
  constructor() {
    this.sessionId = this.generateSessionId()
  }

  trackChatbotInteraction(data: ChatInteractionData) {
    const event: UEBAEvent = {
      userId: data.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      eventType: 'chat_interaction',
      entityType: 'chatbot',
      metadata: {
        messageLength: data.message.length,
        responseTime: data.responseTime,
        sentiment: data.sentiment,
        intent: data.intent,
      },
      riskScore: this.calculateRiskScore(data)
    }
    
    this.sendToAnalytics(event)
  }

  trackUserBehavior(data: UserBehaviorData) {
    const event: UEBAEvent = {
      userId: data.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      eventType: 'page_view',
      entityType: 'user',
      metadata: data.metadata || {}
    }
    
    this.sendToAnalytics(event)
  }

  trackLogin(userId: string, metadata: Record<string, any>) {
    const event: UEBAEvent = {
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      eventType: 'user_login',
      entityType: 'user',
      metadata: {
        ...metadata,
        loginTime: new Date().toISOString(),
      },
      riskScore: this.detectLoginAnomaly(metadata)
    }
    
    this.sendToAnalytics(event)
    
    // Check for anomalies
    if (event.riskScore && event.riskScore > 70) {
      this.trackAnomaly('High risk login detected', userId, event.riskScore)
    }
  }

  trackLogout(userId: string) {
    const event: UEBAEvent = {
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      eventType: 'user_logout',
      entityType: 'user',
      metadata: {
        logoutTime: new Date().toISOString(),
      }
    }
    
    this.sendToAnalytics(event)
  }

  private trackAnomaly(description: string, userId: string, riskScore: number) {
    const event: UEBAEvent = {
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      eventType: 'anomaly_detected',
      entityType: 'system',
      metadata: {
        description,
        anomalyType: 'behavioral',
      },
      riskScore
    }
    
    this.sendToAnalytics(event)
    
    // Log to console for immediate visibility
    console.warn('[UEBA ANOMALY]', description, { userId, riskScore })
  }

  private calculateRiskScore(data: ChatInteractionData): number {
    let score = 0
    
    // Check for emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'accident', 'broke down', 'help', 'crash']
    const lowerMessage = data.message.toLowerCase()
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      score += 30
    }
    
    // Check response time
    if (data.responseTime > 5000) {
      score += 20
    }
    
    // Check message length (very long or very short can be suspicious)
    if (data.message.length > 500 || data.message.length < 2) {
      score += 10
    }
    
    // Check for potential spam patterns
    if (this.detectSpamPattern(data.message)) {
      score += 40
    }
    
    return Math.min(score, 100)
  }

  private detectLoginAnomaly(metadata: Record<string, any>): number {
    let score = 0
    
    // Check for unusual login times (late night)
    const hour = new Date().getHours()
    if (hour >= 2 && hour <= 5) {
      score += 20
    }
    
    // Could add more checks:
    // - Multiple failed login attempts
    // - Login from new location
    // - Unusual user agent
    
    return score
  }

  private detectSpamPattern(message: string): boolean {
    // Check for repeated characters
    const repeatedPattern = /(.)\1{10,}/
    if (repeatedPattern.test(message)) {
      return true
    }
    
    // Check for excessive capitalization
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length
    if (capsRatio > 0.7 && message.length > 10) {
      return true
    }
    
    return false
  }

  private sendToAnalytics(event: UEBAEvent) {
    // Add to buffer
    this.eventBuffer.push(event)
    
    // Send to Firebase Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventType, {
        user_id: event.userId,
        session_id: event.sessionId,
        entity_type: event.entityType,
        risk_score: event.riskScore,
        ...event.metadata
      })
    }
    
    // Also send to custom analytics endpoint (if needed)
    this.sendToCustomEndpoint(event)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[UEBA]', event.eventType, {
        user: event.userId,
        risk: event.riskScore,
        metadata: event.metadata
      })
    }
    
    // Flush buffer if full
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      this.flushBuffer()
    }
  }

  private async sendToCustomEndpoint(event: UEBAEvent) {
    try {
      // This could be a custom backend endpoint for UEBA data
      // For now, we'll store in localStorage for demo purposes
      if (typeof window !== 'undefined') {
        const storageKey = 'ueba_events'
        const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]')
        const events = [...existingEvents, event].slice(-100) // Keep last 100 events
        localStorage.setItem(storageKey, JSON.stringify(events))
      }
    } catch (error) {
      console.error('[UEBA] Failed to store event:', error)
    }
  }

  private flushBuffer() {
    // Could batch send events to backend
    this.eventBuffer = []
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Public method to get recent events (for dashboard)
  getRecentEvents(): UEBAEvent[] {
    if (typeof window === 'undefined') return []
    try {
      const storageKey = 'ueba_events'
      return JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {
      return []
    }
  }

  // Public method to get analytics summary
  getAnalyticsSummary() {
    const events = this.getRecentEvents()
    
    return {
      totalInteractions: events.filter(e => e.eventType === 'chat_interaction').length,
      anomaliesDetected: events.filter(e => e.eventType === 'anomaly_detected').length,
      avgRiskScore: events.reduce((sum, e) => sum + (e.riskScore || 0), 0) / (events.length || 1),
      recentLogins: events.filter(e => e.eventType === 'user_login').length,
      highRiskEvents: events.filter(e => (e.riskScore || 0) > 50).length,
    }
  }
}

export const uebaService = new UEBAService()
