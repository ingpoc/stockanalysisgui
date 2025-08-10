// Configuration Validator - Prevents network/program ID mismatches
// SECURITY: Validates environment configuration consistency

export interface NetworkConfig {
  network: string;
  rpcUrl: string;
  expectedProgramIds: {
    lottery: string;
    roulette: string;
  };
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  localnet: {
    network: 'localnet',
    rpcUrl: 'http://127.0.0.1:8899',
    expectedProgramIds: {
      lottery: 'BH1qtDhU6PtB1jrUJPf8JoNt34ELuTvVTDktDLFyq2JV',
      roulette: 'saLmMwuHKHDvaaPsA6GRaEjjzvmhx1VRgJGYeJpNDbr',
    },
  },
  devnet: {
    network: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    expectedProgramIds: {
      lottery: '9G1iJ7M8fNotapwrW9o9EgB3EeobrzHPyL8kgmQGQGvz',
      roulette: 'HFpMuAtTLCJQoo1bxZ9XUfyoaABSjhDf7ehgjpBBgDJo',
    },
  },
};

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get environment variables
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase() || '';
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '';
  const lotteryProgramId = process.env.NEXT_PUBLIC_LOTTERY_PROGRAM_ID || '';
  const rouletteProgramId = process.env.NEXT_PUBLIC_ROULETTE_PROGRAM_ID || '';

  // Validate network exists
  if (!network || !NETWORK_CONFIGS[network]) {
    errors.push(`Invalid or missing NEXT_PUBLIC_SOLANA_NETWORK: '${network}'. Must be 'localnet' or 'devnet'.`);
    return { isValid: false, errors, warnings };
  }

  const expectedConfig = NETWORK_CONFIGS[network];

  // Validate RPC URL consistency
  if (network === 'localnet' && !rpcUrl.includes('127.0.0.1')) {
    errors.push(`Localnet network requires local RPC URL (127.0.0.1), got: ${rpcUrl}`);
  }
  
  if (network === 'devnet' && rpcUrl.includes('127.0.0.1')) {
    errors.push(`Devnet network cannot use local RPC URL, got: ${rpcUrl}`);
  }

  // Validate program IDs match network
  if (lotteryProgramId !== expectedConfig.expectedProgramIds.lottery) {
    errors.push(`Lottery program ID mismatch for ${network}. Expected: ${expectedConfig.expectedProgramIds.lottery}, got: ${lotteryProgramId}`);
  }

  if (rouletteProgramId !== expectedConfig.expectedProgramIds.roulette) {
    errors.push(`Roulette program ID mismatch for ${network}. Expected: ${expectedConfig.expectedProgramIds.roulette}, got: ${rouletteProgramId}`);
  }

  // Check for common misconfigurations
  if (network === 'devnet' && rpcUrl === 'http://127.0.0.1:8899') {
    warnings.push('Devnet network with local RPC - this will cause account-not-found errors');
  }

  if (network === 'localnet' && !rpcUrl.includes('localhost') && !rpcUrl.includes('127.0.0.1')) {
    warnings.push('Localnet network with remote RPC - ensure local validator is running');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getNetworkDisplayName(network?: string): string {
  switch (network?.toLowerCase()) {
    case 'localnet':
      return 'Local Development';
    case 'devnet':
      return 'Devnet';
    case 'mainnet-beta':
    case 'mainnet':
      return 'Mainnet';
    default:
      return 'Unknown Network';
  }
}

// Auto-validate configuration in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  const validation = validateConfiguration();
  
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  } else {
    console.log('✅ Configuration validation passed');
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  }
}