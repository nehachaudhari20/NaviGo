# NaviGo System - Technical Flow Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Data Flow](#data-flow)
4. [AI Pipeline Integration](#ai-pipeline-integration)
5. [Real-time Updates](#real-time-updates)
6. [Authentication & Authorization](#authentication--authorization)
7. [Component Communication](#component-communication)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Notification System](#notification-system)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js/React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Customer   │  │   Service    │  │ Manufacturer │      │
│  │   Dashboard  │  │   Center     │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘              │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  API Layer │                             │
│                    │  (REST/WS) │                             │
│                    └─────┬─────┘                             │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Service │  │  Data Service │  │  AI Service  │      │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘      │
│                           │                  │               │
│                    ┌──────▼──────┐                          │
│                    │  Database   │                          │
│                    │  (PostgreSQL)│                         │
│                    └─────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: React Context API + useState/useEffect
- **Data Fetching**: React Server Components + Client Components
- **Real-time**: WebSocket (via API layer)
- **Charts**: Recharts 2.15
- **Icons**: Lucide React

### Project Structure

```
vehicle-care-2/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx               # Customer dashboard
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── servicing/
│   │   └── page.tsx          # Servicing dashboard
│   ├── support/
│   │   └── page.tsx          # Support page
│   ├── manufacturer/
│   │   └── page.tsx          # Manufacturer dashboard
│   └── service-center/
│       ├── page.tsx          # Service center dashboard
│       ├── agentic-ai/
│       ├── predictive-maintenance/
│       ├── autonomous-scheduling/
│       └── customer-engagement/
├── components/
│   ├── manufacturer/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── kpi-cards.tsx
│   │   ├── ai-insights.tsx
│   │   ├── ai-quality-predictions.tsx
│   │   └── notifications-panel.tsx
│   ├── ui/                    # shadcn/ui components
│   └── ...
├── contexts/
│   └── auth-context.tsx       # Authentication context
└── lib/
    └── utils.ts               # Utility functions
```

---

## Data Flow

### 1. Initial Page Load Flow

```
User Request
    │
    ├─► Next.js App Router
    │       │
    │       ├─► Route Handler
    │       │       │
    │       │       ├─► Check Authentication (AuthContext)
    │       │       │       │
    │       │       │       ├─► If not authenticated → Redirect to /login
    │       │       │       │
    │       │       │       └─► If authenticated → Load Dashboard
    │       │       │
    │       │       └─► Server Component Render
    │       │               │
    │       │               ├─► Fetch Initial Data (Server-side)
    │       │               │       │
    │       │               │       └─► API Call → Backend
    │       │               │
    │       │               └─► Render HTML with Data
    │       │
    │       └─► Client Component Hydration
    │               │
    │               ├─► React Hydration
    │               │
    │               └─► Interactive Features Enabled
```

### 2. Component Rendering Flow

```
Manufacturer Dashboard Page
    │
    ├─► useEffect Hook (Client-side)
    │       │
    │       ├─► Check Authentication Status
    │       │       │
    │       │       └─► useAuth() Hook
    │       │               │
    │       │               └─► AuthContext
    │       │                       │
    │       │                       └─► localStorage/sessionStorage
    │       │
    │       └─► Redirect if needed
    │
    ├─► Render Layout
    │       │
    │       ├─► ManufacturerSidebar
    │       │       └─► Navigation Icons
    │       │
    │       ├─► ManufacturerHeader
    │       │       ├─► User Info
    │       │       ├─► Search Bar
    │       │       └─► Notifications Icon
    │       │
    │       └─► Main Content
    │               │
    │               ├─► KPICards
    │               │       └─► Fetch KPI Data (Client-side)
    │               │
    │               ├─► AIInsights
    │               │       └─► Fetch AI Insights (Client-side)
    │               │
    │               ├─► AIQualityPredictions
    │               │       └─► Fetch Quality Predictions (Client-side)
    │               │
    │               ├─► NotificationsPanel
    │               │       └─► Fetch Notifications (Client-side)
    │               │
    │               └─► Other Dashboard Components
```

### 3. Data Fetching Pattern

```typescript
// Client Component Example
"use client"

import { useEffect, useState } from "react"

export default function KPICards() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data on component mount
    fetch('/api/manufacturer/kpis')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching KPIs:', error)
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return <ErrorMessage />

  return <Card>{/* Render KPI data */}</Card>
}
```

---

## AI Pipeline Integration

### AI Features in Manufacturer Dashboard

#### 1. AI Insights Component

**Data Flow:**
```
AI Insights Component
    │
    ├─► useEffect Hook
    │       │
    │       └─► Fetch AI Insights
    │               │
    │               ├─► API: GET /api/manufacturer/ai/insights
    │               │       │
    │               │       └─► Backend AI Service
    │               │               │
    │               │               ├─► Data Analysis Agent
    │               │               │       └─► Analyze production data
    │               │               │
    │               │               ├─► Quality Prediction Agent
    │               │               │       └─► Predict quality metrics
    │               │               │
    │               │               └─► Optimization Agent
    │               │                       └─► Generate recommendations
    │               │
    │               └─► Update State
    │                       │
    │                       └─► Re-render Component
```

**Technical Implementation:**
```typescript
// components/manufacturer/ai-insights.tsx
"use client"

import { useEffect, useState } from "react"

interface AIInsight {
  type: string
  title: string
  description: string
  confidence: number
  impact: string
}

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Poll for AI insights every 30 seconds
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/manufacturer/ai/insights', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        })
        const data = await response.json()
        setInsights(data.insights)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching AI insights:', error)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, 30000) // Poll every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      {insights.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </Card>
  )
}
```

#### 2. AI Quality Predictions Component

**Data Flow:**
```
AI Quality Predictions
    │
    ├─► Fetch Historical Quality Data
    │       │
    │       └─► API: GET /api/manufacturer/quality/history
    │
    ├─► Fetch AI Predictions
    │       │
    │       └─► API: GET /api/manufacturer/ai/quality-predictions
    │               │
    │               └─► Backend AI Service
    │                       │
    │                       └─► Quality Prediction Model
    │                               │
    │                               ├─► Input: Historical quality data
    │                               ├─► Input: Current production metrics
    │                               ├─► Input: Component specifications
    │                               │
    │                               └─► Output: Predicted quality score
    │                                       │
    │                                       └─► Confidence level
    │
    └─► Render Chart (Recharts)
            │
            ├─► Predicted Line (Cyan)
            └─► Actual Line (Green)
```

**Technical Implementation:**
```typescript
// components/manufacturer/ai-quality-predictions.tsx
"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export default function AIQualityPredictions() {
  const [qualityData, setQualityData] = useState([])
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    // Fetch quality history
    fetch('/api/manufacturer/quality/history')
      .then(res => res.json())
      .then(data => setQualityData(data))

    // Fetch AI prediction
    fetch('/api/manufacturer/ai/quality-predictions')
      .then(res => res.json())
      .then(data => setPrediction(data))
  }, [])

  return (
    <Card>
      <LineChart data={qualityData}>
        <Line dataKey="predicted" stroke="#06b6d4" />
        <Line dataKey="actual" stroke="#10b981" />
      </LineChart>
    </Card>
  )
}
```

---

## Real-time Updates

### WebSocket Integration

```typescript
// Real-time notification updates
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(
      `wss://api.navigo.com/notifications?userId=${user.id}&persona=manufacturer`
    )

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      
      // Add new notification to state
      setNotifications(prev => [notification, ...prev])
      
      // Show browser notification if tab is not focused
      if (document.hidden) {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/navigo-icon.png'
        })
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        // Reconnect logic
      }, 5000)
    }

    return () => {
      ws.close()
    }
  }, [user])

  return (
    <Card>
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </Card>
  )
}
```

### Polling Strategy (Fallback)

```typescript
// Polling for AI insights (if WebSocket unavailable)
useEffect(() => {
  const fetchInsights = async () => {
    const response = await fetch('/api/manufacturer/ai/insights')
    const data = await response.json()
    setInsights(data.insights)
  }

  // Initial fetch
  fetchInsights()

  // Poll every 30 seconds
  const interval = setInterval(fetchInsights, 30000)

  return () => clearInterval(interval)
}, [])
```

---

## Authentication & Authorization

### Auth Flow

```
User Login
    │
    ├─► Login Page (/login)
    │       │
    │       ├─► User selects persona (Customer/Service/Manufacturer)
    │       │
    │       ├─► User enters credentials
    │       │
    │       └─► Submit Form
    │               │
    │               └─► API: POST /api/auth/login
    │                       │
    │                       └─► Backend Auth Service
    │                               │
    │                               ├─► Validate Credentials
    │                               │
    │                               ├─► Generate JWT Token
    │                               │
    │                               └─► Return Token + User Data
    │                                       │
    │                                       └─► Frontend
    │                                               │
    │                                               ├─► Store in localStorage
    │                                               │
    │                                               ├─► Update AuthContext
    │                                               │
    │                                               └─► Redirect to Dashboard
    │                                                       │
    │                                                       ├─► Customer → /
    │                                                       ├─► Service → /service-center
    │                                                       └─► Manufacturer → /manufacturer
```

### AuthContext Implementation

```typescript
// contexts/auth-context.tsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, persona: string, remember: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem('navigo_auth')
    if (storedAuth) {
      const authData = JSON.parse(storedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
  }, [])

  const login = async (email: string, persona: string, remember: boolean) => {
    // API call to backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, persona })
    })

    const data = await response.json()
    
    // Store auth data
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('navigo_auth', JSON.stringify({
      token: data.token,
      user: data.user
    }))

    setIsAuthenticated(true)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('navigo_auth')
    sessionStorage.removeItem('navigo_auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Route Protection

```typescript
// app/manufacturer/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ManufacturerPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Protect route
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    // Check persona
    if (user?.persona !== "manufacturer") {
      // Redirect to appropriate dashboard
      if (user?.persona === "customer") {
        router.push("/")
      } else if (user?.persona === "service") {
        router.push("/service-center")
      }
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.persona !== "manufacturer") {
    return null // Or loading spinner
  }

  return (
    <div>
      {/* Dashboard content */}
    </div>
  )
}
```

---

## Component Communication

### Parent-Child Communication

```typescript
// Parent Component
export default function ManufacturerDashboard() {
  const [notifications, setNotifications] = useState([])

  return (
    <div>
      <NotificationsPanel 
        notifications={notifications}
        onNotificationRead={(id) => {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
          )
        }}
      />
    </div>
  )
}

// Child Component
interface NotificationsPanelProps {
  notifications: Notification[]
  onNotificationRead: (id: number) => void
}

export default function NotificationsPanel({ 
  notifications, 
  onNotificationRead 
}: NotificationsPanelProps) {
  return (
    <div>
      {notifications.map(notif => (
        <NotificationItem 
          key={notif.id}
          notification={notif}
          onRead={() => onNotificationRead(notif.id)}
        />
      ))}
    </div>
  )
}
```

### Context-Based Communication

```typescript
// Create Notification Context
const NotificationContext = createContext<{
  notifications: Notification[]
  addNotification: (notif: Notification) => void
  markAsRead: (id: number) => void
}>({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {}
})

// Use in any component
function SomeComponent() {
  const { addNotification } = useContext(NotificationContext)
  
  const handleAction = () => {
    addNotification({
      id: Date.now(),
      title: "Action Completed",
      message: "Your action was successful",
      type: "success"
    })
  }
}
```

---

## State Management

### Local Component State

```typescript
// Using useState for component-specific state
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
```

### Global State (Context API)

```typescript
// Auth state (global)
const { user, isAuthenticated } = useAuth()

// Notification state (global)
const { notifications } = useNotifications()
```

### Server State (React Server Components)

```typescript
// app/manufacturer/page.tsx (Server Component)
async function ManufacturerPage() {
  // Fetch data on server
  const initialData = await fetch('https://api.navigo.com/manufacturer/data')
    .then(res => res.json())

  return (
    <ClientDashboard initialData={initialData} />
  )
}
```

---

## API Integration

### API Client Pattern

```typescript
// lib/api-client.ts
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL
  private token: string | null = null

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const apiClient = new APIClient()
```

### Usage in Components

```typescript
// components/manufacturer/kpi-cards.tsx
import { apiClient } from "@/lib/api-client"

export default function KPICards() {
  const [kpis, setKPIs] = useState(null)

  useEffect(() => {
    apiClient.get('/manufacturer/kpis')
      .then(data => setKPIs(data))
      .catch(error => console.error(error))
  }, [])

  return <Card>{/* Render KPIs */}</Card>
}
```

---

## Notification System

### Notification Flow

```
Event Occurs (Backend)
    │
    ├─► Backend Service
    │       │
    │       ├─► Create Notification Record (Database)
    │       │
    │       └─► Emit WebSocket Event
    │               │
    │               └─► WebSocket Server
    │                       │
    │                       └─► Broadcast to Connected Clients
    │                               │
    │                               └─► Frontend WebSocket Client
    │                                       │
    │                                       ├─► Update Notification State
    │                                       │
    │                                       ├─► Show Browser Notification
    │                                       │
    │                                       └─► Update UI (Badge Count)
```

### Notification Component Implementation

```typescript
// components/manufacturer/notifications-panel.tsx
"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const { messages } = useWebSocket('/notifications')

  useEffect(() => {
    // Handle incoming WebSocket messages
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage.type === 'notification') {
        setNotifications(prev => [latestMessage.data, ...prev])
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(latestMessage.data.title, {
            body: latestMessage.data.message,
            icon: '/navigo-icon.png'
          })
        }
      }
    }
  }, [messages])

  return (
    <Card>
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </Card>
  )
}
```

---

## Complete System Flow Example

### User Journey: Manufacturer Views AI Quality Prediction

```
1. User Opens Browser
    │
    ├─► Navigate to https://navigo.com/manufacturer
    │
    ├─► Next.js App Router
    │       │
    │       ├─► Check Authentication (AuthContext)
    │       │       │
    │       │       └─► If not authenticated → Redirect to /login
    │       │
    │       └─► Render Manufacturer Dashboard
    │               │
    │               ├─► Server Component (Initial HTML)
    │               │
    │               └─► Client Component Hydration
    │                       │
    │                       └─► AIQualityPredictions Component
    │                               │
    │                               ├─► useEffect Hook Triggers
    │                               │       │
    │                               │       ├─► Fetch Quality History
    │                               │       │       │
    │                               │       │       └─► GET /api/manufacturer/quality/history
    │                               │       │               │
    │                               │       │               └─► Backend API
    │                               │       │                       │
    │                               │       │                       └─► Database Query
    │                               │       │                               │
    │                               │       │                               └─► Return Historical Data
    │                               │       │
    │                               │       └─► Fetch AI Predictions
    │                               │               │
    │                               │               └─► GET /api/manufacturer/ai/quality-predictions
    │                               │                       │
    │                               │                       └─► Backend AI Service
    │                               │                               │
    │                               │                               ├─► Load ML Model
    │                               │                               │
    │                               │                               ├─► Process Input Data
    │                               │                               │
    │                               │                               └─► Generate Prediction
    │                               │                                       │
    │                               │                                       └─► Return Prediction + Confidence
    │                               │
    │                               ├─► Update Component State
    │                               │       │
    │                               │       └─► setQualityData(data)
    │                               │
    │                               └─► Re-render Component
    │                                       │
    │                                       ├─► Render Line Chart (Recharts)
    │                                       │       │
    │                                       │       ├─► Predicted Line (Cyan)
    │                                       │       └─► Actual Line (Green)
    │                                       │
    │                                       └─► Display Prediction Card
    │                                               │
    │                                               ├─► Next Batch Quality: 98%
    │                                               └─► AI Confidence: 94%
```

---

## Key Technical Patterns

### 1. Server-Side Rendering (SSR)
- Initial page load renders on server
- Faster First Contentful Paint (FCP)
- Better SEO

### 2. Client-Side Hydration
- React takes over after initial render
- Enables interactivity
- Maintains state

### 3. Incremental Static Regeneration (ISR)
- Pre-render pages at build time
- Revalidate in background
- Best of both worlds

### 4. Real-time Updates
- WebSocket for live data
- Polling as fallback
- Optimistic UI updates

### 5. Error Handling
```typescript
try {
  const data = await fetch('/api/endpoint')
  if (!data.ok) throw new Error('API Error')
  return data.json()
} catch (error) {
  // Show error UI
  // Log to error tracking service
  // Fallback to cached data if available
}
```

---

## Performance Optimizations

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Load components on demand
4. **Memoization**: React.memo, useMemo, useCallback
5. **Virtual Scrolling**: For long lists
6. **Debouncing**: For search inputs
7. **Request Deduplication**: Prevent duplicate API calls

---

## Security Considerations

1. **Authentication**: JWT tokens stored securely
2. **Authorization**: Role-based access control (RBAC)
3. **CSRF Protection**: Next.js built-in protection
4. **XSS Prevention**: React's automatic escaping
5. **API Security**: HTTPS, CORS, rate limiting
6. **Input Validation**: Both client and server-side

---

This technical flow document provides a comprehensive overview of how the NaviGo system works from a frontend perspective, including data flow, component communication, state management, and integration with backend services and AI pipelines.

