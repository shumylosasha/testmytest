import { NextResponse } from 'next/server'
import { inventoryData } from '@/data/inventory-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  console.log(`Fetching inventory item with ID: ${id}`) // Debug log

  try {
    // Find the item in mockup data instead of fetching from backend
    const item = inventoryData.find(item => item.id === id)
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error in inventory item API route:', error) // Debug log
    return NextResponse.json(
      { error: 'Failed to fetch inventory item', details: error.message },
      { status: 500 }
    )
  }
} 