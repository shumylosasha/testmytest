"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  AlertTriangle,
  Bell,
  X,
  FileSpreadsheet,
  FileText,
  FileIcon,
  Download,
  Bot,
  Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AINotification = {
  id: string
  message: string
  timestamp: Date
  read: boolean
  type: "info" | "alert" | "suggestion" | "opportunity" | "risk"
  action: {
    label: string
    onClick: () => void
  }
}

interface ReportsQuickActionsProps {
  onExportPDF: () => void;
}

export function ReportsQuickActions({ onExportPDF }: ReportsQuickActionsProps) {
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
      content: "Hello! I'm your procurement assistant. How can I help you with your reports today?",
      action: {
        label: "View Dashboard",
        onClick: () => (window.location.href = "/"),
      },
    },
  ])
  const [aiStatus, setAIStatus] = useState<"idle" | "thinking" | "responding">("idle")
  const [notifications, setNotifications] = useState<AINotification[]>([
    {
      id: "1",
      message: "New cost-saving opportunity identified in surgical supplies",
      timestamp: new Date(),
      read: false,
      type: "opportunity",
      action: {
        label: "View Details",
        onClick: () => console.log("View opportunity details"),
      },
    },
    {
      id: "2",
      message: "High-risk contract expiring in 30 days",
      timestamp: new Date(),
      read: false,
      type: "risk",
      action: {
        label: "Review Contract",
        onClick: () => console.log("Review contract"),
      },
    },
  ])
  const [unreadCount, setUnreadCount] = useState(2)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const updateUnreadCount = (notifs: AINotification[]) => {
    setUnreadCount(notifs.filter((n) => !n.read).length)
  }

  // Initialize notifications
  useEffect(() => {
    const initialNotifications: AINotification[] = [
      {
        id: "1",
        message: "New cost-saving opportunities identified",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        type: "info",
        action: {
          label: "View Opportunities",
          onClick: () => alert("Viewing opportunities..."),
        },
      },
      {
        id: "2",
        message: "High-risk contract expiring soon",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        type: "alert",
        action: {
          label: "Review Now",
          onClick: () => alert("Reviewing contract..."),
        },
      },
    ]

    setNotifications(initialNotifications)
    updateUnreadCount(initialNotifications)
    setAIStatus(initialNotifications.some((n) => n.type === "alert" && !n.read) ? "thinking" : "idle")
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    setAIStatus("idle")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "suggestion":
        return <Bell className="h-4 w-4 text-green-500" />
      case "opportunity":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getAIStatusText = () => {
    if (notifications.some((n) => n.type === "alert" && !n.read)) {
      return "Action required"
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

    const userMessage = { role: "user" as const, content: aiChatInput }
    setAIChatMessages((prev) => [...prev, userMessage])
    setAIChatInput("")

    // Simulate AI response with more realistic data
    setTimeout(() => {
      let response = {
        role: "assistant" as const,
        content: "",
        action: undefined as { label: string; onClick: () => void } | undefined,
      }

      // Analyze the input and provide relevant responses
      if (aiChatInput.toLowerCase().includes("department performance")) {
        response = {
          role: "assistant",
          content: "I've analyzed the performance metrics across departments:\n\n" +
            "**Top Performing Departments:**\n" +
            "• Surgery: `15% above target`\n" +
            "• Pharmacy: `10% above target`\n" +
            "• Emergency: `5% above target`\n\n" +
            "**Areas Needing Attention:**\n" +
            "• Laboratory: `8% below target`\n" +
            "• Radiology: `5% below target`\n\n" +
            "Would you like to see detailed performance metrics for any specific department?",
          action: {
            label: "View Details",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "Here are the detailed performance metrics:\n\n" +
                  "**Surgery Department:**\n" +
                  "✦ Cost Efficiency: `92%`\n" +
                  "✦ Inventory Turnover: `4.2x`\n" +
                  "✦ Supplier Performance: `95%`\n" +
                  "✦ Contract Compliance: `98%`\n\n" +
                  "**Pharmacy Department:**\n" +
                  "✦ Cost Efficiency: `88%`\n" +
                  "✦ Inventory Turnover: `3.8x`\n" +
                  "✦ Supplier Performance: `92%`\n" +
                  "✦ Contract Compliance: `95%`\n\n" +
                  "Would you like to generate a performance report for the leadership team?",
                action: {
                  label: "Generate Report",
                  onClick: () => alert("Generating performance report...")
                }
              }])
            }
          }
        }
      } else if (aiChatInput.toLowerCase().includes("cost-saving")) {
        response = {
          role: "assistant",
          content: "I've analyzed your procurement data and found several cost-saving opportunities:\n\n" +
            "**Cost Reduction Opportunities:**\n" +
            "• Surgical Supplies: `15% savings through bulk ordering`\n" +
            "• Medical Equipment: `10% reduction via vendor consolidation`\n" +
            "• Pharmaceuticals: `8% savings with generic alternatives`\n\n" +
            "Would you like to see a detailed breakdown of these opportunities?",
          action: {
            label: "View Opportunities",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "**Detailed Cost-Saving Analysis:**\n\n" +
                  "**1. Surgical Supplies** _(High Impact)_\n" +
                  "• Current Cost: `$450,000`\n" +
                  "• Potential Savings: `$67,500`\n" +
                  "• Implementation Time: `2 weeks`\n" +
                  "• Risk Level: `Low`\n\n" +
                  "**2. Medical Equipment** _(Medium Impact)_\n" +
                  "• Current Cost: `$1.2M`\n" +
                  "• Potential Savings: `$120,000`\n" +
                  "• Implementation Time: `1 month`\n" +
                  "• Risk Level: `Medium`\n\n" +
                  "**3. Pharmaceuticals** _(Low Impact)_\n" +
                  "• Current Cost: `$800,000`\n" +
                  "• Potential Savings: `$64,000`\n" +
                  "• Implementation Time: `3 weeks`\n" +
                  "• Risk Level: `Low`\n\n" +
                  "Would you like to create an action plan for any of these opportunities?",
                action: {
                  label: "Create Action Plan",
                  onClick: () => alert("Action plan creation initiated...")
                }
              }])
            }
          }
        }
      } else if (aiChatInput.toLowerCase().includes("potential risks")) {
        response = {
          role: "assistant",
          content: "I've identified several potential risks in your procurement operations:\n\n" +
            "**High Priority Risks:**\n" +
            "• Contract Expiration: `3 major supplier contracts expiring in 30 days`\n" +
            "• Supply Chain Disruption: `Potential delays in medical supplies`\n\n" +
            "**Medium Priority Risks:**\n" +
            "• Price Increases: `Expected 10% increase from key suppliers`\n" +
            "• Quality Issues: `Recent batch of surgical supplies below standards`\n\n" +
            "Would you like to see a detailed risk assessment and mitigation plan?",
          action: {
            label: "View Risk Assessment",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "**Risk Assessment and Mitigation Plan:**\n\n" +
                  "**1. Contract Expiration** _(High Risk)_\n" +
                  "• Impact: `$2.5M annual spend`\n" +
                  "• Mitigation: `Begin renewal negotiations immediately`\n" +
                  "• Timeline: `2 weeks`\n\n" +
                  "**2. Supply Chain Disruption** _(High Risk)_\n" +
                  "• Impact: `15% of inventory affected`\n" +
                  "• Mitigation: `Diversify suppliers and increase safety stock`\n" +
                  "• Timeline: `1 month`\n\n" +
                  "Would you like me to create a risk mitigation task list?",
                action: {
                  label: "Create Task List",
                  onClick: () => alert("Creating risk mitigation task list...")
                }
              }])
            }
          }
        }
      } else if (aiChatInput.toLowerCase().includes("monthly report")) {
        response = {
          role: "assistant",
          content: "I can help you generate a comprehensive monthly report. Here's what I'll include:\n\n" +
            "**Report Sections:**\n" +
            "1️⃣ Executive Summary\n" +
            "2️⃣ Cost Analysis\n" +
            "3️⃣ Department Performance\n" +
            "4️⃣ Risk Assessment\n" +
            "5️⃣ Recommendations\n\n" +
            "Would you like me to generate this report now?",
          action: {
            label: "Generate Report",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "**Monthly Report Summary:**\n\n" +
                  "**Executive Overview:**\n" +
                  "• Total Spend: `$4.2M`\n" +
                  "• Cost Savings: `$320K`\n" +
                  "• Active Contracts: `45`\n" +
                  "• Risk Score: `7/10`\n\n" +
                  "**Key Achievements:**\n" +
                  "• `15%` reduction in surgical supplies costs\n" +
                  "• `3` new vendor partnerships established\n" +
                  "• `95%` contract compliance rate\n\n" +
                  "Would you like to export this report in PDF format?",
                action: {
                  label: "Export PDF",
                  onClick: () => alert("Exporting report to PDF...")
                }
              }])
            }
          }
        }
      } else if (aiChatInput.toLowerCase().includes("vendor prices")) {
        response = {
          role: "assistant",
          content: "I've analyzed vendor pricing across key categories:\n\n" +
            "**Surgical Supplies:**\n" +
            "• Vendor A: `$450/unit`\n" +
            "• Vendor B: `$480/unit`\n" +
            "• Vendor C: `$520/unit`\n\n" +
            "**Medical Equipment:**\n" +
            "• Vendor X: `$12,000/unit`\n" +
            "• Vendor Y: `$13,500/unit`\n" +
            "• Vendor Z: `$14,200/unit`\n\n" +
            "Would you like to see a detailed price comparison analysis?",
          action: {
            label: "View Analysis",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "**Detailed Price Comparison Analysis:**\n\n" +
                  "**Surgical Supplies:**\n" +
                  "• Vendor A offers best value (`15% below market`)\n" +
                  "• Bulk discount available: `10% off orders >1000 units`\n" +
                  "• Quality rating: `4.8/5`\n\n" +
                  "**Medical Equipment:**\n" +
                  "• Vendor X offers best value (`12% below market`)\n" +
                  "• Service contract included\n" +
                  "• Warranty: `3 years`\n\n" +
                  "Would you like to initiate price negotiations with any vendor?",
                action: {
                  label: "Start Negotiations",
                  onClick: () => alert("Initiating price negotiations...")
                }
              }])
            }
          }
        }
      } else {
        response = {
          role: "assistant",
          content: "I can help you with various aspects of your procurement reports. Here are some things I can do:\n\n" +
            "**Available Analysis Options:**\n" +
            "1️⃣ Analyze cost-saving opportunities\n" +
            "2️⃣ Review department performance\n" +
            "3️⃣ Identify potential risks\n" +
            "4️⃣ Generate monthly reports\n" +
            "5️⃣ Compare vendor prices\n\n" +
            "What would you like to know more about?",
          action: {
            label: "View Examples",
            onClick: () => {
              setAIChatMessages(prev => [...prev, {
                role: "assistant",
                content: "**Example Queries:**\n\n" +
                  "• `Show me cost-saving opportunities in surgical supplies`\n" +
                  "• `Compare performance between departments`\n" +
                  "• `List high-priority risks`\n" +
                  "• `Generate a monthly procurement report`\n" +
                  "• `Compare vendor prices for medical equipment`\n\n" +
                  "Just type any of these questions or ask something specific!",
                action: {
                  label: "Try Example",
                  onClick: () => {
                    setAIChatInput("Show me cost-saving opportunities in surgical supplies")
                  }
                }
              }])
            }
          }
        }
      }

      setAIChatMessages((prev) => [...prev, response])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Quick Actions Toolbar */}
      <div
        ref={toolbarRef}
        className="bg-white backdrop-blur-sm border rounded-full shadow-lg px-3 py-2 flex items-center gap-3 transition-all"
      >
        {/* AI Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex items-center gap-2 relative hover:bg-gray-100"
            onClick={() => {
              setShowNotificationList(!showNotificationList)
              setShowAIChat(false)
            }}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                aiStatus === "idle" ? "bg-green-500" : "bg-purple-500 animate-pulse",
              )}
            ></div>
            <span className="font-medium text-[14px]">{getAIStatusText()}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 font-medium min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-gray-100 flex items-center gap-2"
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

        {/* Export Action */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
          >
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={onExportPDF}>
              <FileText className="h-4 w-4" />
              <span>Export to PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export to Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <FileIcon className="h-4 w-4" />
              <span>Export to PowerPoint</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notification List */}
      {showNotificationList && (
        <div className="absolute bottom-full mb-2 w-80 bg-white border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium">AI Notifications</h4>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
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
                        <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
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
              <div className="p-4 text-center text-muted-foreground">No notifications</div>
            )}
          </div>
        </div>
      )}

      {/* AI Chat */}
      {showAIChat && (
        <div className="absolute bottom-full mb-2 w-full max-w-2xl bg-white border rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium">Chat with AI Assistant</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowAIChat(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 max-h-[300px] overflow-y-auto">
            {aiChatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-gray-100"} p-2 rounded-lg`}>
                  {msg.role === "assistant" && <Bot className="h-5 w-5 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm">{msg.content}</p>
                    {msg.role === "assistant" && msg.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
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
                  placeholder="Ask about reports..."
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

            {/* Suggestions */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Show cost-saving opportunities",
                  "Analyze department performance",
                  "Identify potential risks",
                  "Generate monthly report",
                  "Compare vendor prices",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1"
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
    </div>
  )
} 