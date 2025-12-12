"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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
    // Check for stored auth on mount
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("navigo_auth")
      const storedUser = localStorage.getItem("navigo_user")
      if (storedAuth === "true" && storedUser) {
        setIsAuthenticated(true)
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const login = (email: string, persona: string, rememberMe = false) => {
    setIsAuthenticated(true)
    const userData = { email, persona }
    setUser(userData)
    if (rememberMe || typeof window !== "undefined") {
      localStorage.setItem("navigo_auth", "true")
      localStorage.setItem("navigo_user", JSON.stringify(userData))
    }
  }

  const logout = () => {
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

