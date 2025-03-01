# App API Integration Guide

This document provides guidelines for integrating the StockDashboard backend endpoints into your frontend application.

## Base URL
```
http://localhost:8000/api/v1
```

## 1. Market Data Endpoints

### Market Data Overview
- **Endpoint:** `/market-data`
- **Method:** GET
- **Description:** Provides market overview data for stocks.
- **Caching:** TTL of 1 hour.
- **Query Parameters:**
  - `quarter` (optional): Specific quarter to retrieve data for (e.g., "Q2 FY24-25")
  - `force_refresh` (optional): Boolean to force data refresh (default: false)
- **Notes:** Use this endpoint to display real-time market trends.

### Stock Details
- **Endpoint:** `/stock/{symbol}`
- **Method:** GET
- **Description:** Retrieves detailed stock information and financial metrics.
- **Caching:** TTL of 24 hours.
- **Path Parameters:**
  - `symbol`: Stock ticker symbol (e.g., "JUBLPHARMA", "SHAKTIPUMP").
- **Notes:** Use proper error handling for invalid symbols.

### Available Quarters
- **Endpoint:** `/quarters`
- **Method:** GET
- **Description:** Returns a list of available quarters for market data.
- **Response Example:**
```json
{
  "quarters": ["Q2 FY24-25", "Q1 FY24-25"]
}
```
- **Notes:** Useful for filtering market data by quarter.

## 2. Analysis and AI Insights Endpoints

### Analysis History
- **Endpoint:** `/stock/{symbol}/analysis-history`
- **Method:** GET
- **Description:** Fetches historical AI analysis data for a stock.
- **Path Parameters:**
  - `symbol`: Stock ticker symbol (e.g., "SHAKTIPUMP", "JUBLPHARMA").
- **Response Example:**
```json
{
  "analyses": [
    {
      "id": "671f6768f7281b62ba10c172",
      "timestamp": "2024-10-28T15:58:56.394Z",
      "label": "October 28, 2024"
    }
  ]
}
```
- **Notes:** Returns an array of previous AI analysis objects with IDs for retrieving detailed content.

### Analysis Content
- **Endpoint:** `/analysis/{analysis_id}`
- **Method:** GET
- **Description:** Retrieves details of a specific AI analysis.
- **Path Parameters:**
  - `analysis_id`: Unique identifier for the analysis (e.g., "671f6768f7281b62ba10c172").
- **Response Format:** Detailed analysis content including sentiment, key factors, risks, and recommendations.
- **Notes:** Ensure the provided analysis ID is valid.

### Refresh Analysis
- **Endpoint:** `/stock/{symbol}/refresh-analysis`
- **Method:** POST
- **Description:** Triggers the generation of a new AI analysis for a given stock.
- **Path Parameters:**
  - `symbol`: Stock ticker symbol (e.g., "SHAKTIPUMP", "JUBLPHARMA").
- **Notes:** 
  - Integrates with xAI's Grok model
  - Requires valid API keys and environment variables (`XAI_API_KEY`, `XAI_API_URL`)
  - Returns the newly generated analysis content and ID

## 3. Portfolio Management Endpoints

### Get All Holdings
- **Endpoint:** `/portfolio/holdings`
- **Method:** GET
- **Description:** Retrieves the current portfolio holdings.
- **Response Example:**
```json
[
  {
    "_id": "67c29e323d92bd4cbfe46c45",
    "symbol": "AAPL",
    "company_name": "Apple Inc.",
    "quantity": 10,
    "average_price": 150.75,
    "purchase_date": "2023-01-15T00:00:00",
    "notes": "Long-term investment",
    "timestamp": "2024-02-15T12:30:45"
  }
]
```

### Add New Holding
- **Endpoint:** `/portfolio/holdings`
- **Method:** POST
- **Description:** Adds a new holding to the portfolio.
- **Request Body:**
```json
{
  "symbol": "MSFT",
  "company_name": "Microsoft Corporation",
  "quantity": 5,
  "average_price": 280.50,
  "purchase_date": "2023-03-10T00:00:00",
  "notes": "Tech sector diversification"
}
```
- **Notes:** Returns the created holding with an ID and timestamp.

### Update Holding
- **Endpoint:** `/portfolio/holdings/{holding_id}`
- **Method:** PUT
- **Description:** Updates an existing holding.
- **Path Parameters:**
  - `holding_id`: The ID of the holding to update.
- **Request Body:** Complete holding object (all fields required).
- **Notes:** All fields must be included in the update request (full replacement).

### Delete Holding
- **Endpoint:** `/portfolio/holdings/{holding_id}`
- **Method:** DELETE
- **Description:** Removes a holding from the portfolio.
- **Path Parameters:**
  - `holding_id`: The ID of the holding to delete.

### Import Holdings from CSV
- **Endpoint:** `/portfolio/holdings/import`
- **Method:** POST
- **Description:** Imports multiple holdings from a CSV file.
- **Request:** CSV file with headers (symbol, company_name, quantity, average_price, purchase_date, notes)
- **Notes:** This will clear all existing holdings before importing new ones.

## Authentication & Headers
- Standard headers include:
  - `Content-Type: application/json` for JSON requests
  - `Content-Type: multipart/form-data` for file uploads

## Error Handling
- The API returns HTTP status codes that indicate success or failure:
  - `200 OK`: Request succeeded
  - `201 Created`: Resource successfully created (for POST requests)
  - `400 Bad Request`: Invalid request parameters
  - `404 Not Found`: Resource not found
  - `422 Unprocessable Entity`: Validation error (missing required fields)
  - `500 Internal Server Error`: Server-side error
- Error responses have a consistent format:
```json
{
  "detail": "Error description"
}
```

## Integration Notes for Developers

1. **CORS Support**: The API has CORS enabled with support for `http://localhost:3000` and `https://localhost:3000`.

2. **Status Codes**: Note that some POST endpoints return a 200 OK status instead of the standard 201 Created.

3. **Date Handling**: All dates are returned in ISO format (e.g., "2024-02-15T10:30:00"). Format these for display.

4. **Special Routing Structure**: The analysis endpoints have a special routing pattern:
   - Analysis history: `/stock/{symbol}/analysis-history`
   - Analysis content: `/analysis/{analysis_id}`
   - Refresh analysis: `/stock/{symbol}/refresh-analysis`

5. **Symbol Validation**: Always use symbols that exist in the database. Current valid examples include "SHAKTIPUMP" and "JUBLPHARMA".

6. **Response Caching**: Implement client-side caching respecting the TTL values mentioned for each endpoint.

7. **Error Recovery**: If you encounter server connection issues, recommend server restart:
   ```
   pkill -f "python run.py" && python run.py
   ```

## Sample Request

Example GET request for market data:

```javascript
fetch('http://localhost:8000/api/v1/market-data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching market data:', error));
```

## Final Remarks
This integration guide reflects the latest backend API implementation as of November 2024. For additional details, refer to the full API documentation or contact the backend team. 