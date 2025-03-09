import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function GET() {
  try {
    // Forward the request to the Python backend
    const response = await fetch(`${API_BASE_URL}/quarters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error fetching quarters' }))
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.detail || 'Error fetching quarters',
        },
        { status: response.status }
      )
    }
    
    // Return the response from the backend
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in quarters API:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
} 