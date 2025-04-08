"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileUp, Loader2, Plus, Search, Trash2, TrendingDown, BookOpen, RefreshCw, ExternalLink, Sparkles, Star, StarHalf, MessageSquare, Mail, ChevronDown, MessageSquareText, Scale, Building2, History, AlertTriangle, FileText, ShoppingCart, BookmarkPlus, Package, DollarSign, X, ChevronRight, CheckCircle2, Clock, CheckCircle, PhoneCall, Filter, XCircle, ShieldCheck, ArrowUpDown, Minus, Truck } from "lucide-react"
import { inventoryData } from "@/data/inventory-data"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { QuickActionsToolbar, useQuickActions } from "@/components/ui/quick-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/data/inventory-data"
import { ordersData, type Order } from "@/data/orders-data"
import Image from "next/image"

interface Feedback {
  doctorName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Vendor {
  id: string;
  name: string;
  image_url?: string;
  price?: number;
  savings?: number | null;
  manufacturer?: string;
  compliance?: string;
  shipping?: string;
  packaging?: string;
  notes?: {
    hospitalUsage?: string;
    stockWarning?: string;
  };
  url?: string;
  status: {
    isCurrentVendor: boolean;
  isSelected: boolean;
  };
  productName?: string;
  delivery?: string;
  qualityRating?: number;
  contactEmail?: string;
  isDefault?: boolean;
}

interface SelectedVendorAction {
  itemId: string;
  vendorId: string;
  vendor: Vendor;
  action: string; // Add the action property to fix the TypeScript error
}

interface OrderDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem;
  alternativeVendors: any[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  handleFindAlternatives?: (itemId: string) => void;
  loadingAlternatives?: { [key: string]: boolean };
  renderStars: (rating: number) => React.ReactNode;
  selectedVendors?: { [key: string]: string[] };
  setSelectedVendors?: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  setSelectedVendorActions?: React.Dispatch<React.SetStateAction<SelectedVendorAction[]>>;
  onAddAlternativeVendor: (itemId: string, vendor: Vendor) => void; // Add the new prop
}

interface RfqItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface VendorInfo {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface CommunicationPrefs {
  email: boolean;
  aiCall: boolean;
}

interface Swap {
  id: string;
  name: string;
  price: number;
  manufacturer: string;
  compliance: string;
  vendor: {
    id: string;
    name: string;
  };
  pricePerUnit: number;
  packaging: string;
  delivery?: string;
  vendor_image_url?: string;
  isDefault?: boolean;
}

interface BaseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  currentVendor?: string;
  unitPrice?: number;
  image?: string;
  sku?: string;
  status?: string;
  description?: string;
  manufacturer?: string;
  category?: string;
}

interface OrderItem extends BaseItem {
  selectedVendor?: Vendor;
  selectedVendorIds?: string[];
  selectedVendors?: Vendor[];
  vendors: Vendor[];  // Make vendors required
  vendor?: string;    // Add optional vendor field for backward compatibility
}

interface InventoryItemWithVendor extends BaseItem {
  vendors: Vendor[];
}

const VENDOR_LOGOS = {
  "MedSupply Inc.": "https://medsupplyinc.com/images/medsupply-logo-min.png",
  "Hospital Direct": "https://www.hospitaldirect.co.uk/wp-content/uploads/2022/11/hlogo-300x225.png",
  "McKesson": "https://www.mckesson.com/assets/img/mckesson-logo.svg",
  "Medline": "https://www.medline.com/wp-content/uploads/2021/03/medline-logo.png",
  "Cardinal Health": "https://www.cardinalhealth.com/content/dam/corp/web/images/cardinal-health-logo.png",
  "Henry Schein": "https://www.henryschein.com/images/hs-logo.svg",
  "Owens & Minor": "https://www.owens-minor.com/wp-content/themes/owens-minor/assets/images/om-logo.svg",
  "Becton Dickinson": "https://www.bd.com/assets/images/bd-logo.svg",
  "PPE Direct": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTpI8MV2cGuu0DNQGnsswtmsjP7Cxi19uN-Q&s",
  "3M Healthcare": "https://www.3m.com/3M/en_US/health-care-us/images/3m-healthcare-logo.png",
  "Abbott Nutrition": "https://www.abbottnutrition.com/images/abbott-nutrition-logo.png",
  "Bard Medical - A Div of BD": "https://www.bd.com/assets/images/bard-medical-logo.png",
  "Baxter Healthcare": "https://www.baxter.com/sites/g/files/ebysai746/files/baxter-logo.png",
  "BD Medical - Div of BD Worldwide": "https://www.bd.com/assets/images/bd-medical-logo.png",
  "Cardinal Health Inc": "https://www.cardinalhealth.com/content/dam/corp/web/images/cardinal-health-logo.png",
  "Corning Inc": "https://www.corning.com/content/dam/corning/logo.png",
  "Dasco Label": "https://www.dascolabel.com/images/dasco-label-logo.png",
  "International Paper": "https://www.internationalpaper.com/content/dam/internationalpaper/logo.png",
  "Maquet Inc - Getinge Group": "https://www.getinge.com/dam/corporate/logo.png",
  "Medline Industries Inc": "https://www.medline.com/wp-content/uploads/2021/03/medline-logo.png",
  "Philips Healthcare": "https://www.usa.philips.com/healthcare/images/philips-healthcare-logo.png",
  "Sage Products LLC": "https://sageproducts.com/wp-content/themes/sage-products/images/sage-logo.png",
  "Westmed - Acq by Sunmed": "https://www.westmedinc.com/images/westmed-logo.png",
  "Medtronic MITG": "https://www.medtronic.com/content/dam/medtronic-com/global/logos/medtronic-logo.png",
  "default": "https://res.cloudinary.com/dk2/image/upload/v1/medical-supplies/vendors/default.png"
};

const getVendorLogo = (vendorName: string): string => {
  // First try to get the exact match
  const exactMatch = VENDOR_LOGOS[vendorName as keyof typeof VENDOR_LOGOS];
  if (exactMatch) return exactMatch;

  // If no exact match, try to find a partial match
  const partialMatch = Object.entries(VENDOR_LOGOS).find(([key]) => 
    vendorName.toLowerCase().includes(key.toLowerCase())
  );
  
  return partialMatch ? partialMatch[1] : VENDOR_LOGOS.default;
};

const MOCK_ALTERNATIVES = {
  "default": [
    {
      name: "Medline",
      productName: "Similar Product",
      price: 85.99,
      savings: 14.00,
      delivery: "2-3 days",
      packaging: "Standard",
      isSelected: false,
      url: "#",
      image_url: null,
      id: "medline-1",
      contactEmail: "sales@medline.com",
      contactPhone: "1-800-MEDLINE",
      certifications: ["ISO 13485", "FDA Registered", "CE Marked"],
      reviews: {
        rating: 4.7,
        count: 128,
        recentReviews: [
          {
            rating: 5,
            comment: "Excellent quality and reliable delivery",
            date: "2024-03-15",
            reviewer: "Dr. Smith"
          },
          {
            rating: 4,
            comment: "Good product, slightly delayed shipping",
            date: "2024-03-10",
            reviewer: "Dr. Johnson"
          }
        ]
      },
      notes: [
        "Bulk discounts available for orders over 100 units",
        "Free shipping on orders over $500",
        "24/7 customer support available"
      ],
      complianceStatus: "Fully Compliant",
      warranty: "1 year manufacturer warranty",
      returnPolicy: "30-day return policy",
      minimumOrderQuantity: 10,
      bulkDiscounts: [
        { quantity: 50, discount: 5 },
        { quantity: 100, discount: 10 },
        { quantity: 200, discount: 15 }
      ],
      onTimeDeliveryRate: 98.5,
      fillRate: 99.2,
      qualityRating: 4.7,
    },
    {
      name: "McKesson",
      productName: "Premium Alternative",
      price: 92.99,
      savings: 7.00,
      delivery: "1-2 days",
      packaging: "Premium",
      isSelected: false,
      url: "#",
      image_url: null,
      id: "mckesson-1",
      contactEmail: "sales@mckesson.com",
      contactPhone: "1-800-MCKESSON",
      certifications: ["ISO 9001", "FDA Registered", "GxP Compliant"],
      reviews: {
        rating: 4.9,
        count: 256,
        recentReviews: [
          {
            rating: 5,
            comment: "Premium quality and exceptional service",
            date: "2024-03-14",
            reviewer: "Dr. Williams"
          },
          {
            rating: 5,
            comment: "Fast delivery and great customer support",
            date: "2024-03-12",
            reviewer: "Dr. Brown"
          }
        ]
      },
      notes: [
        "Next-day delivery available",
        "Custom packaging options",
        "Dedicated account manager"
      ],
      complianceStatus: "Fully Compliant",
      warranty: "2 year manufacturer warranty",
      returnPolicy: "45-day return policy",
      minimumOrderQuantity: 5,
      bulkDiscounts: [
        { quantity: 25, discount: 5 },
        { quantity: 50, discount: 10 },
        { quantity: 100, discount: 15 }
      ],
      onTimeDeliveryRate: 99.0,
      fillRate: 99.5,
      qualityRating: 4.9,
    },
    {
      name: "Cardinal Health",
      productName: "Value Option",
      price: 79.99,
      savings: 20.00,
      delivery: "3-4 days",
      packaging: "Bulk",
      isSelected: false,
      url: "#",
      image_url: null,
      id: "cardinal-1",
      contactEmail: "sales@cardinalhealth.com",
      contactPhone: "1-800-CARDINAL",
      certifications: ["ISO 13485", "FDA Registered", "cGMP Compliant"],
      reviews: {
        rating: 4.5,
        count: 89,
        recentReviews: [
          {
            rating: 4,
            comment: "Good value for money",
            date: "2024-03-13",
            reviewer: "Dr. Davis"
          },
          {
            rating: 5,
            comment: "Reliable supplier with competitive pricing",
            date: "2024-03-11",
            reviewer: "Dr. Miller"
          }
        ]
      },
      notes: [
        "Best value for bulk orders",
        "Extended payment terms available",
        "Regular stock availability"
      ],
      complianceStatus: "Fully Compliant",
      warranty: "1 year manufacturer warranty",
      returnPolicy: "30-day return policy",
      minimumOrderQuantity: 20,
      bulkDiscounts: [
        { quantity: 100, discount: 5 },
        { quantity: 200, discount: 10 },
        { quantity: 500, discount: 20 }
      ]
    }
  ]
};

const OrderDetailsOverlay: React.FC<OrderDetailsOverlayProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  alternativeVendors,
  setSelectedItems,
  handleFindAlternatives,
  loadingAlternatives,
  renderStars,
  selectedVendors,
  setSelectedVendors,
  setSelectedVendorActions,
  onAddAlternativeVendor
}) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [localItem, setLocalItem] = useState<OrderItem | null>(null);
  const [productFeedback] = useState<{ [key: string]: Feedback[] }>({
    'default-feedback': [
      { doctorName: "Dr. Smith", rating: 4.5, comment: "Excellent quality, would recommend", date: "2024-03-15" },
      { doctorName: "Dr. Johnson", rating: 5, comment: "Best in class, very reliable", date: "2024-03-14" },
      { doctorName: "Dr. Williams", rating: 4, comment: "Good product, slight delay in delivery", date: "2024-03-13" }
    ]
  });

  // Update localItem when item prop changes
  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const handleVendorSelect = (itemId: string, vendorName: string, vendor: Vendor) => {
    if (!localItem) return;

    // Update local state first
    const updatedVendors = localItem.vendors.map(v => ({
      ...v,
      status: {
        ...v.status,
        isSelected: v.id === vendor.id ? !v.status.isSelected : v.status.isSelected
      }
    }));

    setLocalItem({
      ...localItem,
      vendors: updatedVendors
    });

    // Update global state
    setSelectedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          vendors: updatedVendors,
          ...(updatedVendors.find(v => v.id === vendor.id)?.status.isSelected ? {
            selectedVendorIds: [...new Set([...(item.selectedVendorIds || []), vendor.id])],
            selectedVendors: [...new Set([...(item.selectedVendors || []), vendor])]
          } : {
            selectedVendorIds: (item.selectedVendorIds || []).filter(id => id !== vendor.id),
            selectedVendors: (item.selectedVendors || []).filter(v => v.id !== vendor.id)
          })
        };
      }
      return item;
    }));

    // Update the selectedVendors state
    if (setSelectedVendors) {
      setSelectedVendors(prev => {
        const currentIds = prev[itemId] || [];
        const isSelected = !currentIds.includes(vendor.id);
        
        return {
          ...prev,
          [itemId]: isSelected 
            ? [...currentIds, vendor.id]
            : currentIds.filter(id => id !== vendor.id)
        };
      });
    }

    // Update the selectedVendorActions state
    if (setSelectedVendorActions) {
      setSelectedVendorActions(prev => [
        ...prev,
        {
          itemId,
          vendorId: vendor.id,
          vendor,
          action: 'select'
        }
      ]);
    }
  };

  // Generate fake historical data for the chart
  const generateHistoricalData = (basePrice: number) => {
    const months = 6;
    const data: Array<{ date: string; price: number }> = [];
    let currentPrice = basePrice;
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Add some random variation to the price
      const variation = (Math.random() - 0.5) * 0.1 * basePrice;
      currentPrice = basePrice + variation;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        price: Number(currentPrice.toFixed(2))
      });
    }
    return data;
  };

  // Handle click outside and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Trigger chart animation when overlay opens
      const timer = setTimeout(() => setChartVisible(true), 300);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  // Reset chart visibility when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setChartVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !localItem) return null;

  const baselinePrice = localItem.unitPrice;
  const alternativePrices = alternativeVendors[localItem.id]?.map((v: any) => v.price) || [];
  const allPrices = [baselinePrice, ...alternativePrices];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const chartHeight = 120;

  // Generate historical data for each vendor
  const baselineHistory = generateHistoricalData(baselinePrice);
  const alternativeHistories = alternativePrices.map((price: number) => generateHistoricalData(price));

  return (
    <AnimatePresence>
      {isOpen && localItem && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            ref={overlayRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-[calc(100%-32px)] max-w-[900px] bg-white shadow-lg z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Product Information</div> {/* Changed title */}
                    <div className="text-lg font-semibold">{localItem.name}</div> {/* Show item name */} 
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tabs */}
                <div className="mt-4">
                  <nav className="flex space-x-8" aria-label="Order sections">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "details"
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Product Details {/* Changed tab name */}
                    </button>
                    <button
                      onClick={() => setActiveTab("quotes")}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "quotes"
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Alternatives
                    </button>
                    {/* Removed History Tab Option */}
                  </nav>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {activeTab === "details" ? (
                    <>
                      {/* Item Overview Card */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src={localItem.image || `/placeholder.svg`}
                                alt={localItem.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-lg">{localItem.name}</div>
                              <div className="text-sm text-muted-foreground">SKU: {localItem.sku}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm">4.5 (24 reviews)</span>
                                </div>
                                {localItem.status === "Urgent" && (
                                  <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs font-normal">Urgent</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">{localItem.description}</div>
                        </CardContent>
                      </Card>

                      {/* Product Specifications Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Product Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div>
                              <div className="text-muted-foreground mb-1">Manufacturer</div>
                              <div className="font-medium">{localItem.manufacturer || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Category</div>
                              <div className="font-medium">{localItem.category || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Status</div>
                              <div className="font-medium">{localItem.status || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Packaging</div>
                              <div className="font-medium">{localItem.packaging || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Current Stock</div>
                              <div className="font-medium">{localItem.currentStock || 0} / {localItem.totalStock || 0}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Expires In</div>
                              <div className="font-medium">{localItem.expiresIn || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Last Purchase Price</div>
                              <div className="font-medium">${localItem.lastPurchasePrice?.toFixed(2) || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Current Unit Price</div>
                              <div className="font-medium">${localItem.unitPrice?.toFixed(2) || '--'}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">Required Units</div>
                              <div className="font-medium">{localItem.requiredUnits || '--'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Transaction History Card */}
                      <Card>
                        <CardHeader 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedItems(prev => ({ ...prev, [localItem.id]: !prev[localItem.id] }))}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Transaction History</CardTitle>
                            <Button variant="ghost" size="icon">
                              {expandedItems[localItem.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        {expandedItems[localItem.id] && (
                          <CardContent>
                            <div className="space-y-4">
                              {ordersData
                                .filter((order: Order) => 
                                  order.items?.some((orderItem: { name: string }) => 
                                    orderItem.name === localItem.name
                                  )
                                )
                                .map((order: Order) => {
                                  const orderItem = order.items?.find((i: { name: string }) => i.name === localItem.name);
                                  return (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                      <div className="space-y-1">
                                        <div className="font-medium">{order.id}</div>
                                        <div className="text-sm text-muted-foreground">{order.date}</div>
                                        <div className="text-sm">Department: {order.department}</div>
                                      </div>
                                      <div className="text-right space-y-1">
                                        <div className="font-medium">{orderItem?.quantity} units</div>
                                        <div className="text-sm">${orderItem?.price.toFixed(2)} per unit</div>
                                        <Badge 
                                          variant={
                                            order.status === "Completed" ? "default" :
                                            order.status === "Processing" ? "secondary" :
                                            order.status === "Cancelled" ? "destructive" :
                                            "outline"
                                          }
                                        >
                                          {order.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </CardContent>
                        )}
                      </Card>

                      {/* Feedback Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Recent Feedback</CardTitle>
                          <CardDescription>Last 3 reviews from healthcare professionals</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {productFeedback['default-feedback'].map((feedback: Feedback, index: number) => (
                              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{feedback.doctorName}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs">{feedback.rating}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                                <span className="text-xs text-muted-foreground">{feedback.date}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : activeTab === "quotes" ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4">
                        {localItem.vendors.map((vendor) => {
                          const isCurrentVendor = vendor.status.isCurrentVendor;
                          const isSelected = vendor.status.isSelected;
                          
                          return (
                            <div
                              key={vendor.id}
                              className={cn(
                                "relative rounded-lg border p-4",
                                isCurrentVendor
                                  ? "border-blue-200 bg-blue-50"
                                  : isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary"
                              )}
                            >
                              {isCurrentVendor && (
                                <Badge 
                                  variant="secondary" 
                                  className="absolute -top-2 -right-2 bg-blue-100 text-blue-800"
                                >
                                  Current Vendor
                                </Badge>
                              )}
                              <div className="flex items-start gap-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                                  {vendor.image_url ? (
                                    <Image
                                      src={vendor.image_url}
                                      alt={vendor.name}
                                      className="object-contain"
                                      fill
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                      <Building2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{vendor.name}</h4>
                                      <p className="text-sm text-muted-foreground">{vendor.productName}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">${vendor.price?.toFixed(2)}</div>
                                      {vendor.savings !== null && vendor.savings > 0 && (
                                        <div className="text-sm text-green-600">Save ${vendor.savings.toFixed(2)}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        <span>Manufacturer: {vendor.manufacturer}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Truck className="h-4 w-4" />
                                        <span>Delivery: {vendor.delivery}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Compliance: {vendor.compliance}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Shipping: {vendor.shipping}</span>
                                      </div>
                                      {vendor.notes?.hospitalUsage && (
                                        <div className="flex items-center gap-1">
                                          <BookOpen className="h-4 w-4" />
                                          <span>Usage: {vendor.notes.hospitalUsage}</span>
                                        </div>
                                      )}
                                      {vendor.notes?.stockWarning && (
                                        <div className="flex items-center gap-1 text-amber-600">
                                          <AlertTriangle className="h-4 w-4" />
                                          <span>{vendor.notes.stockWarning}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2">
                                    <Button
                                      variant={vendor.status.isSelected ? "default" : "outline"}
                                      size="sm"
                                      className="gap-2"
                                      onClick={() => handleVendorSelect(localItem.id, vendor.name, vendor)}
                                    >
                                      {vendor.status.isSelected ? (
                                        <>
                                          <CheckCircle className="h-4 w-4" />
                                          Selected
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-4 w-4" />
                                          Select
                                        </>
                                      )}
                                    </Button>
                                    {vendor.url && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.open(vendor.url, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Website
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* New Supply Exchange Card */}
                      <Card className="mt-6">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-blue-500" />
                                Supply Exchange
                              </CardTitle>
                              <CardDescription>
                                Publish your request to the internal supply exchange network
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                              <div className="p-2 rounded-full bg-blue-100">
                                <MessageSquareText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-blue-900">Why publish to Supply Exchange?</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Publishing your request allows other departments and facilities in your network to:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    Share surplus inventory
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    Combine orders for better pricing
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    Access pre-negotiated contracts
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                Your request will be visible to all members of your healthcare network
                              </div>
                              <Button className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Publish Request
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Fallback or other tabs if needed */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- New Budget Summary Interface ---
interface BudgetSummaryProps {
  allocatedBudget: number;
  currentTotal: number;
}

// --- New Budget Summary Card Component ---
const BudgetSummaryCard: React.FC<BudgetSummaryProps> = ({ allocatedBudget, currentTotal }) => {
  const remainingBudget = allocatedBudget - currentTotal;
  const usagePercentage = allocatedBudget > 0 ? (currentTotal / allocatedBudget) * 100 : 0;

  let progressBarColor = "bg-blue-500";
  let statusText = "Within Budget";
  let statusColor = "text-green-600";
  let icon = <CheckCircle2 className="h-5 w-5" />;

  if (usagePercentage > 100) {
    progressBarColor = "bg-red-500";
    statusText = "Over Budget";
    statusColor = "text-red-600";
    icon = <AlertTriangle className="h-5 w-5" />;
  } else if (usagePercentage > 85) {
    progressBarColor = "bg-yellow-500";
    statusText = "Nearing Budget Limit";
    statusColor = "text-yellow-600";
    icon = <AlertTriangle className="h-5 w-5" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Current order impact on allocated funds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Allocated:</span>
          <span className="font-medium">${allocatedBudget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Current Order:</span>
          <span className="font-medium">${currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressBarColor}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }} // Cap at 100% for visual
          />
        </div>
        <div className={`flex items-center justify-between text-sm font-medium ${statusColor}`}>
          <span>{statusText}</span>
          <div className="flex items-center gap-1">
            {icon}
            <span>
              {remainingBudget >= 0
                ? `$${remainingBudget.toLocaleString()} remaining`
                : `$${Math.abs(remainingBudget).toLocaleString()} over`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreateOrderPage() {
  const router = useRouter()
  const { setRightActions } = useQuickActions()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [isDetailsOverlayOpen, setIsDetailsOverlayOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [loadingAlternatives, setLoadingAlternatives] = useState<{ [key: string]: boolean }>({})
  const [alternativeVendors, setAlternativeVendors] = useState<{ [key: string]: any[] }>({})
  const [plannedWebsites, setPlannedWebsites] = useState<string[]>([])
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([])
  const [showWebsiteSelector, setShowWebsiteSelector] = useState<{ [key: string]: boolean }>({})
  const [selectedVendors, setSelectedVendors] = useState<{ [key: string]: string[] }>({})
  const [aiRecommendations, setAiRecommendations] = useState<{ [key: string]: string }>({})
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>({})
  const [activeTab, setActiveTab] = useState("order")
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>("Net 30")
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("3-5 days")
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const [selectedVendorActions, setSelectedVendorActions] = useState<SelectedVendorAction[]>([])
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([])
  const [rfqNotes, setRfqNotes] = useState<string>("")
  const [communicationPrefs, setCommunicationPrefs] = useState<{ [vendorId: string]: CommunicationPrefs }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<string | null>(null)
  const [csvItems, setCsvItems] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<string>("none"); // State for grouping
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({}); // State for expanded items
  const [isAISuggestionsOverlayOpen, setIsAISuggestionsOverlayOpen] = useState(false)
  const [aiSuggestedItems, setAiSuggestedItems] = useState<any[]>([])
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false)
  const [showRfqDialog, setShowRfqDialog] = useState(false)
  const [isGeneratingRfq, setIsGeneratingRfq] = useState(false)

  // Payment terms options
  const paymentTermsOptions = ["Net 30", "Net 45", "Net 60"]
  
  // Delivery time options
  const deliveryTimeOptions = ["2-3 days", "3-5 days", "5-7 days"]

  const filteredItems = inventoryData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 800)
  }

  // Update the getItemFromInventory function
  const getItemFromInventory = (itemId: string): any => {
    return inventoryData.find(item => item.id === itemId);
  };

  // Update the addItemToOrder function
  const addItemToOrder = (item: InventoryItem) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      // Create vendor objects for all vendors in the array
      const defaultVendor = item.vendors[0]; // Use first vendor as default
      
      const newItem: OrderItem = {
        ...item,
        quantity: 1,
        vendors: item.vendors.map(v => ({
          ...v,
          status: {
            isCurrentVendor: v === defaultVendor,
            isSelected: v === defaultVendor
          }
        })),
        selectedVendor: {
          ...defaultVendor,
          status: {
            isCurrentVendor: true,
            isSelected: true
          }
        },
        selectedVendorIds: [defaultVendor.id],
        selectedVendors: [{
          ...defaultVendor,
          status: {
            isCurrentVendor: true,
            isSelected: true
          }
        }]
      };
      setSelectedItems((prevItems) => [...prevItems, newItem]);
      setSearchQuery("");
    }
  };

  const removeItemFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.selectedVendor?.price || 0) * item.quantity, 0)
  }

  const handleFindAlternatives = async (item: OrderItem) => {
    try {
      // Simulate API call with mock data
      const alternatives = MOCK_ALTERNATIVES.default.map(vendor => ({
          ...vendor,
        status: {
          isCurrentVendor: vendor.id === item.currentVendor,
          isSelected: vendor.id === item.selectedVendor?.id
        }
      }));
      
      setAlternativeVendors(prev => ({
        ...prev,
        [item.id]: alternatives
      }));
    } catch (error) {
      console.error('Error finding alternatives:', error);
    }
  };

  // Helper function to generate realistic-looking AI recommendations
  const generateAlternativesRecommendation = (currentPrice: number, alternatives: Vendor[]) => {
    const bestPrice = Math.min(...alternatives.map(v => v.price || Infinity));
    const bestSavings = currentPrice - bestPrice;
    const bestVendor = alternatives.find(v => v.price === bestPrice);
    
    if (bestSavings > 0) {
      const savingsPercent = Math.round((bestSavings / currentPrice) * 100);
      return `I've found ${alternatives.length} alternative suppliers for this item. ${bestVendor?.name} offers the best price at $${bestPrice.toFixed(2)}, saving you $${bestSavings.toFixed(2)} per unit (${savingsPercent}% discount). ${bestVendor?.delivery} delivery is available, and they maintain a ${bestVendor?.qualityRating}/5 quality rating.`;
    } else {
      return `I've analyzed ${alternatives.length} alternative suppliers for this item. Your current price of $${currentPrice.toFixed(2)} appears to be competitive. I recommend checking for bulk discounts to further reduce your costs.`;
    }
  };

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
    setShowRfqDialog(true);
  };

  const handleConfirmRFQ = async () => {
    setIsGeneratingRfq(true);
    
    // Group by item first, then by vendor
    const itemVendorMap = new Map();
    
    selectedVendorActions.forEach(action => {
      if (!itemVendorMap.has(action.itemId)) {
        const itemDetails = selectedItems.find(item => item.id === action.itemId);
        itemVendorMap.set(action.itemId, {
          itemDetails,
          vendors: []
        });
      }
      
      const itemEntry = itemVendorMap.get(action.itemId);
      itemEntry.vendors.push({
        vendorId: action.vendorId,
        vendorName: action.vendor.name,
        vendorDetails: action.vendor
      });
    });
    
    // Create structured data for RFQ
    const rfqData = {
      id: `RFQ-${Date.now()}`,
      created: new Date().toISOString(),
      status: "Draft",
      items: Array.from(itemVendorMap.entries()).map(([itemId, data]) => ({
        id: itemId,
        name: data.itemDetails?.name || 'Unknown Item',
        sku: data.itemDetails?.sku || 'Unknown SKU',
        quantity: data.itemDetails?.quantity || 0,
        vendors: data.vendors
      }))
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store for navigation to the RFQ page
      sessionStorage.setItem('rfqDataForPreparation', JSON.stringify(rfqData));
      setShowRfqDialog(false);
      router.push('/orders/quotes/create');
    } catch (error) {
      console.error('Error generating RFQ:', error);
    } finally {
      setIsGeneratingRfq(false);
    }
  };

  // Set up the right actions for the quick actions toolbar conditionally
  useEffect(() => {
    let rightActionContent: React.ReactNode = (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-white text-black hover:bg-white/90 hover:text-black active:bg-white/80 flex items-center gap-2"
          onClick={handleImportCSV}
        >
          <FileUp className="h-4 w-4" />
          <span>Upload File</span>
        </Button>
        {selectedItems.length > 0 && (
          <Button
            size="sm"
            className="gap-2"
            onClick={handleGenerateRFQ}
          >
            <ShoppingCart className="h-4 w-4" />
            Generate RFQ
          </Button>
        )}
      </div>
    );

    setRightActions(rightActionContent);

    // Clean up the actions when the component unmounts or dependencies change
    return () => {
      setRightActions(null);
    };
  }, [setRightActions, selectedItems]);

  const renderVendorOptions = (item: InventoryItem) => {
    const filteredVendors = item.vendors.filter(vendor => 
      vendor.status.isSelected || vendor.status.isCurrentVendor
    );
    
    return (
      <div className="space-y-2">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className={`p-2 rounded-lg border ${
              vendor.status.isCurrentVendor
                ? 'bg-blue-50 border-blue-200'
                : vendor.status.isSelected
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {vendor.image_url && (
                  <img
                    src={vendor.image_url}
                  alt={vendor.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
                )}
                <span className="font-medium">{vendor.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {vendor.price && (
                  <span className="font-medium">${vendor.price.toFixed(2)}</span>
                )}
                {vendor.savings && vendor.savings > 0 && (
                  <span className="ml-2 text-green-600">
                    (Save ${vendor.savings.toFixed(2)})
                  </span>
                    )}
                  </div>
                </div>
            </div>
          ))}
      </div>
    );
  };

  const handleCommunicationChange = (vendorId: string, method: keyof CommunicationPrefs, checked: boolean) => {
    setCommunicationPrefs(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        [method]: checked,
      },
    }));
  };

  const handleInitiateSendProcess = async () => {
    setError(null);
    setSendStatus('sending');
    setIsProcessing(true);

    const payload = {
      items: rfqItems.map(item => ({ id: item.id, quantity: item.quantity })),
      vendors: Object.values(selectedVendors).flatMap(vendors => vendors.map(vendor => ({
        id: vendor,
        sendEmail: communicationPrefs[vendor]?.email ?? false,
        initiateAiCall: communicationPrefs[vendor]?.aiCall ?? false,
      }))).filter(v => v.sendEmail || v.initiateAiCall),
      notes: rfqNotes,
    };

    if (payload.vendors.length === 0) {
        setError("Please select at least one communication method for a vendor.");
        setSendStatus('error');
        setIsProcessing(false);
        return;
    }

    console.log("Sending RFQ Payload:", JSON.stringify(payload, null, 2));

    // --- TODO: Replace with actual API Call ---
    try {
      // const response = await fetch('/api/rfq/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // MOCK API Call
       await new Promise(resolve => setTimeout(resolve, 2000));
       const success = Math.random() > 0.1; // Simulate 90% success rate
       if (!success) throw new Error('Simulated API Error: Failed to dispatch RFQ.');

      // if (!response.ok) {
      //    const errorData = await response.json();
      //    throw new Error(errorData.message || 'Failed to send RFQ and initiate actions.');
      // }
      
      setSendStatus('sent');
      // Optional: Redirect after a short delay
      setTimeout(() => {
         router.push('/orders'); // Or a dedicated RFQ tracking page
      }, 2500);

    } catch (err: any) {
      console.error("RFQ Send Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setSendStatus('error');
    } finally {
      setIsProcessing(false); 
      // Keep processing true if redirecting immediately? Depends on desired UX.
      // If showing 'sent' status for a bit, set processing to false here.
    }
    // --- End of API Call Section ---
  };
  const getActiveActionsCount = (vendorId: string): number => {
      return selectedVendors[vendorId]?.length || 0;
  };

  // *** NEW FUNCTION for navigating to Order Confirmation ***
  const handleProceedToOrderConfirmation = () => {
    // Ensure items have been added
    if (selectedItems.length === 0) {
      console.warn("No items in order to proceed.");
      // Optionally show a user message/toast
      return;
    }

    // Ensure each item has a selected vendor (or handle cases where it might not)
    const itemsWithVendors = selectedItems.filter(item => item.selectedVendor && item.selectedVendor.price !== undefined && item.selectedVendor.price !== null);
    if (itemsWithVendors.length !== selectedItems.length) {
        console.warn("Some items are missing a selected vendor or vendor price. Cannot proceed.");
        // Show user message explaining which items need attention
        alert("Please ensure every item has a selected vendor with a price before creating the order."); 
        return;
    }

    // Prepare the final order data
    const finalOrderData = {
      items: itemsWithVendors.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.selectedVendor.price, // Use the price from the selected vendor
        vendorId: item.selectedVendor.id || item.selectedVendor.name, // Need a unique ID for the chosen vendor
        vendorName: item.selectedVendor.name,
      })),
      totalAmount: calculateTotal(), // Use existing total calculation
      // Add any other relevant order metadata if needed (e.g., delivery address, user info)
    };

    try {
      // Store the final order data for the confirmation page
      sessionStorage.setItem('finalOrderDataForConfirmation', JSON.stringify(finalOrderData));
      
      // Navigate to the order confirmation page
      router.push('/orders/create/confirm'); 
    } catch (error) {
        console.error("Error storing final order data or navigating:", error);
        alert("Failed to proceed to order confirmation. Please try again.");
    }
  };

  // *** NEW Handler for the "Continue" button in the Summary Card ***
  const handleProceedToContactMethod = () => {
    // --- Validation ---
    if (selectedItems.length === 0) {
      console.warn("No items in order to proceed.");
      alert("Please add items to your order first."); // User feedback
      return;
    }
    // Ensure every item has a finalized selected vendor before proceeding
    const itemsWithVendors = selectedItems.filter(item => 
        item.selectedVendor && 
        item.selectedVendor.price !== undefined && 
        item.selectedVendor.price !== null
    );
    if (itemsWithVendors.length !== selectedItems.length) {
        console.warn("Some items are missing a selected vendor or vendor price.");
        alert("Please ensure every item has a finalized selected vendor with a price before continuing."); 
        return;
    }

    // --- Prepare Data for Next Step ---
    const contactMethodData = {
      items: itemsWithVendors.map(item => ({
        // Map only necessary fields for the next step
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.selectedVendor.price,
        image: item.image, // Pass image if available
        vendor: { // Pass required info about the CHOSEN vendor
          id: item.selectedVendor.id || item.selectedVendor.name, // Need a unique ID
          name: item.selectedVendor.name,
          contactEmail: item.selectedVendor.contactEmail,
          contactPhone: item.selectedVendor.contactPhone,
        }
      })),
      totalAmount: calculateTotal(), // Pass the calculated total
    };

    // --- Store Data and Navigate ---
    try {
      // Use sessionStorage to pass data to the next client page
      sessionStorage.setItem('orderDataForContactMethod', JSON.stringify(contactMethodData));
      // Navigate to the new contact method selection page
      router.push('/orders/create/contact-method'); 
    } catch (error) {
      console.error("Error storing contact method data or navigating:", error);
      alert("Failed to proceed. Please check console or try again."); // User feedback
    }
  };

  // Handle click outside for filters dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFilters])

  const handleImportCSV = () => {
    // Transform inventory data to match the expected format for selected items
    const importedItems = inventoryData.map(item => {
      const defaultVendor = item.vendors[0];
      return {
        ...item,
        quantity: 1,
        vendors: item.vendors.map(v => ({
          ...v,
          status: {
            isCurrentVendor: v === defaultVendor,
            isSelected: v === defaultVendor
          }
        })),
        selectedVendor: {
          ...defaultVendor,
          status: {
            isCurrentVendor: true,
            isSelected: true
          }
        },
        selectedVendorIds: [defaultVendor.id],
      selectedVendors: [{
          ...defaultVendor,
          status: {
            isCurrentVendor: true,
            isSelected: true
          }
        }]
      };
    });
    
    setCsvItems(importedItems);
    setSelectedItems(importedItems);
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleVendorSelect = (itemId: string, vendorName: string, vendor: Vendor) => {
    if (!selectedItem) return;

    // Update local state first
    const updatedVendors = selectedItem.vendors.map(v => ({
      ...v,
      status: {
        ...v.status,
        isSelected: v.id === vendor.id ? !v.status.isSelected : v.status.isSelected
      }
    }));

    setSelectedItem({
      ...selectedItem,
      vendors: updatedVendors
    });

    // Update global state
    setSelectedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          vendors: updatedVendors,
          ...(updatedVendors.find(v => v.id === vendor.id)?.status.isSelected ? {
            selectedVendorIds: [...new Set([...(item.selectedVendorIds || []), vendor.id])],
            selectedVendors: [...new Set([...(item.selectedVendors || []), vendor])]
          } : {
            selectedVendorIds: (item.selectedVendorIds || []).filter(id => id !== vendor.id),
            selectedVendors: (item.selectedVendors || []).filter(v => v.id !== vendor.id)
          })
        };
      }
      return item;
    }));

    // Update the selectedVendors state
    if (setSelectedVendors) {
      setSelectedVendors(prev => {
        const currentIds = prev[itemId] || [];
        const isSelected = !currentIds.includes(vendor.id);
        
        return {
          ...prev,
          [itemId]: isSelected 
            ? [...currentIds, vendor.id]
            : currentIds.filter(id => id !== vendor.id)
        };
      });
    }

    // Update the selectedVendorActions state
    if (setSelectedVendorActions) {
      setSelectedVendorActions(prev => [
        ...prev,
        {
          itemId,
          vendorId: vendor.id,
          vendor,
          action: 'select'
        }
      ]);
    }
  };

  // New function to add alternative vendors to the main item list
  const handleAddAlternativeVendor = (itemId: string, vendorToAdd: Vendor) => {
    setSelectedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          // Check if vendor already exists
          const vendorExists = item.selectedVendors.some(v => v.id === vendorToAdd.id || v.name === vendorToAdd.name);
          if (!vendorExists) {
            // Add the new vendor, ensuring isDefault is false
            return {
              ...item,
              selectedVendors: [...item.selectedVendors, { ...vendorToAdd, isDefault: false, isSelected: false }]
            };
          }
        }
        return item;
      })
    );
    // Optionally close the overlay or give feedback
    // setIsDetailsOverlayOpen(false);
  };

  // Add this function after the other handlers
  const handleOpenAISuggestions = async () => {
    try {
      setLoadingAISuggestions(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock AI suggested items based on recent activity
      const suggestedItems = inventoryData
        .filter(item => Math.random() > 0.7) // Randomly select some items
        .map(item => ({
          ...item,
          reason: [
            "Based on your recent orders",
            "Similar to items you frequently purchase",
            "Low stock alert",
            "Price drop detected",
            "New product available"
          ][Math.floor(Math.random() * 5)]
        }))
      
      setAiSuggestedItems(suggestedItems)
      setIsAISuggestionsOverlayOpen(true)
    } catch (error) {
      console.error('Error loading AI suggestions:', error)
    } finally {
      setLoadingAISuggestions(false)
    }
  }

  const handleAddSuggestedItem = (item: any) => {
    addItemToOrder(item)
    setAiSuggestedItems(prev => prev.filter(i => i.id !== item.id))
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium">Order #ORD-2023-001</h1>
              <Badge variant="outline" className="text-xs">Draft</Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <nav className="flex space-x-8" aria-label="Order sections">
            <button
              onClick={() => setActiveTab("order")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "order"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Order
            </button>
            <button
              onClick={() => setActiveTab("quotes")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "quotes"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quotes
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "order" && (
            <>
              {/* Search Card */}
              <Card>
                <CardContent className="space-y-6">
                  {/* Remove AI Suggestions Section */}
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, SKU, or category..."
                        className="pl-12 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative" ref={filtersRef}>
                        <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                          <Filter className="h-4 w-4" />
                        </Button>
                        {showFilters && (
                          <div className="absolute right-0 mt-2 w-[280px] rounded-lg border bg-white shadow-lg z-50 p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="filterPaymentTerms">Payment Terms</Label>
                              <select
                                id="filterPaymentTerms"
                                value={selectedPaymentTerms}
                                onChange={(e) => setSelectedPaymentTerms(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                {paymentTermsOptions.map((term) => (
                                  <option key={term} value={term}>
                                    {term}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="filterDeliveryTime">Delivery Time</Label>
                              <select
                                id="filterDeliveryTime"
                                value={selectedDeliveryTime}
                                onChange={(e) => setSelectedDeliveryTime(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                {deliveryTimeOptions.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuRadioGroup value={groupBy} onValueChange={setGroupBy}>
                            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="vendor">Vendor</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="border rounded-md">
                      {isSearching ? (
                        <div className="flex justify-center items-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredItems.length > 0 ? (
                        <div className="divide-y">
                          {filteredItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="p-3 grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 items-center hover:bg-muted/50 cursor-pointer"
                              onClick={() => addItemToOrder(item)}
                            >
                              {/* Product Image */}
                              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                <img
                                  src={item.image || `/placeholder.svg?height=48&width=48`}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain p-1"
                                />
                              </div>
                              
                              {/* Product Name */}
                              <div className="min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.name}</span>
                                  {item.status === "Urgent" && (
                                    <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs font-normal">Urgent</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{item.sku}</div>
                              </div>

                              {/* Stock */}
                              <div className="text-sm text-center">
                                <div className="font-medium">{item.currentStock}/{item.totalStock}</div>
                                <div className="text-muted-foreground">in stock</div>
                              </div>

                              {/* Supplier & Price */}
                              <div className="text-right min-w-[150px]">
                                <div className="font-medium">{item.vendor}</div>
                                <div className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} per unit</div>
                              </div>

                              {/* Add Button */}
                              <Button
                                size="sm"
                                disabled={selectedItems.some((i) => i.id === item.id)}
                                className="w-[80px]"
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

                  {/* Selected Items Table */}
                  {selectedItems.length > 0 && (
                    <div className="overflow-x-auto">
                      <div className="min-w-[1400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[400px]">Product Details</TableHead>
                              <TableHead className="w-[140px]">SKU</TableHead>
                              <TableHead className="w-[250px]">Vendor</TableHead>
                              <TableHead className="w-[120px] text-center">Review</TableHead>
                              <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                              <TableHead className="w-[100px] text-center">Quantity</TableHead>
                              <TableHead className="w-[120px] text-right">Total</TableHead>
                              <TableHead className="w-[150px]">Payment Terms</TableHead>
                              <TableHead className="w-[150px]">Delivery Terms</TableHead>
                              <TableHead className="w-[40px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              if (groupBy === "vendor") {
                                // Group items by vendor
                                const groupedItems = selectedItems.reduce<{ [key: string]: typeof selectedItems }>((acc, item) => {
                                  // Get the vendor name from either the selected vendor or the first vendor in the vendors array
                                  const vendorName = item.selectedVendor?.name || 
                                                    (item.vendors && item.vendors[0]?.name) || 
                                                    "Unassigned";
                                  
                                  if (!acc[vendorName]) {
                                    acc[vendorName] = [];
                                  }
                                  acc[vendorName].push(item);
                                  return acc;
                                }, {});

                                return Object.entries(groupedItems).map(([vendorName, items]) => (
                                  <React.Fragment key={vendorName}>
                                    {/* Vendor Group Header */}
                                    <TableRow className="bg-muted/50">
                                      <TableCell colSpan={10} className="py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center">
                                            <img
                                              src={getVendorLogo(vendorName)}
                                              alt={vendorName}
                                              className="w-full h-full object-contain p-1"
                                            />
                                          </div>
                                          <span className="font-medium">{vendorName}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {items.length} items
                                          </Badge>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                    {/* Vendor Items */}
                                    {items.map((item) => (
                                      <React.Fragment key={item.id}>
                                        <TableRow
                                          className="cursor-pointer hover:bg-muted/50"
                                          onClick={() => {
                                            setSelectedItem(item);
                                            setIsDetailsOverlayOpen(true);
                                          }}
                                        >
                                          <TableCell>
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <img
                                                  src={item.image || `/placeholder.svg?height=32&width=32`}
                                                  alt={item.name}
                                                  className="max-w-full max-h-full object-contain"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-sm">{item.name}</span>
                                                  {item.status === "Urgent" && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs font-normal">Urgent</Badge>
                                                  )}
                                                </div>
                                                <div className="text-sm text-muted-foreground line-clamp-2">
                                                  {item.description}
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>{item.sku}</TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                              {item.vendors
                                                .filter(vendor => vendor.status.isSelected || vendor.status.isCurrentVendor)
                                                .map((vendor, index) => (
                                                <div 
                                                    key={`${item.id}-${vendor.name}`}
                                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                                                      vendor.status.isCurrentVendor 
                                                        ? "bg-blue-50 border-blue-200" 
                                                        : vendor.status.isSelected
                                                        ? "bg-primary/5 border-primary"
                                                        : "bg-gray-50 border-gray-200"
                                                  }`}
                                                >
                                                  <div className="relative h-4 w-4 rounded-full overflow-hidden border bg-white">
                                                    <img
                                                        src={vendor.image_url || getVendorLogo(vendor.name)}
                                                      alt={vendor.name}
                                                      className="w-full h-full object-contain p-0.5"
                                                    />
                                                  </div>
                                                  <span className={`text-xs font-medium ${
                                                      vendor.status.isCurrentVendor 
                                                        ? "text-blue-700" 
                                                        : vendor.status.isSelected
                                                        ? "text-primary"
                                                        : "text-gray-700"
                                                  }`}>
                                                    {vendor.name}
                                                  </span>
                                                </div>
                                              ))}
                                              {/* Add badge showing number of unselected vendors */}
                                              {(() => {
                                                const unselectedCount = item.vendors.filter(
                                                  v => !v.status.isSelected && !v.status.isCurrentVendor
                                                ).length;
                                                if (unselectedCount > 0) {
                                                  return (
                                                    <div 
                                                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setIsDetailsOverlayOpen(true);
                                                      }}
                                                    >
                                                      <Plus className="h-3 w-3 text-gray-500" />
                                                      <span className="text-xs text-gray-500 font-medium">
                                                        {unselectedCount}
                                                      </span>
                                                    </div>
                                                  );
                                                }
                                                return null;
                                              })()}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                              <span className="text-sm text-muted-foreground">4.5 (24)</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            ${item.unitPrice.toFixed(2)}
                                          </TableCell>
                                          <TableCell>
                                            <Input
                                              type="number"
                                              min="1"
                                              value={item.quantity || 1}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                updateItemQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1));
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              className="h-7 w-14 text-center"
                                            />
                                          </TableCell>
                                          <TableCell className="text-right">
                                            ${((item.quantity || 1) * item.unitPrice).toFixed(2)}
                                          </TableCell>
                                          <TableCell>{selectedPaymentTerms}</TableCell>
                                          <TableCell>{selectedDeliveryTime}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeItemFromOrder(item.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                        {expandedItems[item.id] && (
                                          <TableRow>
                                            <TableCell colSpan={11} className="p-0 border-t-0">
                                              <div className="p-4 bg-gray-50">
                                                {/* Existing expanded content */}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </React.Fragment>
                                ));
                              }
                              
                              // Regular non-grouped view
                              return selectedItems.map((item) => (
                                <React.Fragment key={item.id}>
                                  <TableRow
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDetailsOverlayOpen(true);
                                    }}
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                          <img
                                            src={item.image || `/placeholder.svg?height=32&width=32`}
                                            alt={item.name}
                                            className="max-w-full max-h-full object-contain"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{item.name}</span>
                                            {item.status === "Urgent" && (
                                              <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs font-normal">Urgent</Badge>
                                            )}
                                          </div>
                                          <div className="text-sm text-muted-foreground line-clamp-2">
                                            {item.description}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-2">
                                        {item.vendors
                                          .filter(vendor => vendor.status.isSelected || vendor.status.isCurrentVendor)
                                          .map((vendor, index) => (
                                          <div 
                                              key={`${item.id}-${vendor.name}`}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                                                vendor.status.isCurrentVendor 
                                                  ? "bg-blue-50 border-blue-200" 
                                                  : vendor.status.isSelected
                                                  ? "bg-primary/5 border-primary"
                                                  : "bg-gray-50 border-gray-200"
                                            }`}
                                          >
                                            <div className="relative h-4 w-4 rounded-full overflow-hidden border bg-white">
                                              <img
                                                  src={vendor.image_url || getVendorLogo(vendor.name)}
                                                alt={vendor.name}
                                                className="w-full h-full object-contain p-0.5"
                                              />
                                            </div>
                                            <span className={`text-xs font-medium ${
                                                vendor.status.isCurrentVendor 
                                                  ? "text-blue-700" 
                                                  : vendor.status.isSelected
                                                  ? "text-primary"
                                                  : "text-gray-700"
                                            }`}>
                                              {vendor.name}
                                            </span>
                                          </div>
                                        ))}
                                        {/* Add badge showing number of unselected vendors */}
                                        {(() => {
                                          const unselectedCount = item.vendors.filter(
                                            v => !v.status.isSelected && !v.status.isCurrentVendor
                                          ).length;
                                          if (unselectedCount > 0) {
                                            return (
                                              <div 
                                                className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedItem(item);
                                                  setIsDetailsOverlayOpen(true);
                                                }}
                                              >
                                                <Plus className="h-3 w-3 text-gray-500" />
                                                <span className="text-xs text-gray-500 font-medium">
                                                  {unselectedCount}
                                                </span>
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm text-muted-foreground">4.5 (24)</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${item.unitPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity || 1}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          updateItemQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 w-14 text-center"
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ${((item.quantity || 1) * item.unitPrice).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{selectedPaymentTerms}</TableCell>
                                    <TableCell>{selectedDeliveryTime}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeItemFromOrder(item.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                  {expandedItems[item.id] && (
                                    <TableRow>
                                      <TableCell colSpan={11} className="p-0 border-t-0">
                                        <div className="p-4 bg-gray-50">
                                          {/* Existing expanded content */}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Separate Summary Section */}
                  {selectedItems.length > 0 && (
                    <div className="mt-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Summary Statistics Card */}
            <Card>
              <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-lg p-3">
                                <div className="text-sm text-muted-foreground">Total Items</div>
                                <div className="text-2xl font-semibold">{selectedItems.length}</div>
                              </div>
                              <div className="border rounded-lg p-3">
                                <div className="text-sm text-muted-foreground">Total Vendors</div>
                                <div className="text-2xl font-semibold">
                                  {new Set(selectedItems.flatMap(item => 
                                    item.vendors.filter(v => v.status.isSelected).map(v => v.name)
                                  )).size}
                                </div>
                              </div>
                              <div className="border rounded-lg p-3">
                                <div className="text-sm text-muted-foreground">Total Quantity</div>
                                <div className="text-2xl font-semibold">
                                  {selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                </div>
                              </div>
                              <div className="border rounded-lg p-3">
                                <div className="text-sm text-muted-foreground">Total Amount</div>
                                <div className="text-2xl font-semibold">${calculateTotal().toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-4 border-t">
                              <Button
                                className="w-full justify-start gap-2" 
                                onClick={handleGenerateRFQ}
                              >
                                <FileText className="h-4 w-4" />
                                Create an RFQ
                              </Button>
                              <Button 
                                className="w-full justify-start gap-2" 
                                variant="outline"
                                onClick={handleProceedToOrderConfirmation}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Buy with AMS
                              </Button>
                              <Button
                                className="w-full justify-start gap-2" 
                                variant="outline"
                                onClick={() => {/* TODO: Implement email functionality */}}
                              >
                                <Mail className="h-4 w-4" />
                                Send Email
                              </Button>
                              <Button 
                                className="w-full justify-start gap-2" 
                                variant="outline"
                                onClick={() => {/* TODO: Implement AI call functionality */}}
                              >
                                <PhoneCall className="h-4 w-4" />
                                AI Call
                              </Button>
                            </div>
              </CardContent>
            </Card>

                        {/* Actions and AI Analytics Card */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Actions & AI Insights</CardTitle>
                            <CardDescription>Take action and view AI-powered recommendations</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 bg-blue-100 rounded-full">
                                  <Sparkles className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-sm text-blue-800">
                                  We've found 2 items you might want to add based on your recent activity.
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-blue-200">
                                  <div>
                                    <div className="font-medium text-blue-900">Cost Optimization</div>
                                    <p className="text-sm text-blue-700 mt-1">
                                      Potential savings of up to 15% by consolidating orders with AMS
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                                    View
                                  </Button>
                                </div>

                                <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-blue-200">
                                  <div>
                                    <div className="font-medium text-blue-900">Compliance Check</div>
                                    <p className="text-sm text-blue-700 mt-1">
                                      All selected items meet regulatory requirements
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                                    View
                                  </Button>
                                </div>

                                <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-blue-200">
                                  <div>
                                    <div className="font-medium text-blue-900">Similar Items</div>
                                    <p className="text-sm text-blue-700 mt-1">
                                      2 recommended items based on your order history
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
              </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "quotes" && (
            <Card>
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
                <CardDescription>View and compare quotes from different vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  No quotes available yet. Add items to your order to get quotes.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div> {/* Close main space-y-6 div */}

      {/* Quick Actions Toolbar - Will show 'Review Order' or 'Create RFQ' button */}
      <QuickActionsToolbar />
      
      <OrderDetailsOverlay
        isOpen={isDetailsOverlayOpen}
        onClose={() => setIsDetailsOverlayOpen(false)}
        item={selectedItem}
        alternativeVendors={alternativeVendors[selectedItem?.id] || []}
        setSelectedItems={setSelectedItems}
        handleFindAlternatives={handleFindAlternatives}
        loadingAlternatives={loadingAlternatives}
        renderStars={renderStars}
        selectedVendors={selectedVendors}
        setSelectedVendors={setSelectedVendors}
        setSelectedVendorActions={setSelectedVendorActions}
        onAddAlternativeVendor={handleAddAlternativeVendor}
      />

      {isAISuggestionsOverlayOpen && (
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsAISuggestionsOverlayOpen(false)}
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 w-[calc(100%-32px)] max-w-[900px] bg-white shadow-lg z-50"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">AI Suggestions</div>
                      <div className="text-lg font-semibold">Recommended Items</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsAISuggestionsOverlayOpen(false)} className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {loadingAISuggestions ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : aiSuggestedItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No suggestions available at this time.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aiSuggestedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 p-4 border rounded-lg bg-white"
                          >
                            {/* Product Image */}
                            <div className="w-24 h-24 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src={item.image || `/placeholder.svg`}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain p-2"
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">{item.sku}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{item.packaging}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{item.vendor}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${item.unitPrice?.toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.currentStock}/{item.totalStock} in stock
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-blue-600">
                                  {item.reason}
                                </div>
                                <Button
                                  onClick={() => handleAddSuggestedItem(item)}
                                  className="bg-black text-white hover:bg-black/90"
                                >
                                  Add to Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        </AnimatePresence>
      )}

      {/* RFQ Confirmation Dialog */}
      <AnimatePresence>
        {showRfqDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => !isGeneratingRfq && setShowRfqDialog(false)}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-[40%] top-[50px] translate-x-[-50%] translate-y-0 w-full max-w-2xl bg-white shadow-lg rounded-lg z-[101] overflow-y-auto max-h-[calc(100vh-100px)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Generate Request for Quotation</h3>
                    <p className="text-sm text-muted-foreground">Review the details before proceeding</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => !isGeneratingRfq && setShowRfqDialog(false)}
                    disabled={isGeneratingRfq}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Order Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Total Items</div>
                        <div className="font-medium">{selectedItems.length} items</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Total Amount</div>
                        <div className="font-medium">${calculateTotal().toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Vendors */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Vendors</h4>
                    <div className="border rounded-lg divide-y">
                      {Array.from(new Set(selectedItems.flatMap(item => 
                        item.vendors
                          .filter(v => v.status.isSelected)
                          .map(v => ({
                            name: v.name,
                            items: selectedItems.filter(i => 
                              i.vendors.some(vendor => 
                                vendor.status.isSelected && vendor.name === v.name
                              )
                            ).length
                          }))
                      ))).map((vendor, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <img
                                src={getVendorLogo(vendor.name)}
                                alt={vendor.name}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">{vendor.items} items</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Terms & Conditions</h4>
                    <div className="text-sm space-y-2 text-muted-foreground">
                      <p>By proceeding, you agree to:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Share item specifications with selected vendors</li>
                        <li>Allow vendors to submit quotes within 5 business days</li>
                        <li>Maintain quote confidentiality</li>
                        <li>Review and respond to quotes in a timely manner</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => !isGeneratingRfq && setShowRfqDialog(false)}
                    disabled={isGeneratingRfq}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmRFQ}
                    disabled={isGeneratingRfq}
                    className="gap-2"
                  >
                    {isGeneratingRfq ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate RFQ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

