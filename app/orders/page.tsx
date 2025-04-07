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
import { Search, Filter, MoreHorizontal, ShoppingCart, DollarSign, Package, Clock, TrendingUp } from "lucide-react"
import { ordersData } from "../../data/orders-data"
import Link from "next/link"
import { QuickActionsToolbar, useQuickActions } from "../../components/ui/quick-actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentTermsFilter, setPaymentTermsFilter] = useState<string>("")
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState<string>("")
  const router = useRouter()
  const { setRightActions } = useQuickActions()

  const filteredOrders = ordersData.filter(
    (order) =>
      (order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.vendors.some((vendor) => vendor.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (!paymentTermsFilter || order.paymentTerms === paymentTermsFilter) &&
      (!deliveryTimeFilter || order.deliveryTime === deliveryTimeFilter)
  )

  // Get unique payment terms and delivery times for filter options
  const paymentTermsOptions = Array.from(new Set(ordersData.map(order => order.paymentTerms)))
  const deliveryTimeOptions = Array.from(new Set(ordersData.map(order => order.deliveryTime)))

  // Calculate statistics
  const totalBudgetSpent = ordersData.reduce((total, order) => total + order.total, 0)
  const totalOrders = ordersData.length
  const averageOrderValue = totalBudgetSpent / totalOrders
  const pendingOrders = ordersData.filter(order => order.status.toLowerCase() === 'pending').length

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
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

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-700 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Budget Spent</p>
                  <h3 className="text-2xl font-bold">${totalBudgetSpent.toLocaleString()}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <h3 className="text-2xl font-bold">{totalOrders}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <h3 className="text-2xl font-bold">{pendingOrders}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-700 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <h3 className="text-2xl font-bold">${averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage your procurement orders</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Payment Terms
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setPaymentTermsFilter("")}>
                      All Terms
                    </DropdownMenuItem>
                    {paymentTermsOptions.map((term) => (
                      <DropdownMenuItem
                        key={term}
                        onClick={() => setPaymentTermsFilter(term)}
                      >
                        {term}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Delivery Time
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setDeliveryTimeFilter("")}>
                      All Times
                    </DropdownMenuItem>
                    {deliveryTimeOptions.map((time) => (
                      <DropdownMenuItem
                        key={time}
                        onClick={() => setDeliveryTimeFilter(time)}
                      >
                        {time}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendors</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        {order.vendors.length > 0 ? (
                          <div>
                            <span>{order.vendors[0]}</span>
                            {order.vendors.length > 1 && (
                              <span className="text-xs text-muted-foreground ml-1">+{order.vendors.length - 1} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No vendors yet</span>
                        )}
                      </TableCell>
                      <TableCell>{order.itemCount}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.estimatedDelivery}</TableCell>
                      <TableCell>{order.paymentTerms}</TableCell>
                      <TableCell>{order.deliveryTime}</TableCell>
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
          </CardContent>
        </Card>
      </div>

      <QuickActionsToolbar />
    </>
  )
}

