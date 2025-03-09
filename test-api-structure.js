// This script examines the API client structure to demonstrate the consolidated approach

const fs = require('fs');
const path = require('path');

// Path to the API client file
const apiClientPath = path.join(__dirname, 'src', 'lib', 'api.ts');

// Read the file
const fileContent = fs.readFileSync(apiClientPath, 'utf8');

// Simple regex pattern to find exported functions
const functionPattern = /export\s+async\s+function\s+([a-zA-Z0-9_]+)/g;

// Find all the exported functions
const exportedFunctions = [];
let match;
while ((match = functionPattern.exec(fileContent)) !== null) {
  exportedFunctions.push(match[1]);
}

// Simple regex pattern to find exported interfaces
const interfacePattern = /export\s+interface\s+([a-zA-Z0-9_]+)/g;

// Find all the exported interfaces
const exportedInterfaces = [];
while ((match = interfacePattern.exec(fileContent)) !== null) {
  exportedInterfaces.push(match[1]);
}

// Print the results
console.log('API Client Structure Analysis');
console.log('-'.repeat(60));

console.log('\nExported Interfaces:');
exportedInterfaces.forEach(name => console.log(`- ${name}`));

console.log('\nExported Functions:');
exportedFunctions.forEach(name => console.log(`- ${name}`));

// Count functions by category
const categoryMap = {
  'market': ['fetchMarketData', 'getQuarters'],
  'stock': ['getStockDetails', 'getBatchStockDetails', 'refreshStockAnalysis', 'searchStocks', 'fetchStockChart'],
  'analysis': ['getAnalysisContent', 'getStockAnalysisHistory', 'refreshAnalysis', 'getAIInsights'],
  'portfolio': ['fetchHoldings', 'fetchEnrichedHoldings', 'addHolding', 'updateHolding', 'deleteHolding', 'clearHoldings', 'importHoldingsFromCSV'],
  'scraper': ['triggerScraper', 'removeQuarter'],
  'admin': ['backupDatabase', 'restoreDatabase', 'getDatabaseStats']
};

console.log('\nAPI Functions by Category:');
Object.entries(categoryMap).forEach(([category, functions]) => {
  const availableFunctions = functions.filter(f => exportedFunctions.includes(f));
  console.log(`- ${category.toUpperCase()}: ${availableFunctions.length}/${functions.length} functions implemented`);
  availableFunctions.forEach(f => console.log(`  * ${f}()`));
});

console.log('\nTotal:');
console.log(`- ${exportedInterfaces.length} interfaces`);
console.log(`- ${exportedFunctions.length} functions`);

console.log('-'.repeat(60));
console.log('This demonstrates the consolidated API client structure.');
console.log('All frontend API calls to the backend are centralized in this file.'); 