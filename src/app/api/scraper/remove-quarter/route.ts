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
    
    // Forward the request to the Python backend
    const response = await fetch(`${API_BASE_URL}/scraper/remove-quarter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quarter }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.detail || 'Error removing quarterly data',
        },
        { status: response.status }
      )
    }
    
    // Return the response from the backend
    const data = await response.json()
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