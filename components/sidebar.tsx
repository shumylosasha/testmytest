"use client"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, ShoppingCart, Users, FileCheck, FileBarChart } from "lucide-react"

const menuItems = [
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Compliance", href: "/compliance", icon: FileCheck },
]

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "h-screen bg-white border-r transition-all duration-300 relative",
        isOpen ? "w-[104px]" : "w-[104px]"
      )}
    >
      <div className="p-4 flex justify-center items-center">
        <h2 className="font-bold text-xl">AMS</h2>
      </div>

      <nav className="mt-6">
        <ul className="space-y-6 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className={cn("p-2 rounded-md mb-1", isActive ? "bg-primary/10" : "")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

