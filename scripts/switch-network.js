#!/usr/bin/env node

// Network Configuration Switcher
// SECURITY: Prevents configuration mismatches by automating network switching

const fs = require('fs');
const path = require('path');

const NETWORK_TEMPLATES = {
  localnet: '.env.localnet.example',
  devnet: '.env.devnet.example',
};

function switchNetwork(targetNetwork) {
  if (!NETWORK_TEMPLATES[targetNetwork]) {
    console.error(`❌ Invalid network: ${targetNetwork}`);
    console.error(`Available networks: ${Object.keys(NETWORK_TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const templatePath = path.join(__dirname, '..', NETWORK_TEMPLATES[targetNetwork]);
  const envLocalPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template file not found: ${templatePath}`);
    process.exit(1);
  }

  try {
    // Read template
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Write to .env.local
    fs.writeFileSync(envLocalPath, templateContent);
    
    console.log(`✅ Network switched to: ${targetNetwork.toUpperCase()}`);
    console.log(`📝 Configuration written to .env.local`);
    console.log(`\n🔍 Key settings:`);
    
    // Show key configuration
    const lines = templateContent.split('\n');
    const keySettings = lines.filter(line => 
      line.includes('SOLANA_NETWORK') || 
      line.includes('SOLANA_RPC_URL') || 
      line.includes('_PROGRAM_ID')
    ).filter(line => !line.startsWith('#'));
    
    keySettings.forEach(line => {
      console.log(`   ${line}`);
    });

    if (targetNetwork === 'localnet') {
      console.log(`\n⚠️  Remember to start local validator: solana-test-validator`);
      console.log(`📋 Deploy programs: cd ../decentralized-lottery && npm run deploy:local`);
    }

  } catch (error) {
    console.error(`❌ Failed to switch network: ${error.message}`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('🔄 Network Configuration Switcher');
  console.log('');
  console.log('Usage: npm run switch-network <network>');
  console.log('');
  console.log('Available networks:');
  Object.keys(NETWORK_TEMPLATES).forEach(network => {
    console.log(`  - ${network}`);
  });
  process.exit(0);
}

const targetNetwork = args[0].toLowerCase();
switchNetwork(targetNetwork);