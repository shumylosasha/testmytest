"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, FileUp, Search, Filter, Check, X, Clock, TrendingDown, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ArrowUpDown } from "lucide-react"

// Mock data for quotes
const quotesData = [
  {
    id: "QUO-2023-001",
    orderId: "ORD-2023-002",
    vendor: "Hospital Direct",
    items: [
      { name: "Surgical Gloves (Medium)", quantity: 500, price: 0.22 },
      { name: "IV Catheters 20G", quantity: 200, price: 1.95 },
    ],
    total: 499.0,
    status: "Pending Review",
    receivedDate: "2023-12-21",
    expiryDate: "2023-12-28",
    savings: 25.0,
  },
  {
    id: "QUO-2023-002",
    orderId: "ORD-2023-002",
    vendor: "MedSupply Inc.",
    items: [
      { name: "Surgical Gloves (Medium)", quantity: 500, price: 0.2 },
      { name: "IV Catheters 20G", quantity: 200, price: 2.1 },
    ],
    total: 520.0,
    status: "Pending Review",
    receivedDate: "2023-12-22",
    expiryDate: "2023-12-29",
    savings: 0.0,
  },
  {
    id: "QUO-2023-003",
    orderId: "ORD-2023-003",
    vendor: "PPE Direct",
    items: [
      { name: "Surgical Masks", quantity: 1000, price: 0.75 },
      { name: "Face Shields", quantity: 100, price: 2.5 },
    ],
    total: 1000.0,
    status: "Accepted",
    receivedDate: "2023-12-20",
    expiryDate: "2023-12-27",
    savings: 50.0,
  },
  {
    id: "QUO-2023-004",
    orderId: "ORD-2023-006",
    vendor: "Hospital Direct",
    items: [
      { name: "Examination Gloves (Large)", quantity: 300, price: 0.17 },
      { name: "Alcohol Prep Pads", quantity: 500, price: 0.04 },
    ],
    total: 71.0,
    status: "Rejected",
    receivedDate: "2023-12-19",
    expiryDate: "2023-12-26",
    savings: 10.0,
  },
]

// Mock data for quote comparison
const quoteComparisonData = {
  orderId: "ORD-2023-002",
  items: [
    { name: "Surgical Gloves (Medium)", quantity: 500 },
    { name: "IV Catheters 20G", quantity: 200 },
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

// Mock data for demonstration
const mockQuotes = [
  {
    vendor: "Medical Supplies Co.",
    totalAmount: 12500,
    deliveryTime: "3-5 days",
    items: [
      { name: "Surgical Masks", quantity: 1000, price: 2.5, total: 2500 },
      { name: "Hand Sanitizer", quantity: 500, price: 3.0, total: 1500 },
      { name: "Gloves", quantity: 2000, price: 4.25, total: 8500 },
    ],
  },
  {
    vendor: "Healthcare Solutions",
    totalAmount: 11800,
    deliveryTime: "2-4 days",
    items: [
      { name: "Surgical Masks", quantity: 1000, price: 2.3, total: 2300 },
      { name: "Hand Sanitizer", quantity: 500, price: 2.8, total: 1400 },
      { name: "Gloves", quantity: 2000, price: 4.05, total: 8100 },
    ],
  },
  {
    vendor: "Global Medical",
    totalAmount: 13200,
    deliveryTime: "4-6 days",
    items: [
      { name: "Surgical Masks", quantity: 1000, price: 2.7, total: 2700 },
      { name: "Hand Sanitizer", quantity: 500, price: 3.2, total: 1600 },
      { name: "Gloves", quantity: 2000, price: 4.45, total: 8900 },
    ],
  },
]

export default function QuotesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary")

  const filteredQuotes = quotesData.filter(
    (quote) =>
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Pending Review":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const toggleVendor = (vendor: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendor)
        ? prev.filter((v) => v !== vendor)
        : [...prev, vendor]
    )
  }

  const getLowestPrice = (itemName: string) => {
    return Math.min(...mockQuotes.map((quote) => {
      const item = quote.items.find((i) => i.name === itemName)
      return item ? item.price : Infinity
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Vendor Quotes</h1>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Quotes</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="compare">Compare Quotes</TabsTrigger>
            </TabsList>
            <Button variant="outline" className="gap-2">
              <FileUp className="h-4 w-4" />
              Upload Quote
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{quote.orderId}</TableCell>
                        <TableCell>{quote.vendor}</TableCell>
                        <TableCell>{quote.items.length}</TableCell>
                        <TableCell>${quote.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(quote.status)}
                            <Badge variant="outline" className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{quote.receivedDate}</TableCell>
                        <TableCell>{quote.expiryDate}</TableCell>
                        <TableCell>
                          {quote.savings > 0 ? (
                            <div className="flex items-center text-green-600">
                              <TrendingDown className="h-4 w-4 mr-1" />${quote.savings.toFixed(2)}
                            </div>
                          ) : (
                            "$0.00"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              View
                            </Button>
                            {quote.status === "Pending Review" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search pending quotes..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotesData
                      .filter((quote) => quote.status === "Pending Review")
                      .map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.id}</TableCell>
                          <TableCell>{quote.orderId}</TableCell>
                          <TableCell>{quote.vendor}</TableCell>
                          <TableCell>{quote.items.length}</TableCell>
                          <TableCell>${quote.total.toFixed(2)}</TableCell>
                          <TableCell>{quote.receivedDate}</TableCell>
                          <TableCell>{quote.expiryDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quote Comparison</CardTitle>
                <CardDescription>Order ID: {quoteComparisonData.orderId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        {quoteComparisonData.vendors.map((vendor) => (
                          <TableHead key={vendor.name}>{vendor.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteComparisonData.items.map((item, index) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          {quoteComparisonData.vendors.map((vendor) => {
                            const price = vendor.prices[index]
                            const isLowest =
                              price === Math.min(...quoteComparisonData.vendors.map((v) => v.prices[index]))
                            return (
                              <TableCell
                                key={`${vendor.name}-${item.name}`}
                                className={isLowest ? "text-green-600 font-medium" : ""}
                              >
                                ${price.toFixed(2)}
                                {isLowest && (
                                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                    Best
                                  </Badge>
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={2} className="font-bold text-right">
                          Total
                        </TableCell>
                        {quoteComparisonData.vendors.map((vendor) => {
                          const isLowest = vendor.total === Math.min(...quoteComparisonData.vendors.map((v) => v.total))
                          return (
                            <TableCell
                              key={`${vendor.name}-total`}
                              className={isLowest ? "text-green-600 font-bold" : "font-bold"}
                            >
                              ${vendor.total.toFixed(2)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium text-right">
                          Delivery Time
                        </TableCell>
                        {quoteComparisonData.vendors.map((vendor) => (
                          <TableCell key={`${vendor.name}-delivery`}>{vendor.delivery}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium text-right">
                          Payment Terms
                        </TableCell>
                        {quoteComparisonData.vendors.map((vendor) => (
                          <TableCell key={`${vendor.name}-payment`}>{vendor.paymentTerms}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-medium text-right">
                          Expiry Date
                        </TableCell>
                        {quoteComparisonData.vendors.map((vendor) => (
                          <TableCell key={`${vendor.name}-expiry`}>{vendor.expiryDate}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline">Request New Quotes</Button>
                  <Button>Accept Selected Quote</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quote Comparison</h1>
        <Tabs defaultValue="summary" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary View</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {mockQuotes.map((quote) => (
          <Card
            key={quote.vendor}
            className={`cursor-pointer transition-all ${
              selectedVendors.includes(quote.vendor)
                ? "border-primary shadow-lg"
                : "hover:border-primary/50"
            }`}
            onClick={() => toggleVendor(quote.vendor)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {quote.vendor}
                {selectedVendors.includes(quote.vendor) ? (
                  <CheckCircle2 className="text-primary" />
                ) : (
                  <XCircle className="text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">${quote.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span className="font-semibold">{quote.deliveryTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewMode === "summary" ? (
        <Card>
          <CardHeader>
            <CardTitle>Summary Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  {mockQuotes.map((quote) => (
                    <TableHead key={quote.vendor}>{quote.vendor}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuotes[0].items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {mockQuotes.map((quote) => {
                      const quoteItem = quote.items.find(
                        (i) => i.name === item.name
                      )
                      const isLowest = quoteItem?.price === getLowestPrice(item.name)
                      return (
                        <TableCell
                          key={quote.vendor}
                          className={isLowest ? "text-green-600" : ""}
                        >
                          ${quoteItem?.price.toFixed(2)}
                          {isLowest && (
                            <Badge variant="secondary" className="ml-2">
                              Lowest
                            </Badge>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Vendor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuotes.map((quote) =>
                  quote.items.map((item) => (
                    <TableRow key={`${quote.vendor}-${item.name}`}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${item.total.toFixed(2)}</TableCell>
                      <TableCell>{quote.vendor}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

