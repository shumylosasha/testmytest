"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Upload,
  MessageSquare,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  FileText,
  Bell,
  X,
  FileSpreadsheet,
  FileIcon as FilePdf,
  File,
  Loader2,
  ChevronLeft,
  Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface InventoryQuickActionsProps {
  onAddItem: () => void
  onUploadInventory: (file: File) => Promise<void>
  onChatWithAI: () => void
  selectedItemsCount: number
  onCreateOrder: () => void
  onNewItemsAdded?: (items: any[]) => void
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

type UploadStatus = "idle" | "ready" | "uploading" | "processing" | "analyzing" | "complete"

export function InventoryQuickActions({
  onAddItem,
  onUploadInventory,
  onChatWithAI,
  selectedItemsCount,
  onCreateOrder,
  onNewItemsAdded,
}: InventoryQuickActionsProps) {
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
      content: "Hello! I'm your procurement assistant. How can I help you today?",
      action: {
        label: "View Dashboard",
        onClick: () => (window.location.href = "/"),
      },
    },
  ])
  const [aiStatus, setAiStatus] = useState<"ok" | "attention">("ok")
  const [notifications, setNotifications] = useState<AINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [processingMessage, setProcessingMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const router = useRouter()

  // Generate and manage AI notifications
  useEffect(() => {
    // Initial notifications
    const initialNotifications: AINotification[] = [
      {
        id: "1",
        message: "I found 3 new products that match your inventory needs",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        type: "info",
        action: {
          label: "View Products",
          onClick: () => alert("Navigating to new products..."),
        },
      },
      {
        id: "2",
        message: "Prices for surgical gloves have dropped by 15% from your usual supplier",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        type: "alert",
        action: {
          label: "Create RFQ",
          onClick: () => alert("Creating RFQ for surgical gloves..."),
        },
      },
    ]

    setNotifications(initialNotifications)
    updateUnreadCount(initialNotifications)

    // Set initial status based on notifications
    setAiStatus(initialNotifications.some((n) => n.type === "alert" && !n.read) ? "attention" : "ok")

    // Add new notifications periodically
    const interval = setInterval(() => {
      // Only add notifications if not in upload process
      if (uploadStatus === "idle" || uploadStatus === "ready" || uploadStatus === "complete") {
        const newNotificationTypes = [
          {
            message: "I analyzed your inventory and found potential savings of $1,250",
            type: "suggestion",
            action: {
              label: "View Analysis",
              onClick: () => alert("Viewing savings analysis..."),
            },
          },
          {
            message: "2 items in your inventory are running low and need reordering",
            type: "alert",
            action: {
              label: "Reorder Now",
              onClick: () => onCreateOrder(),
            },
          },
          {
            message: "New vendor available for IV catheters with 10% lower pricing",
            type: "info",
            action: {
              label: "Compare Vendors",
              onClick: () => alert("Comparing vendor pricing..."),
            },
          },
          {
            message: "I've optimized your reorder points based on recent usage patterns",
            type: "suggestion",
            action: {
              label: "Apply Changes",
              onClick: () => alert("Applying optimized reorder points..."),
            },
          },
        ]

        const randomType = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)]

        setNotifications((prev) => {
          const newNotification: AINotification = {
            id: Date.now().toString(),
            message: randomType.message,
            timestamp: new Date(),
            read: false,
            type: randomType.type as "info" | "alert" | "suggestion",
            action: randomType.action,
          }

          const updatedNotifications = [newNotification, ...prev].slice(0, 8) // Keep only the 8 most recent
          updateUnreadCount(updatedNotifications)

          // Update status if there are alert notifications
          if (newNotification.type === "alert") {
            setAiStatus("attention")
          }

          return updatedNotifications
        })
      }
    }, 45000) // Add new notification every 45 seconds

    return () => clearInterval(interval)
  }, [uploadStatus, onCreateOrder])

  // Handle drag and drop events
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDragging) setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        handleFileSelected(file)
      }
    }

    const toolbar = toolbarRef.current
    if (toolbar) {
      toolbar.addEventListener("dragover", handleDragOver)
      toolbar.addEventListener("dragleave", handleDragLeave)
      toolbar.addEventListener("drop", handleDrop)

      return () => {
        toolbar.removeEventListener("dragover", handleDragOver)
        toolbar.removeEventListener("dragleave", handleDragLeave)
        toolbar.removeEventListener("drop", handleDrop)
      }
    }
  }, [isDragging])

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

  const handleFileSelected = (file: File) => {
    // Check if file is PDF or Excel
    const fileType = file.type
    if (
      fileType === "application/pdf" ||
      fileType === "application/vnd.ms-excel" ||
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setUploadFile(file)
      setUploadStatus("ready")
    } else {
      alert("Please upload a PDF or Excel file")
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!uploadFile) return

    try {
      // Start upload process
      setUploadStatus("uploading")
      setProcessingMessage("Uploading file...")

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Add AI notification about upload
      addAINotification(`Processing ${uploadFile.name}`, "info", {
        label: "View Progress",
        onClick: () => alert("Viewing upload progress..."),
      })

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Processing stage
      setUploadStatus("processing")
      setProcessingMessage("Processing with AI...")
      addAINotification("Analyzing inventory data with AI", "info", {
        label: "View Analysis",
        onClick: () => alert("Viewing AI analysis..."),
      })

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Analyzing stage
      setUploadStatus("analyzing")
      setProcessingMessage("Identifying items...")

      // Call the actual upload handler
      await onUploadInventory(uploadFile)

      // Complete the progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      setProcessingMessage("Upload complete!")
      setUploadStatus("complete")

      // Generate fake new items
      const newItems = [
        {
          id: `new-${Date.now()}-1`,
          name: "Bed Alarm (10x30 in)",
          sku: "BA-001",
          currentStock: 50,
          totalStock: 50,
          status: "stock",
          category: "Ambulatory Acc.",
          packaging: "Box",
          expiresIn: "24 months",
          swaps: [],
          potentialSavings: 0,
          unitPrice: 75,
          requiredUnits: 50,
          manufacturer: "McKesson",
          image: "https://imgcdn.mckesson.com/CumulusWeb/Images/Original_Image/1020958.jpg"
        },
        {
          id: `new-${Date.now()}-2`,
          name: "Respiratory Accessory",
          sku: "RA-001",
          currentStock: 30,
          totalStock: 30,
          status: "stock",
          category: "Nasal Respiratory",
          packaging: "Box",
          expiresIn: "24 months",
          swaps: [],
          potentialSavings: 0,
          unitPrice: 220,
          requiredUnits: 30,
          manufacturer: "McKesson",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnmi2uYcU6pT08t7cpkjs_6nwFOqwC_lKp3Q&s"
        }
      ]

      // Add success notification
      addAINotification(`Successfully processed ${newItems.length} items from ${uploadFile.name}`, "info", {
        label: "View Items",
        onClick: () => alert("Viewing processed items..."),
      })

      // Pass new items to parent
      if (onNewItemsAdded) {
        onNewItemsAdded(newItems)
      }

      // Reset after a delay
      setTimeout(() => {
        setUploadFile(null)
        setUploadStatus("idle")
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error)
      addAINotification("Error processing file. Please try again.", "alert", {
        label: "Retry",
        onClick: () => handleUploadClick(),
      })
      setUploadStatus("idle")
      setUploadFile(null)
      setUploadProgress(0)
    }
  }

  const addAINotification = (
    message: string,
    type: "info" | "alert" | "suggestion",
    action: { label: string; onClick: () => void },
  ) => {
    const newNotification: AINotification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      read: false,
      type,
      action,
    }

    setNotifications((prev) => {
      const updatedNotifications = [newNotification, ...prev].slice(0, 8)
      updateUnreadCount(updatedNotifications)
      return updatedNotifications
    })

    if (type === "alert") {
      setAiStatus("attention")
    }
  }

  const getFileIcon = () => {
    if (!uploadFile) return <Upload className="h-4 w-4" />

    const fileType = uploadFile.type
    if (fileType === "application/pdf") {
      return <FilePdf className="h-4 w-4 text-red-500" />
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    }

    return <File className="h-4 w-4" />
  }

  const renderUploadButton = () => {
    if (uploadStatus === "idle") {
      return (
        <Button
          variant="ghost"
          className="rounded-full flex items-center gap-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileInputChange}
          />
        </Button>
      )
    }

    if (uploadStatus === "ready") {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-gray-800 rounded-full px-3 py-1 flex items-center gap-2 max-w-[180px]">
            {getFileIcon()}
            <span className="text-sm truncate text-gray-200">{uploadFile?.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
              onClick={() => {
                setUploadFile(null)
                setUploadStatus("idle")
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button
            size="sm"
            className="rounded-full h-8 bg-primary text-white hover:bg-primary/90"
            onClick={handleUploadClick}
          >
            Process File
          </Button>
        </div>
      )
    }

    if (uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "analyzing") {
      return (
        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1 min-w-[200px]">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1 text-gray-200">
              <span>{processingMessage}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5 bg-gray-700 [&>*]:bg-primary" />
          </div>
        </div>
      )
    }

    if (uploadStatus === "complete") {
      return (
        <div className="flex items-center gap-2 bg-green-800 rounded-full px-3 py-1">
          <FileText className="h-4 w-4 text-green-200" />
          <span className="text-green-100 text-sm font-medium">Done</span>
        </div>
      )
    }

    return null
  }

  const getAIStatusText = () => {
    // Normal operation
    if (notifications.some((n) => n.type === "alert" && !n.read)) {
      return "Value opportunity"
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
          text: "I can help you find alternatives for this product that might save costs.",
          action: {
            label: "Search Alternatives",
            onClick: () => alert("Searching for alternatives..."),
          },
        },
        {
          text: "Based on your inventory data, I recommend ordering more of these items soon.",
          action: {
            label: "Create Order",
            onClick: () => onCreateOrder(),
          },
        },
        {
          text: "I've analyzed your procurement patterns and found potential savings of $1,250.",
          action: {
            label: "View Savings Report",
            onClick: () => alert("Viewing savings report..."),
          },
        },
        {
          text: "Several items have shown price fluctuations recently. Would you like me to monitor them?",
          action: {
            label: "Set Up Monitoring",
            onClick: () => alert("Setting up price monitoring..."),
          },
        },
        {
          text: "I can generate a report of similar products from different vendors if you'd like.",
          action: {
            label: "Generate Report",
            onClick: () => alert("Generating vendor comparison report..."),
          },
        },
        {
          text: "Would you like me to notify your suppliers about your upcoming needs?",
          action: {
            label: "Contact Suppliers",
            onClick: () => alert("Sending email to suppliers..."),
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
    // onChatWithAI()
  }

  const handleCreateOrder = () => {
    // Navigate to create order page with selected items
    if (selectedItemsCount > 0) {
      // Use direct navigation to ensure we go to the create page
      window.location.href = "/orders/create"
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Notification list with light theme */}
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

      {/* AI Chat input with light theme */}
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
                  placeholder="Ask a question..."
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
                  "Which items are running low?",
                  "Find cost-saving opportunities",
                  "Suggest alternative vendors",
                  "Analyze inventory trends",
                  "Optimize reorder points",
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
        className={cn(
          "bg-white backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-3 py-2 flex items-center gap-3 transition-all",
          isDragging && "ring-2 ring-primary border-primary bg-primary/5",
        )}
      >
        {/* AI Section now on the left */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex items-center gap-2 relative text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
            onClick={() => {
              setShowNotificationList(!showNotificationList)
              setShowAIChat(false)
              setShowAISuggestions(false)
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
            disabled={uploadStatus !== "idle" && uploadStatus !== "ready" && uploadStatus !== "complete"}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Ask AI</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Regular actions */}
        <Button
          variant="ghost"
          className="rounded-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </Button>

        {/* Upload button with light theme */}
        {(() => {
          if (uploadStatus === "idle") {
            return (
              <Button
                variant="ghost"
                className="rounded-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                <span>Upload inventory</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileInputChange}
                />
              </Button>
            )
          }

          if (uploadStatus === "ready") {
            return (
              <div className="flex items-center gap-2">
                <div className="bg-gray-50 rounded-full px-3 py-1.5 flex items-center gap-2 max-w-[180px] border border-gray-200">
                  {getFileIcon()}
                  <span className="text-sm truncate text-gray-700">{uploadFile?.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 text-gray-400"
                    onClick={() => {
                      setUploadFile(null)
                      setUploadStatus("idle")
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="rounded-full h-8 bg-primary text-white hover:bg-primary/90 active:bg-primary/80 font-medium"
                  onClick={handleUploadClick}
                >
                  Process File
                </Button>
              </div>
            )
          }

          if (uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "analyzing") {
            return (
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 min-w-[200px] border border-gray-200">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1 text-gray-700">
                    <span>{processingMessage}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-gray-200 [&>*]:bg-primary" />
                </div>
              </div>
            )
          }

          if (uploadStatus === "complete") {
            return (
              <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-1.5 border border-green-200">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">Done</span>
              </div>
            )
          }

          return null
        })() as React.ReactNode}

        {/* Create Order button (conditional) */}
        {selectedItemsCount > 0 && (
          <Button
            className="rounded-full flex items-center gap-2 ml-2 bg-primary text-white hover:bg-primary/90 active:bg-primary/80 font-medium"
            onClick={handleCreateOrder}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Create Order ({selectedItemsCount})</span>
          </Button>
        )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-700 font-medium">Drop file to upload</div>
        </div>
      )}
    </div>
  )
}

