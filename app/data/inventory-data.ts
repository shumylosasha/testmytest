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
        name: "Premium Surgical Gloves (Medium)",
        pricePerUnit: 0.18,
        manufacturer: "MediGlove Pro",
        shipping: "2-3 days",
        savings: 0.05,
        vendor: "MedSupply Inc.",
        compliance: "Approved"
      },
      {
        name: "Economy Surgical Gloves (Medium)",
        pricePerUnit: 0.12,
        manufacturer: "ValueMed",
        shipping: "5-7 days",
        savings: 0.11,
        vendor: "Discount Medical",
        compliance: "Approved"
      }
    ],
    potentialSavings: 11.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e5b3848f4f836db5be011/M/D/MDS2503.jpg",
    lastPurchasePrice: 0.23,
    unitPrice: 0.23,
    requiredUnits: 200,
    vendor: "MedSupply Inc.",
    manufacturer: "MediGlove"
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
        name: "Premium IV Catheters 20G",
        pricePerUnit: 1.85,
        manufacturer: "MediFlow",
        shipping: "Next Day",
        savings: 0.15,
        vendor: "Hospital Direct",
        compliance: "Approved"
      }
    ],
    potentialSavings: 15.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e5b3848f4f836db5be011/S/M/SMNIV2051Z.jpg",
    lastPurchasePrice: 2.0,
    unitPrice: 2.0,
    requiredUnits: 100,
    vendor: "Hospital Direct",
    manufacturer: "MediFlow"
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
        name: "Sterile Alcohol Prep Pads",
        pricePerUnit: 0.04,
        manufacturer: "SterileClean",
        shipping: "3-5 days",
        savings: 0.01,
        vendor: "MedSupply Inc.",
        compliance: "Approved"
      }
    ],
    potentialSavings: 2.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e5b3848f4f836db5be011/M/D/MDS090735Z.jpg",
    lastPurchasePrice: 0.05,
    unitPrice: 0.05,
    requiredUnits: 400,
    vendor: "MedSupply Inc.",
    manufacturer: "CleanMed"
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
        name: "N95 Surgical Masks",
        pricePerUnit: 0.95,
        manufacturer: "SafeBreath",
        shipping: "2-3 days",
        savings: 0.0,
        vendor: "PPE Direct",
        compliance: "Approved"
      },
      {
        name: "Standard Surgical Masks",
        pricePerUnit: 0.75,
        manufacturer: "MediProtect",
        shipping: "3-5 days",
        savings: 0.2,
        vendor: "MedSupply Inc.",
        compliance: "Approved"
      }
    ],
    potentialSavings: 20.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e5b3848f4f836db5be011/N/O/NON27122.jpg",
    lastPurchasePrice: 0.95,
    unitPrice: 0.95,
    requiredUnits: 150,
    vendor: "PPE Direct",
    manufacturer: "SafeBreath"
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
        compliance: "Approved"
      }
    ],
    potentialSavings: 3.0,
    image: "https://www.medline.com/media/catalog/product/cache/0b62cc35bf2e5b3848f4f836db5be011/M/D/MDS192076.jpg",
    lastPurchasePrice: 0.18,
    unitPrice: 0.18,
    requiredUnits: 200,
    vendor: "MedSupply Inc.",
    manufacturer: "GloveCare"
  }
] 