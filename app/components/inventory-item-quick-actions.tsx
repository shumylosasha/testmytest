"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  FileText,
  Bell,
  Phone,
  Mail,
  FileSpreadsheet,
  FileIcon as FilePdf,
  File,
  Loader2,
  X,
  MoreVertical,
  RefreshCw,
  Edit,
  Trash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InventoryItemQuickActionsProps {
  onChatWithAI: () => void
  onEmailVendor: () => void
  onReorder: () => void
  onEdit: () => void
  onDelete: () => void
  itemName: string
  itemStatus: string
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

export function InventoryItemQuickActions({
  onChatWithAI,
  onEmailVendor,
  onReorder,
  onEdit,
  onDelete,
  itemName,
  itemStatus,
}: InventoryItemQuickActionsProps) {
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
      content: `Hello! I'm your procurement assistant. I can help you with ${itemName}. How can I assist you today?`,
      action: {
        label: "View Details",
        onClick: () => (window.location.href = "/"),
      },
    },
  ])
  const [aiStatus, setAiStatus] = useState<"ok" | "attention">("ok")
  const [notifications, setNotifications] = useState<AINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Generate and manage AI notifications
  useEffect(() => {
    // Initial notifications
    const initialNotifications: AINotification[] = [
      {
        id: "1",
        message: `I found 3 alternative vendors for ${itemName} with potential savings`,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: "info",
        action: {
          label: "View Alternatives",
          onClick: () => alert("Navigating to alternatives..."),
        },
      },
      {
        id: "2",
        message: `Market prices for ${itemName} have dropped by 15% from your current supplier`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        type: "alert",
        action: {
          label: "Create RFQ",
          onClick: () => onReorder(),
        },
      },
    ]

    setNotifications(initialNotifications)
    updateUnreadCount(initialNotifications)

    // Set initial status based on notifications
    setAiStatus(initialNotifications.some((n) => n.type === "alert" && !n.read) ? "attention" : "ok")
  }, [itemName, onReorder])

  const updateUnreadCount = (notifs: AINotification[]) => {
    setUnreadCount(notifs.filter((n) => !n.read).length)
  }

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
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
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
          text: `I can help you find alternatives for ${itemName} that might save costs.`,
          action: {
            label: "Search Alternatives",
            onClick: () => alert("Searching for alternatives..."),
          },
        },
        {
          text: `Based on your inventory data for ${itemName}, I recommend ordering more soon.`,
          action: {
            label: "Reorder Now",
            onClick: () => onReorder(),
          },
        },
        {
          text: `I've analyzed market trends for ${itemName} and found potential savings.`,
          action: {
            label: "View Market Analysis",
            onClick: () => alert("Viewing market analysis..."),
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
  }

  const getAIStatusText = () => {
    if (notifications.some((n) => n.type === "alert" && !n.read)) {
      return "Value opportunity"
    } else if (notifications.some((n) => n.type === "suggestion" && !n.read)) {
      return "New suggestions"
    } else if (notifications.some((n) => !n.read)) {
      return "New notifications"
    }
    return "All good"
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Notification list */}
      {showNotificationList && (
        <div className="absolute bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">AI Notifications</h4>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Mark all as read
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-gray-50 transition-colors",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className={cn("text-sm text-gray-900", !notification.read && "font-medium")}>{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

      {/* AI Chat input */}
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
              <Input
                value={aiChatInput}
                onChange={(e) => setAIChatInput(e.target.value)}
                placeholder="Ask about this item..."
                className="flex-1 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary"
              />
              <Button type="submit" size="sm" className="bg-primary text-white hover:bg-primary/90">
                Send
              </Button>
            </form>

            {/* Suggestions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Find alternative vendors",
                  "Analyze market trends",
                  "Check price history",
                  "View similar items",
                  "Get reorder recommendations",
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
      <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-3 py-2 flex items-center gap-3">
        {/* AI Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex items-center gap-2 relative text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
            onClick={() => {
              setShowNotificationList(!showNotificationList)
              setShowAIChat(false)
            }}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                aiStatus === "ok" ? "bg-green-500" : "bg-purple-500 animate-pulse",
              )}
            ></div>
            <span className="font-medium text-[14px]">{getAIStatusText()}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-medium min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 flex items-center gap-2"
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
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Item-specific actions */}
        <Button
          className="rounded-full flex items-center gap-2 bg-black text-white hover:bg-black/90"
          onClick={onReorder}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reorder</span>
        </Button>

        <Button
          variant="ghost"
          className="rounded-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
          onClick={onEmailVendor}
        >
          <Mail className="h-4 w-4" />
          <span>Email Vendor</span>
        </Button>

        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit Item</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600 focus:text-red-600">
              <Trash className="h-4 w-4" />
              <span>Delete Item</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 