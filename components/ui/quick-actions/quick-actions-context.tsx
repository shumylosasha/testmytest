"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface QuickActionsContextType {
  showBackButton: boolean
  rightActions: ReactNode
  setRightActions: (actions: ReactNode) => void
  handleBack: () => void
}

const QuickActionsContext = createContext<QuickActionsContextType | undefined>(undefined)

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [rightActions, setRightActions] = useState<ReactNode>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Show back button on deeper pages
  const showBackButton = pathname !== "/" && 
    pathname !== "/orders" && 
    pathname !== "/inventory" &&
    pathname !== "/vendors" &&
    pathname !== "/analytics"

  const handleBack = () => {
    router.back()
  }

  return (
    <QuickActionsContext.Provider
      value={{
        showBackButton,
        rightActions,
        setRightActions,
        handleBack,
      }}
    >
      {children}
    </QuickActionsContext.Provider>
  )
}

export const useQuickActions = () => {
  const context = useContext(QuickActionsContext)
  if (context === undefined) {
    throw new Error("useQuickActions must be used within a QuickActionsProvider")
  }
  return context
} 