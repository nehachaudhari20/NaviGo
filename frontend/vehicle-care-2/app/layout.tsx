import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import ChatbotWrapper from "@/components/chatbot-wrapper"
import Script from "next/script"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Care - Vehicle Maintenance Dashboard",
  description: "Track vehicle maintenance, services, and health indicators",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // #region agent log
  if (typeof window !== "undefined") {
    fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:36',message:'RootLayout render',data:{pathname:window.location.pathname,nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }
  // #endregion
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* #region agent log */}
        {typeof window !== "undefined" && (
          <script dangerouslySetInnerHTML={{__html:`fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:head',message:'Script loading check',data:{scripts:Array.from(document.querySelectorAll('script[src]')).map(s=>s.src)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});`}} />
        )}
        {/* #endregion */}
      </head>
      <body className={`font-sans antialiased dark`} suppressHydrationWarning>
        <AuthProvider>
        {children}
          <ChatbotWrapper />
        </AuthProvider>
        <Analytics />
        {/* Load UEBA test helpers in development */}
        {process.env.NODE_ENV === 'development' && (
          <Script src="/ueba-test-helpers.js" strategy="afterInteractive" />
        )}
        {/* #region agent log */}
        {typeof window !== "undefined" && (
          <script dangerouslySetInnerHTML={{__html:`window.addEventListener('error',function(e){if(e.filename&&e.filename.includes('.js')){fetch('http://127.0.0.1:7242/ingest/a1345270-2a46-4dba-9801-7d775e34c887',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:error-handler',message:'JS load error',data:{filename:e.filename,message:e.message,lineno:e.lineno},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});}});`}} />
        )}
        {/* #endregion */}
      </body>
    </html>
  )
}
