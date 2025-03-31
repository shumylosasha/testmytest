'use client'

import { useEffect, useState } from "react"

export function OrderItem({ index }: { index: number }) {
  const [orderData, setOrderData] = useState({
    date: "",
    amount: "",
    items: ""
  })
  
  useEffect(() => {
    setOrderData({
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: (Math.random() * 10000).toFixed(2),
      items: Math.floor(Math.random() * 50).toString()
    })
  }, [index])
  
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div>
        <div className="font-medium">Order #{1000 + index}</div>
        <div className="text-sm text-muted-foreground">{orderData.date}</div>
      </div>
      <div className="text-right">
        <div className="font-medium">${orderData.amount}</div>
        <div className="text-sm text-muted-foreground">{orderData.items} items</div>
      </div>
    </div>
  )
} 