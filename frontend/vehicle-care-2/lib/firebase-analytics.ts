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

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && !analytics) {
    try {
      // Initialize Firebase app if not already initialized
      if (!getApps().length) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApps()[0]
      }
      
      // Initialize Analytics
      analytics = getAnalytics(app)
      
      console.log('[Firebase] Analytics initialized successfully')
    } catch (error) {
      console.warn('[Firebase] Analytics initialization failed:', error)
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
    initAnalytics()
  }
  
  if (analytics) {
    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.warn('[Firebase] Failed to set user ID:', error)
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
