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
import { Search, Filter, MoreHorizontal, Plus, Star, Phone, Mail, FileText } from "lucide-react"

// Mock data for vendors
const vendorsData = [
  {
    id: "vendor-001",
    name: "MedSupply Inc.",
    contactName: "John Smith",
    contactEmail: "john.smith@medsupply.com",
    contactPhone: "+1 (555) 123-4567",
    categories: ["Surgical Supplies", "IV Supplies", "PPE"],
    status: "Active",
    rating: 4.8,
    complianceStatus: "Approved",
    lastOrder: "2023-12-15",
    totalSpend: 15420.75,
  },
  {
    id: "vendor-002",
    name: "Hospital Direct",
    contactName: "Sarah Johnson",
    contactEmail: "sarah.j@hospitaldirect.com",
    contactPhone: "+1 (555) 987-6543",
    categories: ["Surgical Supplies", "Examination Supplies", "Cleaning Supplies"],
    status: "Active",
    rating: 4.5,
    complianceStatus: "Approved",
    lastOrder: "2023-12-20",
    totalSpend: 8750.25,
  },
  {
    id: "vendor-003",
    name: "PPE Direct",
    contactName: "Michael Chen",
    contactEmail: "mchen@ppedirect.com",
    contactPhone: "+1 (555) 456-7890",
    categories: ["PPE", "Cleaning Supplies"],
    status: "Active",
    rating: 4.2,
    complianceStatus: "Approved",
    lastOrder: "2023-12-22",
    totalSpend: 5320.5,
  },
  {
    id: "vendor-004",
    name: "Discount Medical",
    contactName: "Lisa Rodriguez",
    contactEmail: "lisa@discountmedical.com",
    contactPhone: "+1 (555) 234-5678",
    categories: ["Surgical Supplies", "Examination Supplies"],
    status: "Pending Review",
    rating: 3.9,
    complianceStatus: "Under Review",
    lastOrder: "2023-11-30",
    totalSpend: 2150.75,
  },
  {
    id: "vendor-005",
    name: "PrimeCare Supplies",
    contactName: "David Wilson",
    contactEmail: "dwilson@primecare.com",
    contactPhone: "+1 (555) 876-5432",
    categories: ["Surgical Supplies", "IV Supplies", "Examination Supplies"],
    status: "Active",
    rating: 4.7,
    complianceStatus: "Approved",
    lastOrder: "2023-12-10",
    totalSpend: 12680.3,
  },
]

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVendors = vendorsData.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.categories.some((category) => category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending review":
        return "bg-amber-100 text-amber-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under review":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Manage your procurement vendors and suppliers</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Total Spend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.map((category, i) => (
                          <Badge key={i} variant="outline" className="bg-muted">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{vendor.contactName}</span>
                        <span className="text-xs text-muted-foreground">{vendor.contactEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getComplianceStatusColor(vendor.complianceStatus)}>
                        {vendor.complianceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">{vendor.rating}</span>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    </TableCell>
                    <TableCell>{vendor.lastOrder}</TableCell>
                    <TableCell>${vendor.totalSpend.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit vendor</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View contracts
                            </DropdownMenuItem>
                            <DropdownMenuItem>Create order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

