"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  FileUp,
  FileText,
  Clock,
  Check,
  X,
  TrendingDown,
  AlertCircle,
  MessageSquare,
  Truck,
  Mail,
  Phone,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ordersData } from "@/data/orders-data"

export default function OrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState("details")
  const [quoteComparisonView, setQuoteComparisonView] = useState("side-by-side")

  // Find the order in our mock data
  const order = ordersData.find((order) => order.id === id)

  if (!order) {
    return <div>Order not found</div>
  }

  // Mock data for order items
  const orderItems = [
    {
      id: "item-001",
      name: "Surgical Gloves (Medium)",
      sku: "SG-M-100",
      quantity: 500,
      unitPrice: 0.22,
      total: 110.0,
      vendor: "Hospital Direct",
    },
    {
      id: "item-002",
      name: "IV Catheters 20G",
      sku: "IV-20G-50",
      quantity: 200,
      unitPrice: 1.95,
      total: 390.0,
      vendor: "Hospital Direct",
    },
  ]

  // Mock data for quotes
  const quotes = [
    {
      id: "QUO-2023-001",
      vendor: "Hospital Direct",
      items: orderItems,
      total: 499.0,
      status: "Pending Review",
      receivedDate: "2023-12-21",
      expiryDate: "2023-12-28",
      savings: 25.0,
      deliveryTime: "3-5 days",
      warranty: "1 year",
      paymentTerms: "Net 30",
      contact: "Robert Johnson",
      notes: "Includes free shipping and priority support",
    },
    {
      id: "QUO-2023-002",
      vendor: "MedSupply Inc.",
      items: [
        {
          id: "item-001",
          name: "Surgical Gloves (Medium)",
          sku: "SG-M-100",
          quantity: 500,
          unitPrice: 0.2,
          total: 100.0,
          vendor: "MedSupply Inc.",
        },
        {
          id: "item-002",
          name: "IV Catheters 20G",
          sku: "IV-20G-50",
          quantity: 200,
          unitPrice: 2.1,
          total: 420.0,
          vendor: "MedSupply Inc.",
        },
      ],
      total: 520.0,
      status: "Pending Review",
      receivedDate: "2023-12-22",
      expiryDate: "2023-12-29",
      savings: 0.0,
      deliveryTime: "2-3 days",
      warranty: "2 years",
      paymentTerms: "Net 45",
      contact: "Jennifer Adams",
      notes: "Premium warranty package with 24/7 technical support",
    },
    {
      id: "QUO-2023-005",
      vendor: "Discount Medical",
      items: [
        {
          id: "item-001",
          name: "Surgical Gloves (Medium)",
          sku: "SG-M-100",
          quantity: 500,
          unitPrice: 0.19,
          total: 95.0,
          vendor: "Discount Medical",
        },
        {
          id: "item-002",
          name: "IV Catheters 20G",
          sku: "IV-20G-50",
          quantity: 200,
          unitPrice: 2.15,
          total: 430.0,
          vendor: "Discount Medical",
        },
      ],
      total: 525.0,
      status: "Pending Review",
      receivedDate: "2023-12-23",
      expiryDate: "2023-12-30",
      savings: 0.0,
      deliveryTime: "5-7 days",
      warranty: "1 year",
      paymentTerms: "Net 60",
      contact: "Maria Garcia",
      notes: "Economy package with optional extended warranty available for purchase",
    },
  ]

  // Mock data for quote comparison
  const quoteComparisonData = {
    items: [
      { id: "item-001", name: "Surgical Gloves (Medium)", sku: "SG-M-100", quantity: 500 },
      { id: "item-002", name: "IV Catheters 20G", sku: "IV-20G-50", quantity: 200 },
    ],
    vendors: [
      {
        name: "Hospital Direct",
        quoteId: "QUO-2023-001",
        prices: [0.22, 1.95],
        total: 499.0,
        delivery: "3-5 days",
        paymentTerms: "Net 30",
        expiryDate: "2023-12-28",
      },
      {
        name: "MedSupply Inc.",
        quoteId: "QUO-2023-002",
        prices: [0.2, 2.1],
        total: 520.0,
        delivery: "2-3 days",
        paymentTerms: "Net 45",
        expiryDate: "2023-12-29",
      },
      {
        name: "Discount Medical",
        quoteId: "QUO-2023-005",
        prices: [0.19, 2.15],
        total: 525.0,
        delivery: "5-7 days",
        paymentTerms: "Net 30",
        expiryDate: "2023-12-30",
      },
    ],
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <Check className="h-4 w-4 text-green-600" />
      case "Rejected":
        return <X className="h-4 w-4 text-red-600" />
      case "Pending Review":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{order.id}</h1>
            <p className="text-muted-foreground">Created on {order.date}</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(order.status)}>
          {order.status}
        </Badge>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Items included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={4} className="font-bold text-right">
                        Total
                      </TableCell>
                      <TableCell className="font-bold text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendors:</span>
                    <span>
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
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span>{order.estimatedDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{order.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    View Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Truck className="h-4 w-4" />
                    Track Shipment
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Vendor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vendor Quote Comparison</CardTitle>
                <CardDescription>Compare quotes from different vendors</CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <FileUp className="h-4 w-4" />
                Upload Quote
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="inline-flex items-center rounded-md border p-1 mb-6">
                  <button
                    className={`px-3 py-1.5 text-sm ${quoteComparisonView === "side-by-side" ? "bg-muted rounded-sm font-medium" : ""}`}
                    onClick={() => setQuoteComparisonView("side-by-side")}
                  >
                    Side-by-Side Comparison
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm ${quoteComparisonView === "itemized" ? "bg-muted rounded-sm font-medium" : ""}`}
                    onClick={() => setQuoteComparisonView("itemized")}
                  >
                    Itemized Comparison
                  </button>
                </div>

                {quoteComparisonView === "side-by-side" ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Criteria</TableHead>
                          {quotes.map((quote) => (
                            <TableHead key={quote.id} className="text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full mb-2 flex items-center justify-center">
                                  <img
                                    src={`/placeholder.svg?height=48&width=48`}
                                    alt={quote.vendor}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                {quote.vendor}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Total Price</TableCell>
                          {quotes.map((quote) => {
                            const isLowest = quote.total === Math.min(...quotes.map((q) => q.total))
                            return (
                              <TableCell key={`${quote.id}-price`} className="text-center">
                                <span className={isLowest ? "text-green-600 font-medium" : ""}>
                                  ${quote.total.toFixed(2)}
                                </span>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Delivery Timeframe</TableCell>
                          {quotes.map((quote) => {
                            const isFastest = quote.deliveryTime === "2-3 days"
                            return (
                              <TableCell key={`${quote.id}-delivery`} className="text-center">
                                <span className={isFastest ? "text-green-600 font-medium" : ""}>
                                  {quote.deliveryTime}
                                </span>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Warranty</TableCell>
                          {quotes.map((quote) => {
                            const isBest = quote.warranty === "2 years"
                            return (
                              <TableCell key={`${quote.id}-warranty`} className="text-center">
                                <span className={isBest ? "text-green-600 font-medium" : ""}>{quote.warranty}</span>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Payment Terms</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-payment`} className="text-center">
                              {quote.paymentTerms}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Valid Until</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-expiry`} className="text-center">
                              {quote.expiryDate}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Notes</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-notes`} className="text-center">
                              {quote.notes}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Contact</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-contact`} className="text-center">
                              <div>{quote.contact}</div>
                              <div className="flex justify-center gap-2 mt-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Quote Document</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-document`} className="text-center">
                              <Button variant="outline" size="sm" className="gap-1">
                                <FileText className="h-3 w-3" />
                                View Quote
                              </Button>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Select Vendor</TableCell>
                          {quotes.map((quote) => (
                            <TableCell key={`${quote.id}-select`} className="text-center">
                              <Button>Select</Button>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Quote Analysis</h4>
                        <p className="text-sm text-blue-700">
                          Discount Medical offers the lowest price for Surgical Gloves at $0.19 per unit, saving $15
                          compared to Hospital Direct. However, Hospital Direct offers the best overall package with
                          faster delivery and better pricing on IV Catheters. Consider negotiating with Discount Medical
                          for improved delivery times or request a bundle discount from Hospital Direct.
                        </p>
                      </div>
                    </div>

                    {quoteComparisonData.items.map((item, itemIndex) => (
                      <div key={item.id} className="mb-8">
                        <h3 className="text-lg font-medium mb-4">
                          {item.name} (Qty: {item.quantity})
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vendor</TableHead>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Savings</TableHead>
                              <TableHead>Delivery</TableHead>
                              <TableHead>Compliance</TableHead>
                              <TableHead>Feedback</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quoteComparisonData.vendors.map((vendor, vendorIndex) => {
                              const price = vendor.prices[itemIndex]
                              const isLowest =
                                price === Math.min(...quoteComparisonData.vendors.map((v) => v.prices[itemIndex]))

                              // Mock data for each vendor's product
                              const productName =
                                itemIndex === 0
                                  ? vendorIndex === 0
                                    ? "Standard Surgical Gloves"
                                    : vendorIndex === 1
                                      ? "Basic Surgical Gloves"
                                      : "Economy Surgical Gloves"
                                  : vendorIndex === 0
                                    ? "Premium IV Catheters"
                                    : vendorIndex === 1
                                      ? "Standard IV Catheters"
                                      : "Basic IV Catheters"

                              const rating = 4 + Number.parseFloat((Math.random() * 1).toFixed(1))
                              const feedback =
                                vendorIndex === 0
                                  ? "Good quality, consistent performance"
                                  : vendorIndex === 1
                                    ? "Good value, occasional issues"
                                    : "Economical option, acceptable quality"

                              // Calculate savings compared to highest price
                              const highestPrice = Math.max(
                                ...quoteComparisonData.vendors.map((v) => v.prices[itemIndex]),
                              )
                              const savings = highestPrice - price

                              return (
                                <TableRow key={`${item.id}-${vendor.name}`}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`vendor-${item.id}`}
                                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                        defaultChecked={isLowest}
                                      />
                                      <span>{vendor.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span>{productName}</span>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        Existing
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                      <img
                                        src={`/placeholder.svg?height=40&width=40`}
                                        alt={productName}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className={isLowest ? "font-medium text-green-600" : ""}>
                                    ${price.toFixed(2)}
                                    {isLowest && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-green-50 text-green-700 border-green-200"
                                      >
                                        Best
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {savings > 0 ? (
                                      <div className="flex items-center text-green-600">
                                        <TrendingDown className="h-4 w-4 mr-1" />${savings.toFixed(2)}
                                      </div>
                                    ) : (
                                      "$0.00"
                                    )}
                                  </TableCell>
                                  <TableCell>{vendor.delivery}</TableCell>
                                  <TableCell>
                                    <Check className="h-5 w-5 text-green-600" />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <span>{rating.toFixed(1)}</span>
                                      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="outline" className="h-8">
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ))}

                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Total Package Comparison</h3>
                        <p className="text-sm text-muted-foreground">Overall cost including all items</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">Request New Quotes</Button>
                        <Button>Accept Selected Quote</Button>
                      </div>
                    </div>

                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead>Delivery</TableHead>
                          <TableHead>Payment Terms</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Overall Rating</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quoteComparisonData.vendors.map((vendor) => {
                          const isLowest = vendor.total === Math.min(...quoteComparisonData.vendors.map((v) => v.total))
                          return (
                            <TableRow key={`${vendor.name}-total`}>
                              <TableCell className="font-medium">{vendor.name}</TableCell>
                              <TableCell className={isLowest ? "font-bold text-green-600" : "font-bold"}>
                                ${vendor.total.toFixed(2)}
                                {isLowest && (
                                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                    Best Total
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{vendor.delivery}</TableCell>
                              <TableCell>{vendor.paymentTerms}</TableCell>
                              <TableCell>{vendor.expiryDate}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span>{(4 + Math.random()).toFixed(1)}</span>
                                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Timeline of events for this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    date: "2023-12-22",
                    time: "14:30",
                    event: "Quote received",
                    description: "Quote received from MedSupply Inc.",
                    user: "System",
                  },
                  {
                    date: "2023-12-21",
                    time: "10:15",
                    event: "Quote received",
                    description: "Quote received from Hospital Direct",
                    user: "System",
                  },
                  {
                    date: "2023-12-20",
                    time: "09:45",
                    event: "Order created",
                    description: "Order created and RFQ sent to vendors",
                    user: "John Smith",
                  },
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 text-right text-sm text-muted-foreground">{event.time}</div>
                    <div className="relative">
                      <div className="absolute left-0 top-2 -ml-2 h-4 w-4 rounded-full bg-primary"></div>
                      {i < 2 && <div className="absolute left-0 top-6 bottom-0 -ml-0.5 w-0.5 bg-border"></div>}
                      <div className="ml-6">
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">By: {event.user}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

