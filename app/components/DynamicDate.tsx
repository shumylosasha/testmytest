'use client'

import { useEffect, useState } from "react"

export function DynamicDate() {
  const [date, setDate] = useState("")
  
  useEffect(() => {
    setDate(new Date().toLocaleDateString())
  }, [])
  
  return <div className="text-sm text-muted-foreground">Last updated: {date}</div>
} 