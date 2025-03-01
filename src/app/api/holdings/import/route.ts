import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as Papa from 'papaparse'

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if request is multipart form data
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type, expected multipart/form-data' },
        { status: 400 }
      )
    }

    // Get form data
    const formData = await req.formData()
    const csvFile = formData.get('csvFile') as File

    if (!csvFile) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      )
    }

    // Check file size (limit to 5MB)
    if (csvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 413 }
      )
    }

    // Check file extension
    const fileName = csvFile.name.toLowerCase()
    if (!fileName.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV files are allowed.' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await csvFile.text()
    
    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return NextResponse.json(
        { error: 'Error parsing CSV file: ' + parseResult.errors[0].message },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const userId = session.user.id

    // Validate parsed data and transform to holdings
    const holdings = []
    const errors = []

    for (let [index, row] of parseResult.data.entries()) {
      try {
        // Try to extract required fields from different possible column names
        const symbol = (row.Symbol || row.SYMBOL || row.symbol || row['Stock Symbol'] || row['STOCK SYMBOL'] || '').trim().toUpperCase()
        let quantity = parseFloat(row.Quantity || row.QUANTITY || row.quantity || row.Shares || row.SHARES || row.shares || '0')
        let avgPrice = parseFloat(row['Average Price'] || row['AVERAGE PRICE'] || row.Price || row.PRICE || row.price || row['Avg Price'] || row['AVG PRICE'] || '0')
        
        // Validate required fields
        if (!symbol) {
          errors.push(`Row ${index + 1}: Missing stock symbol`)
          continue
        }
        
        if (isNaN(quantity) || quantity <= 0) {
          errors.push(`Row ${index + 1}: Invalid quantity for ${symbol}`)
          continue
        }
        
        if (isNaN(avgPrice) || avgPrice <= 0) {
          errors.push(`Row ${index + 1}: Invalid average price for ${symbol}`)
          continue
        }

        // Create holding object
        const holding = {
          userId: userId,
          symbol: symbol,
          quantity: quantity,
          average_price: avgPrice,
          purchase_date: new Date(),
          notes: row.Notes || row.NOTES || row.notes || row.Comments || row.COMMENTS || '',
          created_at: new Date(),
          updated_at: new Date(),
        }

        holdings.push(holding)
      } catch (err) {
        console.error(`Error processing row ${index + 1}:`, err)
        errors.push(`Row ${index + 1}: Invalid data format`)
      }
    }

    if (holdings.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid holdings found in CSV file', 
          details: errors 
        },
        { status: 400 }
      )
    }

    // Insert holdings into database
    const result = await db.collection('holdings').insertMany(holdings)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.insertedCount} holdings`,
      warnings: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error importing holdings from CSV:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred while importing holdings' },
      { status: 500 }
    )
  }
} 