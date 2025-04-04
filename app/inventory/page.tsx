"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, MoreHorizontal, Upload, Plus } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"
import Link from "next/link"

export default function InventoryPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = inventoryData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "stock":
        return "bg-green-100 text-green-800"
      case "low":
        return "bg-amber-100 text-amber-800"
      case "urgent":
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
            <CardTitle>All Items</CardTitle>
            <CardDescription>Manage your hospital inventory items</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Inventory
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {selectedItems.length > 0 && <Button variant="outline">Add {selectedItems.length} to Order</Button>}
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead className="text-center">
                    <span className="font-semibold text-primary">Swaps</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="font-semibold text-primary">Potential Savings</span>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <img
                          src={item.image || `/placeholder.svg?height=40&width=40`}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/${item.id}`} className="hover:underline text-primary">
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      {item.currentStock}/{item.totalStock}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.packaging}</TableCell>
                    <TableCell>{item.expiresIn}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      >
                        {item.swaps.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.potentialSavings > 0 ? (
                        <div className="text-green-600 font-medium">
                          {Math.round((item.potentialSavings / (item.unitPrice * item.requiredUnits)) * 100)}%
                        </div>
                      ) : (
                        <div className="text-center">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => (window.location.href = `/inventory/${item.id}`)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit item</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Add to order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

