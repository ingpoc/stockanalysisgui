# App API Integration Guide

This document provides guidelines for integrating the StockDashboard backend endpoints into your frontend application.

## 1. Market Data Endpoints

### Market Data Overview
- **Endpoint:** `/api/v1/market-data`
- **Method:** GET
- **Description:** Provides market overview data for stocks.
- **Caching:** TTL of 1 hour.
- **Notes:** Use this endpoint to display real-time market trends.

### Stock Details
- **Endpoint:** `/api/v1/stock/{symbol}`
- **Method:** GET
- **Description:** Retrieves detailed stock information (basic details, not AI-powered).
- **Caching:** TTL of 24 hours.
- **Parameters:**
  - `symbol`: Stock ticker symbol.
- **Notes:** Use proper error handling for invalid symbols.

### Available Quarters
- **Endpoint:** `/api/v1/quarters`
- **Method:** GET
- **Description:** Returns a list of available quarters for market data.
- **Notes:** Useful for filtering market data by quarter.

## 2. AI Insights Endpoints

### AI Stock Insights
- **Endpoint:** `/api/v1/stock/{symbol}`
- **Method:** GET
- **Description:** Provides AI-powered insights for a specific stock.
- **Parameters:**
  - `symbol`: Stock ticker symbol.
- **Notes:** This endpoint is provided by the AI Insights service and may overlap with Stock Details. Ensure you use the intended endpoint based on your needs.

### Market Sentiment
- **Endpoint:** `/api/v1/market/sentiment`
- **Method:** GET
- **Description:** Retrieves overall market sentiment analysis powered by AI.
- **Notes:** Provides a high-level view of market mood using advanced AI analysis.

### Analysis History (AI)
- **Endpoint:** `/api/v1/stock/{symbol}/analysis-history`
- **Method:** GET
- **Description:** Fetches historical AI analysis data for a stock.
- **Parameters:**
  - `symbol`: Stock ticker symbol.
- **Notes:** Returns an array of previous AI analysis objects.

### Specific Analysis Content
- **Endpoint:** `/api/v1/analysis/{analysis_id}`
- **Method:** GET
- **Description:** Retrieves details of a specific AI analysis.
- **Parameters:**
  - `analysis_id`: Unique identifier for the analysis.
- **Notes:** Ensure the provided analysis ID is valid.

### Refresh Analysis
- **Endpoint:** `/api/v1/stock/{symbol}/refresh-analysis`
- **Method:** POST
- **Description:** Triggers the generation of a new AI analysis for a given stock.
- **Parameters:**
  - `symbol`: Stock ticker symbol.
- **Notes:** Integrates with xAI's Grok model. Requires valid API keys and environment variables (`XAI_API_KEY`, `XAI_API_URL`).

## 3. Holdings Endpoints

### Get Holdings
- **Endpoint:** `/api/v1/holdings`
- **Method:** GET
- **Description:** Retrieves the current portfolio holdings for the authenticated user, including current market values and optional historical data.
- **Parameters:**
  - Optional Query Parameter: `include_history` (boolean) to include historical performance data.
  - Optional Query Parameter: `timeframe` (enum: "1d", "1w", "1m", "3m", "6m", "1y") for historical data timeframe.
- **Notes:** Authentication is handled automatically; no additional token needs to be sent.

### Update or Add Holding
- **Endpoint:** `/api/v1/holdings`
- **Method:** POST
- **Description:** Updates or adds a holding for the current authenticated user.
- **Parameters:**
  - Request Body: Holding object with necessary holding data.
- **Notes:** Ensure proper error handling on failure.

## Authentication & Headers
- Ensure all API requests include the appropriate authentication if required.
- Standard headers include:
  - `Content-Type: application/json`
  - Additional authentication headers as per server configuration.

## Error Handling
- The API returns HTTP status codes that indicate success or failure.
- In case of an error, the response will include an error message.
- Implement proper error handling in the frontend.

## Additional Notes
- **Security:** Respect allowed origins and CORS settings.
- **Performance:** Response times should be within 500ms, with proper caching applied accordingly.
- **Environment Variables:** Ensure necessary environment variables (`MONGODB_URI`, `MONGODB_DB_NAME`, `API_KEYS`) are set on the server.

## Sample Request

Example GET request for market data:

```javascript
fetch('/api/v1/market-data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching market data:', error));
```

## Final Remarks
This integration guide is designed to help frontend developers properly interface with the backend API endpoints. For additional details or customizations, please refer to the full API documentation or contact the backend team. 