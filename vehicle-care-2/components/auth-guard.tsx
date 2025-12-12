"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't protect login page
    if (pathname === "/login") {
      // If already authenticated, redirect to dashboard
      if (isAuthenticated) {
        router.push("/")
      }
      return
    }

    // Protect all other pages
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, pathname, router])

  // Don't render protected content if not authenticated (except login page)
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}

