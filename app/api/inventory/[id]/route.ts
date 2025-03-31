import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  console.log(`Fetching inventory item with ID: ${id}`) // Debug log

  try {
    console.log('Making request to Flask backend...') // Debug log
    const response = await fetch(`http://localhost:5001/api/inventory/item/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Disable cache
    })

    console.log(`Backend response status: ${response.status}`) // Debug log
    
    // Log response headers for debugging
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`) // Debug log
      return NextResponse.json(
        { error: `Failed to fetch inventory item: ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Invalid content type: ${contentType}`) // Debug log
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      )
    }

    const text = await response.text() // Get raw response text
    console.log('Raw response:', text) // Debug log

    try {
      const data = JSON.parse(text)
      console.log('Successfully parsed data:', data) // Debug log
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError) // Debug log
      return NextResponse.json(
        { error: 'Invalid JSON response from backend' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in inventory item API route:', error) // Debug log
    return NextResponse.json(
      { error: 'Failed to fetch inventory item', details: error.message },
      { status: 500 }
    )
  }
} 