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
import { Search, Filter, MoreHorizontal, Plus, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react"

// Mock data for compliance rules
const complianceRulesData = [
  {
    id: "rule-001",
    name: "FDA Approval",
    description: "All medical devices must have FDA approval or clearance",
    category: "Regulatory",
    status: "Active",
    lastUpdated: "2023-10-15",
    severity: "Critical",
    document: "FDA_Requirements.pdf",
  },
  {
    id: "rule-002",
    name: "Sterilization Standards",
    description: "Sterile products must meet ISO 11135 or ISO 11137 standards",
    category: "Quality",
    status: "Active",
    lastUpdated: "2023-11-20",
    severity: "High",
    document: "Sterilization_Standards.pdf",
  },
  {
    id: "rule-003",
    name: "Latex-Free Alternatives",
    description: "Latex-free alternatives must be available for all latex-containing products",
    category: "Safety",
    status: "Active",
    lastUpdated: "2023-09-05",
    severity: "Medium",
    document: "Latex_Policy.pdf",
  },
  {
    id: "rule-004",
    name: "Vendor Certification",
    description: "All vendors must maintain ISO 13485 certification for medical device quality management",
    category: "Vendor",
    status: "Active",
    lastUpdated: "2023-12-01",
    severity: "High",
    document: "Vendor_Requirements.pdf",
  },
  {
    id: "rule-005",
    name: "Environmental Impact",
    description: "Products should have minimal environmental impact and follow sustainable practices",
    category: "Environmental",
    status: "Under Review",
    lastUpdated: "2023-12-10",
    severity: "Low",
    document: "Environmental_Guidelines.pdf",
  },
]

// Mock data for compliance audits
const complianceAuditsData = [
  {
    id: "audit-001",
    name: "Q4 Vendor Compliance Audit",
    description: "Quarterly audit of vendor compliance documentation",
    date: "2023-12-15",
    status: "Completed",
    findings: 3,
    assignedTo: "Sarah Johnson",
    document: "Q4_Audit_Report.pdf",
  },
  {
    id: "audit-002",
    name: "Annual Regulatory Review",
    description: "Annual review of regulatory compliance for all products",
    date: "2023-11-30",
    status: "Completed",
    findings: 5,
    assignedTo: "Michael Chen",
    document: "Annual_Regulatory_Review.pdf",
  },
  {
    id: "audit-003",
    name: "New Vendor Assessment",
    description: "Compliance assessment for new vendor onboarding",
    date: "2023-12-20",
    status: "In Progress",
    findings: 0,
    assignedTo: "Lisa Rodriguez",
    document: null,
  },
]

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("rules")

  const filteredRules = complianceRulesData.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredAudits = complianceAuditsData.filter(
    (audit) =>
      audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "open":
        return "bg-amber-100 text-amber-800"
      case "under review":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "open":
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "under review":
        return <AlertCircle className="h-4 w-4 text-purple-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compliance Rules</CardTitle>
            <CardDescription>Standards and regulations that must be followed</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Tabs defaultValue="rules" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
                  <TabsTrigger value="audits">Audits</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab === "rules" ? "rules" : "audits"}...`}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="rules">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(rule.status)}
                            <Badge variant="outline" className={getStatusColor(rule.status)}>
                              {rule.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.lastUpdated}</TableCell>
                        <TableCell>
                          {rule.document && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3 w-3" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit rule</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Archive rule</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="audits">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium">{audit.name}</TableCell>
                        <TableCell>{audit.description}</TableCell>
                        <TableCell>{audit.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(audit.status)}
                            <Badge variant="outline" className={getStatusColor(audit.status)}>
                              {audit.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {audit.findings > 0 ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">
                              {audit.findings} issues
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              No issues
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{audit.assignedTo}</TableCell>
                        <TableCell>
                          {audit.document && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3 w-3" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit audit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Export report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

