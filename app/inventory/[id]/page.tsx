"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpDown,
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  FileText,
  ExternalLink,
  Search,
  LineChart,
  Loader2,
} from "lucide-react"
import { getInventoryItem, type InventoryItem } from "@/data/inventory-data"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Add MarketTrend type
type MarketTrend = {
  title: string
  description: string
  confidence: number
}

type MarketIntelligence = {
  product_category: string
  trends: MarketTrend[]
  supply_chain_status: string
  price_forecast: string
  key_manufacturers: string[]
  last_updated: string
}

// Add type definition at the top of the file
type Alternative = {
  vendor: string
  name: string
  productName: string
  sku: string
  pricePerUnit: number
  price: number
  savings: number
  shipping: string
  manufacturer: string
  compliance: string
  isSelected: boolean
  url: string
  image: string | null
}

export default function InventoryItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Alternative[]>([])
  const [searchData, setSearchData] = useState<{ summary: string; total_products: number; price_range: string } | null>(null)
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isResearchingMarket, setIsResearchingMarket] = useState(false)
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null)

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await getInventoryItem(id)
        setItem(data)
      } catch (error) {
        console.error('Failed to load item:', error)
        toast.error('Failed to load inventory item')
      } finally {
        setIsLoading(false)
      }
    }
    loadItem()
  }, [id])

  const handleFindAlternatives = async () => {
    if (!item) return

    setIsSearching(true)
    try {
      const searchResponse = await fetch('http://localhost:5001/api/run_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: item.name,
          websites: [
            "heymedsupply.com",
            "mfimedical.com"
          ]
        })
      })

      if (!searchResponse.ok) {
        throw new Error('Failed to run search')
      }

      const searchData = await searchResponse.json()
      
      // Store the formatter agent's response
      setSearchData({
        summary: searchData.summary,
        total_products: searchData.total_products,
        price_range: searchData.price_range
      })
      
      // Transform the search results into the format we need
      const alternatives: Alternative[] = (searchData.products || []).map((product: any) => ({
        vendor: product.website,
        name: product.name,
        productName: product.name,
        sku: product.sku || "--",
        pricePerUnit: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
        price: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
        savings: 0, // Will calculate after mapping
        shipping: product.delivery || "--",
        manufacturer: product.manufacturer || "--",
        compliance: "Pending",
        isSelected: false,
        url: product.url || "#",
        image: product.image_url
      }))

      // Calculate savings after mapping prices
      const currentPrice = item.unitPrice || 0
      alternatives.forEach((alt: Alternative) => {
        alt.savings = currentPrice - alt.price
      })

      setSearchResults(alternatives)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleMarketResearch = async () => {
    setIsResearchingMarket(true)
    try {
      const response = await fetch('/api/market_intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: item?.name,
          category: item?.category,
          vendor: item?.vendor,
          manufacturer: item?.manufacturer,
          current_price: item?.unitPrice,
          sku: item?.sku
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch market intelligence')
      }

      const data = await response.json()
      setMarketIntelligence(data)
      toast.success('Market research completed')
    } catch (error) {
      console.error('Market research error:', error)
      toast.error('Failed to fetch market intelligence')
    } finally {
      setIsResearchingMarket(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!item) {
    return <div>Item not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{item.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product description moved to the left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
                  <img
                    src="https://trimbio.co.uk/media/catalog/product/cache/bc308f1575223bb891fda519f72e61ef/p/p/pp170.jpg"
                    alt={item.name}
                    className="max-w-full max-h-[200px] object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p>{item.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Purchase Price</p>
                      <p>${item.lastPurchasePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit Price</p>
                      <p>${item.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">
                      This product is essential for surgical procedures. We typically maintain a minimum stock level of
                      25 units. The current supplier has been reliable with consistent quality.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="vendors">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="feedback">Feedback (2)</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="vendors" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier</p>
                      <p className="font-medium">{item.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">John Smith, Account Manager</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{item.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reorder Point</p>
                      <p className="font-medium">25 units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                      <p className="font-medium">{item.requiredUnits} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">2 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Alternative Vendors</CardTitle>
                  <Button 
                    className="gap-2"
                    onClick={handleFindAlternatives}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4" />
                    {isSearching ? 'Searching...' : 'Find Alternatives'}
                  </Button>
                </CardHeader>

                {/* AI Recommendation Card */}
                <div className="px-6 pb-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                    <div className="mt-1">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">AMS AI Recommendation</p>
                      <p className="text-sm text-blue-800">
                        {!isSearching && searchResults.length === 0
                          ? "I can help you find better alternatives for this product. Click 'Find Alternatives' to search across our vendor network and compare prices."
                          : searchData?.summary || "Analyzing the search results and providing insights..."}
                      </p>
                      {searchResults.length > 0 && (
                        <div className="flex items-center gap-4 text-sm mt-2 text-blue-800">
                          <div>
                            <span className="opacity-75">Total Products:</span>{" "}
                            <span className="font-medium">{searchData?.total_products || 0}</span>
                          </div>
                          <div>
                            <span className="opacity-75">Price Range:</span>{" "}
                            <span className="font-medium">{searchData?.price_range || "N/A"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent>
                  {!isSearching && searchResults.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>Click "Find Alternatives" to search for alternative vendors.</p>
                    </div>
                  ) : isSearching ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-[200px] animate-pulse rounded bg-muted"></div>
                          <div className="h-3 w-[150px] animate-pulse rounded bg-muted"></div>
                        </div>
                      </div>
                      <div className="h-[100px] animate-pulse rounded-lg bg-muted"></div>
                      <div className="h-[100px] animate-pulse rounded-lg bg-muted"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-4 animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center">
                              <img
                                src={result.image || `/placeholder.svg?height=64&width=64`}
                                alt={result.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{result.name}</h4>
                                {result.savings > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Save ${result.savings.toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Price:</span> ${result.price.toFixed(2)}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Manufacturer:</span> {result.manufacturer}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">SKU:</span> {result.sku}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Shipping:</span> {result.shipping}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Vendor:</span> {result.vendor}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Compliance:</span>{" "}
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {result.compliance}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Button size="sm" className="bg-black text-white hover:bg-black/90">Create Order</Button>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Phone className="h-3 w-3" />
                                  Call
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="gap-1 ml-auto"
                                  asChild
                                >
                                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                    View Product
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="feedback" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Feedback from Doctors</h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Dr. Sarah Johnson",
                    department: "Surgery",
                    date: "2023-12-15",
                    rating: 4,
                    comment:
                      "Good quality product, but the packaging could be improved for easier access during procedures.",
                  },
                  {
                    name: "Dr. Michael Chen",
                    department: "Emergency Medicine",
                    date: "2023-11-30",
                    rating: 5,
                    comment: "Excellent product. Very reliable and consistent quality.",
                  },
                ].map((feedback, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{feedback.name}</h4>
                          <p className="text-sm text-muted-foreground">{feedback.department}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{feedback.date}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-4 h-4 rounded-full ${idx < feedback.rating ? "bg-amber-400" : "bg-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm">{feedback.comment}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="documents" className="pt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[
                      {
                        name: "Product Specification Sheet",
                        type: "PDF",
                        size: "1.2 MB",
                        date: "2023-10-15",
                      },
                      {
                        name: "Safety Data Sheet",
                        type: "PDF",
                        size: "850 KB",
                        date: "2023-09-22",
                      },
                      {
                        name: "Quality Certificate",
                        type: "PDF",
                        size: "1.5 MB",
                        date: "2023-11-05",
                      },
                    ].map((doc, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary p-2 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{doc.date}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Current Inventory and Market Trends moved to the right */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <span className="font-medium">
                    {item.currentStock}/{item.totalStock}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      (item.currentStock / item.totalStock) * 100 < 30
                        ? "bg-red-500"
                        : (item.currentStock / item.totalStock) * 100 < 70
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${(item.currentStock / item.totalStock) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      item.status === "Stock"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Low"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires In:</span>
                  <span>{item.expiresIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>Storage Room B, Shelf 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>2 days ago</span>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  <Button className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Reorder
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Transaction History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Market Trends & Alerts</CardTitle>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleMarketResearch}
                disabled={isResearchingMarket}
              >
                {isResearchingMarket ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <LineChart className="h-4 w-4" />
                    Research Market
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isResearchingMarket ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-[200px] animate-pulse rounded bg-muted"></div>
                        <div className="h-3 w-[150px] animate-pulse rounded bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-[100px] animate-pulse rounded-lg bg-muted"></div>
                    <div className="h-[100px] animate-pulse rounded-lg bg-muted"></div>
                    <div className="h-[100px] animate-pulse rounded-lg bg-muted"></div>
                  </div>
                ) : !marketIntelligence ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Click the Research Market button to analyze current market trends and conditions.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <h4 className="font-medium text-orange-900">Supply Chain Status</h4>
                      </div>
                      <p className="text-sm text-orange-800">{marketIntelligence.supply_chain_status}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <LineChart className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Price Forecast</h4>
                      </div>
                      <p className="text-sm text-blue-800">{marketIntelligence.price_forecast}</p>
                    </div>

                    {marketIntelligence.trends.map((trend, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          trend.confidence > 0.7 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <h4 className="font-medium mb-2">{trend.title}</h4>
                        <p className="text-sm">{trend.description}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Confidence: {(trend.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Key Manufacturers</h4>
                      <div className="flex flex-wrap gap-2">
                        {marketIntelligence.key_manufacturers.map((manufacturer, i) => (
                          <Badge key={i} variant="secondary">
                            {manufacturer}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-4">
                      Last updated: {marketIntelligence.last_updated}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

