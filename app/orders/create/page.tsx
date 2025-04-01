"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileUp, Loader2, Plus, Search, Trash2, TrendingDown, BookOpen, RefreshCw, ExternalLink, Sparkles, Star, StarHalf, MessageSquare, Mail, ChevronDown, MessageSquareText, X, Check, Shield, ShieldCheck, TrendingUp, Activity, Package, Bot, Store, Clock, BarChart, HeartPulse } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

interface Feedback {
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
  role?: string;
}

interface ClinicalOutcomes {
  successRate: number;
  complications: number;
  patientSatisfaction: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  totalStock: number;
  unitPrice: number;
  vendor: string;
  status: string;
  image?: string;
  quantity?: number;
  selectedVendor?: Vendor;
  expirationDate?: string;
  lotNumber?: string;
  storageRequirements?: string[];
  department?: string;
  clinicalSpecialty?: string;
  lastOrderDate?: string;
  usageFrequency?: number;
  clinicalOutcomes?: ClinicalOutcomes;
  benchmarkData?: {
    averagePrice: number;
    marketShare: number;
    peerUsage: number;
    qualityScore: number;
  };
  regulatoryStatus?: string[];
}

interface DepartmentPatterns {
  [key: string]: string[];
}

interface SpecialtyPatterns {
  [key: string]: {
    [key: string]: {
      usage: string;
      outcomes: number;
    };
  };
}

interface PriceComparisons {
  [key: string]: {
    marketAverage: number;
    lowestPrice: number;
    highestPrice: number;
    percentile: number;
  };
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
  compliance?: string;
  regulatoryStatus?: string[];
  performanceMetrics?: {
    deliveryReliability: number;
    qualityConsistency: number;
    priceCompetitiveness: number;
    supportQuality: number;
  };
}

interface SelectedVendorAction {
  itemId: string;
  vendorId: string;
  vendor: Vendor;
}

interface RegulatoryStatus {
  status: string;
  icon?: React.ReactNode;
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
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
    'SG-M-100': [
      { doctorName: "Dr. Smith", rating: 4.5, comment: "Excellent quality, would recommend", date: "2024-03-15", role: "Physician" },
      { doctorName: "Dr. Johnson", rating: 5, comment: "Best in class, very reliable", date: "2024-03-14", role: "Surgeon" },
      { doctorName: "Dr. Williams", rating: 4, comment: "Good product, slight delay in delivery", date: "2024-03-13", role: "Nurse" },
      { doctorName: "Dr. Brown", rating: 3.5, comment: "Average quality, good for routine procedures", date: "2024-03-10", role: "Physician" },
      { doctorName: "Dr. Davis", rating: 4, comment: "Works well in our clinic setting", date: "2024-03-08", role: "Administrator" },
      { doctorName: "Dr. Miller", rating: 4.5, comment: "Excellent performance in surgery", date: "2024-03-05", role: "Surgeon" }
    ]
  })
  const [selectedVendorActions, setSelectedVendorActions] = useState<SelectedVendorAction[]>([])
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})
  const [itemsToCompare, setItemsToCompare] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [regulatoryStatus] = useState<{[key: string]: string[]}>({
    'default-regulatory': ['FDA Approved', 'HIPAA Compliant'],
    'IT-001': ['ISO 13485', 'CE Marked', 'FDA Approved'],
    'LAB-002': ['CLIA Waived', 'FDA Approved'],
    'SP-003': ['FDA Class II', 'Latex Free']
  })
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState<string>("All")
  const [departmentFilter, setDepartmentFilter] = useState<string>("All")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All")
  const [showBenchmarks, setShowBenchmarks] = useState<boolean>(false)
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([])
  
  const [usagePatterns] = useState<{
    departments: DepartmentPatterns;
    specialties: SpecialtyPatterns;
  }>({
    departments: {
      "Surgery": [
        "Surgical Gloves (Medium)",
        "Surgical Masks",
        "Surgical Gowns"
      ],
      "Emergency": [
        "IV Catheters 20G",
        "Surgical Gloves (Medium)",
        "Bandages"
      ],
      "ICU": [
        "IV Catheters 20G",
        "Surgical Gloves (Medium)",
        "Ventilator Circuits"
      ]
    },
    specialties: {
      "General Surgery": {
        "Surgical Gloves (Medium)": { usage: "Very High", outcomes: 4.8 },
        "Surgical Masks": { usage: "High", outcomes: 4.7 }
      },
      "Emergency Medicine": {
        "IV Catheters 20G": { usage: "High", outcomes: 4.6 },
        "Surgical Gloves (Medium)": { usage: "Medium", outcomes: 4.5 }
      },
      "Critical Care": {
        "IV Catheters 20G": { usage: "Very High", outcomes: 4.7 },
        "Surgical Gloves (Medium)": { usage: "High", outcomes: 4.6 }
      }
    }
  })

  const [benchmarkData] = useState<{
    priceComparisons: PriceComparisons;
    vendorPerformance: {
      [key: string]: {
        deliveryReliability: number;
        qualityConsistency: number;
        priceCompetitiveness: number;
        marketShare: number;
      };
    };
  }>({
    priceComparisons: {
      "Surgical Gloves (Medium)": {
        marketAverage: 0.25,
        lowestPrice: 0.20,
        highestPrice: 0.35,
        percentile: 85
      },
      "IV Catheters 20G": {
        marketAverage: 2.50,
        lowestPrice: 1.80,
        highestPrice: 3.20,
        percentile: 65
      }
    },
    vendorPerformance: {
      "MedSupply Co": {
        deliveryReliability: 98,
        qualityConsistency: 99,
        priceCompetitiveness: 92,
        marketShare: 35
      },
      "MedLine": {
        deliveryReliability: 95,
        qualityConsistency: 97,
        priceCompetitiveness: 88,
        marketShare: 28
      }
    }
  })

  const [mockAlternativeVendors] = useState<{ [key: string]: Vendor[] }>({
    'SG-M-100': [
      {
        name: "SafeMed Supply",
        productName: "Premium Surgical Gloves M",
        price: 0.22,
        savings: 0.01,
        delivery: "2-3 days",
        packaging: "100/box",
        isSelected: false,
        url: "https://safemedsupply.com/gloves",
        image_url: "/gloves-safemed.png",
        compliance: "FDA Approved",
        regulatoryStatus: ["FDA Approved", "HIPAA Compliant"],
        performanceMetrics: {
          deliveryReliability: 96,
          qualityConsistency: 98,
          priceCompetitiveness: 94,
          supportQuality: 92
        }
      },
      {
        name: "MediCore",
        productName: "Surgical Gloves Medium",
        price: 0.21,
        savings: 0.02,
        delivery: "3-5 days",
        packaging: "100/box",
        isSelected: false,
        url: "https://medicore.com/gloves",
        image_url: "/gloves-medicore.png",
        compliance: "FDA Approved",
        regulatoryStatus: ["FDA Approved", "HIPAA Compliant"],
        performanceMetrics: {
          deliveryReliability: 94,
          qualityConsistency: 95,
          priceCompetitiveness: 96,
          supportQuality: 90
        }
      }
    ],
    'IV-20G-50': [
      {
        name: "MedExpress",
        productName: "IV Catheter 20G Premium",
        price: 1.95,
        savings: 0.05,
        delivery: "Next Day",
        packaging: "50/box",
        isSelected: false,
        url: "https://medexpress.com/catheters",
        image_url: "/catheter-medexpress.png",
        compliance: "FDA Approved",
        regulatoryStatus: ["FDA Approved", "HIPAA Compliant", "ISO 13485"],
        performanceMetrics: {
          deliveryReliability: 98,
          qualityConsistency: 97,
          priceCompetitiveness: 93,
          supportQuality: 95
        }
      },
      {
        name: "HospitalSupply",
        productName: "20G IV Catheter",
        price: 1.90,
        savings: 0.10,
        delivery: "2-3 days",
        packaging: "50/box",
        isSelected: false,
        url: "https://hospitalsupply.com/catheters",
        image_url: "/catheter-hospitalsupply.png",
        compliance: "FDA Approved",
        regulatoryStatus: ["FDA Approved", "HIPAA Compliant"],
        performanceMetrics: {
          deliveryReliability: 95,
          qualityConsistency: 96,
          priceCompetitiveness: 98,
          supportQuality: 92
        }
      }
    ]
  })

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
    setSelectedItems(selectedItems.map((item) => 
      item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.selectedVendor?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
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
      setLoadingAlternatives(prev => ({ ...prev, [itemId]: true }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data instead of API call
      const alternatives = mockAlternativeVendors[itemId] || [];
      
      setAlternativeVendors(prev => ({
        ...prev,
        [itemId]: alternatives
      }));

      // Set AI recommendation
      const item = selectedItems.find(item => item.id === itemId);
      if (item) {
        const currentPrice = item.unitPrice;
        const bestPrice = Math.min(...alternatives.map((alt: Vendor) => alt.price || currentPrice));
        const savings = currentPrice - bestPrice;
        
        setAiRecommendations(prev => ({
          ...prev,
          [itemId]: `Found ${alternatives.length} alternative suppliers for ${item.name}. ${
            savings > 0 
              ? `Potential savings of up to $${savings.toFixed(2)} per unit identified.` 
              : "Current price appears competitive."
          } All alternatives meet required FDA and HIPAA compliance standards.`
        }));
      }
    } catch (error) {
      console.error('Error finding alternatives:', error);
    } finally {
      setLoadingAlternatives(prev => ({ ...prev, [itemId]: false }));
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

  const toggleItemComparison = (itemId: string) => {
    setItemsToCompare(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        // Limit comparison to max 3 items
        if (prev.length >= 3) {
          return [...prev.slice(1), itemId];
        }
        return [...prev, itemId];
      }
    });
  }

  const clearComparisonItems = () => {
    setItemsToCompare([]);
    setShowComparison(false);
  }

  const viewComparison = () => {
    if (itemsToCompare.length >= 2) {
      setShowComparison(true);
    }
  }

  const getFilteredFeedback = (itemSku: string) => {
    const feedback = productFeedback[itemSku] || productFeedback['SG-M-100'];
    if (feedbackRoleFilter === "All") {
      return feedback;
    }
    return feedback.filter(f => f.role === feedbackRoleFilter);
  }

  // Function to check for expiring items
  const checkExpiringItems = (items: InventoryItem[]) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return items.filter(item => {
      if (!item.expirationDate) return false;
      const expDate = new Date(item.expirationDate);
      return expDate <= thirtyDaysFromNow;
    });
  }

  // Function to get contextual recommendations
  const getContextualRecommendations = (item: InventoryItem): string[] => {
    const recommendations: string[] = [];
    
    // Stock-based recommendations
    const stockPercentage = (item.currentStock / item.totalStock) * 100;
    if (stockPercentage < 30) {
      recommendations.push(`Low stock alert: Consider ordering soon to maintain optimal inventory levels`);
    }

    // Usage-based recommendations
    if (item.usageFrequency && item.usageFrequency > 400) {
      recommendations.push(`High usage item: Consider bulk ordering for better pricing`);
    }

    // Expiration-based recommendations
    if (item.expirationDate) {
      const expirationDate = new Date(item.expirationDate);
      const monthsUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000));
      if (monthsUntilExpiration <= 3) {
        recommendations.push(`Product expires in ${monthsUntilExpiration} months: Consider adjusting order quantity`);
      }
    }

    return recommendations;
  };

  // Function to get benchmark insights
  const getBenchmarkInsights = (item: InventoryItem): string[] => {
    const insights: string[] = [];
    const priceData = benchmarkData.priceComparisons[item.name];
    
    if (priceData) {
      // Price comparison insights
      if (item.unitPrice < priceData.marketAverage) {
        const savingsPercent = ((priceData.marketAverage - item.unitPrice) / priceData.marketAverage * 100).toFixed(1);
        insights.push(`Current price is ${savingsPercent}% below market average`);
      }

      // Market position insights
      if (priceData.percentile < 25) {
        insights.push(`Excellent pricing: Lower than 75% of market prices`);
      } else if (priceData.percentile > 75) {
        insights.push(`Consider exploring alternative vendors for better pricing`);
      }
    }

    // Usage pattern insights
    const departmentUsage = Object.entries(usagePatterns.departments)
      .filter(([_, items]) => items.includes(item.name))
      .length;
    
    if (departmentUsage > 2) {
      insights.push(`High cross-department utilization: Consider centralized procurement`);
    }

    return insights;
  };

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
          {/* Selected Items Section - Refactored to Table */}
          {selectedItems.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Selected Items</h3>
                  <Badge variant="secondary" className="ml-2">{selectedItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead> {/* Expand */}
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="w-[150px] text-center">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]">Action</TableHead> {/* Remove */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <React.Fragment key={item.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleItemExpansion(item.id)}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  expandedItems[item.id] ? 'rotate-0' : '-rotate-90'
                                }`}
                              />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <img
                                  src={item.image || `/placeholder.svg?height=40&width=40`}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {/* Display regulatory badges */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(regulatoryStatus[item.id] || regulatoryStatus['default-regulatory']).map((status: string, idx: number) => (
                                    <Badge 
                                      key={idx} 
                                      variant="outline" 
                                      className="text-[10px] h-4 px-1.5 bg-green-50 text-green-800 border-green-200 flex items-center gap-0.5"
                                    >
                                      <ShieldCheck className="h-2.5 w-2.5" />
                                      {status}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 text-xs text-blue-600"
                                    onClick={(e) => { e.stopPropagation(); setShowFeedback(prev => ({ ...prev, [item.id]: !prev[item.id] }))}}
                                  >
                                    <div className="flex">{renderStars(4.5)}</div>
                                    <MessageSquare className="h-3 w-3 ml-1" />
                                    Feedback
                                  </div>
                                  {/* Add compare button */}
                                  <button
                                    className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                                      itemsToCompare.includes(item.id) 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                    onClick={(e) => { e.stopPropagation(); toggleItemComparison(item.id) }}
                                  >
                                    <Plus className={`h-3 w-3 ${itemsToCompare.includes(item.id) ? 'hidden' : 'block'}`} />
                                    <span>{itemsToCompare.includes(item.id) ? 'Selected for Compare' : 'Compare'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                          <TableCell className="text-center">
                            <div>{item.currentStock}/{item.totalStock}</div>
                             {item.status && (
                              <Badge
                                variant={item.status === "Urgent" ? "destructive" : item.status === "Low" ? "secondary" : "default"}
                                className="text-xs mt-1"
                              >
                                {item.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1)); }}
                                disabled={(item.quantity || 1) <= 1}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity || 1}
                                onChange={(e) => updateItemQuantity(item.id, Number(e.target.value) || 1)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); updateItemQuantity(item.id, (item.quantity || 1) + 1); }}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.unitPrice * (item.quantity || 0)).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => { e.stopPropagation(); removeItemFromOrder(item.id); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Quick Alternative Preview (Always visible) */}
                        {!expandedItems[item.id] && alternativeVendors[item.id]?.length > 0 && (
                          <TableRow className="bg-gray-50/50">
                            <TableCell colSpan={8} className="p-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2 flex justify-between items-center">
                                <span>Quick Alternative Preview</span>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="h-6 p-0 text-xs"
                                  onClick={() => toggleItemExpansion(item.id)}
                                >
                                  See All Alternatives
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {alternativeVendors[item.id].slice(0, 2).map((alt, i) => (
                                  <Card key={i} className="overflow-hidden bg-white shadow-sm border">
                                    <CardContent className="p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                          <img
                                            src={alt.image_url || `/placeholder.svg?height=32&width=32`}
                                            alt={alt.productName}
                                            className="max-w-full max-h-full object-contain"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-1">
                                            <div className="font-medium text-xs truncate">{alt.productName}</div>
                                            <div className="font-bold text-xs">${alt.price?.toFixed(2)}</div>
                                          </div>
                                          <div className="flex items-center justify-between gap-1 mt-0.5">
                                            <div className="text-[11px] text-muted-foreground">{alt.name}</div>
                                            {alt.savings > 0 && (
                                              <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200">
                                                Save ${alt.savings.toFixed(2)}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Expanded Row Content */}
                        <AnimatePresence>
                          {expandedItems[item.id] && (
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                              <TableCell colSpan={8} className="p-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 space-y-4">
                                    {/* Quick Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <Card className="bg-blue-50/50">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm text-muted-foreground">Monthly Usage</p>
                                              <p className="text-2xl font-bold">{item.usageFrequency || 0}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                              <TrendingUp className="h-4 w-4 text-blue-600" />
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {item.usageFrequency && item.usageFrequency > 400 ? "High Usage Item" : "Normal Usage"}
                                          </p>
                                        </CardContent>
                                      </Card>

                                      <Card className={item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'bg-red-50/50' : 'bg-green-50/50'}>
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm text-muted-foreground">Expiration</p>
                                              <p className="text-2xl font-bold">
                                                {item.expirationDate ? 
                                                  new Date(item.expirationDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                                  : "N/A"
                                                }
                                              </p>
                                            </div>
                                            <div className={`h-8 w-8 rounded-full ${
                                              item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                ? 'bg-red-100'
                                                : 'bg-green-100'
                                            } flex items-center justify-center`}>
                                              <Clock className={`h-4 w-4 ${
                                                item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                  ? 'text-red-600'
                                                  : 'text-green-600'
                                              }`} />
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                              ? "Expiring Soon"
                                              : "Good Until Expiry"
                                            }
                                          </p>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-purple-50/50">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm text-muted-foreground">Market Position</p>
                                              <p className="text-2xl font-bold">{
                                                benchmarkData.priceComparisons[item.name]?.percentile || "N/A"
                                              }%</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                              <BarChart className="h-4 w-4 text-purple-600" />
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">Price Percentile</p>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-yellow-50/50">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm text-muted-foreground">Stock Level</p>
                                              <p className="text-2xl font-bold">{Math.round((item.currentStock / item.totalStock) * 100)}%</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                              <Package className="h-4 w-4 text-yellow-600" />
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {item.currentStock}/{item.totalStock} units available
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Main Content Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {/* Inventory Details Card */}
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium">Inventory Details</CardTitle>
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          <dl className="space-y-2 text-sm">
                                            {item.lotNumber && (
                                              <div className="flex justify-between items-center">
                                                <dt className="text-muted-foreground">Lot Number</dt>
                                                <dd className="font-medium bg-secondary/50 px-2 py-0.5 rounded text-xs">
                                                  {item.lotNumber}
                                                </dd>
                                              </div>
                                            )}
                                            {item.storageRequirements && (
                                              <div className="flex justify-between items-center">
                                                <dt className="text-muted-foreground">Storage</dt>
                                                <dd className="flex gap-1">
                                                  {item.storageRequirements.map((req, i) => (
                                                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                      {req}
                                                    </Badge>
                                                  ))}
                                                </dd>
                                              </div>
                                            )}
                                            {item.department && (
                                              <div className="flex justify-between items-center">
                                                <dt className="text-muted-foreground">Department</dt>
                                                <dd className="font-medium">{item.department}</dd>
                                              </div>
                                            )}
                                            {item.lastOrderDate && (
                                              <div className="flex justify-between items-center">
                                                <dt className="text-muted-foreground">Last Ordered</dt>
                                                <dd className="text-muted-foreground text-xs">
                                                  {new Date(item.lastOrderDate).toLocaleDateString()}
                                                </dd>
                                              </div>
                                            )}
                                          </dl>
                                        </CardContent>
                                      </Card>

                                      {/* Usage Patterns Card */}
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium">Usage Patterns</CardTitle>
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-4">
                                            {/* Department Usage Chart */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Department Usage</h4>
                                              <div className="space-y-2">
                                                {Object.entries(usagePatterns.departments)
                                                  .filter(([_, items]) => items.includes(item.name))
                                                  .map(([dept, _]) => (
                                                    <div key={dept} className="flex items-center gap-2">
                                                      <div className="w-full bg-secondary rounded-full h-2">
                                                        <div 
                                                          className="bg-primary rounded-full h-2" 
                                                          style={{ 
                                                            width: `${dept === item.department ? '100%' : '60%'}`
                                                          }}
                                                        />
                                                      </div>
                                                      <span className="text-xs text-muted-foreground min-w-[80px]">{dept}</span>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>

                                            {/* Specialty Usage */}
                                            <div>
                                              <h4 className="text-sm font-medium mb-2">Specialty Usage</h4>
                                              <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(usagePatterns.specialties)
                                                  .filter(([_, items]) => item.name in items)
                                                  .map(([specialty, data]) => (
                                                    <Badge 
                                                      key={specialty}
                                                      variant="outline" 
                                                      className={`justify-between gap-2 ${
                                                        data[item.name].usage === "Very High"
                                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                          : data[item.name].usage === "High"
                                                          ? 'bg-green-50 text-green-700 border-green-200'
                                                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                      }`}
                                                    >
                                                      <span className="truncate">{specialty}</span>
                                                      <span className="font-normal opacity-50">{data[item.name].usage}</span>
                                                    </Badge>
                                                  ))}
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Clinical Outcomes Card */}
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium">Clinical Outcomes</CardTitle>
                                            <HeartPulse className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          {item.clinicalOutcomes && (
                                            <div className="space-y-4">
                                              <div>
                                                <div className="flex justify-between mb-1">
                                                  <span className="text-sm text-muted-foreground">Success Rate</span>
                                                  <span className="text-sm font-medium">{item.clinicalOutcomes.successRate}%</span>
                                                </div>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                  <div 
                                                    className="bg-green-500 rounded-full h-2" 
                                                    style={{ width: `${item.clinicalOutcomes.successRate}%` }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Smart Recommendations */}
                                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-100 rounded-full">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="text-sm font-medium text-blue-900 mb-2">Smart Recommendations</h4>
                                            <div className="space-y-2">
                                              {getContextualRecommendations(item).map((rec, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                                                  <p className="text-sm text-blue-700">{rec}</p>
                                                </div>
                                              ))}
                                              {getBenchmarkInsights(item).map((insight, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                                                  <p className="text-sm text-blue-700">{insight}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Vendor Options Section */}
                                    <div>
                                      <div className="flex justify-between items-center mb-4">
                                        <h5 className="font-medium flex items-center gap-2">
                                          <Store className="h-4 w-4" />
                                          Vendor Options & Feedback
                                        </h5>
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

                                      {/* AI Recommendation Box */}
                                      {aiRecommendations[item.id] && !loadingAlternatives[item.id] && (
                                        <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
                                          <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                              <div className="p-2 bg-blue-100 rounded-full">
                                                <Bot className="h-4 w-4 text-blue-600" />
                                              </div>
                                              <div>
                                                <p className="text-sm text-blue-900">{aiRecommendations[item.id]}</p>
                                                <p className="text-xs text-blue-600 mt-2">AMS AI Recommendation</p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Alternative Vendors Grid */}
                                      {alternativeVendors[item.id]?.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {alternativeVendors[item.id].map((vendor, index) => (
                                            <Card key={index} className="overflow-hidden">
                                              <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                  <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                                                      <img
                                                        src={vendor.image_url || `/placeholder.svg?height=64&width=64`}
                                                        alt={vendor.productName}
                                                        className="max-w-full max-h-full object-contain"
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                      <div>
                                                        <h4 className="font-medium truncate">{vendor.productName}</h4>
                                                        <p className="text-sm text-muted-foreground">{vendor.name}</p>
                                                      </div>
                                                      <div className="text-right">
                                                        <div className="font-bold">${vendor.price?.toFixed(2)}</div>
                                                        {vendor.savings > 0 && (
                                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            Save ${vendor.savings.toFixed(2)}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </div>
                                                    
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        {vendor.delivery}
                                                      </Badge>
                                                      {vendor.regulatoryStatus?.map((status: string, i: number) => (
                                                        <Badge 
                                                          key={i}
                                                          variant="outline"
                                                          className="bg-green-50 text-green-700"
                                                        >
                                                          <ShieldCheck className="h-3 w-3 mr-1" />
                                                          {status}
                                                        </Badge>
                                                      ))}
                                                    </div>

                                                    {vendor.performanceMetrics && (
                                                      <div className="mt-3 grid grid-cols-2 gap-2">
                                                        <div className="text-xs">
                                                          <div className="text-muted-foreground">Delivery Reliability</div>
                                                          <div className="font-medium">{vendor.performanceMetrics.deliveryReliability}%</div>
                                                        </div>
                                                        <div className="text-xs">
                                                          <div className="text-muted-foreground">Quality Score</div>
                                                          <div className="font-medium">{vendor.performanceMetrics.qualityConsistency}%</div>
                                                        </div>
                                                      </div>
                                                    )}

                                                    <div className="mt-3 flex items-center justify-between">
                                                      <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="gap-1"
                                                        onClick={() => handleVendorSelect(item.id, `${vendor.name}-${vendor.productName}`, vendor)}
                                                      >
                                                        <Plus className="h-3 w-3" />
                                                        Select Vendor
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1"
                                                        asChild
                                                      >
                                                        <a href={vendor.url} target="_blank" rel="noopener noreferrer">
                                                          <ExternalLink className="h-3 w-3" />
                                                          View Details
                                                        </a>
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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
                    <TableCell className="text-right">{item.quantity || 0}</TableCell>
                    <TableCell className="text-right">${(item.selectedVendor?.price || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      ${((item.selectedVendor?.price || 0) * (item.quantity || 0)).toFixed(2)}
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

      {/* Vendor Action Bar */}
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

      {/* Comparison Floating Action Button */}
      <AnimatePresence>
        {itemsToCompare.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className="bg-primary text-white rounded-full shadow-lg p-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {itemsToCompare.slice(0, 3).map((itemId, i) => {
                  const item = selectedItems.find(item => item.id === itemId);
                  return (
                    <div 
                      key={itemId}
                      className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center"
                      style={{ zIndex: 3 - i }}
                    >
                      <span className="text-xs font-medium text-primary">
                        {item?.name.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div>
                <span className="font-medium">{itemsToCompare.length} items selected</span>
                <div className="flex gap-2 mt-1">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={clearComparisonItems}
                  >
                    Clear
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={viewComparison}
                    disabled={itemsToCompare.length < 2}
                  >
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto"
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Product Comparison</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowComparison(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-[200px,repeat(auto-fit,minmax(200px,1fr))] gap-4">
                  {/* Comparison headers */}
                  <div className="sticky left-0 bg-white"></div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={itemId} className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded bg-gray-100 flex items-center justify-center">
                          <img
                            src={item?.image || `/placeholder.svg?height=96&width=96`}
                            alt={item?.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <h3 className="font-medium text-center">{item?.name}</h3>
                        <Badge variant={item?.status === "Urgent" ? "destructive" : item?.status === "Low" ? "secondary" : "default"}>
                          {item?.status}
                        </Badge>
                      </div>
                    )
                  })}

                  {/* Basic Info Section */}
                  <div className="text-lg font-semibold pt-4 border-t mt-4 sticky left-0 bg-white">Basic Info</div>
                  {Array(itemsToCompare.length).fill(null).map((_, i) => (
                    <div key={`basic-${i}`} className="border-t mt-4 pt-4"></div>
                  ))}

                  {/* SKU Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">SKU</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={`sku-${itemId}`} className="py-2 text-muted-foreground">
                        {item?.sku}
                      </div>
                    )
                  })}

                  {/* Stock Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Stock Level</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={`stock-${itemId}`} className="py-2">
                        {item?.currentStock}/{item?.totalStock}
                      </div>
                    )
                  })}

                  {/* Unit Price Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Unit Price</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={`price-${itemId}`} className="py-2 font-medium">
                        ${item?.unitPrice.toFixed(2)}
                      </div>
                    )
                  })}

                  {/* Vendor Section */}
                  <div className="text-lg font-semibold pt-4 border-t mt-4 sticky left-0 bg-white">Vendor Info</div>
                  {Array(itemsToCompare.length).fill(null).map((_, i) => (
                    <div key={`vendor-header-${i}`} className="border-t mt-4 pt-4"></div>
                  ))}

                  {/* Vendor Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Primary Vendor</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={`vendor-${itemId}`} className="py-2">
                        {item?.vendor}
                      </div>
                    )
                  })}

                  {/* Best Alternative Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Best Alternative</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    const alternatives = alternativeVendors[itemId] || [];
                    const bestAlternative = alternatives.length > 0 ? 
                      alternatives.reduce((best, current) => 
                        (current.price && (!best.price || current.price < best.price)) ? current : best
                      , alternatives[0]) : null;
                    
                    return (
                      <div key={`alt-${itemId}`} className="py-2">
                        {bestAlternative ? (
                          <div>
                            <div>{bestAlternative.name}</div>
                            <div className="text-sm text-muted-foreground">${bestAlternative.price?.toFixed(2) || "N/A"}</div>
                            {bestAlternative.savings > 0 && (
                              <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">
                                Save ${bestAlternative.savings.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No alternatives found</span>
                        )}
                      </div>
                    )
                  })}

                  {/* Regulations Section */}
                  <div className="text-lg font-semibold pt-4 border-t mt-4 sticky left-0 bg-white">Regulatory</div>
                  {Array(itemsToCompare.length).fill(null).map((_, i) => (
                    <div key={`reg-header-${i}`} className="border-t mt-4 pt-4"></div>
                  ))}

                  {/* Compliance Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Compliance</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    // Simulating compliance data
                    const complianceStatus = regulatoryStatus['default-regulatory'][Math.floor(Math.random() * regulatoryStatus['default-regulatory'].length)];
                    
                    return (
                      <div key={`compliance-${itemId}`} className="py-2">
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          {complianceStatus}
                        </Badge>
                      </div>
                    )
                  })}
                  
                  {/* Feedback Section */}
                  <div className="text-lg font-semibold pt-4 border-t mt-4 sticky left-0 bg-white">User Feedback</div>
                  {Array(itemsToCompare.length).fill(null).map((_, i) => (
                    <div key={`feedback-header-${i}`} className="border-t mt-4 pt-4"></div>
                  ))}

                  {/* Rating Row */}
                  <div className="sticky left-0 bg-white font-medium py-2">Rating</div>
                  {itemsToCompare.map(itemId => {
                    const item = selectedItems.find(item => item.id === itemId);
                    return (
                      <div key={`rating-${itemId}`} className="py-2">
                        <div className="flex">{renderStars(4.5)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowComparison(false)}>Close</Button>
                <Button>Add All to Order</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

