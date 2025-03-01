import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { url } = body
    
    if (!url || !url.includes('moneycontrol.com')) {
      return NextResponse.json(
        { success: false, message: 'Invalid URL provided' },
        { status: 400 }
      )
    }
    
    // Extract the result type from the URL if present
    let result_type = null
    if (url.includes('tab=')) {
      result_type = url.split('tab=')[1].split('&')[0]
    }
    
    // Forward the request to the Python backend
    const response = await fetch(`${API_BASE_URL}/scraper/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url,
        result_type 
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.detail || 'Error triggering scraper',
        },
        { status: response.status }
      )
    }
    
    // Return the response from the backend
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in scraper trigger API:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
} 