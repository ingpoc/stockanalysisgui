// Simple test script for the frontend API client
import {
  fetchMarketData,
  getQuarters,
  getStockDetails,
  triggerScraper,
  removeQuarter
} from './src/lib/api';

// Helper function to handle async operations
async function runTests() {
  console.log('Testing frontend API client integration...');
  console.log('-'.repeat(60));

  try {
    // Test the market data endpoint
    console.log('\nTesting fetchMarketData():');
    const marketData = await fetchMarketData();
    console.log('- Quarter:', marketData.quarter);
    console.log('- Top performers:', marketData.top_performers.length, 'stocks');
    console.log('- Worst performers:', marketData.worst_performers.length, 'stocks');
    console.log('- Latest results:', marketData.latest_results.length, 'stocks');
    console.log('- All stocks:', marketData.all_stocks.length, 'stocks');
  } catch (error) {
    console.error('Error in fetchMarketData():', error.message);
  }

  try {
    // Test the quarters endpoint
    console.log('\nTesting getQuarters():');
    const quarters = await getQuarters();
    console.log('- Available quarters:', quarters);
  } catch (error) {
    console.error('Error in getQuarters():', error.message);
  }

  try {
    // Test the stock details endpoint
    console.log('\nTesting getStockDetails():');
    const stockDetails = await getStockDetails('RELIANCE');
    console.log('- Company name:', stockDetails.formatted_metrics.company_name);
    console.log('- Symbol:', stockDetails.formatted_metrics.symbol);
    console.log('- CMP:', stockDetails.formatted_metrics.cmp);
  } catch (error) {
    console.error('Error in getStockDetails():', error.message);
  }

  // NOTE: We won't actually execute these operations, just demonstrate how
  // the consolidated API client would be used in practice
  console.log('\nExample usages for write operations (not executed):');
  
  console.log('\nTriggering scraper example:');
  console.log(`
  // Import the client function
  import { triggerScraper } from '@/lib/api';
  
  // Use the client function
  try {
    const result = await triggerScraper({ 
      result_type: "LR" 
    });
    console.log(\`Scraped \${result.companies_scraped} companies\`);
  } catch (error) {
    console.error('Error:', error.message);
  }
  `);
  
  console.log('\nRemoving quarter example:');
  console.log(`
  // Import the client function
  import { removeQuarter } from '@/lib/api';
  
  // Use the client function
  try {
    const result = await removeQuarter("Q1 2023");
    console.log(\`Removed quarter data, updated \${result.documents_updated} documents\`);
  } catch (error) {
    console.error('Error:', error.message);
  }
  `);

  console.log('-'.repeat(60));
  console.log('Tests completed!');
}

// Run the tests
runTests(); 