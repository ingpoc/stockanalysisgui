import { NextResponse } from 'next/server'
import { triggerScraper } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { result_type } = body
    
    if (!result_type) {
      return NextResponse.json(
        { success: false, message: 'Result type is required' },
        { status: 400 }
      )
    }
    
    // Use the centralized API client function
    const data = await triggerScraper({ result_type })
    
    // Return the response
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