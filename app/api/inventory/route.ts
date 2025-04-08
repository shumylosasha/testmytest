import { NextResponse } from 'next/server'
import { inventoryData } from '@/data/inventory-data'

export async function GET() {
  try {
    // Return mockup data instead of fetching from backend
    return NextResponse.json(inventoryData)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
} 