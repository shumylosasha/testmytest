import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:5001/api/inventory', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Disable cache
    })

    console.log(`Backend response status: ${response.status}`) // Debug log

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`) // Debug log
      return NextResponse.json(
        { error: `Failed to fetch inventory: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
} 