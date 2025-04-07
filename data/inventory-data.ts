export type InventoryItem = {
  id: string
  name: string
  sku: string
  currentStock: number
  totalStock: number
  status: string
  packaging: string
  category: string
  expiresIn: string
  swaps: Array<{
    id: string
    name: string
    sku: string
    pricePerUnit: number
    manufacturer: string
    shipping: string
    delivery: string
    packaging: string
    savings: number
    vendor: string
    compliance: string
    vendor_image_url: string
    image: string
    url: string
    notes: {
      hospitalUsage?: string
      recentPurchases?: string
      priceTrend?: string
      stockWarning?: string
    }
    feedback?: Array<{
      hospitalName: string
      rating: number
      comment: string
      date: string
    }>
  }>
  potentialSavings: number
  image: string
  vendor_image_url: string
  lastPurchasePrice: number
  unitPrice: number
  requiredUnits: number
  vendor: string
  manufacturer: string
}

export async function getInventoryData(): Promise<InventoryItem[]> {
  // Return the mockup data directly
  return inventoryData as unknown as InventoryItem[];
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  // Find the item directly from the inventoryData array
  const item = inventoryData.find(item => item.id === id);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }
  
  // Convert the item to the expected type
  // This is a workaround for the type mismatch
  return item as unknown as InventoryItem;
}

export const inventoryData = [
  {
    id: "inv-001",
    name: "Surgical Gloves (Medium)",
    sku: "SG-M-100",
    currentStock: 75,
    totalStock: 100,
    status: "Stock",
    packaging: "100/bx",
    category: "Surgical Supplies",
    expiresIn: "6 months",
    swaps: [
      {
        id: "swap-001-1",
        name: "Premium Surgical Gloves (Medium)",
        sku: "PSG-M-100",
        pricePerUnit: 0.18,
        manufacturer: "MediGlove Pro",
        shipping: "2-3 days",
        delivery: "Next Day Available",
        packaging: "100/box, 10 boxes/case",
        savings: 0.05,
        vendor: "MedSupply Inc.",
        compliance: "Approved",
        vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
        image: "https://m.media-amazon.com/images/I/61YO+aQShHL._AC_SY300_SX300_.jpg",
        url: "https://medsupply.com/products/premium-surgical-gloves",
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
        id: "swap-001-2",
        name: "Economy Surgical Gloves (Medium)",
        sku: "ESG-M-100",
        pricePerUnit: 0.12,
        manufacturer: "ValueMed",
        shipping: "5-7 days",
        delivery: "Standard Ground",
        packaging: "100/box, 20 boxes/case",
        savings: 0.11,
        vendor: "Discount Medical",
        compliance: "Approved",
        vendor_image_url: "https://i.imgur.com/Q1ROACh.png",
        image: "https://www.macgill.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/2/0/2023_13136-50_2.jpg",
        url: "https://discountmedical.com/products/economy-surgical-gloves",
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
      }
    ],
    potentialSavings: 11.0,
    image: "https://m.media-amazon.com/images/I/61YO+aQShHL._AC_SY300_SX300_.jpg",
    vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
    lastPurchasePrice: 0.23,
    unitPrice: 0.23,
    requiredUnits: 200,
    vendor: "MedSupply Inc.",
    manufacturer: "MediGlove",
  },
  {
    id: "inv-002",
    name: "IV Catheters 20G",
    sku: "IV-20G-50",
    currentStock: 15,
    totalStock: 100,
    status: "Urgent",
    packaging: "50/bx",
    category: "IV Supplies",
    expiresIn: "12 months",
    swaps: [
      {
        id: "swap-002-1",
        name: "Premium IV Catheters 20G",
        sku: "PIV-20G-50",
        pricePerUnit: 1.85,
        manufacturer: "MediFlow Pro",
        shipping: "1-2 days",
        delivery: "Next Day Available",
        packaging: "50/box, 10 boxes/case",
        savings: 0.15,
        vendor: "Hospital Direct",
        compliance: "Approved",
        vendor_image_url: "https://i.imgur.com/L5VqhbB.png",
        image: "https://m.media-amazon.com/images/I/61YUYmYR1SL._AC_SL1500_.jpg",
        url: "https://hospitaldirect.com/products/premium-iv-catheters",
        notes: {
          hospitalUsage: "Used by 92% of hospitals in your network",
          recentPurchases: "15 hospitals purchased this month",
          priceTrend: "Price stable for next quarter",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Metro General",
            rating: 4.8,
            comment: "Excellent flow rate and patient comfort",
            date: "2024-02-20"
          }
        ]
      },
      {
        id: "swap-002-2",
        name: "Value IV Catheters 20G",
        sku: "VIV-20G-50",
        pricePerUnit: 1.65,
        manufacturer: "EcoMed",
        shipping: "3-5 days",
        delivery: "Standard Ground",
        packaging: "50/box, 20 boxes/case",
        savings: 0.35,
        vendor: "MedSupply Inc.",
        compliance: "Approved",
        vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
        image: "https://m.media-amazon.com/images/I/61YUYmYR1SL._AC_SL1500_.jpg",
        url: "https://medsupply.com/products/value-iv-catheters",
        notes: {
          hospitalUsage: "Used by 45% of hospitals in your network",
          recentPurchases: "Growing adoption rate",
          priceTrend: "Bulk discounts available",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Community Health Center",
            rating: 4.2,
            comment: "Good quality for the price point",
            date: "2024-02-10"
          }
        ]
      }
    ],
    potentialSavings: 15.0,
    image: "https://www.bbraunusa.com/content/dam/catalog/bbraun/bbraunProductCatalog/S/AEM2015/en-us/b218/introcan-safety-ivcathstraight20g.jpeg",
    vendor_image_url: "https://i.imgur.com/L5VqhbB.png",
    lastPurchasePrice: 2.0,
    unitPrice: 2.0,
    requiredUnits: 100,
    vendor: "Hospital Direct",
    manufacturer: "MediFlow",
  },
  {
    id: "inv-003",
    name: "Alcohol Prep Pads",
    sku: "APP-200",
    currentStock: 120,
    totalStock: 200,
    status: "Stock",
    packaging: "200/bx",
    category: "Cleaning Supplies",
    expiresIn: "24 months",
    swaps: [
      {
        id: "swap-003-1",
        name: "Premium Alcohol Prep Pads",
        sku: "PAPP-200",
        pricePerUnit: 0.04,
        manufacturer: "SterileClean Pro",
        shipping: "2-3 days",
        delivery: "Express Available",
        packaging: "200/box, 25 boxes/case",
        savings: 0.01,
        vendor: "MedSupply Inc.",
        compliance: "Approved",
        vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
        image: "https://m.media-amazon.com/images/I/81YnWuJxPWL._AC_SL1500_.jpg",
        url: "https://medsupply.com/products/premium-prep-pads",
        notes: {
          hospitalUsage: "Most popular in your hospital network",
          recentPurchases: "Consistent monthly orders",
          priceTrend: "Volume discounts available",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "University Medical Center",
            rating: 4.6,
            comment: "Excellent saturation and durability",
            date: "2024-02-18"
          }
        ]
      },
      {
        id: "swap-003-2",
        name: "Economy Alcohol Prep Pads",
        sku: "EAPP-200",
        pricePerUnit: 0.035,
        manufacturer: "ValueMed",
        shipping: "4-6 days",
        delivery: "Standard Ground",
        packaging: "200/box, 30 boxes/case",
        savings: 0.015,
        vendor: "Discount Medical",
        compliance: "Approved",
        vendor_image_url: "https://i.imgur.com/Q1ROACh.png",
        image: "https://m.media-amazon.com/images/I/81YnWuJxPWL._AC_SL1500_.jpg",
        url: "https://discountmedical.com/products/economy-prep-pads",
        notes: {
          hospitalUsage: "Growing adoption in smaller clinics",
          recentPurchases: "Cost-effective alternative",
          priceTrend: "Stable pricing",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Regional Medical Center",
            rating: 4.0,
            comment: "Good for routine procedures",
            date: "2024-02-05"
          }
        ]
      }
    ],
    potentialSavings: 2.0,
    image: "https://m.media-amazon.com/images/I/61fNptzgmJL._AC_SX679_.jpg",
    vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
    lastPurchasePrice: 0.05,
    unitPrice: 0.05,
    requiredUnits: 400,
    vendor: "MedSupply Inc.",
    manufacturer: "CleanMed",
  },
  {
    id: "inv-004",
    name: "Surgical Masks",
    sku: "SM-50",
    currentStock: 30,
    totalStock: 100,
    status: "Low",
    packaging: "50/bx",
    category: "PPE",
    expiresIn: "36 months",
    swaps: [
      {
        id: "swap-004-1",
        name: "N95 Surgical Masks",
        sku: "N95-SM-50",
        pricePerUnit: 0.95,
        manufacturer: "SafeBreath Pro",
        shipping: "1-2 days",
        delivery: "Next Day Available",
        packaging: "50/box, 12 boxes/case",
        savings: 0.0,
        vendor: "PPE Direct",
        compliance: "Approved",
        vendor_image_url: "https://i.imgur.com/9KhJQWJ.png",
        image: "https://m.media-amazon.com/images/I/71CgH69u67L._AC_SL1500_.jpg",
        url: "https://ppedirect.com/products/n95-surgical-masks",
        notes: {
          hospitalUsage: "Standard in major hospitals",
          recentPurchases: "High demand item",
          priceTrend: "Premium quality option",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Memorial Hospital",
            rating: 4.9,
            comment: "Excellent protection and comfort",
            date: "2024-02-22"
          }
        ]
      },
      {
        id: "swap-004-2",
        name: "Standard Surgical Masks",
        sku: "STD-SM-50",
        pricePerUnit: 0.75,
        manufacturer: "MediProtect",
        shipping: "2-3 days",
        delivery: "Standard Ground",
        packaging: "50/box, 20 boxes/case",
        savings: 0.2,
        vendor: "MedSupply Inc.",
        compliance: "Approved",
        vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
        image: "https://m.media-amazon.com/images/I/71CgH69u67L._AC_SL1500_.jpg",
        url: "https://medsupply.com/products/standard-surgical-masks",
        notes: {
          hospitalUsage: "Popular in clinics and medical offices",
          recentPurchases: "Cost-effective choice",
          priceTrend: "Bulk discounts available",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "City Medical Center",
            rating: 4.3,
            comment: "Good quality for routine use",
            date: "2024-02-15"
          }
        ]
      },
      {
        id: "swap-004-3",
        name: "Economy Surgical Masks",
        sku: "ECO-SM-50",
        pricePerUnit: 0.65,
        manufacturer: "ValueCare",
        shipping: "4-6 days",
        delivery: "Standard Ground",
        packaging: "50/box, 40 boxes/case",
        savings: 0.3,
        vendor: "Discount Medical",
        compliance: "Approved",
        vendor_image_url: "https://i.imgur.com/Q1ROACh.png",
        image: "https://m.media-amazon.com/images/I/71CgH69u67L._AC_SL1500_.jpg",
        url: "https://discountmedical.com/products/economy-surgical-masks",
        notes: {
          hospitalUsage: "Suitable for visitor use",
          recentPurchases: "High volume orders",
          priceTrend: "Most economical option",
          stockWarning: null
        },
        feedback: [
          {
            hospitalName: "Community Clinic",
            rating: 4.0,
            comment: "Basic protection at good price",
            date: "2024-02-08"
          }
        ]
      }
    ],
    potentialSavings: 20.0,
    image: "https://media.istockphoto.com/id/1206385911/uk/%D1%84%D0%BE%D1%82%D0%BE/%D0%BC%D0%B5%D0%B4%D0%B8%D1%87%D0%BD%D0%B0-%D0%BC%D0%B0%D1%81%D0%BA%D0%B0.jpg?s=612x612&w=0&k=20&c=PIvTRjOLW_fuVFMO05uhnC2D01dRf2y4891A-gpORII=",
    vendor_image_url: "https://i.imgur.com/9KhJQWJ.png",
    lastPurchasePrice: 0.95,
    unitPrice: 0.95,
    requiredUnits: 150,
    vendor: "PPE Direct",
    manufacturer: "SafeBreath",
  },
  {
    id: "inv-005",
    name: "Examination Gloves (Large)",
    sku: "EG-L-100",
    currentStock: 50,
    totalStock: 100,
    status: "Stock",
    packaging: "100/bx",
    category: "Examination Supplies",
    expiresIn: "12 months",
    swaps: [
      {
        name: "Nitrile Examination Gloves (Large)",
        pricePerUnit: 0.15,
        manufacturer: "NitriCare",
        shipping: "2-3 days",
        savings: 0.03,
        vendor: "MedSupply Inc.",
        compliance: "Approved",
        vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw"
      },
    ],
    potentialSavings: 3.0,
    image: "https://mederen.com/uploads/catalog/disposable_clothing/gloves/nitrile-gloves-02.jpg",
    vendor_image_url: "https://media.licdn.com/dms/image/v2/C4E0BAQEE_RxutRO_gQ/company-logo_200_200/company-logo_200_200/0/1630632059780/medsupplyinc_logo?e=2147483647&v=beta&t=v7QRWVsv2Iw55WSIY604LvS0lhYIxQZdo8cf2JzHSkw",
    lastPurchasePrice: 0.18,
    unitPrice: 0.18,
    requiredUnits: 200,
    vendor: "MedSupply Inc.",
    manufacturer: "GloveCare",
  },
]

