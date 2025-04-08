// Mock data for department comparisons
export const departmentData = {
  surgery: {
    name: "Surgery Department",
    metrics: {
      costPerUnit: 150,
      utilizationRate: 85,
      qualityScore: 96,
      operationalEfficiency: 88,
      contributionMargin: 45,
      patientSatisfaction: 92,
      complicationRate: 2.5,
      averageLengthOfStay: 3.2,
    },
    products: [
      { name: "Surgical Gloves", cost: 12, usage: 5000, quality: 95 },
      { name: "Surgical Masks", cost: 8, usage: 8000, quality: 94 },
      { name: "Surgical Gowns", cost: 25, usage: 3000, quality: 96 },
    ],
    surgeons: [
      { name: "Dr. Smith", procedures: 120, successRate: 98, costEfficiency: 92 },
      { name: "Dr. Johnson", procedures: 95, successRate: 96, costEfficiency: 88 },
      { name: "Dr. Williams", procedures: 110, successRate: 97, costEfficiency: 90 },
    ],
  },
  pharmacy: {
    name: "Pharmacy Department",
    metrics: {
      costPerUnit: 120,
      utilizationRate: 92,
      qualityScore: 93,
      operationalEfficiency: 85,
      contributionMargin: 38,
      patientSatisfaction: 88,
      medicationErrorRate: 1.2,
      averageFillTime: 15,
    },
    products: [
      { name: "Generic Medications", cost: 15, usage: 10000, quality: 92 },
      { name: "Brand Name Drugs", cost: 45, usage: 3000, quality: 95 },
      { name: "IV Solutions", cost: 8, usage: 6000, quality: 94 },
    ],
    pharmacists: [
      { name: "Dr. Brown", prescriptions: 1500, accuracy: 99, costEfficiency: 95 },
      { name: "Dr. Davis", prescriptions: 1300, accuracy: 98, costEfficiency: 92 },
      { name: "Dr. Miller", prescriptions: 1400, accuracy: 99, costEfficiency: 94 },
    ],
  },
  emergency: {
    name: "Emergency Department",
    metrics: {
      costPerUnit: 180,
      utilizationRate: 78,
      qualityScore: 88,
      operationalEfficiency: 82,
      contributionMargin: 35,
      patientSatisfaction: 85,
      waitTime: 25,
      readmissionRate: 3.5,
    },
    products: [
      { name: "Emergency Kits", cost: 35, usage: 2000, quality: 90 },
      { name: "Trauma Supplies", cost: 50, usage: 1500, quality: 92 },
      { name: "Emergency Medications", cost: 20, usage: 4000, quality: 91 },
    ],
    physicians: [
      { name: "Dr. Wilson", patients: 800, successRate: 94, costEfficiency: 85 },
      { name: "Dr. Moore", patients: 750, successRate: 93, costEfficiency: 82 },
      { name: "Dr. Taylor", patients: 850, successRate: 95, costEfficiency: 88 },
    ],
  },
  laboratory: {
    name: "Laboratory Department",
    metrics: {
      costPerUnit: 90,
      utilizationRate: 95,
      qualityScore: 90,
      operationalEfficiency: 90,
      contributionMargin: 42,
      patientSatisfaction: 90,
      testAccuracy: 99.5,
      turnaroundTime: 45,
    },
    products: [
      { name: "Lab Reagents", cost: 10, usage: 7000, quality: 93 },
      { name: "Test Kits", cost: 15, usage: 5000, quality: 94 },
      { name: "Lab Equipment", cost: 200, usage: 100, quality: 96 },
    ],
    technicians: [
      { name: "Dr. Anderson", tests: 2000, accuracy: 99.7, costEfficiency: 93 },
      { name: "Dr. Thomas", tests: 1800, accuracy: 99.6, costEfficiency: 91 },
      { name: "Dr. Jackson", tests: 2200, accuracy: 99.8, costEfficiency: 95 },
    ],
  },
};

// Mock data for product comparisons
export const productData = {
  surgicalSupplies: [
    {
      name: "Surgical Gloves",
      brand: "MediSafe",
      cost: 12,
      quality: 95,
      usage: 5000,
      department: "Surgery",
      supplier: "MedSupply Co.",
      leadTime: 3,
      stockLevel: 2000,
    },
    {
      name: "Surgical Gloves",
      brand: "SafeHands",
      cost: 10,
      quality: 94,
      usage: 4500,
      department: "Surgery",
      supplier: "HealthCare Supplies",
      leadTime: 2,
      stockLevel: 1800,
    },
  ],
  medications: [
    {
      name: "Generic Pain Reliever",
      brand: "MediGen",
      cost: 15,
      quality: 92,
      usage: 10000,
      department: "Pharmacy",
      supplier: "PharmaDist",
      leadTime: 5,
      stockLevel: 3000,
    },
    {
      name: "Brand Name Pain Reliever",
      brand: "PainFree",
      cost: 45,
      quality: 95,
      usage: 3000,
      department: "Pharmacy",
      supplier: "BrandPharma",
      leadTime: 7,
      stockLevel: 1000,
    },
  ],
};

// Mock data for surgeon comparisons
export const surgeonData = {
  surgery: [
    {
      name: "Dr. Smith",
      specialty: "Cardiac Surgery",
      procedures: 120,
      successRate: 98,
      costEfficiency: 92,
      complicationRate: 1.5,
      averageLengthOfStay: 3.0,
      patientSatisfaction: 95,
      resourceUtilization: 88,
    },
    {
      name: "Dr. Johnson",
      specialty: "Orthopedic Surgery",
      procedures: 95,
      successRate: 96,
      costEfficiency: 88,
      complicationRate: 2.0,
      averageLengthOfStay: 3.5,
      patientSatisfaction: 90,
      resourceUtilization: 85,
    },
    {
      name: "Dr. Williams",
      specialty: "General Surgery",
      procedures: 110,
      successRate: 97,
      costEfficiency: 90,
      complicationRate: 1.8,
      averageLengthOfStay: 3.2,
      patientSatisfaction: 93,
      resourceUtilization: 87,
    },
  ],
};

// Helper functions for comparison calculations
export const calculateDifference = (value1: number, value2: number) => {
  return value1 - value2;
};

export const calculatePercentageDifference = (value1: number, value2: number) => {
  return ((value1 - value2) / value2) * 100;
};

export const getComparisonColor = (difference: number) => {
  if (difference > 0) return "text-green-500";
  if (difference < 0) return "text-red-500";
  return "text-gray-500";
}; 