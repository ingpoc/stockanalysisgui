import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { quarter } = body
    
    if (!quarter) {
      return NextResponse.json(
        { success: false, message: 'Quarter parameter is required' },
        { status: 400 }
      )
    }
    
    console.log(`Removing quarter data for: ${quarter}`)
    
    // Forward the request to the Python backend
    const response = await fetch(`${API_BASE_URL}/scraper/remove-quarter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quarter }),
    })
    
    // Parse the response JSON regardless of status
    const data = await response.json()
    
    // If response is not OK, return a proper error
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Error removing quarterly data',
        },
        { status: response.status }
      )
    }
    
    // Return the successful response from the backend
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in remove quarter API:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
} 