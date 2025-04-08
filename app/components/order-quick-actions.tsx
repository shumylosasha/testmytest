"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  ShoppingCart,
  AlertTriangle,
  Bell,
  X,
  Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderQuickActionsProps {
  onChatWithAI: () => void
  onCreateOrder: () => void
}

type AINotification = {
  id: string
  message: string
  timestamp: Date
  read: boolean
  type: "info" | "alert" | "suggestion"
  action: {
    label: string
    onClick: () => void
  }
}

export function OrderQuickActions({
  onChatWithAI,
  onCreateOrder,
}: OrderQuickActionsProps) {
  const [showNotificationList, setShowNotificationList] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiChatInput, setAIChatInput] = useState("")
  const [aiChatMessages, setAIChatMessages] = useState<
    Array<{
      role: "user" | "assistant"
      content: string
      action?: {
        label: string
        onClick: () => void
      }
    }>
  >([
    {
      role: "assistant",
      content: "Hello! I'm your procurement assistant. How can I help you with your orders today?",
      action: {
        label: "View Orders",
        onClick: () => (window.location.href = "/orders"),
      },
    },
  ])
  const [aiStatus, setAiStatus] = useState<"ok" | "attention">("ok")
  const [notifications, setNotifications] = useState<AINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const updateUnreadCount = (notifs: AINotification[]) => {
    setUnreadCount(notifs.filter((n) => !n.read).length)
  }

  // Generate and manage AI notifications
  useEffect(() => {
    // Initial notifications
    const initialNotifications: AINotification[] = [
      {
        id: "1",
        message: "New order recommendations based on your inventory levels",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: "info",
        action: {
          label: "View Recommendations",
          onClick: () => alert("Viewing order recommendations..."),
        },
      },
      {
        id: "2",
        message: "Urgent: 3 orders require your attention",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        type: "alert",
        action: {
          label: "Review Orders",
          onClick: () => alert("Reviewing urgent orders..."),
        },
      },
    ]

    setNotifications(initialNotifications)
    updateUnreadCount(initialNotifications)
    setAiStatus(initialNotifications.some((n) => n.type === "alert" && !n.read) ? "attention" : "ok")
  }, []) // Empty dependency array means this runs once on mount

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    setAiStatus("ok")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "suggestion":
        return <Bell className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getAIStatusText = () => {
    if (notifications.some((n) => n.type === "alert" && !n.read)) {
      return "Urgent orders"
    } else if (notifications.some((n) => n.type === "suggestion" && !n.read)) {
      return "New suggestions"
    } else if (notifications.some((n) => !n.read)) {
      return "New notifications"
    }
    return "All good"
  }

  const handleAIChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiChatInput.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: aiChatInput }
    setAIChatMessages((prev) => [...prev, userMessage])
    setAIChatInput("")

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        {
          text: "I can help you track the status of your orders and identify any potential delays.",
          action: {
            label: "Track Orders",
            onClick: () => alert("Tracking orders..."),
          },
        },
        {
          text: "Would you like me to analyze your order history for optimization opportunities?",
          action: {
            label: "View Analysis",
            onClick: () => alert("Viewing order analysis..."),
          },
        },
        {
          text: "I can help you create a new order based on your current inventory levels.",
          action: {
            label: "Create Order",
            onClick: () => onCreateOrder(),
          },
        },
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const aiMessage = {
        role: "assistant" as const,
        content: randomResponse.text,
        action: randomResponse.action,
      }
      setAIChatMessages((prev) => [...prev, aiMessage])
    }, 1000)

    // Call the actual onChatWithAI function if needed
    onChatWithAI()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Notification list with dark theme */}
      {showNotificationList && (
        <div className="absolute bottom-full mb-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden text-gray-200">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h4 className="font-medium">AI Notifications</h4>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-gray-300 hover:bg-gray-800 hover:text-white">
              Mark all as read
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-gray-800/50 transition-colors",
                      !notification.read && "bg-primary/20",
                    )}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                            onClick={notification.action.onClick}
                          >
                            {notification.action.label}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}

      {/* AI Chat input with dark theme */}
      {showAIChat && (
        <div className="absolute bottom-full mb-2 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Chat with AI Assistant</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowAIChat(false)} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 max-h-[300px] overflow-y-auto">
            {aiChatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
                <div
                  className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"} p-2 rounded-lg`}
                >
                  {msg.role === "assistant" && <div className="h-5 w-5 mt-0.5 shrink-0 bg-primary rounded-full"></div>}
                  <div>
                    <p className="text-sm">{msg.content}</p>
                    {msg.role === "assistant" && msg.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={msg.action.onClick}
                      >
                        {msg.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200">
            <form onSubmit={handleAIChatSubmit} className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={aiChatInput}
                  onChange={(e) => setAIChatInput(e.target.value)}
                  placeholder="Ask a question about your orders..."
                  className="flex-1 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  className="h-10 w-10 shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    // TODO: Implement voice input
                    console.log("Voice input clicked")
                  }}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
                Send
              </Button>
            </form>

            {/* Suggestions with light theme */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Track my orders",
                  "Show pending approvals",
                  "Find delayed orders",
                  "Order status summary",
                  "Recent order history",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      setAIChatInput(suggestion)
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Toolbar */}
      <div
        ref={toolbarRef}
        className="bg-[#111623] backdrop-blur-sm border border-gray-800 rounded-full shadow-lg px-3 py-2 flex items-center gap-3 transition-all"
      >
        {/* AI Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex items-center gap-2 relative text-white hover:bg-white/10 hover:text-white active:bg-white/20"
            onClick={() => {
              setShowNotificationList(!showNotificationList)
              setShowAIChat(false)
            }}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                aiStatus === "ok" ? "bg-purple-500" : "bg-purple-500 animate-pulse",
              )}
            ></div>
            <span className="font-medium text-[14px]">{getAIStatusText()}</span>
            {unreadCount > 0 && (
              <span className="bg-white text-black text-xs rounded-full px-1.5 py-0.5 font-medium min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-white hover:bg-white/10 hover:text-white active:bg-white/20 flex items-center gap-2"
            onClick={() => {
              setShowAIChat(!showAIChat)
              setShowNotificationList(false)
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Ask AI</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-800 mx-1"></div>

        {/* Create Order button */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full flex items-center gap-2 text-white hover:bg-white/10 hover:text-white active:bg-white/20"
          onClick={onCreateOrder}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Create Order</span>
        </Button>
      </div>
    </div>
  )
} 