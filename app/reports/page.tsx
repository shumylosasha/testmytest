"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  MoreHorizontal,
  FileSpreadsheet,
  FileText,
  FileIcon,
  TrendingDown as TrendingDownIcon,
  AlertTriangle,
  Download,
  Package,
  Bot,
  Globe,
  TrendingUp,
  Users,
  User,
} from "lucide-react"
import { ReportsQuickActions } from "./components/reports-quick-actions"
import { Checkbox } from "@/components/ui/checkbox"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { departmentData, productData, surgeonData, calculateDifference, getComparisonColor } from "../data/comparison-data"

// Mock data for opportunity reports
const opportunityReports = [
  {
    id: "opp-001",
    title: "Bulk Order Discount",
    description: "Potential 15% savings on surgical gloves through bulk ordering",
    category: "Cost Savings",
    status: "Active",
    potentialSavings: 15000,
    department: "Surgery",
    priority: "High",
  },
  {
    id: "opp-002",
    title: "Vendor Consolidation",
    description: "Consolidate orders with preferred vendor for better pricing",
    category: "Vendor Management",
    status: "Active",
    potentialSavings: 25000,
    department: "General Supplies",
    priority: "Medium",
  },
  {
    id: "opp-003",
    title: "Alternative Product",
    description: "Switch to generic brand for similar quality at lower cost",
    category: "Product Optimization",
    status: "Active",
    potentialSavings: 8000,
    department: "Pharmacy",
    priority: "Low",
  },
]

// Type definition for department savings
type DepartmentSavings = {
  department: string
  totalSavings: number
  opportunities: number
  status: string
  yearOverYear: string
  topSavings: Array<{ category: string; amount: number }>
}

// Mock data for savings leaderboard
const savingsLeaderboard: DepartmentSavings[] = [
  {
    department: "Surgery",
    totalSavings: 45000,
    opportunities: 5,
    status: "Leading",
    yearOverYear: "+15%",
    topSavings: [
      { category: "Bulk Orders", amount: 20000 },
      { category: "Vendor Negotiations", amount: 15000 },
      { category: "Alternative Products", amount: 10000 },
    ],
  },
  {
    department: "Pharmacy",
    totalSavings: 32000,
    opportunities: 4,
    status: "On Track",
    yearOverYear: "+10%",
    topSavings: [
      { category: "Generic Alternatives", amount: 15000 },
      { category: "Bulk Orders", amount: 10000 },
      { category: "Inventory Optimization", amount: 7000 },
    ],
  },
  {
    department: "Emergency",
    totalSavings: 28000,
    opportunities: 3,
    status: "On Track",
    yearOverYear: "+8%",
    topSavings: [
      { category: "Supplier Consolidation", amount: 12000 },
      { category: "Process Optimization", amount: 9000 },
      { category: "Bulk Orders", amount: 7000 },
    ],
  },
  {
    department: "Laboratory",
    totalSavings: 15000,
    opportunities: 2,
    status: "Needs Attention",
    yearOverYear: "+5%",
    topSavings: [
      { category: "Equipment Maintenance", amount: 8000 },
      { category: "Reagent Optimization", amount: 4000 },
      { category: "Process Improvement", amount: 3000 },
    ],
  },
]

// Mock data for risk warnings
const riskWarnings = [
  {
    id: "risk-001",
    title: "Contract Expiration",
    description: "Vendor contract expiring in 30 days",
    category: "Contract",
    severity: "High",
    department: "Surgery",
    dueDate: "2024-02-15",
    impact: "$25,000",
    mitigation: "Begin renewal negotiations immediately",
  },
  {
    id: "risk-002",
    title: "Price Increase",
    description: "Expected 10% price increase from supplier",
    category: "Cost",
    severity: "Medium",
    department: "Pharmacy",
    dueDate: "2024-03-01",
    impact: "$15,000",
    mitigation: "Review alternative suppliers and bulk order options",
  },
  {
    id: "risk-003",
    title: "Supply Chain Delay",
    description: "Potential delays in medical supplies",
    category: "Supply Chain",
    severity: "High",
    department: "Emergency",
    dueDate: "2024-02-20",
    impact: "$35,000",
    mitigation: "Increase safety stock and identify backup suppliers",
  },
]

// Mock data for spending trends
const spendingTrends = [
  { month: "Jan", spending: 45000, savings: 5000, alternatives: 2000 },
  { month: "Feb", spending: 42000, savings: 8000, alternatives: 3000 },
  { month: "Mar", spending: 48000, savings: 7000, alternatives: 4000 },
  { month: "Apr", spending: 44000, savings: 9000, alternatives: 3500 },
  { month: "May", spending: 46000, savings: 6000, alternatives: 4500 },
  { month: "Jun", spending: 41000, savings: 9000, alternatives: 5000 },
]

// Mock data for savings breakdown
const savingsBreakdown = [
  { name: "Bulk Discounts", value: 35000, color: "#8884d8" },
  { name: "Alternative Products", value: 25000, color: "#82ca9d" },
  { name: "Vendor Negotiations", value: 20000, color: "#ffc658" },
  { name: "Process Optimization", value: 15000, color: "#ff8042" },
]

// Mock data for department savings
const departmentSavings = [
  { department: "Surgery", current: 45000, potential: 55000, target: 60000 },
  { department: "Pharmacy", current: 32000, potential: 40000, target: 45000 },
  { department: "Emergency", current: 28000, potential: 35000, target: 40000 },
  { department: "Laboratory", current: 15000, potential: 25000, target: 30000 },
]

// Mock data for recommendations
const recommendations = [
  {
    id: "rec-001",
    title: "Bulk Order Surgical Supplies",
    description: "Save 15% by ordering surgical supplies in bulk",
    impact: 15000,
    effort: "Medium",
    status: "New",
  },
  {
    id: "rec-002",
    title: "Consolidate Vendors",
    description: "Reduce costs by 10% through vendor consolidation",
    impact: 25000,
    effort: "High",
    status: "New",
  },
  {
    id: "rec-003",
    title: "Generic Alternatives",
    description: "Switch to generic brands where possible",
    impact: 8000,
    effort: "Low",
    status: "In Progress",
  },
]

// Mock Data specifically for Tariffs (replace with real data)
const tariffOverview = {
  affectedItems: 125, // Number of items in inventory potentially affected
  estimatedImpact: 75000, // Estimated total cost increase due to tariffs
  watchlistCountries: 3, // Countries with potential upcoming tariffs
  activeAlerts: 1, // Countries with active, impactful tariffs
};

const tariffDetails = [
  { 
    country: "China", 
    status: "Active Alert", 
    tariffRate: "15%", 
    affectedCategories: ["Electronics", "Textiles"], 
    estimatedImpact: 45000, 
    notes: "New tariffs effective since last quarter.",
    geoCode: [35.8617, 104.1954] // Approx lat/lng for map marker
  },
  { 
    country: "Vietnam", 
    status: "Watchlist", 
    tariffRate: "Potential 10%", 
    affectedCategories: ["Apparel", "Footwear"], 
    estimatedImpact: 20000, 
    notes: "Trade negotiations ongoing, potential changes Q3.",
    geoCode: [14.0583, 108.2772] 
  },
   { 
    country: "Brazil", 
    status: "Watchlist", 
    tariffRate: "Potential 5-8%", 
    affectedCategories: ["Raw Materials"], 
    estimatedImpact: 10000, 
    notes: "Regulatory review expected by year-end.",
    geoCode: [-14.2350, -51.9253] 
  },
  // Add more countries/regions as needed
];

// Helper for map colors (Example)
const getStatusColorForMap = (status: string) => {
   switch (status) {
      case "Active Alert": return "#ef4444"; // Red
      case "Watchlist": return "#f97316"; // Orange
      default: return "#888888"; // Grey
   }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
    case "leading":
      return "bg-green-100 text-green-800"
    case "on track":
      return "bg-blue-100 text-blue-800"
    case "needs attention":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "High":
      return "bg-red-100 text-red-800"
    case "Medium":
      return "bg-amber-100 text-amber-800"
    case "Low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getEffortColor = (effort: string) => {
  switch (effort.toLowerCase()) {
    case "low":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-blue-100 text-blue-800"
    case "high":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Calculate total values for overview cards
const totalSavings = savingsLeaderboard.reduce((acc, curr) => acc + curr.totalSavings, 0)
const totalOpportunities = opportunityReports.length
const highPriorityRisks = riskWarnings.filter((r) => r.severity === "High").length
const potentialSavings = opportunityReports.reduce((acc, curr) => acc + curr.potentialSavings, 0)

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("savings")
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  
  // New state for comparison functionality
  const [comparisonType, setComparisonType] = useState<"department" | "product" | "surgeon" | null>(null)
  const [firstEntity, setFirstEntity] = useState<string>("")
  const [secondEntity, setSecondEntity] = useState<string>("")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const toggleRecommendation = (id: string) => {
    setSelectedRecommendations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportPDF = () => {
    setShowPdfPreview(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">
              Active purchase orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,458</div>
            <p className="text-xs text-muted-foreground">
              Tracked items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total savings this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityRisks}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div>
        {/* Tabs Navigation */}
        <div className="border-b mb-6">
          <nav className="flex space-x-8" aria-label="Reports sections">
            <button
              onClick={() => setActiveTab("savings")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "savings"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "opportunities"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "risks"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Risks
            </button>
            <button
              onClick={() => setActiveTab("tariffs")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tariffs"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tariffs
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "compare"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Compare
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "savings" && (
            <>
              {/* Top Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Reduction Overview Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Reduction Overview</CardTitle>
                    <CardDescription>Monthly spending, savings, and alternatives impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spendingTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="spending" stroke="#8884d8" name="Total Spending" />
                          <Line type="monotone" dataKey="savings" stroke="#82ca9d" name="Cost Savings" />
                          <Line type="monotone" dataKey="alternatives" stroke="#ffc658" name="Alternative Products" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Savings Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Savings Distribution</CardTitle>
                    <CardDescription>Breakdown of cost reduction strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={savingsBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {savingsBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Current savings vs potential and targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentSavings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" fill="#8884d8" name="Current Savings" />
                        <Bar dataKey="potential" fill="#82ca9d" name="Potential Savings" />
                        <Bar dataKey="target" fill="#ffc658" name="Target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department List in 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savingsLeaderboard.map((dept: DepartmentSavings) => (
                  <Card key={dept.department}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{dept.department}</CardTitle>
                          <CardDescription>Year over Year: {dept.yearOverYear}</CardDescription>
                        </div>
                        <Badge variant="outline" className={getStatusColor(dept.status)}>
                          {dept.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Total Savings</span>
                            <div className="text-2xl font-bold">${dept.totalSavings.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Opportunities</span>
                            <div className="text-2xl font-bold">{dept.opportunities}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Top Savings Categories</h4>
                          <div className="space-y-2">
                            {dept.topSavings.map((saving, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{saving.category}</span>
                                <span>${saving.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === "opportunities" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opportunity Impact Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opportunity Impact</CardTitle>
                    <CardDescription>Potential savings by department and category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={opportunityReports}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="potentialSavings" fill="#82ca9d" name="Potential Savings" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunity Status Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opportunity Status</CardTitle>
                    <CardDescription>Distribution by priority and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "High Priority", value: opportunityReports.filter(o => o.priority === "High").length, color: "#ef4444" },
                              { name: "Medium Priority", value: opportunityReports.filter(o => o.priority === "Medium").length, color: "#f97316" },
                              { name: "Low Priority", value: opportunityReports.filter(o => o.priority === "Low").length, color: "#22c55e" },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {opportunityReports.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={["#ef4444", "#f97316", "#22c55e"][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost-Saving Recommendations</CardTitle>
                  <CardDescription>Select recommendations to implement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={rec.id}
                          checked={selectedRecommendations.includes(rec.id)}
                          onCheckedChange={() => toggleRecommendation(rec.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={rec.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {rec.title}
                            </label>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getEffortColor(rec.effort)}>
                                {rec.effort} Effort
                              </Badge>
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                ${rec.impact.toLocaleString()} Potential Savings
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "risks" && (
            <div className="space-y-4">
              {riskWarnings.map((risk) => (
                <Card key={risk.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{risk.title}</CardTitle>
                        <CardDescription>{risk.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Department:</span> {risk.department}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span> {risk.dueDate}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Potential Impact:</span> {risk.impact}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mitigation:</span> {risk.mitigation}
                        </div>
                      </div>
                      
                      {/* AI Message and Action */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Bot className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-blue-900">
                              {risk.severity === "High" 
                                ? "Immediate action required. I recommend scheduling a vendor meeting to discuss contract terms and potential alternatives."
                                : "Consider reviewing current agreements and exploring alternative suppliers to mitigate potential risks."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 ml-8">
                          <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                            {risk.severity === "High" ? "Contact Vendor" : "Review Agreements"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "tariffs" && (
            <>
              {/* Global Tariff Tracker */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600"/>
                    Global Tariff Tracker
                  </CardTitle>
                  <CardDescription>Overview of international tariffs impacting your procurement.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Adjusted grid: Summary on left, Table on right */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> 
                    {/* Left Column: Summary Metrics */}
                    <div className="lg:col-span-1 space-y-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-blue-700 font-medium mb-1">Affected Items</p>
                          <p className="text-3xl font-bold text-blue-900">{tariffOverview.affectedItems}</p>
                          <p className="text-xs text-blue-600">Inventory items with potential tariff exposure.</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-red-700 font-medium mb-1">Est. Annual Cost Impact</p>
                          <p className="text-3xl font-bold text-red-900">${tariffOverview.estimatedImpact.toLocaleString()}</p>
                          <p className="text-xs text-red-600">Projected increase based on current/potential tariffs.</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-yellow-700 font-medium mb-1">Countries on Watchlist</p>
                          <p className="text-3xl font-bold text-yellow-900">{tariffOverview.watchlistCountries}</p>
                          <p className="text-xs text-yellow-600">Regions with potential upcoming tariff changes.</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Detailed Table */}
                    <div className="lg:col-span-2 space-y-4"> 
                      {/* Detailed Tariff Table */}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Country/Region</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Rate</TableHead>
                              <TableHead>Est. Impact</TableHead>
                              <TableHead>Affected Categories</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tariffDetails.map((detail) => (
                              <TableRow key={detail.country}>
                                <TableCell className="font-medium">{detail.country}</TableCell>
                                <TableCell>
                                  <Badge variant={detail.status === "Active Alert" ? "destructive" : "secondary"} className={detail.status === "Watchlist" ? "bg-yellow-100 text-yellow-800" : ""}>
                                    {detail.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{detail.tariffRate}</TableCell>
                                <TableCell className="text-right">${detail.estimatedImpact.toLocaleString()}</TableCell>
                                <TableCell className="text-xs">{detail.affectedCategories.join(", ")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>Priority tasks based on current tariff impacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Action Item 1 */}
                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Review Chinese Electronics Supply Chain</h4>
                        <p className="text-sm text-muted-foreground mt-1">Identify alternative suppliers for affected electronic components to mitigate 15% tariff impact.</p>
                        <Button variant="outline" size="sm" className="mt-2">Start Review</Button>
                      </div>
                    </div>

                    {/* Action Item 2 */}
                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Update Cost Forecasts</h4>
                        <p className="text-sm text-muted-foreground mt-1">Revise Q3/Q4 procurement budgets to account for potential Vietnam tariff changes.</p>
                        <Button variant="outline" size="sm" className="mt-2">Update Forecasts</Button>
                      </div>
                    </div>

                    {/* Action Item 3 */}
                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Inventory Assessment</h4>
                        <p className="text-sm text-muted-foreground mt-1">Conduct inventory analysis of affected categories to optimize stock levels before tariff implementation.</p>
                        <Button variant="outline" size="sm" className="mt-2">Begin Assessment</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "compare" && (
            <>
              {/* Comparison Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Analysis</CardTitle>
                  <CardDescription>Select comparison type and entities to analyze</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Comparison Type */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Comparison Type</h3>
                      <div className="space-y-2">
                        <Button 
                          variant={comparisonType === "department" ? "default" : "outline"} 
                          className="w-full justify-start"
                          onClick={() => {
                            setComparisonType("department")
                            setFirstEntity("")
                            setSecondEntity("")
                            setSelectedMetrics([])
                            setShowComparison(false)
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Department-to-Department
                        </Button>
                        <Button 
                          variant={comparisonType === "product" ? "default" : "outline"} 
                          className="w-full justify-start"
                          onClick={() => {
                            setComparisonType("product")
                            setFirstEntity("")
                            setSecondEntity("")
                            setSelectedMetrics([])
                            setShowComparison(false)
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Product-to-Product
                        </Button>
                        <Button 
                          variant={comparisonType === "surgeon" ? "default" : "outline"} 
                          className="w-full justify-start"
                          onClick={() => {
                            setComparisonType("surgeon")
                            setFirstEntity("")
                            setSecondEntity("")
                            setSelectedMetrics([])
                            setShowComparison(false)
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Surgeon-to-Surgeon
                        </Button>
                      </div>
                    </div>

                    {/* Entity Selection */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Select Entities</h3>
                      <div className="space-y-2">
                        <Select
                          value={firstEntity}
                          onValueChange={setFirstEntity}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select first entity" />
                          </SelectTrigger>
                          <SelectContent>
                            {comparisonType === "department" && Object.entries(departmentData).map(([key, dept]) => (
                              <SelectItem key={key} value={key}>
                                {dept.name}
                              </SelectItem>
                            ))}
                            {comparisonType === "product" && [...productData.surgicalSupplies, ...productData.medications].map((product) => (
                              <SelectItem key={product.brand} value={product.brand}>
                                {product.name} ({product.brand})
                              </SelectItem>
                            ))}
                            {comparisonType === "surgeon" && surgeonData.surgery.map((surgeon) => (
                              <SelectItem key={surgeon.name} value={surgeon.name}>
                                {surgeon.name} - {surgeon.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={secondEntity}
                          onValueChange={setSecondEntity}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select second entity" />
                          </SelectTrigger>
                          <SelectContent>
                            {comparisonType === "department" && Object.entries(departmentData).map(([key, dept]) => (
                              <SelectItem key={key} value={key}>
                                {dept.name}
                              </SelectItem>
                            ))}
                            {comparisonType === "product" && [...productData.surgicalSupplies, ...productData.medications].map((product) => (
                              <SelectItem key={product.brand} value={product.brand}>
                                {product.name} ({product.brand})
                              </SelectItem>
                            ))}
                            {comparisonType === "surgeon" && surgeonData.surgery.map((surgeon) => (
                              <SelectItem key={surgeon.name} value={surgeon.name}>
                                {surgeon.name} - {surgeon.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Metrics Selection */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Metrics to Compare</h3>
                      <div className="space-y-2">
                        {comparisonType === "department" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="costPerUnit" 
                                checked={selectedMetrics.includes("costPerUnit")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "costPerUnit"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "costPerUnit"))
                                  }
                                }}
                              />
                              <label htmlFor="costPerUnit">Cost per Unit</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="utilizationRate" 
                                checked={selectedMetrics.includes("utilizationRate")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "utilizationRate"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "utilizationRate"))
                                  }
                                }}
                              />
                              <label htmlFor="utilizationRate">Utilization Rate</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="qualityScore" 
                                checked={selectedMetrics.includes("qualityScore")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "qualityScore"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "qualityScore"))
                                  }
                                }}
                              />
                              <label htmlFor="qualityScore">Quality Score</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="operationalEfficiency" 
                                checked={selectedMetrics.includes("operationalEfficiency")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "operationalEfficiency"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "operationalEfficiency"))
                                  }
                                }}
                              />
                              <label htmlFor="operationalEfficiency">Operational Efficiency</label>
                            </div>
                          </>
                        )}
                        {comparisonType === "product" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="cost" 
                                checked={selectedMetrics.includes("cost")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "cost"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "cost"))
                                  }
                                }}
                              />
                              <label htmlFor="cost">Cost</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="quality" 
                                checked={selectedMetrics.includes("quality")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "quality"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "quality"))
                                  }
                                }}
                              />
                              <label htmlFor="quality">Quality</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="usage" 
                                checked={selectedMetrics.includes("usage")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "usage"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "usage"))
                                  }
                                }}
                              />
                              <label htmlFor="usage">Usage</label>
                            </div>
                          </>
                        )}
                        {comparisonType === "surgeon" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="procedures" 
                                checked={selectedMetrics.includes("procedures")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "procedures"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "procedures"))
                                  }
                                }}
                              />
                              <label htmlFor="procedures">Procedures</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="successRate" 
                                checked={selectedMetrics.includes("successRate")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "successRate"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "successRate"))
                                  }
                                }}
                              />
                              <label htmlFor="successRate">Success Rate</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="costEfficiency" 
                                checked={selectedMetrics.includes("costEfficiency")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, "costEfficiency"])
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== "costEfficiency"))
                                  }
                                }}
                              />
                              <label htmlFor="costEfficiency">Cost Efficiency</label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => {
                        if (comparisonType && firstEntity && secondEntity && selectedMetrics.length > 0) {
                          setShowComparison(true)
                        }
                      }}
                      disabled={!comparisonType || !firstEntity || !secondEntity || selectedMetrics.length === 0}
                    >
                      Compare
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Results */}
              {showComparison && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cost Comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Metrics Comparison</CardTitle>
                        <CardDescription>Selected metrics comparison</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedMetrics.map(metric => ({
                              name: metric,
                              [firstEntity]: comparisonType === "department" 
                                ? departmentData[firstEntity as keyof typeof departmentData].metrics[metric as keyof typeof departmentData.surgery.metrics]
                                : comparisonType === "product"
                                  ? [...productData.surgicalSupplies, ...productData.medications].find(p => p.brand === firstEntity)?.[metric as keyof typeof productData.surgicalSupplies[0]] || 0
                                  : surgeonData.surgery.find(s => s.name === firstEntity)?.[metric as keyof typeof surgeonData.surgery[0]] || 0,
                              [secondEntity]: comparisonType === "department"
                                ? departmentData[secondEntity as keyof typeof departmentData].metrics[metric as keyof typeof departmentData.surgery.metrics]
                                : comparisonType === "product"
                                  ? [...productData.surgicalSupplies, ...productData.medications].find(p => p.brand === secondEntity)?.[metric as keyof typeof productData.surgicalSupplies[0]] || 0
                                  : surgeonData.surgery.find(s => s.name === secondEntity)?.[metric as keyof typeof surgeonData.surgery[0]] || 0,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey={firstEntity} fill="#8884d8" />
                              <Bar dataKey={secondEntity} fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Comparison</CardTitle>
                        <CardDescription>Side-by-side analysis of selected metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead>{comparisonType === "department" 
                                ? departmentData[firstEntity as keyof typeof departmentData].name 
                                : firstEntity}</TableHead>
                              <TableHead>{comparisonType === "department"
                                ? departmentData[secondEntity as keyof typeof departmentData].name
                                : secondEntity}</TableHead>
                              <TableHead>Difference</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedMetrics.map(metric => {
                              const value1 = comparisonType === "department"
                                ? departmentData[firstEntity as keyof typeof departmentData].metrics[metric as keyof typeof departmentData.surgery.metrics]
                                : comparisonType === "product"
                                  ? [...productData.surgicalSupplies, ...productData.medications].find(p => p.brand === firstEntity)?.[metric as keyof typeof productData.surgicalSupplies[0]] || 0
                                  : surgeonData.surgery.find(s => s.name === firstEntity)?.[metric as keyof typeof surgeonData.surgery[0]] || 0;
                              const value2 = comparisonType === "department"
                                ? departmentData[secondEntity as keyof typeof departmentData].metrics[metric as keyof typeof departmentData.surgery.metrics]
                                : comparisonType === "product"
                                  ? [...productData.surgicalSupplies, ...productData.medications].find(p => p.brand === secondEntity)?.[metric as keyof typeof productData.surgicalSupplies[0]] || 0
                                  : surgeonData.surgery.find(s => s.name === secondEntity)?.[metric as keyof typeof surgeonData.surgery[0]] || 0;
                              const difference = calculateDifference(value1, value2);
                              
                              return (
                                <TableRow key={metric}>
                                  <TableCell className="capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                                  <TableCell>{typeof value1 === 'number' ? value1.toFixed(1) : value1}</TableCell>
                                  <TableCell>{typeof value2 === 'number' ? value2.toFixed(1) : value2}</TableCell>
                                  <TableCell className={getComparisonColor(difference)}>
                                    {typeof difference === 'number' ? difference.toFixed(1) : difference}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>PDF Report Preview</DialogTitle>
            <DialogDescription>Preview of your report before export</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 p-6 bg-white rounded-lg border">
            {/* Report Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Procurement Analytics Report</h1>
              <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
                <p className="text-muted-foreground">
                  Total savings of ${totalSavings.toLocaleString()} achieved across departments, with {totalOpportunities} active opportunities 
                  identified for further cost reduction. {highPriorityRisks} high-priority risks require immediate attention.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                <ul className="space-y-2">
                  <li>Total Orders: 2,345</li>
                  <li>Inventory Items: 12,458</li>
                  <li>Cost Savings: ${totalSavings.toLocaleString()}</li>
                  <li>High Priority Risks: {highPriorityRisks}</li>
                </ul>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Cost Reduction Overview</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="spending" stroke="#8884d8" name="Total Spending" />
                      <Line type="monotone" dataKey="savings" stroke="#82ca9d" name="Cost Savings" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Savings Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={savingsBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {savingsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          {/* Export Button */}
          <div className="flex justify-end mt-4 flex-shrink-0">
            <Button onClick={() => setShowPdfPreview(false)} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ReportsQuickActions onExportPDF={handleExportPDF} />
    </div>
  );
}