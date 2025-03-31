"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileUp, Loader2, Plus, Search, Trash2, TrendingDown, BookOpen, RefreshCw, ExternalLink, Sparkles, Star, StarHalf, MessageSquare, Mail, ChevronDown, Send } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { InventorySearch } from "../../../components/inventory-search"
import { cn } from "@/lib/utils"

interface ActionPlan {
  action_type: string;
  description: string;
  query: string;
  websites: string[];
  specific_requirements?: Record<string, any>;
}

interface Message {
  role: 'user' | 'assistant' | 'plan' | 'results';
  content: string;
  timestamp: Date;
  plan?: ActionPlan;
  results?: any;
}

export default function AlternativeCreateOrderPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you with your order. You can ask me questions about products, vendors, or get recommendations for alternatives.',
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<ActionPlan | null>(null)
  const [isExecutingPlan, setIsExecutingPlan] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [loadingAlternatives, setLoadingAlternatives] = useState<{ [key: string]: boolean }>({})
  const [alternativeVendors, setAlternativeVendors] = useState<{ [key: string]: any[] }>({})
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
      
      // Log the raw search results
      console.log('Raw search results:', JSON.stringify(searchData, null, 2))
      
      // Transform the search results into the format we need
      const alternatives = searchData.products.map((product: any) => {
        // Log each product's image data
        console.log(`Product: ${product.name}`, {
          images: product.images,
          rawProduct: product
        })
        
        return {
          name: product.website,
          productName: product.name,
          price: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
          savings: null,
          delivery: product.delivery || "--",
          packaging: product.packaging || "--",
          isSelected: false,
          url: product.url,
          images: product.images || [] // Include the images array from the search results
        }
      })

      // Log the transformed alternatives
      console.log('Transformed alternatives:', JSON.stringify(alternatives, null, 2))

      // Calculate savings after mapping prices
      const currentPrice = selectedItems.find(item => item.id === itemId)?.unitPrice || 0
      alternatives.forEach((alt: any) => {
        alt.savings = alt.price ? (currentPrice - alt.price) : null
      })

      setAlternativeVendors(prev => ({
        ...prev,
        [itemId]: alternatives
      }))

    } catch (error) {
      console.error('Error finding alternatives:', error)
    } finally {
      setLoadingAlternatives(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    try {
      // Get action plan from chat agent
      const planResponse = await fetch('http://localhost:5001/api/chat/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content })
      })

      if (!planResponse.ok) {
        throw new Error('Failed to create action plan')
      }

      const planData = await planResponse.json()
      const plan = planData.plan

      // Add plan message
      const planMessage: Message = {
        role: 'plan',
        content: `I suggest the following action plan:\n\n${plan.description}\n\nI will search on these websites:\n${plan.websites.join('\n')}\n\nWould you like me to proceed with this plan?`,
        timestamp: new Date(),
        plan: plan
      }

      setMessages(prev => [...prev, planMessage])
      setCurrentPlan(plan)

      // Create a placeholder item for the search
      const placeholderItem = {
        id: `search-${Date.now()}`,
        name: plan.query || "Searching for items...",
        sku: "Searching...",
        category: "Searching...",
        unitPrice: 0,
        quantity: 1,
        vendor: "Searching vendors...",
        image: null,
        status: null,
        selectedVendor: null,
        isSearching: true,
        websites: plan.websites
      }

      // Add the placeholder item to selected items and expand it
      setSelectedItems(prev => [...prev, placeholderItem])
      setExpandedItems(prev => ({
        ...prev,
        [placeholderItem.id]: true // Automatically expand the new item
      }))
      setLoadingAlternatives(prev => ({
        ...prev,
        [placeholderItem.id]: true // Set loading state for alternatives
      }))
      
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsTyping(false)
  }

  const handleConfirmPlan = async () => {
    if (!currentPlan) return

    setIsExecutingPlan(true)
    setIsTyping(true)

    try {
      // Execute the plan
      const executeResponse = await fetch('http://localhost:5001/api/chat/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: currentPlan })
      })

      if (!executeResponse.ok) {
        throw new Error('Failed to execute plan')
      }

      const results = await executeResponse.json()

      // Add results message
      const resultsMessage: Message = {
        role: 'results',
        content: `Here are the results:\n\n${results.results.summary}\n\nFound ${results.results.total_products} products\nPrice range: ${results.results.price_range}`,
        timestamp: new Date(),
        results: results.results
      }

      setMessages(prev => [...prev, resultsMessage])

      // Find the searching item
      const searchingItemIndex = selectedItems.findIndex(item => item.isSearching)
      if (searchingItemIndex !== -1 && results.results.products && results.results.products.length > 0) {
        const searchingItem = selectedItems[searchingItemIndex]
        const product = results.results.products[0] // Use the first product as the main item

        // Update the item with real data
        const updatedItem = {
          ...searchingItem,
          name: product.name,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          unitPrice: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
          vendor: product.website,
          image: product.image_url,
          status: null,
          isSearching: false,
          selectedVendor: {
            name: product.website,
            price: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
            delivery: product.delivery || "3-5 days",
            compliance: "Pending Review",
          }
        }

        // Update selected items
        setSelectedItems(prev => [
          ...prev.slice(0, searchingItemIndex),
          updatedItem,
          ...prev.slice(searchingItemIndex + 1)
        ])

        // Update alternative vendors
        const alternatives = results.results.products.map((alt: any) => ({
          name: alt.website,
          productName: alt.name,
          price: parseFloat(alt.price?.replace(/[^0-9.]/g, '') || '0'),
          savings: parseFloat(alt.price?.replace(/[^0-9.]/g, '') || '0') < parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0') 
            ? parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0') - parseFloat(alt.price?.replace(/[^0-9.]/g, '') || '0')
            : null,
          delivery: alt.delivery || "--",
          packaging: alt.packaging || "--",
          isSelected: false,
          url: alt.url,
          image_url: alt.image_url,
          images: alt.images || []
        }))

        setAlternativeVendors(prev => ({
          ...prev,
          [searchingItem.id]: alternatives
        }))

        // Turn off loading state
        setLoadingAlternatives(prev => ({
          ...prev,
          [searchingItem.id]: false
        }))
      }
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while executing the plan. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsExecutingPlan(false)
    setIsTyping(false)
    setCurrentPlan(null)
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
            {(item.websites || ["Loading vendors..."]).map((website: string, i: number) => (
              <Card key={i} className="overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute inset-0 bg-blue-50/50" />
                <CardContent className="p-4 relative">
                  <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,auto] gap-6 items-center">
                    <div>
                      <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                    </div>
                    <div className="w-12 h-12 rounded bg-gray-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="text-sm text-muted-foreground">{website}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    // Return the existing vendor options section for non-searching items
    return (
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
            Find Alternatives
          </Button>
        </div>

        <div className="space-y-3">
          {/* All Products */}
          {alternativeVendors[item.id]?.map((vendor, index) => (
            <Card 
              key={`${vendor.name}-${index}`} 
              className="overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,auto] gap-6 items-center">
                  <div>
                    <input
                      type="checkbox"
                      checked={index === 0}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
                    />
                  </div>
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                    {vendor.images?.[0]?.url ? (
                      <img
                        src={vendor.images[0].url}
                        alt={vendor.productName}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.error(`Failed to load image: ${vendor.images[0].url}`);
                          e.currentTarget.src = '/placeholder.svg?height=48&width=48';
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.svg?height=48&width=48"
                        alt="No image available"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{vendor.productName}</div>
                    <div className="text-sm text-muted-foreground">{vendor.name}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Price</div>
                    <div className="font-medium">${vendor.price.toFixed(2)}</div>
                    {vendor.savings > 0 && (
                      <div className="flex items-center text-green-600 text-xs mt-1">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Save ${vendor.savings.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Delivery</div>
                    <div className="font-medium">{vendor.delivery}</div>
                    <Badge variant="outline" className="mt-1">
                      {index === 0 ? "Selected" : "Alternative"}
                    </Badge>
                  </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Main Order Creation Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Create Order</h1>
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
              <InventorySearch 
                onItemSelect={addItemToOrder}
                selectedItems={selectedItems}
              />

              {/* Selected Items */}
              {selectedItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "overflow-hidden",
                    item.isSearching && "animate-in fade-in slide-in-from-top-4 duration-500"
                  )}
                >
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

                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center -ml-3">
                          {item.isSearching ? (
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                          ) : (
                            <img
                              src={item.image || `/placeholder.svg?height=48&width=48`}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          )}
                        </div>

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
                            {item.isSearching && (
                              <Badge variant="secondary" className="animate-pulse">
                                Searching...
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-x-2">
                            <span>SKU: {item.sku}</span>
                            <span>•</span>
                            <span>Category: {item.category}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="text-muted-foreground">Unit Price</div>
                          <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
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
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItemFromOrder(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Vendor Options Section */}
                      <AnimatePresence>
                        {expandedItems[item.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {renderVendorOptions(item)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Order Summary */}
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
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-[400px] border-l flex flex-col h-full">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Get help with your order</p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'plan'
                    ? 'bg-blue-50 border border-blue-200'
                    : message.role === 'results'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'plan' ? (
                  <div className="space-y-3">
                    <div className="pl-1">
                      <h4 className="font-medium text-gray-800">Action Plan</h4>
                    </div>
                    <div className="pl-1 space-y-2">
                      <p className="text-sm text-gray-800">
                        I will search for <span className="font-semibold">{message.plan?.query}</span>
                      </p>
                      <div className="text-sm text-gray-700">{message.plan?.description}</div>
                      <div className="space-y-1 mt-3">
                        <p className="text-sm font-medium text-gray-800">Target Websites:</p>
                        <div className="space-y-1">
                          {message.plan?.websites.map((website, idx) => (
                            <div key={website} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                              <span>{website}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={handleConfirmPlan}
                        disabled={isExecutingPlan}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {isExecutingPlan ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Searching...
                          </>
                        ) : (
                          'Proceed'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              className="self-end"
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 