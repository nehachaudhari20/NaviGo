"use client"

import { usePathname } from "next/navigation"
import Chatbot from "./chatbot"

export default function ChatbotWrapper() {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  // Don't show chatbot on login page
  if (isLoginPage) {
    return null
  }

  return <Chatbot />
}


