export interface Vendor {
  id: string;
  name: string;
  pricePerUnit: number;
  image_url?: string;
  delivery: string;
  packaging: string;
  manufacturer: string;
  shipping: string;
  compliance: string;
  url?: string;
  notes?: {
    hospitalUsage?: string;
    recentPurchases?: string;
    priceTrend?: string;
    stockWarning?: string;
  };
  feedback?: Array<{
    hospitalName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  status: {
    isCurrentVendor: boolean;
    isSelected: boolean;
  };
  savings?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  sku: string;
  currentStock: number;
  totalStock: number;
  status: string;
  packaging: string;
  category: string;
  expiresIn: string;
  image: string;
  potentialSavings: number;
  lastPurchasePrice: number;
  unitPrice: number;
  requiredUnits: number;
  vendors: Vendor[];
  selectedVendorIds: string[];
}

export async function getInventoryData(): Promise<InventoryItem[]> {
  return inventoryData;
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const item = inventoryData.find(item => item.id === id);
  if (!item) {
    throw new Error('Inventory item not found');
  }
  return item;
}

export const inventoryData: InventoryItem[] = [
  {
    id: "inv-001",
    name: "Surgical Gloves (Medium)",
    description: "Latex-free surgical gloves designed for medium-sized hands, providing excellent tactile sensitivity and barrier protection",
    sku: "SG-M-100",
    currentStock: 75,
    totalStock: 100,
    status: "Stock",
    packaging: "100/bx",
    category: "Surgical Supplies",
    expiresIn: "6 months",
    potentialSavings: 11.0,
    image: "https://m.media-amazon.com/images/I/61YO+aQShHL._AC_SY300_SX300_.jpg",
    lastPurchasePrice: 0.23,
    unitPrice: 0.23,
    requiredUnits: 200,
    selectedVendorIds: ["vendor-001"],
    vendors: [
      {
        id: "vendor-001",
        name: "MedSupply Inc.",
        pricePerUnit: 0.18,
        manufacturer: "MediGlove Pro",
        shipping: "2-3 days",
        delivery: "Next Day Available",
        packaging: "100/box, 10 boxes/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
        url: "https://medsupply.com/products/premium-surgical-gloves",
        status: {
          isCurrentVendor: true,
          isSelected: true
        },
        notes: {
          hospitalUsage: "Used by 85% of hospitals in your network",
          recentPurchases: "12 hospitals like yours bought this in last 5 months",
          priceTrend: "Price expected to drop 5% next month",
          stockWarning: "Limited stock available"
        },
        feedback: [
          {
            hospitalName: "St. Mary's Hospital",
            rating: 4.5,
            comment: "Excellent quality and durability",
            date: "2024-02-15"
          },
          {
            hospitalName: "City General",
            rating: 5,
            comment: "Best value for money",
            date: "2024-01-20"
          }
        ]
      },
      {
        id: "vendor-002",
        name: "Discount Medical",
        pricePerUnit: 0.12,
        manufacturer: "ValueMed",
        shipping: "5-7 days",
        delivery: "Standard Ground",
        packaging: "100/box, 20 boxes/case",
        compliance: "Pending Review",
        image_url: "https://i.imgur.com/Q1ROACh.png",
        url: "https://discountmedical.com/products/economy-surgical-gloves",
        status: {
          isCurrentVendor: false,
          isSelected: false
        },
        savings: 0.11,
        notes: {
          hospitalUsage: "Used by 45% of hospitals in your network",
          recentPurchases: "8 hospitals like yours bought this in last 5 months",
          priceTrend: "Stable price expected",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "County Medical Center",
            rating: 4,
            comment: "Good for basic procedures",
            date: "2024-02-01"
          }
        ]
      },
      {
        id: "vendor-003",
        name: "Cardinal Health",
        pricePerUnit: 0.22,
        manufacturer: "Cardinal Health",
        shipping: "1-2 days",
        delivery: "Premium Express",
        packaging: "100/box, 8 boxes/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4D0BAQHfK4PHpB5N1w/company-logo_200_200/0/1630507620714/cardinal_health_logo?e=2147483647&v=beta&t=9Wd6DQNBQxjPnTqGfWm7lA7KFQogeAHmHcWXHfVtxGE",
        url: "https://cardinalhealth.com/products/ultra-comfort-surgical-gloves",
        status: {
          isCurrentVendor: false,
          isSelected: false
        },
        savings: 0.01,
        notes: {
          hospitalUsage: "Used by 72% of hospitals in your network",
          recentPurchases: "15 hospitals like yours bought this in last 3 months",
          priceTrend: "Premium quality, stable pricing",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Memorial Hospital",
            rating: 4.8,
            comment: "Superior comfort and sensitivity",
            date: "2024-03-01"
          },
          {
            hospitalName: "University Medical Center",
            rating: 4.7,
            comment: "Excellent grip and durability",
            date: "2024-02-28"
          }
        ]
      }
    ]
  },
  {
    id: "inv-002",
    name: "N95 Respirator Masks",
    description: "NIOSH-approved N95 respirator masks providing superior protection against airborne particles",
    sku: "N95-R-50",
    currentStock: 120,
    totalStock: 150,
    status: "Low",
    packaging: "50/bx",
    category: "PPE",
    expiresIn: "2 years",
    potentialSavings: 70.0,
    image: "https://multimedia.3m.com/mws/media/1425070P/3m-particulate-respirator-8210-n95.jpg",
    lastPurchasePrice: 2.50,
    unitPrice: 2.50,
    requiredUnits: 200,
    selectedVendorIds: ["vendor-004"],
    vendors: [
      {
        id: "vendor-004",
        name: "3M Medical",
        pricePerUnit: 2.15,
        manufacturer: "3M Healthcare",
        shipping: "1-2 days",
        delivery: "Express Available",
        packaging: "50/box, 6 boxes/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C560BAQE88xCsONDULQ/company-logo_200_200/0/1630652622688/3m_logo?e=2147483647&v=beta&t=YN6gzPz9o8JrfJJh1Kj_L0YRJssJE_rbXVkM_6_V9kU",
        url: "https://3m.com/products/n95-respirator",
        status: {
          isCurrentVendor: true,
          isSelected: true
        },
        savings: 0.35,
        notes: {
          hospitalUsage: "Used by 92% of hospitals in your network",
          recentPurchases: "15 hospitals like yours bought this in last 3 months",
          priceTrend: "Price stable for next quarter",
          stockWarning: "High demand item"
        }
      },
      {
        id: "vendor-005",
        name: "Medline Industries",
        pricePerUnit: 1.85,
        manufacturer: "Kimberly-Clark",
        shipping: "2-3 days",
        delivery: "Standard Ground",
        packaging: "50/box, 8 boxes/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4E0BAQFKw0for7A7Qg/company-logo_200_200/0/1630507622157/medline_logo?e=2147483647&v=beta&t=Q8jZ8K8J8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8",
        url: "https://medline.com/products/value-n95-respirator",
        status: {
          isCurrentVendor: false,
          isSelected: false
        },
        savings: 0.65,
        notes: {
          hospitalUsage: "Used by 75% of hospitals in your network",
          recentPurchases: "10 hospitals like yours bought this in last 2 months",
          priceTrend: "Competitive pricing, bulk discounts available",
          stockWarning: null
        }
      }
    ]
  },
  {
    id: "inv-003",
    name: "Disposable Surgical Gowns",
    description: "Level 3 barrier protection surgical gowns with reinforced critical zones",
    sku: "DSG-L3-25",
    currentStock: 45,
    totalStock: 100,
    status: "Urgent",
    packaging: "25/pk",
    category: "Surgical Supplies",
    expiresIn: "3 years",
    potentialSavings: 18.75,
    image: "https://www.cardinalhealth.com/content/dam/corp/products/professional-products/ppe/surgical-gowns/cardinal-health-surgical-gown.png",
    lastPurchasePrice: 5.50,
    unitPrice: 5.50,
    requiredUnits: 25,
    selectedVendorIds: [],
    vendors: [
      {
        id: "vendor-006",
        name: "Cardinal Health",
        pricePerUnit: 4.75,
        manufacturer: "Cardinal Health",
        shipping: "2-3 days",
        delivery: "Standard",
        packaging: "25/pack, 4 packs/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4D0BAQHfK4PHpB5N1w/company-logo_200_200/0/1630507620714/cardinal_health_logo?e=2147483647&v=beta&t=9Wd6DQNBQxjPnTqGfWm7lA7KFQogeAHmHcWXHfVtxGE",
        url: "https://cardinalhealth.com/products/surgical-gown-level-3",
        status: {
          isCurrentVendor: true,
          isSelected: false
        },
        savings: 0.75,
        notes: {
          hospitalUsage: "Used by 78% of hospitals in your network",
          recentPurchases: "10 hospitals like yours bought this in last 2 months",
          priceTrend: "Price increase expected next quarter",
          stockWarning: "Order soon - stock limited"
        }
      },
      {
        id: "vendor-007",
        name: "Medline",
        pricePerUnit: 3.95,
        manufacturer: "Medline",
        shipping: "3-4 days",
        delivery: "Standard Ground",
        packaging: "25/pack, 6 packs/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4E0BAQFKw0for7A7Qg/company-logo_200_200/0/1630507622157/medline_logo?e=2147483647&v=beta&t=Q8jZ8K8J8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8",
        url: "https://medline.com/products/economy-surgical-gown-level-3",
        status: {
          isCurrentVendor: false,
          isSelected: false
        },
        savings: 1.55,
        notes: {
          hospitalUsage: "Used by 65% of hospitals in your network",
          recentPurchases: "7 hospitals like yours bought this in last month",
          priceTrend: "Stable pricing expected",
          stockWarning: null
        }
      },
      {
        id: "vendor-008",
        name: "Halyard Health",
        pricePerUnit: 5.25,
        manufacturer: "Halyard Health",
        shipping: "1-2 days",
        delivery: "Express Available",
        packaging: "25/pack, 3 packs/case",
        compliance: "Hospital Approved",
        image_url: "https://www.mckesson.com/assets/img/mckesson-logo.svg",
        url: "https://mckesson.com/products/ultra-protection-surgical-gown",
        status: {
          isCurrentVendor: false,
          isSelected: false
        },
        savings: 0.25,
        notes: {
          hospitalUsage: "Used by 82% of hospitals in your network",
          recentPurchases: "14 hospitals like yours bought this in last 3 months",
          priceTrend: "Premium quality, stable pricing",
          stockWarning: null
        }
      }
    ]
  },
  {
    id: "inv-004",
    name: "IV Administration Sets",
    description: "Primary IV sets with integrated safety features and precise flow control",
    sku: "IV-SET-20",
    currentStock: 200,
    totalStock: 250,
    status: "Stock",
    packaging: "20/cs",
    category: "IV Therapy",
    expiresIn: "2 years",
    potentialSavings: 10.0,
    image: "https://www.bbraun.com/content/dam/catalog/bbraun/bbraunProductCatalog/S/AEM2015/en-01/b5/iv-administration-set.jpeg",
    lastPurchasePrice: 3.75,
    unitPrice: 3.75,
    requiredUnits: 20,
    selectedVendorIds: [],
    vendors: [
      {
        id: "vendor-009",
        name: "B. Braun Medical",
        pricePerUnit: 3.25,
        manufacturer: "B. Braun",
        shipping: "2-3 days",
        delivery: "Standard",
        packaging: "20/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4D0BAQFKw0for7A7Qg/company-logo_200_200/0/1630507622157/b_braun_logo?e=2147483647&v=beta&t=Q8jZ8K8J8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8",
        url: "https://bbraun.com/products/iv-administration-set",
        status: {
          isCurrentVendor: true,
          isSelected: false
        },
        notes: {
          hospitalUsage: "Used by 65% of hospitals in your network",
          recentPurchases: "8 hospitals like yours bought this in last month",
          priceTrend: "Price stable",
          stockWarning: null
        }
      }
    ]
  },
  {
    id: "inv-005",
    name: "Sterile Gauze Pads",
    description: "4x4 inch sterile gauze pads, highly absorbent and lint-free",
    sku: "SGP-4X4-200",
    currentStock: 150,
    totalStock: 200,
    status: "Stock",
    packaging: "200/bx",
    category: "Wound Care",
    expiresIn: "5 years",
    potentialSavings: 4.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e/N/O/NON21444_HRE_1.jpg",
    lastPurchasePrice: 0.10,
    unitPrice: 0.10,
    requiredUnits: 200,
    selectedVendorIds: [],
    vendors: [
      {
        id: "vendor-010",
        name: "Medline Industries",
        pricePerUnit: 0.08,
        manufacturer: "Medline",
        shipping: "1-2 days",
        delivery: "Next Day Available",
        packaging: "200/box, 10 boxes/case",
        compliance: "Hospital Approved",
        image_url: "https://media.licdn.com/dms/image/C4E0BAQFKw0for7A7Qg/company-logo_200_200/0/1630507622157/medline_logo?e=2147483647&v=beta&t=Q8jZ8K8J8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8",
        url: "https://medline.com/products/sterile-gauze-pads",
        status: {
          isCurrentVendor: true,
          isSelected: false
        },
        notes: {
          hospitalUsage: "Used by 88% of hospitals in your network",
          recentPurchases: "14 hospitals like yours bought this in last 4 months",
          priceTrend: "Bulk discounts available",
          stockWarning: null
        }
      }
    ]
  }
] 