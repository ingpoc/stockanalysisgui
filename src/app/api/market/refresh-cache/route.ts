import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * POST handler for refreshing market data cache
 * This route forces a refresh of the market data cache for a specific quarter
 */
export async function POST(req: NextRequest) {
  try {
    // Get the quarter from the URL query parameters
    const searchParams = req.nextUrl.searchParams
    const quarter = searchParams.get('quarter')
    
    // Refresh the quarters cache - always use explicit 'true' string
    await fetch(`${API_BASE_URL}/quarters?force_refresh=true`)
    
    // If a specific quarter was provided, also refresh that quarter's market data
    if (quarter) {
      await fetch(`${API_BASE_URL}/market-data?quarter=${encodeURIComponent(quarter)}&force_refresh=true`)
    } else {
      // Otherwise, refresh all market data
      await fetch(`${API_BASE_URL}/market-data?force_refresh=true`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache refreshed successfully'
    })
  } catch (error) {
    console.error('Error refreshing cache:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to refresh cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 