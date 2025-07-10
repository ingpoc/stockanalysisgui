#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.log('✅ No file provided or file does not exist');
  process.exit(0);
}

// Only check TypeScript files
if (!filePath.match(/\.(ts|tsx)$/)) {
  console.log('✅ Non-TypeScript file, skipping naming validation');
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const fileName = path.basename(filePath);
const issues = [];

// Check for common Solana/Anchor naming issues specific to this project
const patterns = [
  {
    pattern:
      /\b(RouletteType|EndTime|TotalBets|BetAmount|WinningNumber|PrizePool|TicketPrice|DrawTime)\b/g,
    message:
      'Use camelCase for Anchor account fields: rouletteType, endTime, totalBets, betAmount, winningNumber, prizePool, ticketPrice, drawTime',
  },
  {
    pattern: /program\.account\.GlobalConfig/g,
    message:
      'Use camelCase for Anchor account access: program.account.globalConfig',
  },
  {
    pattern: /program\.account\.RouletteAccount/g,
    message:
      'Use camelCase for Anchor account access: program.account.rouletteAccount',
  },
  {
    pattern: /program\.account\.LotteryAccount/g,
    message:
      'Use camelCase for Anchor account access: program.account.lotteryAccount',
  },
  {
    pattern: /program\.account\.TicketAccount/g,
    message:
      'Use camelCase for Anchor account access: program.account.ticketAccount',
  },
  {
    pattern:
      /\.(RouletteType|EndTime|TotalBets|BetAmount|WinningNumber|PrizePool|TicketPrice|DrawTime)\b/g,
    message:
      'Access Anchor runtime fields with camelCase: .rouletteType, .endTime, .totalBets, .betAmount, .winningNumber, .prizePool, .ticketPrice, .drawTime',
  },
  {
    pattern: /\bGlobalConfig\b(?!\s*=|\s*interface|\s*type)/g,
    message:
      'Use camelCase for variable names: globalConfig (unless defining types/interfaces)',
  },
  {
    pattern: /\bRouletteAccount\b(?!\s*=|\s*interface|\s*type)/g,
    message:
      'Use camelCase for variable names: rouletteAccount (unless defining types/interfaces)',
  },
  {
    pattern: /\bLotteryAccount\b(?!\s*=|\s*interface|\s*type)/g,
    message:
      'Use camelCase for variable names: lotteryAccount (unless defining types/interfaces)',
  },
  {
    pattern: /\bTicketAccount\b(?!\s*=|\s*interface|\s*type)/g,
    message:
      'Use camelCase for variable names: ticketAccount (unless defining types/interfaces)',
  },
];

// Check for environment variable patterns (should be UPPER_CASE)
const envPatterns = [
  {
    pattern: /process\.env\.next_public_/gi,
    message: 'Environment variables should be UPPER_CASE: NEXT_PUBLIC_*',
  },
  {
    pattern: /process\.env\.[a-z]/g,
    message: 'Environment variables should be UPPER_CASE',
  },
];

// Apply all patterns
[...patterns, ...envPatterns].forEach(({ pattern, message }) => {
  const matches = content.match(pattern);
  if (matches) {
    issues.push({
      message,
      matches: [...new Set(matches)], // Remove duplicates
      line: getLineNumbers(content, pattern),
    });
  }
});

// Check for specific Solana/Anchor anti-patterns
const solanaAntiPatterns = [
  {
    pattern: /PublicKey\.findProgramAddressSync\(\s*\[\s*Buffer\.from\(/g,
    message:
      'Consider using MCP derivePDA tool instead of manual PDA derivation',
  },
  {
    pattern: /\.toNumber\(\)\s*\*\s*1000000/g,
    message: 'Use constants for USDC decimals: amount / USDC_DECIMALS',
  },
  {
    pattern: /process\.env\.NEXT_PUBLIC_[A-Z_]+!\s*$/gm,
    message:
      'Consider using constants.ts for environment variables with validation',
  },
];

solanaAntiPatterns.forEach(({ pattern, message }) => {
  const matches = content.match(pattern);
  if (matches) {
    issues.push({
      message,
      matches: [...new Set(matches)],
      line: getLineNumbers(content, pattern),
    });
  }
});

function getLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const matchingLines = [];

  lines.forEach((line, index) => {
    if (line.match(pattern)) {
      matchingLines.push(index + 1);
    }
  });

  return matchingLines;
}

if (issues.length > 0) {
  console.error(`❌ Naming Convention Issues in ${fileName}:`);
  issues.forEach(issue => {
    console.error(`  📍 ${issue.message}`);
    console.error(`     Found: ${issue.matches.join(', ')}`);
    if (issue.line.length > 0) {
      console.error(`     Lines: ${issue.line.join(', ')}`);
    }
    console.error('');
  });
  process.exit(1);
} else {
  console.log(`✅ Naming conventions look good in ${fileName}`);
}
