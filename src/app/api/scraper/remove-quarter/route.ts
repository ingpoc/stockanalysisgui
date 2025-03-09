import { NextResponse } from 'next/server'
import { removeQuarter } from '@/lib/api'

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
    
    // Use the centralized API client function
    const data = await removeQuarter(quarter)
    
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