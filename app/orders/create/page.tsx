"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileUp, Loader2, Plus, Search, Trash2, TrendingDown, BookOpen, RefreshCw, ExternalLink, Sparkles, Star, StarHalf, MessageSquare, Mail, ChevronDown, MessageSquareText } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface Feedback {
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Vendor {
  name: string;
  productName: string;
  price: number | null;
  savings: number | null;
  delivery: string;
  packaging: string;
  isSelected: boolean;
  url: string;
  image_url?: string;
}

interface SelectedVendorAction {
  itemId: string;
  vendorId: string;
  vendor: Vendor;
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loadingAlternatives, setLoadingAlternatives] = useState<{ [key: string]: boolean }>({})
  const [alternativeVendors, setAlternativeVendors] = useState<{ [key: string]: any[] }>({})
  const [plannedWebsites, setPlannedWebsites] = useState<string[]>([])
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([])
  const [showWebsiteSelector, setShowWebsiteSelector] = useState<{ [key: string]: boolean }>({})
  const [selectedVendors, setSelectedVendors] = useState<{ [key: string]: string[] }>({})
  const [aiRecommendations, setAiRecommendations] = useState<{ [key: string]: string }>({})
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>({})
  const [productFeedback] = useState<{ [key: string]: Feedback[] }>({
    'default-feedback': [
      { doctorName: "Dr. Smith", rating: 4.5, comment: "Excellent quality, would recommend", date: "2024-03-15" },
      { doctorName: "Dr. Johnson", rating: 5, comment: "Best in class, very reliable", date: "2024-03-14" },
      { doctorName: "Dr. Williams", rating: 4, comment: "Good product, slight delay in delivery", date: "2024-03-13" }
    ]
  })
  const [selectedVendorActions, setSelectedVendorActions] = useState<SelectedVendorAction[]>([])
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})

  const filteredItems = inventoryData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 800)
  }

  const addItemToOrder = (item: any) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems([
        ...selectedItems,
        {
          ...item,
          quantity: 1,
          selectedVendor: {
            name: item.vendor,
            price: item.unitPrice,
            delivery: "3-5 days",
            compliance: "Approved",
          },
        },
      ])
      // Clear search query and close suggestions
      setSearchQuery("")

      // Add immediate AI recommendation
      setAiRecommendations(prev => ({
        ...prev,
        [item.id]: "I can help you find better alternatives for this product. Click 'Find Alternatives' to search across our vendor network and compare prices."
      }))
    }
  }

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.selectedVendor?.price || 0) * item.quantity, 0)
  }

  const handleVendorSelect = (itemId: string, vendorId: string, vendor: Vendor) => {
    setSelectedVendors(prev => {
      const current = prev[itemId] || []
      const updated = current.includes(vendorId)
        ? current.filter(v => v !== vendorId)
        : [...current, vendorId]
      
      // Update selected vendor actions
      if (!current.includes(vendorId)) {
        setSelectedVendorActions(prev => [...prev, { itemId, vendorId, vendor }])
      } else {
        setSelectedVendorActions(prev => prev.filter(action => action.vendorId !== vendorId))
      }
      
      return { ...prev, [itemId]: updated }
    })
  }

  const handleFindAlternatives = async (itemId: string) => {
    try {
      setLoadingAlternatives(prev => ({ ...prev, [itemId]: true }))
      
      const searchResponse = await fetch('http://localhost:5001/api/run_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedItems.find(item => item.id === itemId)?.name || "",
          websites: [
            "heymedsupply.com",
            "mfimedical.com"
          ]
        })
      })

      if (!searchResponse.ok) {
        throw new Error('Failed to search for alternatives')
      }

      const searchData = await searchResponse.json()
      
      // Transform the search results into the format we need
      const alternatives = searchData.products.map((product: any) => ({
        name: product.website,
        productName: product.name,
        price: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
        savings: null, // Will calculate after mapping
        delivery: product.delivery || "--",
        packaging: product.packaging || "--",
        isSelected: false,
        url: product.url,
        image_url: product.image_url
      }))

      // Calculate savings after mapping prices
      const currentPrice = selectedItems.find(item => item.id === itemId)?.unitPrice || 0
      alternatives.forEach((alt: Vendor) => {
        alt.savings = alt.price ? (currentPrice - alt.price) : null
      })

      setAlternativeVendors(prev => ({
        ...prev,
        [itemId]: alternatives
      }))

      // Set AI recommendation with summary and price comparison
      setAiRecommendations(prev => ({
        ...prev,
        [itemId]: searchData.summary + "\n\n" + (alternatives.length > 0 ? generatePriceComparison(currentPrice, alternatives) : "")
      }))
    } catch (error) {
      console.error('Error finding alternatives:', error)
    } finally {
      setLoadingAlternatives(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const generatePriceComparison = (currentPrice: number, alternatives: Vendor[]) => {
    const bestPrice = Math.min(...alternatives.map(v => v.price || Infinity))
    const bestSavings = currentPrice - bestPrice
    
    if (bestSavings > 0) {
      const bestVendor = alternatives.find(v => v.price === bestPrice)
      return `The best price is $${bestPrice.toFixed(2)} from ${bestVendor?.name}, which saves you $${bestSavings.toFixed(2)} per unit.`
    }
    return "The current price appears to be competitive. Consider bulk ordering for better rates."
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  const handleGenerateRFQ = () => {
    const selectedProducts = selectedVendorActions.map(action => ({
      name: action.vendor.productName,
      vendor: action.vendor.name,
      price: action.vendor.price,
      packaging: action.vendor.packaging
    }))
    
    // Here you would implement the RFQ generation logic
    console.log("Generating RFQ for:", selectedProducts)
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const renderVendorOptions = (item: any) => {
    if (loadingAlternatives[item.id]) {
      return (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-medium">Vendor Options</h5>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding Alternatives...
            </Button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <Card key={i} className="overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute inset-0 bg-blue-50/50" />
                <CardContent className="p-4 relative">
                  <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,auto] gap-6 items-center">
                    <div>
                      <div className="h-4 w-4 rounded bg-blue-100 animate-pulse" />
                    </div>
                    <div className="w-12 h-12 rounded bg-blue-100 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-blue-100 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-blue-100 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-blue-100 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/4 bg-blue-100 rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-blue-100 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/4 bg-blue-100 rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-blue-100 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-16 bg-blue-100 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Create Order</h1>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push('/orders/create/alternative')}
        >
          <MessageSquareText className="h-4 w-4" />
          Open AI Assistant View
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Add Items to Order</CardTitle>
              <CardDescription>Search for items or add them manually</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Catalogue
              </Button>
              <Button variant="outline" className="gap-2">
                <FileUp className="h-4 w-4" />
                Upload File
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or category..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6 text-base">Search</Button>
          </div>

          {searchQuery && (
            <div className="border rounded-md">
              {isSearching ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="divide-y">
                  {filteredItems.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-[auto,2fr,1fr,1fr,auto] items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => addItemToOrder(item)}
                    >
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <img
                          src={item.image || `/placeholder.svg?height=40&width=40`}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge 
                            variant={item.status === "Urgent" ? "destructive" : item.status === "Low" ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">{item.currentStock}/{item.totalStock}</div>
                        <div className="text-muted-foreground">in stock</div>
                      </div>

                      <div>
                        <div className="font-medium">{item.vendor}</div>
                        <div className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} per unit</div>
                      </div>

                      <Button
                        size="sm"
                        disabled={selectedItems.some((i) => i.id === item.id)}
                      >
                        {selectedItems.some((i) => i.id === item.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No items found. Try a different search term.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Items and Selected Items Sections */}
      {!searchQuery && (
        <div className="space-y-4">
          {/* Selected Items Section */}
          {selectedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Selected Items</h3>
                <Badge variant="secondary" className="ml-2">{selectedItems.length}</Badge>
              </div>
              {selectedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      {/* Product Information - Full Width Layout */}
                      <div className="grid grid-cols-[auto,auto,2fr,1fr,auto] gap-6 items-center">
                        {/* Chevron Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -ml-1 hover:bg-transparent"
                          onClick={() => toggleItemExpansion(item.id)}
                        >
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedItems[item.id] ? 'rotate-0' : '-rotate-90'
                            }`}
                          />
                        </Button>

                        {/* Image */}
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center -ml-3">
                          <img
                            src={item.image || `/placeholder.svg?height=48&width=48`}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* Product Details */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.status && (
                              <Badge 
                                variant={item.status === "Urgent" ? "destructive" : item.status === "Low" ? "secondary" : "default"}
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-x-2">
                            <span>SKU: {item.sku}</span>
                            <span>•</span>
                            <span>Category: {item.category}</span>
                          </div>
                          <div 
                            className="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-80"
                            onClick={() => setShowFeedback(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                          >
                            <div className="flex">{renderStars(4.5)}</div>
                            <span className="text-sm text-blue-600 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              View Feedback
                            </span>
                          </div>
                        </div>

                        {/* Stock and Price */}
                        <div className="flex items-center gap-6">
                          <div className="text-sm">
                            <div className="text-muted-foreground">In Stock</div>
                            <div className="font-medium">{item.currentStock}/{item.totalStock}</div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">Unit Price</div>
                            <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.id, Math.max(1, item.quantity - 1)); }}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, Number(e.target.value) || 1)}
                              className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.id, item.quantity + 1); }}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => { e.stopPropagation(); removeItemFromOrder(item.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Vendor Options Section */}
                      <div className="mt-4 pt-4">
                        <AnimatePresence>
                          {expandedItems[item.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-medium">Vendor Options</h5>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => handleFindAlternatives(item.id)}
                                    disabled={loadingAlternatives[item.id]}
                                  >
                                    {loadingAlternatives[item.id] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                    {loadingAlternatives[item.id] ? 'Finding Alternatives...' : 'Find Alternatives'}
                                  </Button>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                {/* Loading State */}
                                {loadingAlternatives[item.id] ? (
                                  <div className="space-y-3">
                                    {[1, 2, 3].map((_, i) => (
                                      <Card key={i} className="overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="absolute inset-0 bg-blue-50/50" />
                                        <CardContent className="p-4 relative">
                                          <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,auto] gap-6 items-center">
                                            <div>
                                              <div className="h-4 w-4 rounded bg-blue-100 animate-pulse" />
                                            </div>
                                            <div className="w-12 h-12 rounded bg-blue-100 animate-pulse" />
                                            <div className="space-y-2">
                                              <div className="h-4 w-3/4 bg-blue-100 rounded animate-pulse" />
                                              <div className="h-3 w-1/2 bg-blue-100 rounded animate-pulse" />
                                              <div className="h-3 w-1/3 bg-blue-100 rounded animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                              <div className="h-3 w-1/4 bg-blue-100 rounded animate-pulse" />
                                              <div className="h-4 w-1/3 bg-blue-100 rounded animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                              <div className="h-3 w-1/4 bg-blue-100 rounded animate-pulse" />
                                              <div className="h-4 w-1/3 bg-blue-100 rounded animate-pulse" />
                                            </div>
                                            <div className="h-8 w-16 bg-blue-100 rounded animate-pulse" />
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    {/* AI Recommendation Box */}
                                    {aiRecommendations[item.id] && (
                                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                          <div className="p-1 bg-blue-100 rounded-full">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                          </div>
                                          <div>
                                            {aiRecommendations[item.id].split('\n\n').map((paragraph, index) => (
                                              <p key={index} className={`text-sm text-blue-900 ${index > 0 ? 'mt-2' : ''}`}>{paragraph}</p>
                                            ))}
                                            <p className="text-xs text-blue-600 mt-1">AMS AI Recommendation</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Vendor Options Cards */}
                                    <div className="space-y-3">
                                      {[
                                        {
                                          name: item.vendor,
                                          productName: item.name,
                                          sku: item.sku,
                                          price: item.unitPrice || 0,
                                          savings: 0,
                                          packaging: item.packaging || "--",
                                          isSelected: true,
                                          url: "#",
                                          compliance: "Approved",
                                          image_url: item.image,
                                          delivery: "2-3 days"
                                        },
                                        ...(alternativeVendors[item.id] || [])
                                      ].map((vendor, i) => (
                                        <Card key={`${vendor.name}-${vendor.productName}`} className={`overflow-hidden ${i > 0 ? "animate-in fade-in slide-in-from-top-4 duration-500" : ""}`}>
                                          <CardContent className="p-4">
                                            <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,auto] gap-6 items-center">
                                              {/* Checkbox */}
                                              <div>
                                                <input
                                                  type="checkbox"
                                                  checked={selectedVendors[item.id]?.includes(`${vendor.name}-${vendor.productName}`) || vendor.isSelected}
                                                  onChange={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleVendorSelect(item.id, `${vendor.name}-${vendor.productName}`, vendor); 
                                                  }}
                                                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
                                                />
                                              </div>

                                              {/* Product Image */}
                                              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                                <img
                                                  src={vendor.image_url || `/placeholder.svg?height=48&width=48`}
                                                  alt={vendor.productName}
                                                  className="max-w-full max-h-full object-contain"
                                                />
                                              </div>

                                              {/* Product Details */}
                                              <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h4 className="font-medium">{vendor.productName}</h4>
                                                  {vendor.isSelected && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                      Current
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="text-sm text-muted-foreground space-x-2">
                                                  <span>SKU: {vendor.sku || "--"}</span>
                                                  <span>•</span>
                                                  <span>Vendor: {vendor.name}</span>
                                                </div>
                                              </div>

                                              {/* Price and Savings */}
                                              <div className="text-sm">
                                                <div className="text-muted-foreground">Price</div>
                                                <div className="font-medium">
                                                  {vendor.price !== null ? `$${vendor.price.toFixed(2)}` : "Contact for pricing"}
                                                </div>
                                                {vendor.savings !== null && vendor.savings > 0 && (
                                                  <div className="flex items-center text-green-600 text-xs mt-1">
                                                    <TrendingDown className="h-3 w-3 mr-1" />
                                                    Save ${vendor.savings.toFixed(2)}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Delivery and Compliance */}
                                              <div className="text-sm">
                                                <div className="text-muted-foreground">Delivery</div>
                                                <div className="font-medium">{vendor.delivery}</div>
                                                <div className="flex items-center gap-1 mt-1">
                                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    {vendor.compliance || "Approved"}
                                                  </Badge>
                                                </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="gap-1"
                                                  asChild
                                                >
                                                  <a href={vendor.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                    View
                                                  </a>
                                                </Button>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Suggested Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Urgent Items */}
            {inventoryData
              .filter(item => item.status === "Urgent")
              .slice(0, 3)
              .map(item => (
                <Card key={item.id} className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addItemToOrder(item)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <img
                          src={item.image || `/placeholder.svg?height=48&width=48`}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <div>SKU: {item.sku}</div>
                          <div>Stock: {item.currentStock}/{item.totalStock}</div>
                        </div>
                        <div className="text-sm font-medium">${item.unitPrice.toFixed(2)} per unit</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Low Stock Items */}
            {inventoryData
              .filter(item => item.status === "Low")
              .slice(0, 3)
              .map(item => (
                <Card key={item.id} className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addItemToOrder(item)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <img
                          src={item.image || `/placeholder.svg?height=48&width=48`}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <Badge variant="secondary" className="text-xs">Low Stock</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <div>SKU: {item.sku}</div>
                          <div>Stock: {item.currentStock}/{item.totalStock}</div>
                        </div>
                        <div className="text-sm font-medium">${item.unitPrice.toFixed(2)} per unit</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* In Stock Items */}
            {inventoryData
              .filter(item => item.status === "Stock")
              .slice(0, 3)
              .map(item => (
                <Card key={item.id} className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addItemToOrder(item)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <img
                          src={item.image || `/placeholder.svg?height=48&width=48`}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <Badge variant="default" className="text-xs">In Stock</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <div>SKU: {item.sku}</div>
                          <div>Stock: {item.currentStock}/{item.totalStock}</div>
                        </div>
                        <div className="text-sm font-medium">${item.unitPrice.toFixed(2)} per unit</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <Card>
          <CardHeader className="border-t">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.selectedVendor?.price.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-right">
                      ${((item.selectedVendor?.price || 0) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-bold text-right">
                    Total
                  </TableCell>
                  <TableCell className="font-bold text-right">${calculateTotal().toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Create Request for Quote</Button>
          </CardFooter>
        </Card>
      )}

      <AnimatePresence>
        {selectedVendorActions.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50"
          >
            <div className="container max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedVendorActions.length} vendor{selectedVendorActions.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex -space-x-2">
                  {selectedVendorActions.slice(0, 3).map((action, i) => (
                    <div 
                      key={action.vendorId}
                      className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                      style={{ zIndex: 3 - i }}
                    >
                      <span className="text-xs font-medium text-blue-700">
                        {action.vendor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {selectedVendorActions.length > 3 && (
                    <div 
                      className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
                      style={{ zIndex: 0 }}
                    >
                      <span className="text-xs font-medium text-gray-600">
                        +{selectedVendorActions.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVendorActions([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Vendors
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleGenerateRFQ}
                >
                  <FileUp className="h-4 w-4" />
                  Generate RFQ
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

