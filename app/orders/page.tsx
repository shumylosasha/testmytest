"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Clock, 
  TrendingUp, 
  Check, 
  AlertTriangle, 
  LayersIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown 
} from "lucide-react"
import { ordersData, Order } from "../../data/orders-data"
import Link from "next/link"
import { QuickActionsToolbar, useQuickActions } from "../../components/ui/quick-actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { VENDOR_LOGOS } from "../../lib/constants"
import Image from "next/image"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order | ""; direction: "asc" | "desc" }>({ key: "", direction: "asc" })
  const router = useRouter()
  const { setRightActions } = useQuickActions()

  const handleSort = (key: keyof Order) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }))
  }

  const getSortedOrders = (orders: Order[]) => {
    if (!sortConfig.key) return orders

    return [...orders].sort((a, b) => {
      if (sortConfig.key === "") return 0
      
      if (sortConfig.key === "total") {
        return sortConfig.direction === "asc" 
          ? a.total - b.total
          : b.total - a.total
      }
      
      if (sortConfig.key === "itemCount") {
        return sortConfig.direction === "asc"
          ? a.itemCount - b.itemCount
          : b.itemCount - a.itemCount
      }

      const aValue = String(a[sortConfig.key as keyof Order]).toLowerCase()
      const bValue = String(b[sortConfig.key as keyof Order]).toLowerCase()
      
      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const filteredOrders = ordersData.filter(
    (order) =>
      (order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.vendors.some((vendor) => vendor.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (statusFilters.length === 0 || statusFilters.some(filter => order.status.toLowerCase().includes(filter.toLowerCase())))
  )

  const sortedOrders = getSortedOrders(filteredOrders)

  const SortableHeader = ({ column, label }: { column: keyof Order; label: string }) => {
    const isActive = sortConfig.key === column
    return (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-primary"
        onClick={() => handleSort(column)}
      >
        {label}
        <span className="inline-flex">
          {isActive ? (
            sortConfig.direction === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-30" />
          )}
        </span>
      </div>
    )
  }

  const groupedOrders = groupBy ? 
    sortedOrders.reduce((groups, order) => {
      let keys: string[] = [];
      switch(groupBy) {
        case 'department':
          keys = [order.department || 'General'];
          break;
        case 'vendor':
          keys = order.vendors.length > 0 ? order.vendors : ['No Vendor'];
          break;
        case 'status':
          keys = [order.status];
          break;
        case 'urgency':
          keys = [order.urgency || 'Normal'];
          break;
        default:
          keys = ['Other'];
      }
      
      // Handle multiple keys (for vendors)
      keys.forEach(key => {
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(order);
      });
      
      return groups;
    }, {} as Record<string, Order[]>) 
    : null

  // Get unique payment terms and delivery times for filter options
  const paymentTermsOptions = Array.from(new Set(ordersData.map(order => order.paymentTerms)))
  const deliveryTimeOptions = Array.from(new Set(ordersData.map(order => order.deliveryTime)))

  // Calculate statistics
  const totalBudgetSpent = ordersData.reduce((total, order) => total + order.total, 0)
  const totalOrders = ordersData.length
  const averageOrderValue = totalBudgetSpent / totalOrders
  const pendingOrders = ordersData.filter(order => order.status.toLowerCase() === 'pending').length

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(current => 
      current.includes(status) 
        ? current.filter(s => s !== status)
        : [...current, status]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateOrder = () => {
    router.push("/orders/create")
  }

  // Set up the right actions for the quick actions toolbar
  useEffect(() => {
    setRightActions(
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full bg-black text-white hover:bg-black/90 hover:text-white active:bg-black/80 flex items-center gap-2"
        onClick={handleCreateOrder}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Create Order</span>
      </Button>
    )

    // Clean up the actions when the component unmounts
    return () => setRightActions(null)
  }, [setRightActions])

  const getGroupHeaderColor = (groupType: string, group: string) => {
    switch (groupType) {
      case 'status':
        return getStatusColor(group)
      case 'department':
        switch (group.toLowerCase()) {
          case 'surgery':
            return 'bg-purple-50 text-purple-900'
          case 'emergency':
            return 'bg-red-50 text-red-900'
          case 'general':
            return 'bg-blue-50 text-blue-900'
          default:
            return 'bg-gray-50 text-gray-900'
        }
      case 'urgency':
        return group.toLowerCase() === 'urgent' 
          ? 'bg-red-50 text-red-900' 
          : 'bg-green-50 text-green-900'
      case 'vendor':
        return 'bg-indigo-50 text-indigo-900'
      default:
        return 'bg-gray-50 text-gray-900'
    }
  }

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'status':
        return <Clock className="h-5 w-5 opacity-75" />
      case 'department':
        return <Package className="h-5 w-5 opacity-75" />
      case 'urgency':
        return <AlertTriangle className="h-5 w-5 opacity-75" />
      case 'vendor':
        return <ShoppingCart className="h-5 w-5 opacity-75" />
      default:
        return <LayersIcon className="h-5 w-5 opacity-75" />
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage and track your orders</CardDescription>
            </div>
            {/* Budget Card */}
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg border bg-card w-[300px]">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium">${(100000).toLocaleString()}</p>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(totalBudgetSpent / 100000) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <div className="font-medium text-blue-600">${totalBudgetSpent.toLocaleString()}</div>
                  <div className="font-medium text-gray-600">${(100000 - totalBudgetSpent).toLocaleString()} left</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Section */}
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders, vendors, or items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter by status</span>
                      {statusFilters.length > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                          {statusFilters.length}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setStatusFilters([])}>
                      Clear Filters
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => toggleStatusFilter("processing")}
                      className="flex items-center justify-between"
                    >
                      <span>Processing</span>
                      {statusFilters.includes("processing") && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatusFilter("pending")}
                      className="flex items-center justify-between"
                    >
                      <span>Pending</span>
                      {statusFilters.includes("pending") && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatusFilter("completed")}
                      className="flex items-center justify-between"
                    >
                      <span>Completed</span>
                      {statusFilters.includes("completed") && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleStatusFilter("cancelled")}
                      className="flex items-center justify-between"
                    >
                      <span>Cancelled</span>
                      {statusFilters.includes("cancelled") && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <LayersIcon className="h-4 w-4" />
                      <span className="sr-only">Group by</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Group by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setGroupBy("")}>
                      No Grouping
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setGroupBy("department")}>
                      Department
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGroupBy("vendor")}>
                      Vendor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGroupBy("status")}>
                      Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGroupBy("urgency")}>
                      Urgency
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="border rounded-md">
              {groupBy ? (
                Object.entries(groupedOrders || {}).map(([group, orders]) => (
                  <div key={group} className="border-b last:border-b-0">
                    <div className={`px-4 py-3 flex items-center justify-between ${getGroupHeaderColor(groupBy, group)}`}>
                      <div className="flex items-center gap-2">
                        {groupBy === 'vendor' ? (
                          <div className="relative h-8 w-8 rounded-full overflow-hidden border bg-white">
                            <Image
                              src={VENDOR_LOGOS[group as keyof typeof VENDOR_LOGOS] || VENDOR_LOGOS.default}
                              alt={group}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          getGroupIcon(groupBy)
                        )}
                        <div>
                          <div className="font-medium">{group}</div>
                          <div className="text-sm text-muted-foreground">{orders.length} orders</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="min-w-[1200px]">
                        <Table>
                          <TableBody>
                            {orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                                    {order.id}
                                  </Link>
                                  <div className="text-xs text-muted-foreground">{order.date}</div>
                                </TableCell>
                                <TableCell>
                                  <Link 
                                    href={`/orders/${order.id}`} 
                                    className="hover:underline text-foreground block"
                                  >
                                    <span className="line-clamp-2">
                                      {order.itemCount} items: {order.items?.map(item => item.name).join(", ") || "No items specified"}
                                    </span>
                                  </Link>
                                </TableCell>
                                <TableCell>{order.department || "General"}</TableCell>
                                <TableCell>
                                  {order.vendors.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {order.vendors.map((vendor) => (
                                        <div key={vendor} className="flex items-center gap-2">
                                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary">
                                            <div className="relative h-4 w-4 rounded-full overflow-hidden border bg-white">
                                              <Image
                                                src={VENDOR_LOGOS[vendor as keyof typeof VENDOR_LOGOS] || VENDOR_LOGOS.default}
                                                alt={vendor}
                                                fill
                                                className="object-contain"
                                              />
                                            </div>
                                            <span className="text-xs font-medium">{vendor}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">No vendors yet</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1.5 items-start">
                                    <Badge variant="outline" className={`inline-flex w-auto ${getStatusColor(order.status)}`}>
                                      {order.status}
                                    </Badge>
                                    {order.urgency === "urgent" && (
                                      <Badge variant="outline" className="inline-flex w-auto bg-red-100 text-red-800">
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{order.estimatedDelivery}</TableCell>
                                <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem>
                                        <Link href={`/orders/${order.id}`}>View details</Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>Track order</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>Cancel order</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">
                            <SortableHeader column="id" label="Order ID" />
                          </TableHead>
                          <TableHead className="w-[300px]">
                            <SortableHeader column="itemCount" label="Items" />
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <SortableHeader column="department" label="Department" />
                          </TableHead>
                          <TableHead className="w-[200px]">
                            <SortableHeader column="vendors" label="Vendor" />
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <SortableHeader column="status" label="Status" />
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <SortableHeader column="estimatedDelivery" label="Est. Delivery" />
                          </TableHead>
                          <TableHead className="w-[120px] text-right">
                            <div className="flex justify-end">
                              <SortableHeader column="total" label="Total" />
                            </div>
                          </TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                                {order.id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link 
                                href={`/orders/${order.id}`} 
                                className="hover:underline text-foreground block"
                              >
                                <span className="line-clamp-2">
                                  {order.itemCount} items: {order.items?.map(item => item.name).join(", ") || "No items specified"}
                                </span>
                              </Link>
                            </TableCell>
                            <TableCell>{order.department || "General"}</TableCell>
                            <TableCell>
                              {order.vendors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {order.vendors.map((vendor) => (
                                    <div key={vendor} className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary">
                                        <div className="relative h-4 w-4 rounded-full overflow-hidden border bg-white">
                                          <Image
                                            src={VENDOR_LOGOS[vendor as keyof typeof VENDOR_LOGOS] || VENDOR_LOGOS.default}
                                            alt={vendor}
                                            fill
                                            className="object-contain"
                                          />
                                        </div>
                                        <span className="text-xs font-medium">{vendor}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No vendors yet</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1.5 items-start">
                                <Badge variant="outline" className={`inline-flex w-auto ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </Badge>
                                {order.urgency === "urgent" && (
                                  <Badge variant="outline" className="inline-flex w-auto bg-red-100 text-red-800">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{order.estimatedDelivery}</TableCell>
                            <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Link href={`/orders/${order.id}`}>View details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Track order</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Cancel order</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickActionsToolbar />
    </>
  )
}

