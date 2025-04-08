export type Order = {
  id: string
  date: string
  vendors: string[]
  itemCount: number
  total: number
  status: string
  estimatedDelivery: string
  paymentTerms: string
  deliveryTime: string
  urgency?: string
  department?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export const ordersData: Order[] = [
  {
    id: "ORD-2023-001",
    date: "2023-12-15",
    vendors: ["MedSupply Inc.", "Hospital Direct"],
    itemCount: 12,
    total: 1245.67,
    status: "Processing",
    estimatedDelivery: "Delivered",
    paymentTerms: "Net 30",
    deliveryTime: "3-5 days",
    urgency: "urgent",
    department: "Surgery",
    items: [
      { name: "Surgical Gloves (Medium)", quantity: 500, price: 0.22 },
      { name: "Surgical Masks", quantity: 1000, price: 0.95 },
      { name: "IV Catheters 20G", quantity: 200, price: 1.85 }
    ]
  },
  {
    id: "ORD-2023-002",
    date: "2023-12-20",
    vendors: ["Hospital Direct"],
    itemCount: 5,
    total: 876.5,
    status: "Processing",
    estimatedDelivery: "Dec 27, 2023",
    paymentTerms: "Net 45",
    deliveryTime: "2-3 days",
    department: "Emergency",
    items: [
      { name: "Examination Gloves (Large)", quantity: 300, price: 0.17 },
      { name: "Alcohol Prep Pads", quantity: 500, price: 0.04 }
    ]
  },
  {
    id: "ORD-2023-003",
    date: "2023-12-22",
    vendors: ["PPE Direct", "MedSupply Inc."],
    itemCount: 3,
    total: 345.25,
    status: "Pending",
    estimatedDelivery: "Dec 29, 2023",
    paymentTerms: "Net 60",
    deliveryTime: "5-7 days",
    department: "General",
    items: [
      { name: "N95 Respirators", quantity: 50, price: 2.95 },
      { name: "Face Shields", quantity: 30, price: 3.50 },
      { name: "Isolation Gowns", quantity: 25, price: 4.25 }
    ]
  },
  {
    id: "ORD-2023-004",
    date: "2023-12-10",
    vendors: ["Discount Medical"],
    itemCount: 8,
    total: 567.8,
    status: "Completed",
    estimatedDelivery: "Delivered",
    paymentTerms: "Net 30",
    deliveryTime: "3-5 days",
    department: "Cardiology",
    items: [
      { name: "ECG Electrodes", quantity: 200, price: 0.45 },
      { name: "Blood Pressure Cuffs", quantity: 10, price: 15.99 },
      { name: "Pulse Oximeter Sensors", quantity: 20, price: 8.75 },
      { name: "Medical Tape", quantity: 50, price: 1.25 },
      { name: "Stethoscope Covers", quantity: 100, price: 0.35 },
      { name: "Alcohol Wipes", quantity: 500, price: 0.08 },
      { name: "Disposable Thermometer Covers", quantity: 200, price: 0.15 },
      { name: "Hand Sanitizer (500ml)", quantity: 24, price: 3.99 }
    ]
  },
  {
    id: "ORD-2023-005",
    date: "2023-12-05",
    vendors: ["MedSupply Inc."],
    itemCount: 15,
    total: 1890.45,
    status: "Completed",
    estimatedDelivery: "Delivered",
    paymentTerms: "Net 45",
    deliveryTime: "2-3 days",
    department: "Laboratory",
    items: [
      { name: "Blood Collection Tubes", quantity: 500, price: 0.75 },
      { name: "Specimen Containers", quantity: 200, price: 0.95 },
      { name: "Microscope Slides", quantity: 1000, price: 0.15 },
      { name: "Pipette Tips", quantity: 2000, price: 0.05 },
      { name: "Disposable Lab Coats", quantity: 50, price: 4.99 },
      { name: "Nitrile Gloves (Small)", quantity: 500, price: 0.18 },
      { name: "Nitrile Gloves (Medium)", quantity: 500, price: 0.18 },
      { name: "Nitrile Gloves (Large)", quantity: 500, price: 0.18 },
      { name: "Biohazard Bags", quantity: 100, price: 0.45 },
      { name: "Sharps Containers", quantity: 20, price: 8.99 },
      { name: "Test Tube Racks", quantity: 30, price: 5.99 },
      { name: "Laboratory Markers", quantity: 50, price: 1.25 },
      { name: "pH Test Strips", quantity: 500, price: 0.10 },
      { name: "Disposable Pipettes", quantity: 1000, price: 0.15 },
      { name: "Safety Goggles", quantity: 40, price: 6.99 }
    ]
  },
  {
    id: "ORD-2023-006",
    date: "2023-12-18",
    vendors: ["Hospital Direct", "PPE Direct"],
    itemCount: 4,
    total: 432.1,
    status: "Processing",
    estimatedDelivery: "Dec 26, 2023",
    paymentTerms: "Net 30",
    deliveryTime: "3-5 days",
    department: "Emergency",
    items: [
      { name: "Emergency Blankets", quantity: 50, price: 2.99 },
      { name: "Trauma Shears", quantity: 20, price: 7.50 },
      { name: "Cervical Collars", quantity: 10, price: 15.99 },
      { name: "Wound Dressing Kits", quantity: 30, price: 5.75 }
    ]
  },
  {
    id: "ORD-2023-007",
    date: "2023-11-30",
    vendors: ["MedSupply Inc."],
    itemCount: 10,
    total: 987.65,
    status: "Cancelled",
    estimatedDelivery: "Cancelled",
    paymentTerms: "Net 45",
    deliveryTime: "2-3 days",
    department: "Pharmacy",
    items: [
      { name: "Pill Counting Trays", quantity: 10, price: 24.99 },
      { name: "Prescription Bottles (30ml)", quantity: 500, price: 0.25 },
      { name: "Prescription Bottles (60ml)", quantity: 500, price: 0.35 },
      { name: "Prescription Labels", quantity: 2000, price: 0.05 },
      { name: "Medication Bags", quantity: 1000, price: 0.15 },
      { name: "Auxiliary Labels", quantity: 1000, price: 0.08 },
      { name: "Oral Syringes", quantity: 200, price: 0.75 },
      { name: "Pill Splitters", quantity: 50, price: 3.99 },
      { name: "Pharmacy Bags", quantity: 500, price: 0.20 },
      { name: "Disposable Spatulas", quantity: 200, price: 0.45 }
    ]
  },
  {
    id: "ORD-2023-008",
    date: "2023-12-23",
    vendors: [],
    itemCount: 7,
    total: 543.21,
    status: "Draft",
    estimatedDelivery: "Not scheduled",
    paymentTerms: "Net 30",
    deliveryTime: "3-5 days",
    department: "Radiology",
    items: [
      { name: "X-Ray Markers", quantity: 20, price: 12.99 },
      { name: "Lead Markers", quantity: 10, price: 15.99 },
      { name: "Positioning Sponges", quantity: 30, price: 8.99 },
      { name: "Patient Gowns", quantity: 50, price: 4.99 },
      { name: "Radiation Warning Signs", quantity: 10, price: 9.99 },
      { name: "Image Receptor Covers", quantity: 200, price: 0.75 },
      { name: "Immobilization Straps", quantity: 15, price: 11.99 }
    ]
  },
]

