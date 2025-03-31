import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, FileCheck, BarChart2, MessageSquare, Scale } from "lucide-react"

const agents = [
  {
    title: "Shopping Agent",
    description: "Intelligent agent that helps you find the best products and prices across multiple vendors, optimizing your procurement decisions.",
    icon: ShoppingCart,
  },
  {
    title: "Compliance Agent",
    description: "Ensures all procurement activities adhere to healthcare regulations and internal policies, maintaining compliance standards.",
    icon: FileCheck,
  },
  {
    title: "Market Insights Agent",
    description: "Provides real-time market analysis, price trends, and supplier intelligence to inform strategic procurement decisions.",
    icon: BarChart2,
  },
  {
    title: "Review Analysis Agent",
    description: "Analyzes product reviews and feedback to help you make informed decisions about product quality and reliability.",
    icon: MessageSquare,
  },
  {
    title: "Quotes Comparison Agent",
    description: "Automatically compares quotes from different vendors, highlighting the best options based on price, quality, and delivery terms.",
    icon: Scale,
  },
]

export default function AgentsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">AI Agents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <Card key={agent.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle>{agent.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{agent.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 