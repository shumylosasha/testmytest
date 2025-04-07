import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { SidebarProvider } from "../components/sidebar-provider"
import Sidebar from "../components/sidebar"
import { Toaster } from "sonner"
import { QuickActionsProvider } from "../components/ui/quick-actions"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Healthcare Procurement System",
  description: "Procurement management system for healthcare",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <QuickActionsProvider>
            <SidebarProvider>
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </SidebarProvider>
          </QuickActionsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'