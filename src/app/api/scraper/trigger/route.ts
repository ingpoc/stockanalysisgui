import { NextRequest, NextResponse } from 'next/server'
import { triggerScraper } from '@/lib/api' // Keep for type reference if needed, but don't call
import { logger } from '@/lib/logger'

// Get the internal API URL for server-side calls
const INTERNAL_API_URL = process.env.INTERNAL_API_URL;

export async function POST(req: NextRequest) {
  if (!INTERNAL_API_URL) {
    logger.error('INTERNAL_API_URL environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: Internal API URL missing' }, { status: 500 });
  }

  try {
    const { result_type } = await req.json()

    if (!result_type) {
      return NextResponse.json({ error: 'result_type is required' }, { status: 400 })
    }

    logger.info(`Received request to trigger scraper for type: ${result_type}`);

    // Construct the backend URL using the internal URL
    const triggerUrl = `${INTERNAL_API_URL}/scraper/scrape`; // Corrected endpoint

    // Call the backend scraper trigger endpoint directly
    const backendResponse = await fetch(triggerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result_type }),
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      logger.error(`Backend scraper trigger failed: ${backendResponse.status} ${backendResponse.statusText}`, { errorBody });
      throw new Error(`Backend trigger failed: ${backendResponse.statusText} - ${errorBody}`);
    }

    const responseData = await backendResponse.json();
    logger.info(`Backend scraper trigger successful`, { responseData });
    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    logger.error('Error triggering scraper via API route:', error);
    return NextResponse.json({ error: 'Failed to trigger scraper', detail: error.message }, { status: 500 })
  }
} 