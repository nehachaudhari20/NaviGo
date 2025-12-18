"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { uebaService } from "@/lib/analytics"
import { setAnalyticsUserId, initAnalytics } from "@/lib/firebase-analytics"

interface AuthContextType {
  isAuthenticated: boolean
  user: { email: string; persona: string } | null
  isInitialized: boolean
  login: (email: string, persona: string, rememberMe?: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string; persona: string } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // #region agent log
    const logData = {location:'auth-context.tsx:22',message:'AuthProvider useEffect started',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    console.log('[DEBUG]', logData);
    fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    // #endregion
    // Initialize Firebase Analytics
    if (typeof window !== "undefined") {
      initAnalytics()
    }

    // Check for stored auth on mount
    if (typeof window !== "undefined") {
      // #region agent log
      const logData2 = {location:'auth-context.tsx:30',message:'Checking localStorage for auth',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
      console.log('[DEBUG]', logData2);
      fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion
      const storedAuth = localStorage.getItem("navigo_auth")
      const storedUser = localStorage.getItem("navigo_user")
      // #region agent log
      const logData3 = {location:'auth-context.tsx:33',message:'localStorage values',data:{storedAuth,hasStoredUser:!!storedUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
      console.log('[DEBUG]', logData3);
      fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
      // #endregion
      if (storedAuth === "true" && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setIsAuthenticated(true)
          setUser(userData)
          // #region agent log
          const logData4 = {location:'auth-context.tsx:36',message:'Auth restored from localStorage',data:{persona:userData.persona,email:userData.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
          console.log('[DEBUG]', logData4);
          fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
          // #endregion
          
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
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          localStorage.removeItem("navigo_auth")
          localStorage.removeItem("navigo_user")
        }
      }
      setIsInitialized(true)
      // #region agent log
      const logData5 = {location:'auth-context.tsx:55',message:'Auth initialization complete',data:{isAuthenticated:storedAuth==='true',isInitialized:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
      console.log('[DEBUG]', logData5);
      fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
      // #endregion
    } else {
      // Server-side: mark as initialized immediately
      setIsInitialized(true)
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
    <AuthContext.Provider value={{ isAuthenticated, user, isInitialized, login, logout }}>
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

