"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { uebaService } from "@/lib/analytics"
import { setAnalyticsUserId, initAnalytics } from "@/lib/firebase-analytics"

interface AuthContextType {
  isAuthenticated: boolean
  user: { email: string; persona: string } | null
  login: (email: string, persona: string, rememberMe?: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string; persona: string } | null>(null)

  useEffect(() => {
    // Initialize Firebase Analytics
    if (typeof window !== "undefined") {
      initAnalytics()
    }

    // Check for stored auth on mount
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("navigo_auth")
      const storedUser = localStorage.getItem("navigo_user")
      if (storedAuth === "true" && storedUser) {
        const userData = JSON.parse(storedUser)
        setIsAuthenticated(true)
        setUser(userData)
        
        // Track session restoration
        uebaService.trackUserBehavior({
          action: 'session_restored',
          userId: userData.email,
          metadata: {
            persona: userData.persona,
            timestamp: new Date().toISOString(),
          }
        })
        
        setAnalyticsUserId(userData.email)
      }
    }
  }, [])

  const login = (email: string, persona: string, rememberMe = false) => {
    setIsAuthenticated(true)
    const userData = { email, persona }
    setUser(userData)
    
    // Track login with UEBA
    uebaService.trackLogin(email, {
      persona,
      rememberMe,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      screenResolution: typeof window !== 'undefined' 
        ? `${window.screen.width}x${window.screen.height}` 
        : 'unknown',
    })
    
    // Set user ID in Firebase Analytics
    setAnalyticsUserId(email)
    
    if (rememberMe || typeof window !== "undefined") {
      localStorage.setItem("navigo_auth", "true")
      localStorage.setItem("navigo_user", JSON.stringify(userData))
    }
  }

  const logout = () => {
    const userId = user?.email || 'unknown'
    
    // Track logout with UEBA
    uebaService.trackLogout(userId)
    
    setIsAuthenticated(false)
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("navigo_auth")
      localStorage.removeItem("navigo_user")
      // Force clear any cached data
      sessionStorage.clear()
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

