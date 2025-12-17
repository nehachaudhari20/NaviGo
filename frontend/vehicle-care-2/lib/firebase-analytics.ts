import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, logEvent, setUserId, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'navigo-27206',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let analytics: Analytics | null = null
let app: FirebaseApp | null = null

// Track if we've already warned about missing config (to avoid spam)
let hasWarnedAboutConfig = false

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && !analytics) {
    // Check if required config values are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      // Only warn once in development mode
      if (!hasWarnedAboutConfig && process.env.NODE_ENV === 'development') {
        console.debug('[Firebase] Analytics skipped: Missing required configuration (apiKey or projectId). Analytics will be disabled.')
        hasWarnedAboutConfig = true
      }
      return null
    }
    
    try {
      // Check if Firebase app is already initialized (from Firestore)
      const existingApps = getApps()
      if (existingApps.length > 0) {
        app = existingApps[0]
      } else {
        // Only initialize if we have all required config
        if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
          if (!hasWarnedAboutConfig && process.env.NODE_ENV === 'development') {
            console.debug('[Firebase] Analytics skipped: Incomplete Firebase configuration')
            hasWarnedAboutConfig = true
          }
          return null
        }
        app = initializeApp(firebaseConfig)
      }
      
      // Initialize Analytics only if measurementId is present (required for Analytics)
      if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app)
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Firebase] Analytics initialized successfully')
        }
      } else {
        if (!hasWarnedAboutConfig && process.env.NODE_ENV === 'development') {
          console.debug('[Firebase] Analytics skipped: Missing measurementId')
          hasWarnedAboutConfig = true
        }
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Firebase] Analytics initialization failed:', error)
      }
      // Gracefully handle analytics initialization failure
      // App will continue to work without analytics
    }
  }
  
  return analytics
}

export const trackUEBAEvent = (eventName: string, params: Record<string, any>) => {
  if (!analytics && typeof window !== 'undefined') {
    initAnalytics()
  }
  
  if (analytics) {
    try {
      logEvent(analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...params
      })
    } catch (error) {
      console.warn('[Firebase] Failed to log event:', error)
    }
  }
}

export const setAnalyticsUserId = (userId: string) => {
  if (!analytics && typeof window !== 'undefined') {
    const result = initAnalytics()
    if (!result) {
      // Analytics not available, skip silently (no warning needed)
      return
    }
  }
  
  if (analytics) {
    try {
      setUserId(analytics, userId)
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Firebase] Failed to set user ID:', error)
      }
    }
  }
}

export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackUEBAEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  })
}

export const trackCustomEvent = (eventName: string, eventParams?: Record<string, any>) => {
  trackUEBAEvent(eventName, eventParams || {})
}

// Export analytics instance for direct use if needed
export const getAnalyticsInstance = () => analytics
