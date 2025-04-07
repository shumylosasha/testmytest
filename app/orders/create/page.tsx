"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileUp, Loader2, Plus, Search, Trash2, TrendingDown, BookOpen, RefreshCw, ExternalLink, Sparkles, Star, StarHalf, MessageSquare, Mail, ChevronDown, MessageSquareText, Scale, Building2, History, AlertTriangle, FileText, ShoppingCart, BookmarkPlus, Package, DollarSign, X, ChevronRight, CheckCircle2, Clock, CheckCircle, PhoneCall, Filter, XCircle, ShieldCheck } from "lucide-react"
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
  image_url?: string | null;
  id: string;
  contactEmail?: string;
  contactPhone?: string;
  certifications?: string[];
  reviews?: {
    rating: number;
    count: number;
    recentReviews: Array<{
      rating: number;
      comment: string;
      date: string;
      reviewer: string;
    }>;
  };
  notes?: string[];
  complianceStatus?: string;
  warranty?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  bulkDiscounts?: Array<{
    quantity: number;
    discount: number;
  }>;
  // Add mock performance data
  onTimeDeliveryRate?: number;
  fillRate?: number;
  qualityRating?: number; // e.g., scale of 1-5 or specific metric
}

interface SelectedVendorAction {
  itemId: string;
  vendorId: string;
  vendor: Vendor;
}

interface OrderDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  alternativeVendors: { [key: string]: any[] };
  setSelectedItems: React.Dispatch<React.SetStateAction<any[]>>;
  handleFindAlternatives: (itemId: string) => void;
  loadingAlternatives: { [key: string]: boolean };
  renderStars: (rating: number) => React.ReactNode; // Add renderStars prop
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
      // Add mock performance data
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
      // Add mock performance data
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

const OrderDetailsOverlay = ({ 
  isOpen, 
  onClose, 
  item, 
  alternativeVendors,
  setSelectedItems,
  handleFindAlternatives,
  loadingAlternatives,
  renderStars
}: OrderDetailsOverlayProps) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleVendorSelect = (itemId: string, vendorId: string, vendor: Vendor) => {
    setSelectedItems(prev => prev.map(i => 
      i.id === itemId 
        ? { ...i, selectedVendor: vendor }
        : i
    ));
    onClose();
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

  if (!isOpen || !item) return null;

  const baselinePrice = item.unitPrice;
  const alternativePrices = alternativeVendors[item.id]?.map(v => v.price) || [];
  const allPrices = [baselinePrice, ...alternativePrices];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const chartHeight = 120;

  // Generate historical data for each vendor
  const baselineHistory = generateHistoricalData(baselinePrice);
  const alternativeHistories = alternativePrices.map(price => generateHistoricalData(price));

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-y-0 right-0 w-[calc(100%-32px)] max-w-[720px] bg-white shadow-lg z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Product Information</div> {/* Changed title */}
                    <div className="text-lg font-semibold">{item.name}</div> {/* Show item name */} 
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
                      {/* Item Identification Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Item Overview</h3>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <img
                              src={item.image || `/placeholder.svg`}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-base">{item.name}</div>
                            <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </div>

                      {/* Product Details Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Product Specifications</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="text-muted-foreground">Manufacturer:</div>
                          <div>{item.mfgrName || '--'}</div>
                          
                          <div className="text-muted-foreground">Mfg Product #:</div>
                          <div>{item.mfgProdItem || '--'}</div>
                          
                          <div className="text-muted-foreground">Description:</div>
                          <div>{item.prodDesc || '--'}</div>

                          <div className="text-muted-foreground">Available:</div>
                          <div>{item.productAvailable || '--'}</div>
                          
                          <div className="text-muted-foreground">Items/Case:</div>
                          <div>{item.itemsInCase || '--'}</div>
                          
                          <div className="text-muted-foreground">Case MOQ:</div>
                          <div>{item.caseMOQ || '--'}</div>

                          <div className="text-muted-foreground">Case Price:</div>
                          <div>{item.casePrice || '--'}</div>

                          <div className="text-muted-foreground">Shipping Included:</div>
                          <div>{item.priceIncludeShipping || '--'}</div>

                          <div className="text-muted-foreground">Comment:</div>
                          <div>{item.comment || '--'}</div>

                          <div className="text-muted-foreground">Substitution:</div>
                          <div>{item.substitutionItem || '--'}</div>

                        </div>
                      </div>

                      {/* Current Supplier Section */}
                      {item.vendor && (
                        <div>
                          <h3 className="text-sm font-medium mb-4">Current Supplier</h3>
                          <div className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                            <div className="w-10 h-10 rounded bg-white border flex items-center justify-center flex-shrink-0">
                              <img
                                src={getVendorLogo(item.vendor)}
                                alt={item.vendor}
                                className="max-w-full max-h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.src = VENDOR_LOGOS.default;
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.vendor}</div>
                              <div className="text-sm text-muted-foreground">Unit Price: ${(item.unitPrice || 0).toFixed(2)}</div>
                            </div>
                            {/* Maybe add a button to switch supplier or view vendor details? */}
                          </div>
                        </div>
                      )}

                      {/* Removed Order Info, Customer Info, Payment Summary */}
                    </>
                  ) : activeTab === "quotes" ? (
                    <div className="space-y-4"> {/* Changed from space-y-6 and removed justify-between header */}
                      <h3 className="text-sm font-medium">Alternative Vendors</h3>
                      {/* Removed Refresh Button */}

                      {/* Changed layout from grid to vertical flex */}
                      <div className="flex flex-col gap-4">
                        {MOCK_ALTERNATIVES.default.map((vendor) => { // Directly use mock data
                          const isSelected = item.selectedVendor?.id === vendor.id || item.selectedVendor?.name === vendor.name; // Check if this mock vendor is the currently selected one
                          return (
                          <Card
                            key={vendor.id}
                            className={`transition-all border ${isSelected ? "border-primary shadow-md" : "hover:border-gray-300"}`}
                          >
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                              {/* Vendor Logo & Basic Info */}
                              <div className="flex flex-col items-center md:items-start md:w-1/4">
                                <div className="w-16 h-16 mb-2 rounded border bg-white flex items-center justify-center flex-shrink-0 p-1">
                                  <img
                                    src={getVendorLogo(vendor.name)}
                                    alt={vendor.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => { e.currentTarget.src = VENDOR_LOGOS.default; }}
                                  />
                                </div>
                                <div className="text-center md:text-left">
                                  <div className="font-medium text-sm">{vendor.name}</div>
                                  <a href={vendor.url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center justify-center md:justify-start gap-1">
                                    Visit Website <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>

                              {/* Details Section */}
                              <div className="flex-1 space-y-2 border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-base">{vendor.productName}</span>
                                  <span className="font-semibold text-lg">${vendor.price?.toFixed(2)}</span>
                                </div>
                                {vendor.savings !== null && vendor.savings > 0 && (
                                  <div className="text-sm text-green-600 font-medium text-right">
                                    Save ${vendor.savings.toFixed(2)}
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                                  <div>Delivery: <span className="font-medium text-foreground">{vendor.delivery}</span></div>
                                  <div>Packaging: <span className="font-medium text-foreground">{vendor.packaging}</span></div>
                                  <div>Warranty: <span className="font-medium text-foreground">{vendor.warranty || 'N/A'}</span></div>
                                  <div>Returns: <span className="font-medium text-foreground">{vendor.returnPolicy || 'N/A'}</span></div>
                                </div>
                                {vendor.certifications && vendor.certifications.length > 0 && (
                                  <div className="text-xs text-muted-foreground pt-1">
                                    Certifications: {vendor.certifications.join(', ')}
                                  </div>
                                )}
                                {vendor.reviews && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <div className="flex">{renderStars(vendor.reviews.rating)}</div> {/* Use passed prop */}
                                    <span className="text-xs text-muted-foreground">({vendor.reviews.count} reviews)</span>
                                  </div>
                                )}
                              </div>

                              {/* Actions Section */}
                              <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0 min-w-[120px]">
                                <Button
                                  size="sm"
                                  onClick={() => handleVendorSelect(item.id, vendor.id, vendor)}
                                  variant={isSelected ? "default" : "outline"}
                                  className="w-full gap-2"
                                >
                                  {isSelected ? <CheckCircle className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                                  {isSelected ? 'Selected' : 'Select'}
                                </Button>
                                <Button size="sm" variant="outline" className="w-full gap-2">
                                  <Mail className="h-4 w-4" /> Email
                                </Button>
                                <Button size="sm" variant="outline" className="w-full gap-2">
                                  <FileText className="h-4 w-4" /> Send RFQ
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      )}
                      </div>

                      {/* Price History section (optional, can be kept or removed) */}
                      <div className="border-t pt-4 mt-6">
                        <h4 className="text-sm font-medium mb-3">Price History</h4>
                        <div className="h-[120px] relative bg-muted/20 rounded-lg">
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            Historical price trends will be shown here
                          </div>
                        </div>
                      </div>
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
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
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
  const [productFeedback] = useState<{ [key: string]: Feedback[] }>({
    'default-feedback': [
      { doctorName: "Dr. Smith", rating: 4.5, comment: "Excellent quality, would recommend", date: "2024-03-15" },
      { doctorName: "Dr. Johnson", rating: 5, comment: "Best in class, very reliable", date: "2024-03-14" },
      { doctorName: "Dr. Williams", rating: 4, comment: "Good product, slight delay in delivery", date: "2024-03-13" }
    ]
  })
  const [selectedVendorActions, setSelectedVendorActions] = useState<SelectedVendorAction[]>([])
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([])
  const [rfqNotes, setRfqNotes] = useState<string>("")
  const [communicationPrefs, setCommunicationPrefs] = useState<{ [vendorId: string]: CommunicationPrefs }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<string | null>(null)
  const [csvItems, setCsvItems] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<string>("none"); // State for grouping
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set()); // State for checkboxes

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

  const addItemToOrder = async (item: any) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      // Add the item to selected items first
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

      // Add immediate mockup alternatives instead of searching
      setAlternativeVendors(prev => ({
        ...prev,
        [item.id]: MOCK_ALTERNATIVES.default.map(alt => {
          const altPrice = parseFloat((item.unitPrice * (0.8 + Math.random() * 0.3)).toFixed(2));
          return {
            ...alt,
            price: altPrice,
            savings: Math.max(0, item.unitPrice - altPrice)
          };
        })
      }));

      // Add immediate AI recommendation
      setAiRecommendations(prev => ({
        ...prev,
        [item.id]: "I've found several alternative vendors for this product. Cardinal Health offers the best value with potential savings of up to 20%. Medline provides faster delivery options."
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
            "mfimedical.com",
            "medline.com",
            "cardinalhealth.com",
            "mckesson.com",
            "henryschein.com"
          ]
        })
      })

      if (!searchResponse.ok) {
        throw new Error('Failed to search for alternatives')
      }

      const searchData = await searchResponse.json()
      
      // Transform the search results into the format we need and limit to 4 vendors
      const alternatives = searchData.products
        .slice(0, 4) // Limit to 4 vendors
        .map((product: any) => ({
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

      // If we have less than 2 alternatives, add placeholder alternatives
      if (alternatives.length < 2) {
        const placeholderVendors = [
          {
            name: "Medline",
            productName: "Similar Product",
            price: parseFloat((selectedItems.find(item => item.id === itemId)?.unitPrice * 0.9).toFixed(2)),
            savings: null,
            delivery: "3-5 days",
            packaging: "Standard",
            isSelected: false,
            url: "#",
            image_url: null
          },
          {
            name: "Cardinal Health",
            productName: "Similar Product",
            price: parseFloat((selectedItems.find(item => item.id === itemId)?.unitPrice * 0.95).toFixed(2)),
            savings: null,
            delivery: "2-4 days",
            packaging: "Standard",
            isSelected: false,
            url: "#",
            image_url: null
          },
          {
            name: "McKesson",
            productName: "Similar Product",
            price: parseFloat((selectedItems.find(item => item.id === itemId)?.unitPrice * 0.85).toFixed(2)),
            savings: null,
            delivery: "4-6 days",
            packaging: "Standard",
            isSelected: false,
            url: "#",
            image_url: null
          }
        ].slice(0, 2 - alternatives.length); // Only add what we need to reach 2 vendors

        alternatives.push(...placeholderVendors);
      }

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
    // Prepare data for the RFQ page
    const rfqData = selectedVendorActions.map(action => {
      // Find the full item details from selectedItems using the itemId from the action
      const itemDetails = selectedItems.find(item => item.id === action.itemId);
      
      return {
        itemId: action.itemId,
        itemName: itemDetails?.name || 'Unknown Item', // Get name from selectedItems
        itemSku: itemDetails?.sku || 'Unknown SKU', // Get SKU from selectedItems
        quantity: itemDetails?.quantity || 0, // Get quantity from selectedItems
        vendor: { // Pass relevant vendor details
          id: action.vendor.id || action.vendorId, // Ensure vendor has an ID
          name: action.vendor.name,
          contactEmail: action.vendor.contactEmail,
          contactPhone: action.vendor.contactPhone,
          // Add other necessary vendor details if needed
        }
      };
    }).filter(data => data.quantity > 0); // Ensure we only pass items with quantity

    if (rfqData.length === 0) {
      console.warn("No valid items/vendors selected for RFQ.");
      // Optionally show a user message/toast here
      return;
    }

    try {
      // Store the prepared data in sessionStorage
      sessionStorage.setItem('rfqDataForPreparation', JSON.stringify(rfqData));
      
      // Navigate to the RFQ preparation page
      router.push('/orders/create/rfq'); 
    } catch (error) {
        console.error("Error storing RFQ data or navigating:", error);
        // Handle storage error (e.g., quota exceeded)
        // Show an error message to the user
    }
  };

  // Set up the right actions for the quick actions toolbar conditionally
  useEffect(() => {
    let rightActionContent: React.ReactNode = (
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full bg-white text-black hover:bg-white/90 hover:text-black active:bg-white/80 flex items-center gap-2"
      >
        <FileUp className="h-4 w-4" />
        <span>Upload File</span>
      </Button>
    );

    if (checkedItems.size > 0) {
      rightActionContent = (
        <Button
          size="sm"
          className="gap-2"
          onClick={handleGenerateRFQ} // Assuming this function handles RFQ for checked items
        >
          <Mail className="h-4 w-4" />
          Send RFQ ({checkedItems.size})
        </Button>
      );
    } else if (selectedItems.length > 0) {
      rightActionContent = (
        <Button
          size="sm"
          className="gap-2"
          onClick={handleGenerateRFQ} // Assuming this function handles RFQ for all selected items
        >
          <Mail className="h-4 w-4" />
          Send RFQ ({selectedItems.length}) {/* Changed text to show total item count */}
        </Button>
      );
    }

    setRightActions(rightActionContent);

    // Clean up the actions when the component unmounts or dependencies change
    return () => {
      setRightActions(null);
    };
  }, [setRightActions, selectedItems, checkedItems]); // Add dependencies

  const renderVendorOptions = (item: any) => {
    const vendors = alternativeVendors[item.id] || [];
    
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {vendors.map((vendor: Vendor, index: number) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <img
                  src={getVendorLogo(vendor.name)}
                  alt={vendor.name}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.src = VENDOR_LOGOS.default;
                  }}
                />
              </div>
              {/* Rest of the vendor option content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-muted-foreground">{vendor.productName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${vendor.price?.toFixed(2)}</div>
                    {vendor.savings !== null && vendor.savings > 0 && ( // Check for null before comparison
                      <div className="text-sm text-green-600">Save ${vendor.savings.toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {vendor.packaging}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {vendor.delivery}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="ml-4"
                onClick={() => handleVendorSelect(item.id, `${vendor.name}-${vendor.productName}`, vendor)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
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
    // Mock data for now - in real implementation, you would parse the actual CSV
    const mockCsvItems = [
      {
        id: '1',
        name: 'Set Irrigation Fluid Warming Single',
        sku: '24750',
        mfgrName: '3M HEALTHCARE',
        mfgProdItem: '24750',
        prodDesc: 'Set Irrigation Fluid Warming Single',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: '3M HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '2',
        name: 'Drape Surgical Transparent 23x33in Antimicrobial Incise loban 2 Sterile',
        sku: '6651EZ',
        mfgrName: '3M HEALTHCARE',
        mfgProdItem: '6651EZ',
        prodDesc: 'Drape Surgical Transparent 23x33in Antimicrobial Incise loban 2 Sterile',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: '3M HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '3',
        name: 'Bottle Feeding 2oz Plastic Pediatric w/Cap Similac Volu-Feed',
        sku: '00180',
        mfgrName: 'ABBOTI NUTRITION',
        mfgProdItem: '00180',
        prodDesc: 'Bottle Feeding 2oz Plastic Pediatric w/Cap Similac Volu-Feed',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'ABBOTI NUTRITION',
        status: 'Normal'
      },
      {
        id: '4',
        name: 'Formula Similac Water Sterilized 2oz Bottle RTF',
        sku: '51000',
        mfgrName: 'ABBOTI NUTRITION',
        mfgProdItem: '51000',
        prodDesc: 'Formula Similac Water Sterilized 2oz Bottle RTF',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'ABBOTI NUTRITION',
        status: 'Normal'
      },
      {
        id: '5',
        name: 'Tray Foley 16Fr Lubricath Drainage Bag Statlock Latex Advance',
        sku: '899916',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '899916',
        prodDesc: 'Tray Foley 16Fr Lubricath Drainage Bag Statlock Latex Advance',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '6',
        name: 'Tray Foley Urine Meter 16Fr 350ml Statlock Latex LubriCath',
        sku: '902916',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '902916',
        prodDesc: 'Tray Foley Urine Meter 16Fr 350ml Statlock Latex LubriCath',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '7',
        name: 'Tray Foley Urine Meter 18Fr 350ml Statlock Latex LubriCath',
        sku: '902918',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '902918',
        prodDesc: 'Tray Foley Urine Meter 18Fr 350ml Statlock Latex LubriCath',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '8',
        name: 'Tray Catheterization 16fr Urine Meter Outlet Tube Statlock Foley Advance LubriSil',
        sku: '942216',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '942216',
        prodDesc: 'Tray Catheterization 16fr Urine Meter Outlet Tube Statlock Foley Advance LubriSil',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '9',
        name: 'Tray Foley 14Fr IC Temp Sensing Urine Meter Statlock Complete Care Latex Advance',
        sku: '319414AM',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '319414AM',
        prodDesc: 'Tray Foley 14Fr IC Temp Sensing Urine Meter Statlock Complete Care Latex Advance',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '10',
        name: 'Tray Foley 16Fr IC Temp Sensing Urine Meter Statlock Complete Care Latex Advance',
        sku: '319416AM',
        mfgrName: 'BARD MEDICAL - A DIV OF BD',
        mfgProdItem: '319416AM',
        prodDesc: 'Tray Foley 16Fr IC Temp Sensing Urine Meter Statlock Complete Care Latex Advance',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BARD MEDICAL - A DIV OF BD',
        status: 'Normal'
      },
      {
        id: '11',
        name: 'Solution IV Sterile Water for lnj 1000ml Viaflex Plastic Container',
        sku: '280304X',
        mfgrName: 'BAXTER HEALTHCARE',
        mfgProdItem: '280304X',
        prodDesc: 'Solution IV Sterile Water for lnj 1000ml Viaflex Plastic Container',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BAXTER HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '12',
        name: 'Solution IV 0.9% Sodium Chloride lnj 50ml Viaflex',
        sku: '281306',
        mfgrName: 'BAXTER HEALTHCARE',
        mfgProdItem: '281306',
        prodDesc: 'Solution IV 0.9% Sodium Chloride lnj 50ml Viaflex',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BAXTER HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '13',
        name: 'Solution IV 0.9% Sodium Chloride lnj 100ml Viaflex',
        sku: '281307',
        mfgrName: 'BAXTER HEALTHCARE',
        mfgProdItem: '281307',
        prodDesc: 'Solution IV 0.9% Sodium Chloride lnj 100ml Viaflex',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BAXTER HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '14',
        name: 'Syringe 10ml Slip Tip',
        sku: '303134',
        mfgrName: 'BD MEDICAL - DIV OF BD WORLDWIDE',
        mfgProdItem: '303134',
        prodDesc: 'Syringe 10ml Slip Tip',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BD MEDICAL - DIV OF BD WORLDWIDE',
        status: 'Normal'
      },
      {
        id: '15',
        name: 'Syringe 50ml Luer-Lok Tip',
        sku: '309653',
        mfgrName: 'BD MEDICAL - DIV OF BD WORLDWIDE',
        mfgProdItem: '309653',
        prodDesc: 'Syringe 50ml Luer-Lok Tip',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'BD MEDICAL - DIV OF BD WORLDWIDE',
        status: 'Normal'
      },
      {
        id: '16',
        name: 'Catheter Thoracic 28Fr x 20in Straight Argyle',
        sku: '8888570549',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '8888570549',
        prodDesc: 'Catheter Thoracic 28Fr x 20in Straight Argyle',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: 'ship 7-10 days',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '17',
        name: 'Tube Culture 16ml Round Bottom Polystryrene Screw Cap Sterile',
        sku: '352037',
        mfgrName: 'CORNING INC',
        mfgProdItem: '352037',
        prodDesc: 'Tube Culture 16ml Round Bottom Polystryrene Screw Cap Sterile',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CORNING INC',
        status: 'Normal'
      },
      {
        id: '18',
        name: 'Label Thermal Sunquest 4.1x1.2in 2-part Multicut 1800/rl',
        sku: 'SUN0001',
        mfgrName: 'DASCO LABEL',
        mfgProdItem: 'SUN0001',
        prodDesc: 'Label Thermal Sunquest 4.1x1.2in 2-part Multicut 1800/rl',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'DASCO LABEL',
        status: 'Normal'
      },
      {
        id: '19',
        name: 'Straw Flex 7.Sin Wrapped',
        sku: 'NAS-420276',
        mfgrName: 'INTERNATIONAL PAPER',
        mfgProdItem: 'NAS-420276',
        prodDesc: 'Straw Flex 7.Sin Wrapped',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'INTERNATIONAL PAPER',
        status: 'Normal'
      },
      {
        id: '20',
        name: 'Catheter Thoracic 28Fr Straight Taper Tip PVC Thermosensitive Atrium',
        sku: '8028',
        mfgrName: 'MAQUET INC - GETINGE GROUP',
        mfgProdItem: '8028',
        prodDesc: 'Catheter Thoracic 28Fr Straight Taper Tip PVC Thermosensitive Atrium',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'MAQUET INC - GETINGE GROUP',
        status: 'Normal'
      },
      {
        id: '21',
        name: 'Catheter Thoracic 28Fr Right Angle Taper Tip PVC Thermosensitive Atrium',
        sku: '8128',
        mfgrName: 'MAQUET INC - GETINGE GROUP',
        mfgProdItem: '8128',
        prodDesc: 'Catheter Thoracic 28Fr Right Angle Taper Tip PVC Thermosensitive Atrium',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'MAQUET INC - GETINGE GROUP',
        status: 'Normal'
      },
      {
        id: '22',
        name: 'Underpants Maternity L/XL Knit',
        sku: 'MSC76400',
        mfgrName: 'MEDLINE INDUSTRIES INC',
        mfgProdItem: 'MSC76400',
        prodDesc: 'Underpants Maternity L/XL Knit',
        productAvailable: 'N',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: 'Cardinal brand MFR#705M',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'MEDLINE INDUSTRIES INC',
        status: 'Normal'
      },
      {
        id: '23',
        name: 'Warmer Heel Infant Nonsterile',
        sku: '989805603201',
        mfgrName: 'PHILIPS HEALTHCARE',
        mfgProdItem: '989805603201',
        prodDesc: 'Warmer Heel Infant Nonsterile',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'PHILIPS HEALTHCARE',
        status: 'Normal'
      },
      {
        id: '24',
        name: 'Kit Oral Care Suction Swab Perox-A-Mint Solution',
        sku: '6513',
        mfgrName: 'SAGE PRODUCTS LLC',
        mfgProdItem: '6513',
        prodDesc: 'Kit Oral Care Suction Swab Perox-A-Mint Solution',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'SAGE PRODUCTS LLC',
        status: 'Normal'
      },
      {
        id: '25',
        name: 'Cannula Nasal Adult C02/02 Male Luer',
        sku: '0538',
        mfgrName: 'WESTMED - ACQ BY SUNMED',
        mfgProdItem: '0538',
        prodDesc: 'Cannula Nasal Adult C02/02 Male Luer',
        productAvailable: 'N',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: 'McKesson MFR#16-0538',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'WESTMED - ACQ BY SUNMED',
        status: 'Normal'
      },
      {
        id: '26',
        name: 'Pad Sanitary Maternity 3-3/4 x 1Oin Per-Pad',
        sku: '1380A',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '1380A',
        prodDesc: 'Pad Sanitary Maternity 3-3/4 x 1Oin Per-Pad',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '27',
        name: 'Pad Nursing Sin Curity',
        sku: '2630-',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '2630-',
        prodDesc: 'Pad Nursing Sin Curity',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '28',
        name: 'Electrode Fetal Scalp Single Helix Kendall',
        sku: '31479549',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '31479549',
        prodDesc: 'Electrode Fetal Scalp Single Helix Kendall',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '29',
        name: 'Catheter Umbilical Vessel 3.SFr x 1Sin Single Lumen Polyurethan Argyle',
        sku: '8888160333',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '8888160333',
        prodDesc: 'Catheter Umbilical Vessel 3.SFr x 1Sin Single Lumen Polyurethan Argyle',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: 'ship 7-10 days',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '30',
        name: 'Catheter Umbilical Vessel 5Fr x 1Sin Single Lumen Polyurethan Argyle',
        sku: '8888160341',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '8888160341',
        prodDesc: 'Catheter Umbilical Vessel 5Fr x 1Sin Single Lumen Polyurethan Argyle',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '31',
        name: 'Catheter Umbilical Vessel 5Fr x 1Sin Dual Lumen Polyurethan Argyle',
        sku: '8888160556',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '8888160556',
        prodDesc: 'Catheter Umbilical Vessel 5Fr x 1Sin Dual Lumen Polyurethan Argyle',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '32',
        name: 'Catheter Suction Neonatal 1OFr x 24in Replogle Argyle',
        sku: '8888256503',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '8888256503',
        prodDesc: 'Catheter Suction Neonatal 1OFr x 24in Replogle Argyle',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '33',
        name: 'Belt Fetal Monitor Tab 1.5x42in Pink and Blue Striped Kendall',
        sku: '56102',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '56102',
        prodDesc: 'Belt Fetal Monitor Tab 1.5x42in Pink and Blue Striped Kendall',
        productAvailable: 'Y',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      },
      {
        id: '34',
        name: 'Detector Carbon Dioxide Adult Colorimetric Nellcor',
        sku: 'EASYCAP II',
        mfgrName: 'MEDTRONIC MITG',
        mfgProdItem: 'EASYCAP II',
        prodDesc: 'Detector Carbon Dioxide Adult Colorimetric Nellcor',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'MEDTRONIC MITG',
        status: 'Normal'
      },
      {
        id: '35',
        name: 'Syringe Oral Enteral Feeding 60ml Purple Monoject Sterile',
        sku: '460S.E',
        mfgrName: 'CARDINAL HEALTH INC',
        mfgProdItem: '460S.E',
        prodDesc: 'Syringe Oral Enteral Feeding 60ml Purple Monoject Sterile',
        productAvailable: '',
        itemsInCase: '',
        caseMOQ: '',
        casePrice: '',
        priceIncludeShipping: '',
        comment: '',
        substitutionItem: '',
        currentStock: 0,
        totalStock: 0,
        unitPrice: 0,
        vendor: 'CARDINAL HEALTH INC',
        status: 'Normal'
      }
    ];
    
    setCsvItems(mockCsvItems);
    setSelectedItems(mockCsvItems.map(item => ({ ...item, quantity: 1 }))); // Add quantity=1 for imported items
    setCheckedItems(new Set()); // Reset checked items on import
  };

  const handleCheckAll = (isChecked: boolean) => {
    if (isChecked) {
      setCheckedItems(new Set(selectedItems.map(item => item.id)));
    } else {
      setCheckedItems(new Set());
    }
  };

  const handleCheckItem = (itemId: string, isChecked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const allItemsChecked = selectedItems.length > 0 && checkedItems.size === selectedItems.length;
  const isIndeterminate = checkedItems.size > 0 && checkedItems.size < selectedItems.length;

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
                  {/* AI Suggestions Section - Moved to top */}
                  {showAISuggestions && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-100 rounded-full">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-sm text-blue-800">
                            We've found 2 items you might want to add based on your recent activity.
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-7 bg-white text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            // Add onClick handler for Review button if needed
                          >
                            Review
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-8"
                            onClick={() => setShowAISuggestions(false)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleImportCSV}
                      >
                        <FileUp className="h-4 w-4" />
                        Import CSV
                      </Button>
                      <div className="relative" ref={filtersRef}>
                        <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                          <Filter className="h-4 w-4" />
                          Risk
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
                            Group by: {groupBy === 'vendor' ? 'Vendor' : 'None'}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuRadioGroup value={groupBy} onValueChange={setGroupBy}>
                            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="vendor">Vendor</DropdownMenuRadioItem>
                            {/* Add other grouping options here */}
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

                  {/* Selected Items Table */}
                  {selectedItems.length > 0 && (
                    <div className="mt-6 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]">
                              <Checkbox 
                                checked={allItemsChecked || isIndeterminate}
                                onCheckedChange={handleCheckAll}
                                aria-label="Select all rows"
                                {...(isIndeterminate && { 'data-state': 'indeterminate' })} // Handle indeterminate state correctly
                              />
                            </TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Ratings</TableHead>
                            <TableHead>Reviews</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Manufacturer</TableHead>
                            <TableHead>Mfg Product #</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Items/Case</TableHead>
                            <TableHead>Case MOQ</TableHead>
                            <TableHead>Case Price</TableHead>
                            <TableHead>Shipping Included</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Substitution</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            {groupBy !== 'vendor' && <TableHead>Current Vendor</TableHead>} {/* Hide Vendor column when grouped */}
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-center">Potential Savings</TableHead>
                            <TableHead className="w-[120px] text-center">Quantity</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[40px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupBy === 'vendor' ? (
                            Object.entries(
                              selectedItems.reduce((groups, item) => {
                                const vendor = item.vendor || 'Unknown Vendor';
                                if (!groups[vendor]) {
                                  groups[vendor] = [];
                                }
                                groups[vendor].push(item);
                                return groups;
                              }, {} as { [key: string]: any[] }) // Keep type assertion for accumulator
                            ).map(([vendor, items]) => { // Let TS infer type here, then cast inside
                              const vendorItems = items as any[]; // Cast to any[] to use array methods
                              return (
                                <React.Fragment key={vendor}>
                                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    {/* Empty cell for checkbox column in group header */}
                                    <TableCell></TableCell> 
                                    <TableCell colSpan={20} className="font-semibold"> {/* Adjust colSpan: 18 original + 2 new + 1 checkbox - 1 vendor = 20 */}
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={getVendorLogo(vendor)}
                                          alt={vendor}
                                          className="h-5 w-5 object-contain"
                                          onError={(e) => {
                                            e.currentTarget.src = VENDOR_LOGOS.default;
                                          }}
                                        />
                                        {vendor} ({vendorItems.length} items)
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                  {vendorItems.map((item: any) => ( // Use the casted array
                                    <TableRow
                                      key={item.id}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsDetailsOverlayOpen(true);
                                      }}
                                    >
                                      <TableCell onClick={(e) => e.stopPropagation()} className="pl-4"> {/* Prevent row click on checkbox cell */}
                                        <Checkbox 
                                          checked={checkedItems.has(item.id)}
                                          onCheckedChange={(checked) => handleCheckItem(item.id, !!checked)}
                                          aria-label={`Select row ${item.id}`}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {/* Item Cell Content - WITHOUT feedback */}
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <img
                                              src={item.image || `/placeholder.svg?height=32&width=32`}
                                              alt={item.name}
                                              className="max-w-full max-h-full object-contain"
                                            />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm">{item.name}</div>
                                            {/* Feedback removed from here */}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {/* Ratings Cell Content */}
                                        <div className="flex">{renderStars(4.5)}</div>
                                      </TableCell>
                                      <TableCell>
                                        {/* Reviews Cell Content */}
                                        <div
                                          className="flex items-center gap-1 cursor-pointer hover:opacity-80 text-xs text-blue-600"
                                          onClick={(e) => { e.stopPropagation(); setShowFeedback(prev => ({ ...prev, [item.id]: !prev[item.id] }))}}
                                        >
                                          <MessageSquare className="h-3 w-3 mr-0.5" />
                                          Hospital Feedback
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                                      <TableCell>{item.mfgrName}</TableCell>
                                      <TableCell>{item.mfgProdItem}</TableCell>
                                      <TableCell>{item.prodDesc}</TableCell>
                                      <TableCell>{item.productAvailable}</TableCell>
                                      <TableCell>{item.itemsInCase}</TableCell>
                                      <TableCell>{item.caseMOQ}</TableCell>
                                      <TableCell>{item.casePrice}</TableCell>
                                      <TableCell>{item.priceIncludeShipping}</TableCell>
                                      <TableCell>{item.comment}</TableCell>
                                      <TableCell>{item.substitutionItem}</TableCell>
                                      <TableCell className="text-center">
                                        <div>{item.currentStock}/{item.totalStock}</div>
                                      </TableCell>
                                      {/* Vendor Cell is omitted when grouping by vendor */}
                                      <TableCell className="text-right">${(item.unitPrice || 0).toFixed(2)}</TableCell>
                                      <TableCell className="text-center">
                                        {/* ... Potential Savings Cell Content ... */}
                                        {alternativeVendors[item.id]?.length > 0 && (
                                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                            <TrendingDown className="h-3.5 w-3.5 mr-1" />
                                            ${(item.unitPrice - Math.min(...alternativeVendors[item.id].map(v => v.price || Infinity))).toFixed(2)}
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {/* ... Quantity Cell Content ... */}
                                        <div className="flex items-center justify-center gap-1">
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
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8 w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${((item.unitPrice || 0) * item.quantity).toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {/* ... Action Cell Content ... */}
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
                                  ))}
                                </React.Fragment>
                              )
                            })
                          ) : (
                            selectedItems.map((item) => (
                              <TableRow
                                key={item.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsDetailsOverlayOpen(true);
                                }}
                              >
                                <TableCell onClick={(e) => e.stopPropagation()} className="pl-4"> {/* Prevent row click on checkbox cell */}
                                  <Checkbox 
                                    checked={checkedItems.has(item.id)}
                                    onCheckedChange={(checked) => handleCheckItem(item.id, !!checked)}
                                    aria-label={`Select row ${item.id}`}
                                  />
                                </TableCell>
                                <TableCell>
                                  {/* Item Cell Content - WITHOUT feedback */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      <img
                                        src={item.image || `/placeholder.svg?height=32&width=32`}
                                        alt={item.name}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{item.name}</div>
                                      {/* Feedback removed from here */}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {/* Ratings Cell Content */}
                                  <div className="flex">{renderStars(4.5)}</div>
                                </TableCell>
                                <TableCell>
                                  {/* Reviews Cell Content */}
                                  <div
                                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 text-xs text-blue-600"
                                    onClick={(e) => { e.stopPropagation(); setShowFeedback(prev => ({ ...prev, [item.id]: !prev[item.id] }))}}
                                  >
                                    <MessageSquare className="h-3 w-3 mr-0.5" />
                                    Hospital Feedback
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                                <TableCell>{item.mfgrName}</TableCell>
                                <TableCell>{item.mfgProdItem}</TableCell>
                                <TableCell>{item.prodDesc}</TableCell>
                                <TableCell>{item.productAvailable}</TableCell>
                                <TableCell>{item.itemsInCase}</TableCell>
                                <TableCell>{item.caseMOQ}</TableCell>
                                <TableCell>{item.casePrice}</TableCell>
                                <TableCell>{item.priceIncludeShipping}</TableCell>
                                <TableCell>{item.comment}</TableCell>
                                <TableCell>{item.substitutionItem}</TableCell>
                                <TableCell className="text-center">
                                  <div>{item.currentStock}/{item.totalStock}</div>
                                </TableCell>
                                <TableCell>
                                  {/* ... Vendor Cell Content ... */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                                      <img
                                        src={getVendorLogo(item.vendor)}
                                        alt={item.vendor}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.src = VENDOR_LOGOS.default;
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm">{item.vendor}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">${(item.unitPrice || 0).toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                  {/* ... Potential Savings Cell Content ... */}
                                  {alternativeVendors[item.id]?.length > 0 && (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <TrendingDown className="h-3.5 w-3.5 mr-1" />
                                      ${(item.unitPrice - Math.min(...alternativeVendors[item.id].map(v => v.price || Infinity))).toFixed(2)}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {/* ... Quantity Cell Content ... */}
                                  <div className="flex items-center justify-center gap-1">
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
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8 w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ${((item.unitPrice || 0) * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {/* ... Action Cell Content ... */}
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
                            ))
                          )}
                        </TableBody>
                      </Table>
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

        <AnimatePresence>
          {selectedVendorActions.length > 0 && ( // Removed !showComparison condition
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
                    Create Request for Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> {/* Close main space-y-6 div */}

      {/* Quick Actions Toolbar - Will show 'Review Order' or 'Create RFQ' button */}
      <QuickActionsToolbar />
      
      <OrderDetailsOverlay
        isOpen={isDetailsOverlayOpen}
        onClose={() => setIsDetailsOverlayOpen(false)}
        item={selectedItem}
        alternativeVendors={alternativeVendors}
        setSelectedItems={setSelectedItems}
        handleFindAlternatives={handleFindAlternatives}
        loadingAlternatives={loadingAlternatives}
        renderStars={renderStars} // Pass the function down
      />
    </>
  )
}

