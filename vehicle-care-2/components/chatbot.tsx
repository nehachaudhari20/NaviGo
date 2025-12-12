"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your vehicle today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "I understand your concern. Let me help you with that.",
        "Based on your vehicle data, I can provide some insights.",
        "That's a great question! Let me check your vehicle's status.",
        "I'm here to assist you with any vehicle-related queries.",
        "I can help you schedule a service or answer questions about your vehicle's health.",
      ]

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = [
    "Check vehicle health",
    "Schedule service",
    "View maintenance history",
    "Emergency help",
  ]

  const handleQuickQuestion = (question: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: question,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])

    setTimeout(() => {
      const responses: Record<string, string> = {
        "Check vehicle health": "Your vehicle health score is 87%. All systems are operating normally. Would you like detailed information about any specific component?",
        "Schedule service": "I can help you schedule a service. Your next recommended service is due in 15 days. Would you like to book an appointment?",
        "View maintenance history": "You have 5 service records. Your last service was 45 days ago for an oil change. Would you like to see the full history?",
        "Emergency help": "For emergency assistance, please call +91-9876543210 or use the Emergency section in Support. I can also help you locate nearby service centers.",
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: responses[question] || "I'm here to help! Can you provide more details?",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full border-2 border-black">
            1
          </Badge>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          }`}
        >
          <Card className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/40 h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md border-b border-slate-700/50 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/20 backdrop-blur-sm p-2 rounded-lg border border-cyan-500/30">
                    <Bot size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-cyan-400 font-semibold">AI Assistant</CardTitle>
                    <p className="text-xs text-slate-400">Usually replies instantly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50"
                  >
                    <Minimize2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/20">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <div className="bg-cyan-500/20 backdrop-blur-sm p-2 rounded-full border border-cyan-500/30 flex-shrink-0 h-8 w-8 flex items-center justify-center">
                          <Bot size={14} className="text-cyan-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-slate-100"
                            : "bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <div className="bg-slate-700/50 backdrop-blur-sm p-2 rounded-full border border-slate-600/50 flex-shrink-0 h-8 w-8 flex items-center justify-center">
                          <User size={14} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/30">
                    <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 h-auto py-1.5 px-3"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

